package com.maplelog.maplelog.domain.schedule.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ContentRecord {

    @JsonProperty("content_name")
    private String contentName;

    @JsonProperty("type")
    private String type;

    @JsonProperty("registration_flag")
    private String registrationFlag;

    @JsonProperty("now_count")
    private int nowCount;

    @JsonProperty("max_count")
    private int maxCount;

    @JsonProperty("quest_state")
    private String questState;
}
