package com.maplelog.maplelog.domain.notice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class EventNoticeResponse {

    @JsonProperty("event_notice")
    private List<EventNoticeItem> eventNotice;

    @Getter
    @NoArgsConstructor
    public static class EventNoticeItem {
        @JsonProperty("title")
        private String title;
        @JsonProperty("url")
        private String url;
        @JsonProperty("notice_id")
        private Long noticeId;
        @JsonProperty("date")
        private String date;
        @JsonProperty("date_event_start")
        private String dateEventStart;
        @JsonProperty("date_event_end")
        private String dateEventEnd;
    }
}
