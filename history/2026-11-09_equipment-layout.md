# 장비창 배치 개편 및 스타포스 표시

**날짜**: 2026-11-09  
**작업 범위**: BE + FE

## 배경 및 목적

참고 이미지(5열 × 6행 장비창)에 맞춰 홈 화면 장비 그리드 배치를 바꾸고, 각 아이템 좌상단에 스타포스(★N)를 표시한다. 기존 배치에 없던 펜던트·펜던트2·벨트·기계 심장 슬롯도 추가.

## 변경 파일 목록

| 파일 경로 | 변경 유형 | 주요 내용 |
|-----------|-----------|-----------|
| `BE/.../character/dto/nexon/NexonEquipmentResponse.java` | 수정 | `starforce` 필드 매핑 |
| `BE/.../character/dto/response/CharacterEquipmentResponse.java` | 수정 | `starforce`(int) 응답 추가, 문자열 파싱 |
| `BE/.../character/service/CharacterService.java` | 수정 | Nexon 응답의 `title`을 슬롯 "칭호"로 장비 목록 끝에 추가 |
| `BE/.../character/dto/nexon/NexonAndroidResponse.java` | 신규 | `android_name`, `android_icon` 매핑 |
| `BE/.../character/client/NexonApiClient.java` | 수정 | `getCharacterAndroid()` — `/maplestory/v1/character/android-equipment` |
| `FE/.../types/equipment.ts` | 수정 | `starforce: number` 추가 |
| `FE/.../pages/HomePage.tsx` | 수정 | `EQUIP_LAYOUT` 재배치, 별 배지·툴팁 |
| `FE/.../index.css` | 수정 | 장착 슬롯 초록 테두리, 별 배지 스타일 |

## 배치 (인게임 장비창 기준, 7열 × 6행 — 사용자 확인 완료)

```
반지4  얼굴장식  [캐릭터 이미지]           모자       망토
반지3  눈장식    [ 3~5열 × 1~4행 ]          상의       장갑
반지2  귀고리    [             ]          하의       신발
반지1  펜던트    [             ]          어깨장식   훈장
벨트   펜던트2   무기  보조무기  엠블렘    안드로이드  기계 심장
포켓                                      칭호       뱃지
```
- 사이트 캡처(5열) → 인게임 스크린샷 추정(7열) → 사용자가 알려준 배치로 최종 확정

## 주의사항

- 반지는 아래→위로 반지1→반지4. 캐릭터 "식중땐" 프리셋 2를 넥슨 API로 조회해 스크린샷과 대조 (반지1=리스트레인트 링 Lv6이 맨 아래, 반지4=거대한 공포가 맨 위)

- 안드로이드는 별도 API(`android-equipment`)로 받아 슬롯 "안드로이드"로 장비 목록 끝에 붙임 (`CharacterEquipmentResponse.fromAndroid()`)
- 안드로이드 조회 실패 시 경고 로그만 남기고 나머지 장비는 정상 응답 → 장비 조회 1회당 넥슨 API 2회 호출
- 얼굴/눈/귀고리 순서는 아이콘으로 추정한 배치
- 칭호는 `item_equipment` 배열이 아닌 별도 `title` 객체 → `CharacterEquipmentResponse.fromTitle()`로 변환
