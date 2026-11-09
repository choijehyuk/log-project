package com.maplelog.maplelog.domain.schedule.dto;

import com.maplelog.maplelog.domain.schedule.entity.BossContentRecord;
import com.maplelog.maplelog.domain.schedule.entity.CharacterSchedule;
import com.maplelog.maplelog.domain.schedule.entity.ContentRecord;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class CharacterScheduleResponse {

    private Long characterId;
    private String characterName;
    private LocalDate scheduleDate;
    private List<BossContentRecord> bossContents;
    private List<ContentRecord> dailyContents;
    private List<ContentRecord> weeklyContents;
    private int weeklyBossClearCount;
    private int weeklyBossClearLimitCount;

    public static CharacterScheduleResponse from(CharacterSchedule schedule) {
        return CharacterScheduleResponse.builder()
                .characterId(schedule.getCharacter().getId())
                .characterName(schedule.getCharacter().getCharacterName())
                .scheduleDate(schedule.getScheduleDate())
                .bossContents(schedule.getBossContents())
                .dailyContents(schedule.getDailyContents())
                .weeklyContents(schedule.getWeeklyContents())
                .weeklyBossClearCount(schedule.getWeeklyBossClearCount())
                .weeklyBossClearLimitCount(schedule.getWeeklyBossClearLimitCount())
                .build();
    }
}
