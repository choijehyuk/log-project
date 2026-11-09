package com.maplelog.maplelog.domain.snapshot.service;

import com.maplelog.maplelog.domain.character.client.NexonApiClient;
import com.maplelog.maplelog.domain.character.dto.nexon.CharacterBasicResponse;
import com.maplelog.maplelog.domain.character.dto.nexon.CharacterStatResponse;
import com.maplelog.maplelog.domain.character.entity.MapleCharacter;
import com.maplelog.maplelog.domain.character.repository.MapleCharacterRepository;
import com.maplelog.maplelog.domain.snapshot.dto.SnapshotResponse;
import com.maplelog.maplelog.domain.snapshot.dto.SnapshotSummaryResponse;
import com.maplelog.maplelog.domain.snapshot.entity.CharacterSnapshot;
import com.maplelog.maplelog.domain.snapshot.repository.CharacterSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SnapshotService {

    private final CharacterSnapshotRepository snapshotRepository;
    private final MapleCharacterRepository mapleCharacterRepository;
    private final NexonApiClient nexonApiClient;

    @Transactional(readOnly = true)
    public List<SnapshotResponse> getSnapshots(Long characterId, int limit) {
        return snapshotRepository.findAllByCharacterIdOrderBySnapshotDateDesc(
                        characterId, PageRequest.of(0, limit))
                .stream()
                .map(SnapshotResponse::from)
                .toList();
    }

    @Transactional
    public SnapshotResponse saveSnapshot(Long characterId) {
        MapleCharacter character = mapleCharacterRepository.findById(characterId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 캐릭터입니다."));

        LocalDate today = LocalDate.now();
        if (snapshotRepository.findByCharacterIdAndSnapshotDate(characterId, today).isPresent()) {
            throw new IllegalArgumentException("오늘 이미 스냅샷이 저장되어 있습니다.");
        }

        CharacterBasicResponse basic = nexonApiClient.getCharacterBasic(character.getOcid());
        long combatPower = fetchCombatPower(character.getOcid());

        CharacterSnapshot snapshot = CharacterSnapshot.builder()
                .character(character)
                .level(basic.getCharacterLevel())
                .expRate(basic.getCharacterExpRate())
                .combatPower(combatPower)
                .snapshotDate(today)
                .build();

        return SnapshotResponse.from(snapshotRepository.save(snapshot));
    }

    // 스케줄러에서 호출 — 이미 오늘 저장된 경우 스킵
    @Transactional
    public void saveSnapshotIfAbsent(MapleCharacter character) {
        LocalDate today = LocalDate.now();
        if (snapshotRepository.findByCharacterIdAndSnapshotDate(character.getId(), today).isPresent()) {
            return;
        }
        try {
            CharacterBasicResponse basic = nexonApiClient.getCharacterBasic(character.getOcid());
            long combatPower = fetchCombatPower(character.getOcid());

            snapshotRepository.save(CharacterSnapshot.builder()
                    .character(character)
                    .level(basic.getCharacterLevel())
                    .expRate(basic.getCharacterExpRate())
                    .combatPower(combatPower)
                    .snapshotDate(today)
                    .build());
        } catch (Exception e) {
            log.warn("스냅샷 자동 저장 실패 - characterId: {}, error: {}", character.getId(), e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public SnapshotSummaryResponse getSummary(Long characterId) {
        List<CharacterSnapshot> all = snapshotRepository.findAllByCharacterId(characterId);
        if (all.isEmpty()) {
            throw new IllegalArgumentException("저장된 스냅샷이 없습니다.");
        }

        CharacterSnapshot first = snapshotRepository.findTopByCharacterIdOrderBySnapshotDateAsc(characterId)
                .orElseThrow();
        CharacterSnapshot latest = all.stream()
                .max((a, b) -> a.getSnapshotDate().compareTo(b.getSnapshotDate()))
                .orElseThrow();

        return SnapshotSummaryResponse.builder()
                .firstDate(first.getSnapshotDate())
                .latestDate(latest.getSnapshotDate())
                .firstLevel(first.getLevel())
                .latestLevel(latest.getLevel())
                .levelGain(latest.getLevel() - first.getLevel())
                .firstCombatPower(first.getCombatPower())
                .latestCombatPower(latest.getCombatPower())
                .combatPowerGain(latest.getCombatPower() - first.getCombatPower())
                .totalSnapshots(all.size())
                .build();
    }

    private long fetchCombatPower(String ocid) {
        try {
            CharacterStatResponse stat = nexonApiClient.getCharacterStat(ocid);
            return stat.getCombatPower();
        } catch (Exception e) {
            log.warn("전투력 조회 실패 - ocid: {}", ocid);
            return 0L;
        }
    }
}
