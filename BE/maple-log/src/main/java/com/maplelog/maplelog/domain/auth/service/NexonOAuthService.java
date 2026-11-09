package com.maplelog.maplelog.domain.auth.service;

import com.maplelog.maplelog.domain.auth.dto.AuthResponse;
import com.maplelog.maplelog.domain.member.entity.AuthType;
import com.maplelog.maplelog.domain.member.entity.Member;
import com.maplelog.maplelog.domain.member.repository.MemberRepository;
import com.maplelog.maplelog.global.config.NexonOAuthProperties;
import com.maplelog.maplelog.global.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class NexonOAuthService {

    private static final String REFRESH_TOKEN_PREFIX = "RT:";

    private final MemberRepository memberRepository;
    private final JwtProvider jwtProvider;
    private final NexonOAuthProperties oAuthProperties;
    private final StringRedisTemplate redisTemplate;
    private final RestClient restClient;

    public String buildLoginUrl() {
        return UriComponentsBuilder.fromUriString(oAuthProperties.getAuthorizationUri())
                .queryParam("response_type", "code")
                .queryParam("client_id", oAuthProperties.getClientId())
                .queryParam("redirect_uri", oAuthProperties.getRedirectUri())
                .toUriString();
    }

    @Transactional
    public AuthResponse processCallback(String code) {
        NexonTokenResponse tokenResponse = exchangeCodeForToken(code);
        NexonUserInfo userInfo = fetchUserInfo(tokenResponse.accessToken());

        Member member = memberRepository.findByNexonId(userInfo.nexonId())
                .orElseGet(() -> memberRepository.save(Member.builder()
                        .authType(AuthType.OAUTH)
                        .nexonId(userInfo.nexonId())
                        .nickname(userInfo.nickname())
                        .nexonAccessToken(tokenResponse.accessToken())
                        .nexonRefreshToken(tokenResponse.refreshToken())
                        .build()));

        member.updateOAuthTokens(tokenResponse.accessToken(), tokenResponse.refreshToken());

        return issueTokens(member);
    }

    private NexonTokenResponse exchangeCodeForToken(String code) {
        Map response = restClient.post()
                .uri(oAuthProperties.getTokenUri())
                .body(Map.of(
                        "grant_type", "authorization_code",
                        "client_id", oAuthProperties.getClientId(),
                        "client_secret", oAuthProperties.getClientSecret(),
                        "redirect_uri", oAuthProperties.getRedirectUri(),
                        "code", code
                ))
                .retrieve()
                .body(Map.class);

        return new NexonTokenResponse(
                (String) response.get("access_token"),
                (String) response.get("refresh_token")
        );
    }

    private NexonUserInfo fetchUserInfo(String accessToken) {
        Map response = restClient.get()
                .uri(oAuthProperties.getUserInfoUri())
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(Map.class);

        return new NexonUserInfo(
                (String) response.get("AccountID"),
                (String) response.get("CharacterName")
        );
    }

    private AuthResponse issueTokens(Member member) {
        String subject = String.valueOf(member.getId());
        String accessToken = jwtProvider.generateAccessToken(subject);
        String refreshToken = jwtProvider.generateRefreshToken(subject);

        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + subject,
                refreshToken,
                jwtProvider.getRefreshExpiration(),
                TimeUnit.MILLISECONDS
        );

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .nickname(member.getNickname())
                .authType(member.getAuthType().name())
                .build();
    }

    record NexonTokenResponse(String accessToken, String refreshToken) {}
    record NexonUserInfo(String nexonId, String nickname) {}
}
