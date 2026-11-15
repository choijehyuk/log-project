package com.maplelog.maplelog.domain.notice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class NoticeResponse {

    @JsonProperty("notice")
    private List<NoticeItem> notice;

    @Getter
    @NoArgsConstructor
    public static class NoticeItem {
        @JsonProperty("title")
        private String title;
        @JsonProperty("url")
        private String url;
        @JsonProperty("notice_id")
        private Long noticeId;
        @JsonProperty("date")
        private String date;
    }
}
