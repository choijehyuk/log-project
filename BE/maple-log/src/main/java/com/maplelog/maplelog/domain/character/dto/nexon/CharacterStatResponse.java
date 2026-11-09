package com.maplelog.maplelog.domain.character.dto.nexon;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.List;

@Getter
public class CharacterStatResponse {

    @JsonProperty("final_stat")
    private List<StatItem> finalStat;

    @Getter
    public static class StatItem {
        @JsonProperty("stat_name")
        private String statName;

        @JsonProperty("stat_value")
        private String statValue;
    }

    public long getCombatPower() {
        if (finalStat == null) return 0L;
        return finalStat.stream()
                .filter(s -> "전투력".equals(s.getStatName()))
                .map(s -> {
                    try {
                        return Long.parseLong(s.getStatValue().replace(",", ""));
                    } catch (NumberFormatException e) {
                        return 0L;
                    }
                })
                .findFirst()
                .orElse(0L);
    }
}
