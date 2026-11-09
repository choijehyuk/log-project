package com.maplelog.maplelog.domain.log.service;

import com.maplelog.maplelog.domain.character.entity.MapleCharacter;
import com.maplelog.maplelog.domain.character.repository.MapleCharacterRepository;
import com.maplelog.maplelog.domain.log.dto.ActivityLogRequest;
import com.maplelog.maplelog.domain.log.dto.ActivityLogResponse;
import com.maplelog.maplelog.domain.log.entity.ActivityLog;
import com.maplelog.maplelog.domain.log.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final MapleCharacterRepository mapleCharacterRepository;

    @Transactional
    public ActivityLogResponse createLog(Long characterId, ActivityLogRequest request) {
        MapleCharacter character = mapleCharacterRepository.findById(characterId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 캐릭터입니다."));

        ActivityLog log = ActivityLog.builder()
                .character(character)
                .content(request.getContent())
                .build();

        return ActivityLogResponse.from(activityLogRepository.save(log));
    }

    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getLogs(Long characterId) {
        return activityLogRepository.findAllByCharacterIdOrderByCreatedAtDesc(characterId)
                .stream()
                .map(ActivityLogResponse::from)
                .toList();
    }

    @Transactional
    public void deleteLog(Long characterId, Long logId) {
        ActivityLog log = activityLogRepository.findById(logId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 로그입니다."));

        if (!log.getCharacter().getId().equals(characterId)) {
            throw new IllegalArgumentException("해당 캐릭터의 로그가 아닙니다.");
        }

        activityLogRepository.delete(log);
    }
}
