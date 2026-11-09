package com.maplelog.maplelog.domain.character.dto.response;

import com.maplelog.maplelog.domain.character.entity.MapleCharacter;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CharacterResponse {

    private Long id;
    private String characterName;
    private String characterClass;
    private int level;
    private String world;
    private String characterImage;
    private boolean isMain;

    public static CharacterResponse from(MapleCharacter character) {
        return CharacterResponse.builder()
                .id(character.getId())
                .characterName(character.getCharacterName())
                .characterClass(character.getCharacterClass())
                .level(character.getLevel())
                .world(character.getWorld())
                .characterImage(character.getCharacterImage())
                .isMain(character.isMain())
                .build();
    }
}