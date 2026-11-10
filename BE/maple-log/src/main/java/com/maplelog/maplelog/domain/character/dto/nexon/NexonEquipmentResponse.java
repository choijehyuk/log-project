package com.maplelog.maplelog.domain.character.dto.nexon;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class NexonEquipmentResponse {

    @JsonProperty("preset_no")
    private int characterEquipmentPresetNo;

    @JsonProperty("item_equipment")
    private List<ItemEquipment> itemEquipment;

    @JsonProperty("item_equipment_preset_1")
    private List<ItemEquipment> itemEquipmentPreset1;

    @JsonProperty("item_equipment_preset_2")
    private List<ItemEquipment> itemEquipmentPreset2;

    @JsonProperty("item_equipment_preset_3")
    private List<ItemEquipment> itemEquipmentPreset3;

    @JsonProperty("title")
    private Title title;

    public List<ItemEquipment> getPresetEquipment(int preset) {
        return switch (preset) {
            case 2 -> itemEquipmentPreset2 != null ? itemEquipmentPreset2 : List.of();
            case 3 -> itemEquipmentPreset3 != null ? itemEquipmentPreset3 : List.of();
            default -> itemEquipmentPreset1 != null ? itemEquipmentPreset1 : List.of();
        };
    }

    @Getter
    @NoArgsConstructor
    public static class Title {

        @JsonProperty("title_name")
        private String titleName;

        @JsonProperty("title_icon")
        private String titleIcon;
    }

    @Getter
    @NoArgsConstructor
    public static class ItemOption {

        @JsonProperty("str")
        private String str;

        @JsonProperty("dex")
        private String dex;

        @JsonProperty("int")
        private String int_;

        @JsonProperty("luk")
        private String luk;

        @JsonProperty("max_hp")
        private String maxHp;

        @JsonProperty("max_mp")
        private String maxMp;

        @JsonProperty("max_hp_rate")
        private String maxHpRate;

        @JsonProperty("max_mp_rate")
        private String maxMpRate;

        @JsonProperty("speed")
        private String speed;

        @JsonProperty("jump")
        private String jump;

        @JsonProperty("attack_power")
        private String attackPower;

        @JsonProperty("magic_power")
        private String magicPower;

        @JsonProperty("armor")
        private String armor;

        @JsonProperty("boss_damage")
        private String bossDamage;

        @JsonProperty("ignore_monster_armor")
        private String ignoreMonsterArmor;

        @JsonProperty("all_stat")
        private String allStat;

        @JsonProperty("damage")
        private String damage;

        @JsonProperty("base_equipment_level")
        private int baseEquipmentLevel;
    }

    @Getter
    @NoArgsConstructor
    public static class ItemEquipment {

        @JsonProperty("item_equipment_part")
        private String itemEquipmentPart;

        @JsonProperty("item_equipment_slot")
        private String itemEquipmentSlot;

        @JsonProperty("item_name")
        private String itemName;

        @JsonProperty("item_icon")
        private String itemIcon;

        @JsonProperty("starforce")
        private String starforce;

        @JsonProperty("scroll_upgrade")
        private String scrollUpgrade;

        @JsonProperty("cuttable_count")
        private String cuttableCount;

        @JsonProperty("golden_hammer_flag")
        private String goldenHammerFlag;

        @JsonProperty("potential_option_grade")
        private String potentialOptionGrade;

        @JsonProperty("potential_option_1")
        private String potentialOption1;

        @JsonProperty("potential_option_2")
        private String potentialOption2;

        @JsonProperty("potential_option_3")
        private String potentialOption3;

        @JsonProperty("additional_potential_option_grade")
        private String additionalPotentialOptionGrade;

        @JsonProperty("additional_potential_option_1")
        private String additionalPotentialOption1;

        @JsonProperty("additional_potential_option_2")
        private String additionalPotentialOption2;

        @JsonProperty("additional_potential_option_3")
        private String additionalPotentialOption3;

        @JsonProperty("soul_name")
        private String soulName;

        @JsonProperty("soul_option")
        private String soulOption;

        @JsonProperty("item_total_option")
        private ItemOption itemTotalOption;

        @JsonProperty("item_base_option")
        private ItemOption itemBaseOption;

        @JsonProperty("item_add_option")
        private ItemOption itemAddOption;

        @JsonProperty("item_etc_option")
        private ItemOption itemEtcOption;

        @JsonProperty("item_starforce_option")
        private ItemOption itemStarforceOption;

        @JsonProperty("item_exceptional_option")
        private ItemOption itemExceptionalOption;
    }
}
