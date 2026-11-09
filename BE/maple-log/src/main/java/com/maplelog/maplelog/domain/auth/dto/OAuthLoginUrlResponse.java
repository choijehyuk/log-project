package com.maplelog.maplelog.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OAuthLoginUrlResponse {
    private String loginUrl;
}
