package com.maplelog.maplelog.domain.character.dto.response;

import com.maplelog.maplelog.domain.character.dto.nexon.NexonAndroidResponse;
import com.maplelog.maplelog.domain.character.dto.nexon.NexonEquipmentResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CharacterEquipmentResponse {

    private String slot;
    private String name;
    private String icon;
    private int starforce;

    public static CharacterEquipmentResponse from(NexonEquipmentResponse.ItemEquipment item) {
        return CharacterEquipmentResponse.builder()
                .slot(item.getItemEquipmentSlot())
                .name(item.getItemName())
                .icon(item.getItemIcon())
                .starforce(parseStarforce(item.getStarforce()))
                .build();
    }

    // 칭호는 item_equipment 밖의 별도 항목이라 슬롯 "칭호"로 맞춰 내려준다
    public static CharacterEquipmentResponse fromTitle(NexonEquipmentResponse.Title title) {
        return CharacterEquipmentResponse.builder()
                .slot("칭호")
                .name(title.getTitleName())
                .icon(title.getTitleIcon())
                .starforce(0)
                .build();
    }

    // 안드로이드는 별도 API라 슬롯 "안드로이드"로 맞춰 내려준다
    public static CharacterEquipmentResponse fromAndroid(NexonAndroidResponse android) {
        return CharacterEquipmentResponse.builder()
                .slot("안드로이드")
                .name(android.getAndroidName())
                .icon(android.getAndroidIcon())
                .starforce(0)
                .build();
    }

    // Nexon API는 스타포스를 문자열("22")로 내려준다
    private static int parseStarforce(String value) {
        try {
            return value == null ? 0 : Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
