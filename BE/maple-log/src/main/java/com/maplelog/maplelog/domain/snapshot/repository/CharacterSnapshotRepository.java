package com.maplelog.maplelog.domain.snapshot.repository;

import com.maplelog.maplelog.domain.snapshot.entity.CharacterSnapshot;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CharacterSnapshotRepository extends JpaRepository<CharacterSnapshot, Long> {
    List<CharacterSnapshot> findAllByCharacterIdOrderBySnapshotDateDesc(Long characterId, Pageable pageable);
    Optional<CharacterSnapshot> findByCharacterIdAndSnapshotDate(Long characterId, LocalDate snapshotDate);
    List<CharacterSnapshot> findAllByCharacterId(Long characterId);
    Optional<CharacterSnapshot> findTopByCharacterIdOrderBySnapshotDateAsc(Long characterId);
    void deleteAllByCharacterId(Long characterId);
}
