package com.maplelog.maplelog.domain.character.controller;

import com.maplelog.maplelog.domain.character.dto.request.CharacterRegisterRequest;
import com.maplelog.maplelog.domain.character.dto.response.CharacterEquipmentResponse;
import com.maplelog.maplelog.domain.character.dto.response.CharacterResponse;
import com.maplelog.maplelog.domain.character.service.CharacterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/characters")
@RequiredArgsConstructor
public class CharacterController {

    private final CharacterService characterService;

    // 비로그인 닉네임 검색
    @GetMapping("/search")
    public ResponseEntity<CharacterResponse> searchCharacter(@RequestParam String name) {
        return ResponseEntity.ok(characterService.searchByName(name));
    }

    // 내 계정에 캐릭터 등록 (로그인 필요)
    @PostMapping
    public ResponseEntity<CharacterResponse> registerCharacter(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid CharacterRegisterRequest request) {
        Long memberId = Long.valueOf(userDetails.getUsername());
        return ResponseEntity.ok(characterService.registerCharacter(memberId, request.getCharacterName()));
    }

    // 캐릭터 단건 조회
    @GetMapping("/{characterId}")
    public ResponseEntity<CharacterResponse> getCharacter(@PathVariable Long characterId) {
        return ResponseEntity.ok(characterService.getCharacter(characterId));
    }

    // API 키로 보유 캐릭터 중 최고 레벨 캐릭터를 대표로 자동 등록
    @PostMapping("/auto-register")
    public ResponseEntity<CharacterResponse> autoRegister(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long memberId = Long.valueOf(userDetails.getUsername());
        return ResponseEntity.ok(characterService.autoRegisterTopCharacter(memberId));
    }

    // 캐릭터 장비 조회
    @GetMapping("/{characterId}/equipment")
    public ResponseEntity<List<CharacterEquipmentResponse>> getEquipment(@PathVariable Long characterId) {
        return ResponseEntity.ok(characterService.getEquipment(characterId));
    }

    // 캐릭터 정보 최신화
    @PutMapping("/{characterId}/refresh")
    public ResponseEntity<CharacterResponse> refreshCharacter(@PathVariable Long characterId) {
        return ResponseEntity.ok(characterService.refreshCharacter(characterId));
    }

    // 내 캐릭터 목록
    @GetMapping("/me")
    public ResponseEntity<List<CharacterResponse>> getMyCharacters(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long memberId = Long.valueOf(userDetails.getUsername());
        return ResponseEntity.ok(characterService.getMyCharacters(memberId));
    }

    // 대표 캐릭터 설정
    @PatchMapping("/me/{characterId}/main")
    public ResponseEntity<CharacterResponse> setMainCharacter(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long characterId) {
        Long memberId = Long.valueOf(userDetails.getUsername());
        return ResponseEntity.ok(characterService.setMainCharacter(memberId, characterId));
    }

    // 캐릭터 삭제
    @DeleteMapping("/{characterId}")
    public ResponseEntity<Void> deleteCharacter(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long characterId) {
        Long memberId = Long.valueOf(userDetails.getUsername());
        characterService.deleteCharacter(memberId, characterId);
        return ResponseEntity.noContent().build();
    }
}
