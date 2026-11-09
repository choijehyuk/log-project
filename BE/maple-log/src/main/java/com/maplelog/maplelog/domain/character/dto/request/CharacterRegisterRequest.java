package com.maplelog.maplelog.domain.character.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CharacterRegisterRequest {

    @NotBlank
    private String characterName;
}