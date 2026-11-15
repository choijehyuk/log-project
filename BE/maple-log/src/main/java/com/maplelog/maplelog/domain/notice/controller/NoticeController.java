package com.maplelog.maplelog.domain.notice.controller;

import com.maplelog.maplelog.domain.notice.dto.EventNoticeResponse;
import com.maplelog.maplelog.domain.notice.dto.NoticeResponse;
import com.maplelog.maplelog.domain.notice.dto.RankingResponse;
import com.maplelog.maplelog.domain.notice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping("/notice")
    public ResponseEntity<NoticeResponse> getNotices() {
        return ResponseEntity.ok(noticeService.getNotices());
    }

    @GetMapping("/notice/event")
    public ResponseEntity<EventNoticeResponse> getEventNotices() {
        return ResponseEntity.ok(noticeService.getEventNotices());
    }

    @GetMapping("/ranking")
    public ResponseEntity<RankingResponse> getRanking(
            @RequestParam(required = false) String worldName,
            @RequestParam(required = false) String characterClass,
            @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(noticeService.getRanking(worldName, characterClass, page));
    }
}
