package com.maplelog.maplelog.global.admin;

import com.maplelog.maplelog.domain.schedule.scheduler.ScheduleSyncScheduler;
import com.maplelog.maplelog.domain.snapshot.scheduler.SnapshotScheduler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminSchedulerController {

    private final SnapshotScheduler snapshotScheduler;
    private final ScheduleSyncScheduler scheduleSyncScheduler;

    @PostMapping("/scheduler/snapshot")
    public ResponseEntity<String> runSnapshot(@RequestHeader("X-Admin-Key") String key) {
        if (!isValidKey(key)) return ResponseEntity.status(403).body("Forbidden");
        log.info("[수동] 스냅샷 스케줄러 실행");
        snapshotScheduler.saveAllSnapshots();
        return ResponseEntity.ok("스냅샷 저장 완료");
    }

    @PostMapping("/scheduler/schedule-sync")
    public ResponseEntity<String> runScheduleSync(@RequestHeader("X-Admin-Key") String key) {
        if (!isValidKey(key)) return ResponseEntity.status(403).body("Forbidden");
        log.info("[수동] 스케줄 동기화 스케줄러 실행");
        scheduleSyncScheduler.syncAllCharacterSchedules();
        return ResponseEntity.ok("스케줄 동기화 완료");
    }

    @PostMapping("/scheduler/run-all")
    public ResponseEntity<String> runAll(@RequestHeader("X-Admin-Key") String key) {
        if (!isValidKey(key)) return ResponseEntity.status(403).body("Forbidden");
        log.info("[수동] 전체 스케줄러 실행");
        snapshotScheduler.saveAllSnapshots();
        scheduleSyncScheduler.syncAllCharacterSchedules();
        return ResponseEntity.ok("스냅샷 + 스케줄 동기화 완료");
    }

    private boolean isValidKey(String key) {
        return "maplelog-admin-2024".equals(key);
    }
}
