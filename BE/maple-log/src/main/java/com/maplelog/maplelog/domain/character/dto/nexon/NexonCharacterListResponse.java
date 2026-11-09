package com.maplelog.maplelog.domain.character.dto.nexon;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class NexonCharacterListResponse {

    @JsonProperty("account_list")
    private List<AccountInfo> accountList;

    @Getter
    @NoArgsConstructor
    public static class AccountInfo {

        @JsonProperty("character_list")
        private List<CharacterInfo> characterList;
    }

    @Getter
    @NoArgsConstructor
    public static class CharacterInfo {

        @JsonProperty("ocid")
        private String ocid;

        @JsonProperty("character_name")
        private String characterName;

        @JsonProperty("world_name")
        private String worldName;

        @JsonProperty("character_class")
        private String characterClass;

        @JsonProperty("character_level")
        private int characterLevel;
    }
}
