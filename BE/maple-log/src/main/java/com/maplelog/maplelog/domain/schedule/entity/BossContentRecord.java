package com.maplelog.maplelog.domain.schedule.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class BossContentRecord {

    @JsonProperty("content_name")
    private String contentName;

    @JsonProperty("difficulty")
    private String difficulty;

    @JsonProperty("cycle")
    private String cycle;

    @JsonProperty("list_order_no")
    private int listOrderNo;

    @JsonProperty("registration_flag")
    private String registrationFlag;

    @JsonProperty("complete_flag")
    private String completeFlag;
}
