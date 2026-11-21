package com.maplelog.maplelog.domain.schedule.service;

import com.maplelog.maplelog.domain.character.client.NexonApiClient;
import com.maplelog.maplelog.domain.character.dto.nexon.NexonScheduleResponse;
import com.maplelog.maplelog.domain.character.entity.MapleCharacter;
import com.maplelog.maplelog.domain.character.repository.MapleCharacterRepository;
import com.maplelog.maplelog.domain.member.entity.Member;
import com.maplelog.maplelog.domain.member.repository.MemberRepository;
import com.maplelog.maplelog.domain.schedule.dto.CharacterScheduleResponse;
import com.maplelog.maplelog.domain.schedule.entity.CharacterSchedule;
import com.maplelog.maplelog.domain.schedule.repository.CharacterScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final NexonApiClient nexonApiClient;
    private final CharacterScheduleRepository scheduleRepository;
    private final MapleCharacterRepository mapleCharacterRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public void syncSchedule(MapleCharacter character, String userApiKey) {
        NexonScheduleResponse nexonResponse =
                nexonApiClient.getCharacterSchedule(character.getOcid(), userApiKey);

        LocalDate scheduleDate = OffsetDateTime.parse(nexonResponse.getDate()).toLocalDate();

        scheduleRepository.findByCharacterIdAndScheduleDate(character.getId(), scheduleDate)
                .ifPresentOrElse(
                        existing -> existing.update(
                                nexonResponse.getBossContents(),
                                nexonResponse.getDailyContents(),
                                nexonResponse.getWeeklyContents(),
                                nexonResponse.getWeeklyBossClearCount(),
                                nexonResponse.getWeeklyBossClearLimitCount()
                        ),
                        () -> scheduleRepository.save(CharacterSchedule.builder()
                                .character(character)
                                .scheduleDate(scheduleDate)
                                .bossContents(nexonResponse.getBossContents())
                                .dailyContents(nexonResponse.getDailyContents())
                                .weeklyContents(nexonResponse.getWeeklyContents())
                                .weeklyBossClearCount(nexonResponse.getWeeklyBossClearCount())
                                .weeklyBossClearLimitCount(nexonResponse.getWeeklyBossClearLimitCount())
                                .build())
                );
    }

    @Transactional
    public CharacterScheduleResponse syncAndGetSchedule(Long memberId, Long characterId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        MapleCharacter character = mapleCharacterRepository.findById(characterId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 캐릭터입니다."));
        if (!character.getMember().getId().equals(memberId)) {
            throw new IllegalArgumentException("본인 캐릭터만 동기화할 수 있습니다.");
        }
        syncSchedule(character, member.getEffectiveApiKey());
        return getTodaySchedule(characterId);
    }

    @Transactional(readOnly = true)
    public CharacterScheduleResponse getTodaySchedule(Long characterId) {
        LocalDate today = LocalDate.now();
        CharacterSchedule schedule = scheduleRepository
                .findByCharacterIdAndScheduleDate(characterId, today)
                .orElseThrow(() -> new IllegalArgumentException("오늘 스케줄 데이터가 없습니다. 동기화가 필요합니다."));
        return CharacterScheduleResponse.from(schedule);
    }

    @Transactional(readOnly = true)
    public List<CharacterScheduleResponse> getScheduleHistory(Long characterId) {
        return scheduleRepository.findAllByCharacterIdOrderByScheduleDateDesc(characterId)
                .stream()
                .map(CharacterScheduleResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CharacterScheduleResponse> getMyTodaySchedules(Long memberId) {
        LocalDate today = LocalDate.now();
        List<Long> characterIds = mapleCharacterRepository.findAllByMemberId(memberId)
                .stream()
                .map(MapleCharacter::getId)
                .toList();

        return scheduleRepository.findAllByCharacterIdInAndScheduleDate(characterIds, today)
                .stream()
                .map(CharacterScheduleResponse::from)
                .toList();
    }
}
