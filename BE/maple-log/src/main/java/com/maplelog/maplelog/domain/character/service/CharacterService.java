package com.maplelog.maplelog.domain.character.service;

import com.maplelog.maplelog.domain.character.client.NexonApiClient;
import com.maplelog.maplelog.domain.character.dto.nexon.CharacterBasicResponse;
import com.maplelog.maplelog.domain.character.dto.nexon.NexonAndroidResponse;
import com.maplelog.maplelog.domain.character.dto.nexon.NexonCharacterListResponse;
import com.maplelog.maplelog.domain.character.dto.nexon.NexonEquipmentResponse;
import com.maplelog.maplelog.domain.character.dto.response.CharacterEquipmentResponse;
import com.maplelog.maplelog.domain.character.dto.response.CharacterResponse;
import com.maplelog.maplelog.domain.character.entity.MapleCharacter;
import com.maplelog.maplelog.domain.character.repository.MapleCharacterRepository;
import com.maplelog.maplelog.domain.log.repository.ActivityLogRepository;
import com.maplelog.maplelog.domain.member.entity.Member;
import com.maplelog.maplelog.domain.member.repository.MemberRepository;
import com.maplelog.maplelog.domain.schedule.repository.CharacterScheduleRepository;
import com.maplelog.maplelog.domain.snapshot.repository.CharacterSnapshotRepository;
import com.maplelog.maplelog.global.exception.NexonApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CharacterService {

    private final NexonApiClient nexonApiClient;
    private final MapleCharacterRepository mapleCharacterRepository;
    private final MemberRepository memberRepository;
    private final ActivityLogRepository activityLogRepository;
    private final CharacterScheduleRepository characterScheduleRepository;
    private final CharacterSnapshotRepository characterSnapshotRepository;

    // 비로그인 닉네임 검색
    public CharacterResponse searchByName(String characterName) {
        String ocid = nexonApiClient.getCharacterOcid(characterName);
        CharacterBasicResponse basic = nexonApiClient.getCharacterBasic(ocid);
        return CharacterResponse.builder()
                .characterName(basic.getCharacterName())
                .characterClass(basic.getCharacterClass())
                .level(basic.getCharacterLevel())
                .world(basic.getWorldName())
                .characterImage(basic.getCharacterImage())
                .build();
    }

    @Transactional
    public CharacterResponse registerCharacter(Long memberId, String characterName) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        String ocid = nexonApiClient.getCharacterOcid(characterName);

        // 이미 이 멤버에 등록된 캐릭터면 그대로 반환
        return mapleCharacterRepository.findByMemberIdAndOcid(memberId, ocid)
                .map(CharacterResponse::from)
                .orElseGet(() -> {
                    CharacterBasicResponse basic = nexonApiClient.getCharacterBasic(ocid);
                    MapleCharacter character = MapleCharacter.builder()
                            .member(member)
                            .ocid(ocid)
                            .characterName(basic.getCharacterName())
                            .characterClass(basic.getCharacterClass())
                            .level(basic.getCharacterLevel())
                            .world(basic.getWorldName())
                            .characterImage(basic.getCharacterImage())
                            .build();
                    return CharacterResponse.from(mapleCharacterRepository.save(character));
                });
    }

    @Transactional
    public CharacterResponse refreshCharacter(Long characterId) {
        MapleCharacter character = mapleCharacterRepository.findById(characterId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 캐릭터입니다."));

        CharacterBasicResponse basic = nexonApiClient.getCharacterBasic(character.getOcid());
        character.update(basic.getCharacterClass(), basic.getCharacterLevel(),
                basic.getWorldName(), basic.getCharacterImage());

        return CharacterResponse.from(character);
    }

    @Transactional(readOnly = true)
    public CharacterResponse getCharacter(Long characterId) {
        MapleCharacter character = mapleCharacterRepository.findById(characterId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 캐릭터입니다."));
        return CharacterResponse.from(character);
    }

    @Transactional(readOnly = true)
    public List<CharacterResponse> getMyCharacters(Long memberId) {
        return mapleCharacterRepository.findAllByMemberId(memberId).stream()
                .map(CharacterResponse::from)
                .toList();
    }

    @Transactional
    public CharacterResponse setMainCharacter(Long memberId, Long characterId) {
        mapleCharacterRepository.findByMemberIdAndIsMainTrue(memberId)
                .ifPresent(prev -> prev.setMain(false));

        MapleCharacter character = mapleCharacterRepository.findById(characterId)
                .filter(c -> c.getMember().getId().equals(memberId))
                .orElseThrow(() -> new IllegalArgumentException("해당 캐릭터를 찾을 수 없습니다."));
        character.setMain(true);

        return CharacterResponse.from(character);
    }

    @Transactional(readOnly = true)
    public List<CharacterEquipmentResponse> getEquipment(Long characterId) {
        MapleCharacter character = mapleCharacterRepository.findById(characterId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 캐릭터입니다."));
        NexonEquipmentResponse equipment = nexonApiClient.getCharacterEquipment(character.getOcid());

        List<CharacterEquipmentResponse> result = new ArrayList<>();
        if (equipment.getItemEquipment() != null) {
            equipment.getItemEquipment().stream()
                    .map(CharacterEquipmentResponse::from)
                    .forEach(result::add);
        }
        NexonEquipmentResponse.Title title = equipment.getTitle();
        if (title != null && title.getTitleName() != null) {
            result.add(CharacterEquipmentResponse.fromTitle(title));
        }

        // 안드로이드 조회가 실패해도 나머지 장비는 보여준다
        try {
            NexonAndroidResponse android = nexonApiClient.getCharacterAndroid(character.getOcid());
            if (android.getAndroidName() != null) {
                result.add(CharacterEquipmentResponse.fromAndroid(android));
            }
        } catch (NexonApiException | RestClientException e) {
            log.warn("안드로이드 조회 실패 - characterId={}, {}", characterId, e.getMessage());
        }
        return result;
    }

    // API 키로 보유 캐릭터 목록을 조회해 최고 레벨 캐릭터를 대표로 자동 등록
    @Transactional
    public CharacterResponse autoRegisterTopCharacter(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        String apiKey = member.getEffectiveApiKey();
        if (apiKey == null) {
            throw new IllegalArgumentException("API 키가 없습니다.");
        }

        NexonCharacterListResponse listResponse = nexonApiClient.getCharacterList(apiKey);

        NexonCharacterListResponse.CharacterInfo top = listResponse.getAccountList().stream()
                .flatMap(account -> account.getCharacterList().stream())
                .max(java.util.Comparator.comparingInt(NexonCharacterListResponse.CharacterInfo::getCharacterLevel))
                .orElseThrow(() -> new IllegalArgumentException("보유 캐릭터가 없습니다."));

        // 이미 이 멤버에 등록된 경우 대표만 갱신
        return mapleCharacterRepository.findByMemberIdAndOcid(memberId, top.getOcid())
                .map(existing -> {
                    mapleCharacterRepository.findByMemberIdAndIsMainTrue(memberId)
                            .ifPresent(prev -> prev.setMain(false));
                    existing.setMain(true);
                    return CharacterResponse.from(existing);
                })
                .orElseGet(() -> {
                    CharacterBasicResponse basic = nexonApiClient.getCharacterBasic(top.getOcid());

                    // 기존 대표 해제
                    mapleCharacterRepository.findByMemberIdAndIsMainTrue(memberId)
                            .ifPresent(prev -> prev.setMain(false));

                    MapleCharacter character = MapleCharacter.builder()
                            .member(member)
                            .ocid(top.getOcid())
                            .characterName(basic.getCharacterName())
                            .characterClass(basic.getCharacterClass())
                            .level(basic.getCharacterLevel())
                            .world(basic.getWorldName())
                            .characterImage(basic.getCharacterImage())
                            .build();
                    character.setMain(true);

                    return CharacterResponse.from(mapleCharacterRepository.save(character));
                });
    }

    @Transactional
    public void deleteCharacter(Long memberId, Long characterId) {
        MapleCharacter character = mapleCharacterRepository.findById(characterId)
                .filter(c -> c.getMember().getId().equals(memberId))
                .orElseThrow(() -> new IllegalArgumentException("해당 캐릭터를 찾을 수 없습니다."));

        activityLogRepository.deleteAllByCharacterId(characterId);
        characterScheduleRepository.deleteAllByCharacterId(characterId);
        characterSnapshotRepository.deleteAllByCharacterId(characterId);
        mapleCharacterRepository.delete(character);
    }
}
