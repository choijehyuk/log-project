package com.maplelog.maplelog.domain.auth.controller;

import com.maplelog.maplelog.domain.auth.dto.ApiKeyLoginRequest;
import com.maplelog.maplelog.domain.auth.dto.AuthResponse;
import com.maplelog.maplelog.domain.auth.dto.NicknameLoginRequest;
import com.maplelog.maplelog.domain.auth.dto.OAuthLoginUrlResponse;
import com.maplelog.maplelog.domain.auth.service.AuthService;
import com.maplelog.maplelog.domain.auth.service.NexonOAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final NexonOAuthService nexonOAuthService;

    // 넥슨 OAuth 로그인 URL 발급
    @GetMapping("/oauth/nexon/login-url")
    public ResponseEntity<OAuthLoginUrlResponse> getLoginUrl() {
        return ResponseEntity.ok(new OAuthLoginUrlResponse(nexonOAuthService.buildLoginUrl()));
    }

    // 넥슨 OAuth 콜백 처리 — 토큰 발급 후 FE로 리다이렉트
    @GetMapping("/oauth/nexon/callback")
    public ResponseEntity<Void> oauthCallback(@RequestParam String code) {
        AuthResponse auth = nexonOAuthService.processCallback(code);
        URI redirectUri = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth/result")
                .queryParam("accessToken", auth.getAccessToken())
                .queryParam("refreshToken", auth.getRefreshToken())
                .queryParam("nickname", auth.getNickname())
                .queryParam("authType", auth.getAuthType())
                .build().toUri();
        return ResponseEntity.status(302).location(redirectUri).build();
    }

    // 닉네임으로 로그인 (Nexon API 조회 후 캐릭터 존재 여부 확인)
    @PostMapping("/nickname")
    public ResponseEntity<AuthResponse> nicknameLogin(@RequestBody @Valid NicknameLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithNickname(request));
    }

    // API 키로 로그인
    @PostMapping("/api-key")
    public ResponseEntity<AuthResponse> apiKeyLogin(@RequestBody @Valid ApiKeyLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithApiKey(request));
    }

    // 토큰 갱신
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestHeader("Refresh-Token") String refreshToken) {
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserDetails userDetails) {
        authService.logout(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
