package com.maplelog.maplelog.domain.schedule.entity;

import com.maplelog.maplelog.domain.character.entity.MapleCharacter;
import com.maplelog.maplelog.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "character_schedule",
        uniqueConstraints = @UniqueConstraint(columnNames = {"character_id", "schedule_date"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CharacterSchedule extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id", nullable = false)
    private MapleCharacter character;

    @Column(name = "schedule_date", nullable = false)
    private LocalDate scheduleDate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<BossContentRecord> bossContents;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<ContentRecord> dailyContents;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<ContentRecord> weeklyContents;

    private int weeklyBossClearCount;
    private int weeklyBossClearLimitCount;

    @Builder
    public CharacterSchedule(MapleCharacter character, LocalDate scheduleDate,
                              List<BossContentRecord> bossContents,
                              List<ContentRecord> dailyContents,
                              List<ContentRecord> weeklyContents,
                              int weeklyBossClearCount, int weeklyBossClearLimitCount) {
        this.character = character;
        this.scheduleDate = scheduleDate;
        this.bossContents = bossContents;
        this.dailyContents = dailyContents;
        this.weeklyContents = weeklyContents;
        this.weeklyBossClearCount = weeklyBossClearCount;
        this.weeklyBossClearLimitCount = weeklyBossClearLimitCount;
    }

    public void update(List<BossContentRecord> bossContents,
                       List<ContentRecord> dailyContents,
                       List<ContentRecord> weeklyContents,
                       int weeklyBossClearCount, int weeklyBossClearLimitCount) {
        this.bossContents = bossContents;
        this.dailyContents = dailyContents;
        this.weeklyContents = weeklyContents;
        this.weeklyBossClearCount = weeklyBossClearCount;
        this.weeklyBossClearLimitCount = weeklyBossClearLimitCount;
    }
}
