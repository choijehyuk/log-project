package com.maplelog.maplelog.domain.snapshot.dto;

import com.maplelog.maplelog.domain.snapshot.entity.CharacterSnapshot;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class SnapshotResponse {
    private Long id;
    private int level;
    private String expRate;
    private long combatPower;
    private LocalDate snapshotDate;

    public static SnapshotResponse from(CharacterSnapshot snapshot) {
        return SnapshotResponse.builder()
                .id(snapshot.getId())
                .level(snapshot.getLevel())
                .expRate(snapshot.getExpRate())
                .combatPower(snapshot.getCombatPower())
                .snapshotDate(snapshot.getSnapshotDate())
                .build();
    }
}
