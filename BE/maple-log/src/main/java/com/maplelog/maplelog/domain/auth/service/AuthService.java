package com.maplelog.maplelog.domain.auth.service;

import com.maplelog.maplelog.domain.auth.dto.ApiKeyLoginRequest;
import com.maplelog.maplelog.domain.auth.dto.AuthResponse;
import com.maplelog.maplelog.domain.auth.dto.NicknameLoginRequest;
import com.maplelog.maplelog.domain.character.client.NexonApiClient;
import com.maplelog.maplelog.domain.character.dto.nexon.CharacterBasicResponse;
import com.maplelog.maplelog.domain.member.entity.AuthType;
import com.maplelog.maplelog.domain.member.entity.Member;
import com.maplelog.maplelog.domain.member.repository.MemberRepository;
import com.maplelog.maplelog.global.exception.NexonApiException;
import com.maplelog.maplelog.global.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String REFRESH_TOKEN_PREFIX = "RT:";
    private static final String NEXON_API_BASE = "https://open.api.nexon.com";

    private final MemberRepository memberRepository;
    private final JwtProvider jwtProvider;
    private final StringRedisTemplate redisTemplate;
    private final RestClient restClient;
    private final NexonApiClient nexonApiClient;

    @Transactional
    public AuthResponse loginWithApiKey(ApiKeyLoginRequest request) {
        validateApiKey(request.getApiKey());

        Member member = memberRepository.findByApiKey(request.getApiKey())
                .orElseGet(() -> memberRepository.save(Member.builder()
                        .authType(AuthType.API_KEY)
                        .apiKey(request.getApiKey())
                        .nickname("")
                        .build()));

        return issueTokens(member);
    }

    @Transactional
    public AuthResponse loginWithNickname(NicknameLoginRequest request) {
        String ocid = nexonApiClient.getCharacterOcid(request.getNickname());
        CharacterBasicResponse basic = nexonApiClient.getCharacterBasic(ocid);
        String characterName = basic.getCharacterName();

        Member member = memberRepository.findByNicknameAndAuthType(characterName, AuthType.NICKNAME)
                .orElseGet(() -> memberRepository.save(Member.builder()
                        .authType(AuthType.NICKNAME)
                        .nickname(characterName)
                        .build()));

        return issueTokens(member);
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 Refresh Token입니다.");
        }

        String subject = jwtProvider.extractSubject(refreshToken);
        String savedToken = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + subject);

        if (!refreshToken.equals(savedToken)) {
            throw new IllegalArgumentException("Refresh Token이 일치하지 않습니다.");
        }

        Member member = memberRepository.findById(Long.valueOf(subject))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return issueTokens(member);
    }

    public void logout(String subject) {
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + subject);
    }

    private void validateApiKey(String apiKey) {
        try {
            restClient.get()
                    .uri(NEXON_API_BASE + "/maplestory/v1/notice")
                    .header("x-nxopen-api-key", apiKey)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            throw new NexonApiException(401, "유효하지 않은 API 키입니다.");
        }
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
}
