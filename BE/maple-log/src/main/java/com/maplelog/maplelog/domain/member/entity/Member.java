package com.maplelog.maplelog.domain.member.entity;

import com.maplelog.maplelog.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "member")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthType authType;

    // Nexon OAuth 사용자 식별자
    @Column(unique = true)
    private String nexonId;

    // API 키 입력 사용자의 키
    @Column(unique = true)
    private String apiKey;

    // OAuth access token (갱신 필요 시 사용)
    @Column(length = 1000)
    private String nexonAccessToken;

    @Column(length = 1000)
    private String nexonRefreshToken;

    @Column
    private String nickname;

    @Builder
    public Member(AuthType authType, String nexonId, String apiKey,
                  String nexonAccessToken, String nexonRefreshToken, String nickname) {
        this.authType = authType;
        this.nexonId = nexonId;
        this.apiKey = apiKey;
        this.nexonAccessToken = nexonAccessToken;
        this.nexonRefreshToken = nexonRefreshToken;
        this.nickname = nickname;
    }

    public void updateOAuthTokens(String accessToken, String refreshToken) {
        this.nexonAccessToken = accessToken;
        this.nexonRefreshToken = refreshToken;
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    // 스케줄러 API 호출 시 사용할 키 반환 (NICKNAME 타입은 null 반환 → 스케줄러 스킵)
    public String getEffectiveApiKey() {
        if (authType == AuthType.OAUTH) {
            return nexonAccessToken;
        }
        if (authType == AuthType.NICKNAME) {
            return null;
        }
        return apiKey;
    }
}
