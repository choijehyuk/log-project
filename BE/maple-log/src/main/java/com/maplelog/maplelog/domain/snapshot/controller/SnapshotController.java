package com.maplelog.maplelog.domain.snapshot.controller;

import com.maplelog.maplelog.domain.snapshot.dto.SnapshotResponse;
import com.maplelog.maplelog.domain.snapshot.dto.SnapshotSummaryResponse;
import com.maplelog.maplelog.domain.snapshot.service.SnapshotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/characters/{characterId}/snapshots")
@RequiredArgsConstructor
public class SnapshotController {

    private final SnapshotService snapshotService;

    @GetMapping
    public ResponseEntity<List<SnapshotResponse>> getSnapshots(
            @PathVariable Long characterId,
            @RequestParam(defaultValue = "30") int limit) {
        return ResponseEntity.ok(snapshotService.getSnapshots(characterId, limit));
    }

    @PostMapping
    public ResponseEntity<SnapshotResponse> saveSnapshot(@PathVariable Long characterId) {
        return ResponseEntity.ok(snapshotService.saveSnapshot(characterId));
    }

    @GetMapping("/summary")
    public ResponseEntity<SnapshotSummaryResponse> getSummary(@PathVariable Long characterId) {
        return ResponseEntity.ok(snapshotService.getSummary(characterId));
    }
}
