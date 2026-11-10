package com.maplelog.maplelog.domain.character.dto.response;

import com.maplelog.maplelog.domain.character.dto.nexon.NexonEquipmentResponse.ItemOption;
import lombok.Builder;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

// 장비 툴팁의 스탯 한 줄: "INT : +327 ( 150 +145 +32 )"
@Getter
@Builder
public class EquipmentStatLine {

    private String label;
    private boolean percent;
    private int total;
    private int base;
    private int starforce;
    private int etc;
    private int add;
    private int exceptional;

    private record StatDef(String label, boolean percent, Function<ItemOption, String> getter) {}

    // 인게임 툴팁 표시 순서
    private static final List<StatDef> DEFS = List.of(
            new StatDef("STR", false, ItemOption::getStr),
            new StatDef("DEX", false, ItemOption::getDex),
            new StatDef("INT", false, ItemOption::getInt_),
            new StatDef("LUK", false, ItemOption::getLuk),
            new StatDef("올스탯", true, ItemOption::getAllStat),
            new StatDef("최대 HP", false, ItemOption::getMaxHp),
            new StatDef("최대 MP", false, ItemOption::getMaxMp),
            new StatDef("최대 HP", true, ItemOption::getMaxHpRate),
            new StatDef("최대 MP", true, ItemOption::getMaxMpRate),
            new StatDef("공격력", false, ItemOption::getAttackPower),
            new StatDef("마력", false, ItemOption::getMagicPower),
            new StatDef("방어력", false, ItemOption::getArmor),
            new StatDef("이동속도", false, ItemOption::getSpeed),
            new StatDef("점프력", false, ItemOption::getJump),
            new StatDef("보스 몬스터 공격 시 데미지", true, ItemOption::getBossDamage),
            new StatDef("몬스터 방어율 무시", true, ItemOption::getIgnoreMonsterArmor),
            new StatDef("데미지", true, ItemOption::getDamage)
    );

    public static List<EquipmentStatLine> build(ItemOption total, ItemOption base, ItemOption starforce,
                                                ItemOption etc, ItemOption add, ItemOption exceptional) {
        if (total == null) return List.of();
        List<EquipmentStatLine> lines = new ArrayList<>();
        for (StatDef def : DEFS) {
            int totalValue = value(total, def);
            if (totalValue == 0) continue;
            lines.add(EquipmentStatLine.builder()
                    .label(def.label())
                    .percent(def.percent())
                    .total(totalValue)
                    .base(value(base, def))
                    .starforce(value(starforce, def))
                    .etc(value(etc, def))
                    .add(value(add, def))
                    .exceptional(value(exceptional, def))
                    .build());
        }
        return lines;
    }

    private static int value(ItemOption opt, StatDef def) {
        if (opt == null) return 0;
        String raw = def.getter().apply(opt);
        try {
            return raw == null ? 0 : Integer.parseInt(raw.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
