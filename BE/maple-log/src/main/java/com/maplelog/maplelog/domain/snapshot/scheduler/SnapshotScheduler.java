package com.maplelog.maplelog.domain.snapshot.scheduler;

import com.maplelog.maplelog.domain.character.entity.MapleCharacter;
import com.maplelog.maplelog.domain.character.repository.MapleCharacterRepository;
import com.maplelog.maplelog.domain.snapshot.service.SnapshotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SnapshotScheduler {

    private final SnapshotService snapshotService;
    private final MapleCharacterRepository mapleCharacterRepository;

    @Scheduled(cron = "0 0 1 * * *")
    public void saveAllSnapshots() {
        List<MapleCharacter> characters = mapleCharacterRepository.findAll();
        log.info("스냅샷 자동 저장 시작 - 캐릭터 수: {}", characters.size());

        for (MapleCharacter character : characters) {
            snapshotService.saveSnapshotIfAbsent(character);
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        log.info("스냅샷 자동 저장 완료");
    }
}
