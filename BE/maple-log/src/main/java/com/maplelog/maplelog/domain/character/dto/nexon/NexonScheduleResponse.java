package com.maplelog.maplelog.domain.character.dto.nexon;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.maplelog.maplelog.domain.schedule.entity.BossContentRecord;
import com.maplelog.maplelog.domain.schedule.entity.ContentRecord;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class NexonScheduleResponse {

    @JsonProperty("date")
    private String date;

    @JsonProperty("character_name")
    private String characterName;

    @JsonProperty("world_name")
    private String worldName;

    @JsonProperty("character_level")
    private int characterLevel;

    @JsonProperty("character_class")
    private String characterClass;

    @JsonProperty("daily_contents")
    private List<ContentRecord> dailyContents;

    @JsonProperty("weekly_contents")
    private List<ContentRecord> weeklyContents;

    @JsonProperty("boss_contents")
    private List<BossContentRecord> bossContents;

    @JsonProperty("weekly_boss_clear_count")
    private int weeklyBossClearCount;

    @JsonProperty("weekly_boss_clear_limit_count")
    private int weeklyBossClearLimitCount;
}
