package com.maplelog.maplelog.domain.character.dto.nexon;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class NexonEquipmentResponse {

    @JsonProperty("item_equipment")
    private List<ItemEquipment> itemEquipment;

    @JsonProperty("title")
    private Title title;

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
    }
}
