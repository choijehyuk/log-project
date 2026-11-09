package com.maplelog.maplelog.domain.character.dto.nexon;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 안드로이드를 장착하지 않았으면 android_name이 null로 온다
@Getter
@NoArgsConstructor
public class NexonAndroidResponse {

    @JsonProperty("android_name")
    private String androidName;

    @JsonProperty("android_icon")
    private String androidIcon;
}
