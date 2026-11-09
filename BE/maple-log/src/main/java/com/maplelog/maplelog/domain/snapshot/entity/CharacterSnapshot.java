package com.maplelog.maplelog.domain.snapshot.entity;

import com.maplelog.maplelog.domain.character.entity.MapleCharacter;
import com.maplelog.maplelog.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "character_snapshot",
        uniqueConstraints = @UniqueConstraint(columnNames = {"character_id", "snapshot_date"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CharacterSnapshot extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id", nullable = false)
    private MapleCharacter character;

    @Column(nullable = false)
    private int level;

    @Column
    private String expRate;

    @Column
    private long combatPower;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Builder
    public CharacterSnapshot(MapleCharacter character, int level, String expRate, long combatPower, LocalDate snapshotDate) {
        this.character = character;
        this.level = level;
        this.expRate = expRate;
        this.combatPower = combatPower;
        this.snapshotDate = snapshotDate;
    }
}
