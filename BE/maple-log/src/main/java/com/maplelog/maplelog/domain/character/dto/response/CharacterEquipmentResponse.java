package com.maplelog.maplelog.domain.character.dto.response;

import com.maplelog.maplelog.domain.character.dto.nexon.NexonAndroidResponse;
import com.maplelog.maplelog.domain.character.dto.nexon.NexonEquipmentResponse;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CharacterEquipmentResponse {

    private String slot;
    private String part;
    private String name;
    private String icon;
    private int starforce;
    private int scrollUpgrade;
    private boolean goldenHammer;
    // 가위 사용 가능 횟수 (해당 없음이면 null)
    private Integer cuttableCount;
    private int requiredLevel;

    private String potentialGrade;
    private String potential1;
    private String potential2;
    private String potential3;

    private String additionalPotentialGrade;
    private String additionalPotential1;
    private String additionalPotential2;
    private String additionalPotential3;

    private String soulName;
    private String soulOption;

    // 0이 아닌 스탯만, 출처별(기본/스타포스/주문서/추옵/익셉셔널) 수치 포함
    private List<EquipmentStatLine> stats;

    public static CharacterEquipmentResponse from(NexonEquipmentResponse.ItemEquipment item) {
        return CharacterEquipmentResponse.builder()
                .slot(item.getItemEquipmentSlot())
                .part(item.getItemEquipmentPart())
                .name(item.getItemName())
                .icon(item.getItemIcon())
                .starforce(parseIntStr(item.getStarforce()))
                .scrollUpgrade(parseIntStr(item.getScrollUpgrade()))
                .goldenHammer("적용".equals(item.getGoldenHammerFlag()))
                .cuttableCount(parseCuttableCount(item.getCuttableCount()))
                .requiredLevel(item.getItemBaseOption() != null ? item.getItemBaseOption().getBaseEquipmentLevel() : 0)
                .potentialGrade(item.getPotentialOptionGrade())
                .potential1(item.getPotentialOption1())
                .potential2(item.getPotentialOption2())
                .potential3(item.getPotentialOption3())
                .additionalPotentialGrade(item.getAdditionalPotentialOptionGrade())
                .additionalPotential1(item.getAdditionalPotentialOption1())
                .additionalPotential2(item.getAdditionalPotentialOption2())
                .additionalPotential3(item.getAdditionalPotentialOption3())
                .soulName(item.getSoulName())
                .soulOption(item.getSoulOption())
                .stats(EquipmentStatLine.build(
                        item.getItemTotalOption(),
                        item.getItemBaseOption(),
                        item.getItemStarforceOption(),
                        item.getItemEtcOption(),
                        item.getItemAddOption(),
                        item.getItemExceptionalOption()))
                .build();
    }

    public static CharacterEquipmentResponse fromTitle(NexonEquipmentResponse.Title title) {
        return CharacterEquipmentResponse.builder()
                .slot("칭호")
                .part("칭호")
                .name(title.getTitleName())
                .icon(title.getTitleIcon())
                .starforce(0)
                .stats(List.of())
                .build();
    }

    public static CharacterEquipmentResponse fromAndroid(NexonAndroidResponse android) {
        return CharacterEquipmentResponse.builder()
                .slot("안드로이드")
                .part("안드로이드")
                .name(android.getAndroidName())
                .icon(android.getAndroidIcon())
                .starforce(0)
                .stats(List.of())
                .build();
    }

    private static int parseIntStr(String value) {
        try {
            return value == null ? 0 : Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    // Nexon API는 가위 사용 대상이 아니면 255를 내려준다
    private static Integer parseCuttableCount(String value) {
        if (value == null || value.isBlank()) return null;
        int count = parseIntStr(value);
        return count == 255 ? null : count;
    }
}
