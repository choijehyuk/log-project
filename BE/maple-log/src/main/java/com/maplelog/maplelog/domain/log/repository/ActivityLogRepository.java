package com.maplelog.maplelog.domain.log.repository;

import com.maplelog.maplelog.domain.log.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findAllByCharacterIdOrderByCreatedAtDesc(Long characterId);
    void deleteAllByCharacterId(Long characterId);
}