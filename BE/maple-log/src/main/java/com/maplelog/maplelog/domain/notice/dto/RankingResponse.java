package com.maplelog.maplelog.domain.notice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class RankingResponse {

    @JsonProperty("ranking")
    private List<RankingItem> ranking;

    @Getter
    @NoArgsConstructor
    public static class RankingItem {
        @JsonProperty("date")
        private String date;
        @JsonProperty("ranking")
        private int ranking;
        @JsonProperty("character_name")
        private String characterName;
        @JsonProperty("world_name")
        private String worldName;
        @JsonProperty("class_name")
        private String className;
        @JsonProperty("sub_class_name")
        private String subClassName;
        @JsonProperty("character_level")
        private int characterLevel;
        @JsonProperty("character_exp")
        private long characterExp;
        @JsonProperty("character_popularity")
        private long characterPopularity;
        @JsonProperty("character_guildname")
        private String characterGuildname;
    }
}
