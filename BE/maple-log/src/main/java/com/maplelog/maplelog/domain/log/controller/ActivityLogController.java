package com.maplelog.maplelog.domain.log.controller;

import com.maplelog.maplelog.domain.log.dto.ActivityLogRequest;
import com.maplelog.maplelog.domain.log.dto.ActivityLogResponse;
import com.maplelog.maplelog.domain.log.service.ActivityLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/characters/{characterId}/logs")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @PostMapping
    public ResponseEntity<ActivityLogResponse> createLog(
            @PathVariable Long characterId,
            @RequestBody @Valid ActivityLogRequest request) {
        return ResponseEntity.ok(activityLogService.createLog(characterId, request));
    }

    @GetMapping
    public ResponseEntity<List<ActivityLogResponse>> getLogs(@PathVariable Long characterId) {
        return ResponseEntity.ok(activityLogService.getLogs(characterId));
    }

    @DeleteMapping("/{logId}")
    public ResponseEntity<Void> deleteLog(
            @PathVariable Long characterId,
            @PathVariable Long logId) {
        activityLogService.deleteLog(characterId, logId);
        return ResponseEntity.noContent().build();
    }
}
