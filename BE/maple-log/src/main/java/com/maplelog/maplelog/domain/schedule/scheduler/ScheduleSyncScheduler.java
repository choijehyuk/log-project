package com.maplelog.maplelog.domain.schedule.scheduler;

import com.maplelog.maplelog.domain.character.entity.MapleCharacter;
import com.maplelog.maplelog.domain.character.repository.MapleCharacterRepository;
import com.maplelog.maplelog.domain.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduleSyncScheduler {

    private final MapleCharacterRepository characterRepository;
    private final ScheduleService scheduleService;

    // 매일 오전 1시 동기화 (넥슨 API 데이터 갱신 시간 이후)
    @Scheduled(cron = "0 0 1 * * *")
    public void syncAllCharacterSchedules() {
        List<MapleCharacter> characters = characterRepository.findAllWithMember();

        for (MapleCharacter character : characters) {
            try {
                String apiKey = character.getMember().getEffectiveApiKey();
                if (apiKey == null) {
                    log.warn("멤버 {}의 API 키가 없어 스케줄 동기화를 건너뜁니다.", character.getMember().getId());
                    continue;
                }
                scheduleService.syncSchedule(character, apiKey);
                log.info("캐릭터 {} 스케줄 동기화 완료", character.getCharacterName());
            } catch (Exception e) {
                log.error("캐릭터 {} 스케줄 동기화 실패: {}", character.getCharacterName(), e.getMessage());
            }
        }
    }
}
