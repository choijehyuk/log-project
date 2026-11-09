package com.maplelog.maplelog.domain.schedule.repository;

import com.maplelog.maplelog.domain.schedule.entity.CharacterSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CharacterScheduleRepository extends JpaRepository<CharacterSchedule, Long> {
    Optional<CharacterSchedule> findByCharacterIdAndScheduleDate(Long characterId, LocalDate date);
    List<CharacterSchedule> findAllByCharacterIdOrderByScheduleDateDesc(Long characterId);
    void deleteAllByCharacterId(Long characterId);
    List<CharacterSchedule> findAllByCharacterIdInAndScheduleDate(List<Long> characterIds, LocalDate date);
}
