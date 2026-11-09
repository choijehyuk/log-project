package com.maplelog.maplelog.domain.snapshot.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class SnapshotSummaryResponse {

    private LocalDate firstDate;
    private LocalDate latestDate;
    private int firstLevel;
    private int latestLevel;
    private int levelGain;
    private long firstCombatPower;
    private long latestCombatPower;
    private long combatPowerGain;
    private int totalSnapshots;
}
