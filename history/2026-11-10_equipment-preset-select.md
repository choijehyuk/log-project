# 장비 프리셋 선택 기능 추가

**날짜**: 2026-11-10  
**작업 범위**: BE

## 배경 및 목적

Nexon Open API의 `/maplestory/v1/character/item-equipment`는 프리셋 1/2/3을 모두 한 번에 내려준다. 기존 코드는 `item_equipment`(현재 착용 프리셋)만 사용했으나, 사용자가 원하는 프리셋을 선택해 조회할 수 있도록 `?preset=1|2|3` 쿼리 파라미터를 추가했다.

## 변경 파일 목록

| 파일 경로 | 변경 유형 | 주요 내용 |
|-----------|-----------|-----------|
| `BE/.../dto/nexon/NexonEquipmentResponse.java` | 수정 | `item_equipment_preset1/2/3`, `character_equipment_preset_no` 필드 추가 및 `getPresetEquipment(int)` 헬퍼 메서드 추가 |
| `BE/.../service/CharacterService.java` | 수정 | `getEquipment(Long characterId, int preset)` — preset 번호에 맞는 목록 사용 |
| `BE/.../controller/CharacterController.java` | 수정 | `GET /{characterId}/equipment?preset=1` — `@RequestParam(defaultValue="1") int preset` 추가 |

## 주요 변경 내용

### 백엔드 (BE)

**`NexonEquipmentResponse`**
- `character_equipment_preset_no` (현재 착용 중인 프리셋 번호) 필드 추가
- `item_equipment_preset1`, `item_equipment_preset2`, `item_equipment_preset3` 필드 추가
- `getPresetEquipment(int preset)` — switch로 1/2/3 분기, null이면 빈 리스트 반환

**`CharacterService`**
- `getEquipment(Long characterId, int preset)` 시그니처 변경
- 기존 `equipment.getItemEquipment()` 대신 `equipment.getPresetEquipment(preset)` 사용
- 칭호·안드로이드는 프리셋과 무관하게 동일하게 추가

**`CharacterController`**
- `@RequestParam(defaultValue = "1") int preset` 추가
- 서비스 호출 시 preset 전달

## 동작 흐름

1. FE가 `GET /api/characters/{id}/equipment?preset=2` 호출
2. 컨트롤러가 `preset=2`를 서비스에 전달
3. 서비스가 Nexon API 1회 호출 → `NexonEquipmentResponse` 수신
4. `getPresetEquipment(2)` → `item_equipment_preset2` 목록 반환
5. 칭호·안드로이드 append 후 `List<CharacterEquipmentResponse>` 응답

## 주의사항 / 연관 사항

- Nexon API는 프리셋과 무관하게 1회 호출로 전체 데이터를 받으므로 preset마다 별도 API 호출 없음
- `preset` 기본값은 1 (인게임 기본 프리셋과 동일)
- FE는 프리셋 1/2/3 탭을 두고 선택 시 `?preset=N`으로 재요청하면 됨
- 칭호·안드로이드는 프리셋 구분 없이 항상 동일하게 붙음 (Nexon API 스펙상 프리셋별 데이터 없음)
