package com.maplelog.maplelog.domain.schedule.controller;

import com.maplelog.maplelog.domain.schedule.dto.CharacterScheduleResponse;
import com.maplelog.maplelog.domain.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/api/characters/{characterId}/schedule/today")
    public ResponseEntity<CharacterScheduleResponse> getTodaySchedule(@PathVariable Long characterId) {
        return ResponseEntity.ok(scheduleService.getTodaySchedule(characterId));
    }

    @GetMapping("/api/characters/{characterId}/schedule/history")
    public ResponseEntity<List<CharacterScheduleResponse>> getScheduleHistory(@PathVariable Long characterId) {
        return ResponseEntity.ok(scheduleService.getScheduleHistory(characterId));
    }

    // 수동 동기화 후 오늘 스케줄 반환
    @PostMapping("/api/characters/{characterId}/schedule/sync")
    public ResponseEntity<CharacterScheduleResponse> syncSchedule(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long characterId) {
        Long memberId = Long.valueOf(userDetails.getUsername());
        return ResponseEntity.ok(scheduleService.syncAndGetSchedule(memberId, characterId));
    }

    // 내 모든 캐릭터 오늘 스케줄 한번에 조회
    @GetMapping("/api/characters/me/schedules/today")
    public ResponseEntity<List<CharacterScheduleResponse>> getMyTodaySchedules(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long memberId = Long.valueOf(userDetails.getUsername());
        return ResponseEntity.ok(scheduleService.getMyTodaySchedules(memberId));
    }
}
