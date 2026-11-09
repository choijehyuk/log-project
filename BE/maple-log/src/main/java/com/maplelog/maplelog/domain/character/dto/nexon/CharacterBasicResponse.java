package com.maplelog.maplelog.domain.character.dto.nexon;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CharacterBasicResponse {

    @JsonProperty("date")
    private String date;

    @JsonProperty("character_name")
    private String characterName;

    @JsonProperty("world_name")
    private String worldName;

    @JsonProperty("character_gender")
    private String characterGender;

    @JsonProperty("character_class")
    private String characterClass;

    @JsonProperty("character_class_level")
    private String characterClassLevel;

    @JsonProperty("character_level")
    private int characterLevel;

    @JsonProperty("character_exp")
    private long characterExp;

    @JsonProperty("character_exp_rate")
    private String characterExpRate;

    @JsonProperty("character_guild_name")
    private String characterGuildName;

    @JsonProperty("character_image")
    private String characterImage;

    @JsonProperty("character_date_create")
    private String characterDateCreate;
}