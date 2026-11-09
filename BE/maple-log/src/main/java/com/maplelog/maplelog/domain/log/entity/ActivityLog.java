package com.maplelog.maplelog.domain.log.entity;

import com.maplelog.maplelog.domain.character.entity.MapleCharacter;
import com.maplelog.maplelog.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "activity_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ActivityLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id", nullable = false)
    private MapleCharacter character;

    @Column(nullable = false)
    private String content;

    @Builder
    public ActivityLog(MapleCharacter character, String content) {
        this.character = character;
        this.content = content;
    }
}