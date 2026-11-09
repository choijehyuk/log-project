package com.maplelog.maplelog.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ApiKeyLoginRequest {

    @NotBlank
    private String apiKey;
}
