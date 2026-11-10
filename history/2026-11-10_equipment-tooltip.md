# 장비 상세 툴팁 개편 (인게임 스타일)

**날짜**: 2026-11-10  
**작업 범위**: BE + FE

## 배경 및 목적

장비 슬롯에 마우스를 올렸을 때 나오는 툴팁을 인게임 장비 상세창과 같은 형태로 바꾼다. 기존 툴팁은 합계 스탯만 보여주고 구성이 달랐다.

## 변경 파일 목록

| 파일 경로 | 변경 유형 | 주요 내용 |
|-----------|-----------|-----------|
| `BE/.../dto/nexon/NexonEquipmentResponse.java` | 수정 | `item_add/etc/starforce/exceptional_option` 및 MP·속도·점프·HP%·MP% 필드 매핑 |
| `BE/.../dto/response/EquipmentStatLine.java` | 신규 | 스탯 한 줄(합계 + 기본/스타포스/주문서/추옵/익셉셔널) |
| `BE/.../dto/response/CharacterEquipmentResponse.java` | 수정 | `stats`를 `List<EquipmentStatLine>`로 변경, `part`(장비분류) 추가 |
| `FE/.../types/equipment.ts` | 수정 | `EquipmentStatLine`, `part` 타입 |
| `FE/.../components/equipment/EquipTooltip.tsx` | 신규 | 툴팁 컴포넌트 (HomePage에서 분리) |
| `FE/.../pages/HomePage.tsx` | 수정 | 툴팁 분리, 마우스 벗어나면 닫힘 |
| `FE/.../index.css` | 수정 | 툴팁 스타일 교체 |

## 툴팁 구성 (위 → 아래)

1. 스타포스 별 (15개씩 줄바꿈, 5개 단위 간격 / 최대치는 착용 레벨 기준, 138↑ = 30)
2. 아이템명 `(+주문서 업그레이드 횟수)`, `(잠재 등급 아이템)`
3. 아이콘 (흰 배경, 잠재 등급 색 테두리)
4. 장비분류 + 스탯: `INT : +327 ( 150 +145 +32 )`
   - 기본 외 수치가 있으면 줄 전체 하늘색(#66ffff)
   - 괄호 순서/색: 기본(흰) → 스타포스(#ffcc00) → 주문서(#aaaaff) → 추옵(#ccff00) → 익셉셔널(#ff6699)
5. 잠재옵션 / 에디셔널 잠재옵션 (등급 글자 배지 R/E/U/L)
6. 소울 (`○○ 소울 적용` 노란색 + 옵션)

## 주의사항

- BE 응답의 `stats` 형식이 Map → List로 바뀌었으므로 BE 재시작 필요 (구 BE + 신 FE 조합이면 툴팁 에러)

## 추가 수정 (같은 날)

- 올스탯 줄 위치를 LUK 바로 다음으로 이동 (인게임 순서: STR → DEX → INT → LUK → 올스탯 → 최대 HP → …)
- 가위 사용 가능 횟수 표시: Nexon `cuttable_count` → 응답 `cuttableCount` (255 = 해당 없음 → null, 툴팁에서 숨김). 인게임처럼 아이템명/등급 바로 아래에 주황색 `(가위 사용 잔여 횟수 : N회)`로 표시 (최대 횟수는 API 미제공이라 생략)
