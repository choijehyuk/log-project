package com.maplelog.maplelog.domain.character.entity;

import com.maplelog.maplelog.domain.member.entity.Member;
import com.maplelog.maplelog.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "maple_character",
    uniqueConstraints = @UniqueConstraint(name = "UK_member_ocid", columnNames = {"member_id", "ocid"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MapleCharacter extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private String ocid;

    @Column(nullable = false)
    private String characterName;

    @Column(nullable = false)
    private String characterClass;

    private int level;

    private String world;

    @Column(columnDefinition = "TEXT")
    private String characterImage;

    @Column(nullable = false)
    private boolean isMain = false;

    @Column(nullable = false)
    private int sortOrder = 0;

    @Builder
    public MapleCharacter(Member member, String ocid, String characterName, String characterClass,
                          int level, String world, String characterImage, int sortOrder) {
        this.member = member;
        this.ocid = ocid;
        this.characterName = characterName;
        this.characterClass = characterClass;
        this.level = level;
        this.world = world;
        this.characterImage = characterImage;
        this.isMain = false;
        this.sortOrder = sortOrder;
    }

    public void update(String characterClass, int level, String world, String characterImage) {
        this.characterClass = characterClass;
        this.level = level;
        this.world = world;
        this.characterImage = characterImage;
    }

    public void setMain(boolean isMain) {
        this.isMain = isMain;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
}