package com.maplelog.maplelog.domain.snapshot.controller;

import com.maplelog.maplelog.domain.snapshot.dto.SnapshotResponse;
import com.maplelog.maplelog.domain.snapshot.dto.SnapshotSummaryResponse;
import com.maplelog.maplelog.domain.snapshot.scheduler.SnapshotScheduler;
import com.maplelog.maplelog.domain.snapshot.service.SnapshotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SnapshotController {

    private final SnapshotService snapshotService;
    private final SnapshotScheduler snapshotScheduler;

    @GetMapping("/api/characters/{characterId}/snapshots")
    public ResponseEntity<List<SnapshotResponse>> getSnapshots(
            @PathVariable Long characterId,
            @RequestParam(defaultValue = "30") int limit) {
        return ResponseEntity.ok(snapshotService.getSnapshots(characterId, limit));
    }

    @PostMapping("/api/characters/{characterId}/snapshots")
    public ResponseEntity<SnapshotResponse> saveSnapshot(@PathVariable Long characterId) {
        return ResponseEntity.ok(snapshotService.saveSnapshot(characterId));
    }

    @GetMapping("/api/characters/{characterId}/snapshots/summary")
    public ResponseEntity<SnapshotSummaryResponse> getSummary(@PathVariable Long characterId) {
        return ResponseEntity.ok(snapshotService.getSummary(characterId));
    }

    // TODO: 테스트용 — 배포 전 삭제
    @PostMapping("/api/admin/snapshots/trigger-all")
    public ResponseEntity<Void> triggerAll() {
        snapshotScheduler.saveAllSnapshots();
        return ResponseEntity.ok().build();
    }
}
