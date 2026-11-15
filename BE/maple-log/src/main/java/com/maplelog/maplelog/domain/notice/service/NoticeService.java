package com.maplelog.maplelog.domain.notice.service;

import com.maplelog.maplelog.domain.notice.dto.EventNoticeResponse;
import com.maplelog.maplelog.domain.notice.dto.NoticeResponse;
import com.maplelog.maplelog.domain.notice.dto.RankingResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class NoticeService {

    private final RestClient nexonRestClient;

    public NoticeService(@Qualifier("nexonRestClient") RestClient nexonRestClient) {
        this.nexonRestClient = nexonRestClient;
    }

    public NoticeResponse getNotices() {
        NoticeResponse response = nexonRestClient.get()
                .uri("/maplestory/v1/notice")
                .retrieve()
                .body(NoticeResponse.class);
        return response != null ? response : new NoticeResponse();
    }

    public EventNoticeResponse getEventNotices() {
        EventNoticeResponse response = nexonRestClient.get()
                .uri("/maplestory/v1/notice-event")
                .retrieve()
                .body(EventNoticeResponse.class);
        return response != null ? response : new EventNoticeResponse();
    }

    public RankingResponse getRanking(String worldName, String characterClass, int page) {
        // 넥슨 랭킹 API는 전날 날짜까지만 제공
        String date = LocalDate.now().minusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE);

        RankingResponse response = nexonRestClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder.path("/maplestory/v1/ranking/overall")
                            .queryParam("date", date)
                            .queryParam("page", page);
                    if (worldName != null && !worldName.isBlank()) {
                        builder = builder.queryParam("world_name", worldName);
                    }
                    if (characterClass != null && !characterClass.isBlank()) {
                        builder = builder.queryParam("character_class", characterClass);
                    }
                    return builder.build();
                })
                .retrieve()
                .body(RankingResponse.class);
        return response != null ? response : new RankingResponse();
    }
}
