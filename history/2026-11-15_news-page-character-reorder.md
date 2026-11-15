# 소식 페이지 추가 및 캐릭터 순서 드래그 변경

**날짜**: 2026-11-15  
**작업 범위**: BE+FE

## 배경 및 목적

설정 탭에 넣을 기능을 논의하다 캐릭터 순서 변경(드래그)과 메이플스토리 공지/이벤트/랭킹 조회 기능을 추가하기로 결정. Nexon Open API의 공지·이벤트·랭킹 엔드포인트를 활용해 별도 소식 탭을 신설.

## 변경 파일 목록

| 파일 경로 | 변경 유형 | 주요 내용 |
|-----------|-----------|-----------|
| `BE/.../character/entity/MapleCharacter.java` | 수정 | `sortOrder` 필드 추가, `setSortOrder()` 메서드 추가 |
| `BE/.../character/repository/MapleCharacterRepository.java` | 수정 | `findAllByMemberIdOrderBySortOrderAsc`, `countByMemberId` 추가 |
| `BE/.../character/dto/response/CharacterResponse.java` | 수정 | `sortOrder` 필드 추가 |
| `BE/.../character/service/CharacterService.java` | 수정 | `getMyCharacters` sortOrder 정렬 적용, `reorderCharacters` 메서드 추가, `registerCharacter` 시 sortOrder 초기화 |
| `BE/.../character/controller/CharacterController.java` | 수정 | `PATCH /api/characters/me/order` 엔드포인트 추가 |
| `BE/.../domain/notice/` | 신규 | 공지·이벤트·랭킹 DTO, Service, Controller 전체 |
| `BE/.../global/admin/AdminSchedulerController.java` | 신규 | 수동 스케줄러 트리거 API (`X-Admin-Key` 헤더 인증) |
| `BE/.../global/config/SecurityConfig.java` | 수정 | `/api/notice/**`, `/api/ranking`, `/api/admin/**` permitAll 추가 |
| `FE/src/api/character.ts` | 수정 | `reorder(orderedIds)` 추가 |
| `FE/src/api/notice.ts` | 신규 | 공지·이벤트·랭킹 API 클라이언트 |
| `FE/src/types/character.ts` | 수정 | `sortOrder` 필드 추가 |
| `FE/src/pages/SettingsPage.tsx` | 수정 | `@dnd-kit` 기반 드래그 앤 드롭 순서 변경 UI |
| `FE/src/pages/NewsPage.tsx` | 신규 | 공지/이벤트/랭킹 탭 페이지 |
| `FE/src/routes/index.tsx` | 수정 | `/news` 라우트 추가 |
| `FE/src/components/layout/Layout.tsx` | 수정 | "소식" 탭 추가 (6번째 탭) |
| `FE/src/index.css` | 수정 | 탭 아이콘 축소 (6탭 대응), news/ranking 스타일 추가 |
| `FE/package.json` | 수정 | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` 의존성 추가 |

## 주요 변경 내용

### 백엔드 (BE)

**캐릭터 순서**
- `MapleCharacter`에 `sortOrder int` 컬럼 추가 (기본값 0)
- 캐릭터 등록 시 `countByMemberId`로 맨 뒤 순서 자동 배정
- `PATCH /api/characters/me/order` — `List<Long>` (정렬된 characterId 배열) 받아 순서 일괄 업데이트
- `getMyCharacters`가 `sortOrder ASC` 정렬로 반환

**소식 (공지·이벤트·랭킹)**
- `domain/notice/` 신설: `NoticeController`, `NoticeService`, 3개 DTO
- Nexon API 호출에 서버 `nexonRestClient`(기본 API 키 헤더 포함) 재사용
- 랭킹 API는 전날 날짜를 자동 계산해 `date` 파라미터 주입 (Nexon API 요구사항)
- 모두 인증 없이 접근 가능 (SecurityConfig permitAll)

**관리자 스케줄러**
- `POST /api/admin/scheduler/snapshot` — 스냅샷 수동 실행
- `POST /api/admin/scheduler/schedule-sync` — 스케줄 동기화 수동 실행
- `POST /api/admin/scheduler/run-all` — 전체 수동 실행
- `X-Admin-Key: maplelog-admin-2024` 헤더 인증

### 프론트엔드 (FE)

**캐릭터 순서 변경**
- `@dnd-kit/sortable` 기반 `SortableCharacterItem` 컴포넌트
- `⠿` 드래그 핸들 UI, `PointerSensor` (activationConstraint distance: 5)
- 드래그 완료 시 낙관적 업데이트 후 `characterApi.reorder()` 호출

**소식 페이지**
- `/news` 라우트, 하단 탭 "소식" 추가
- 공지: 메이플 공지 목록, 넥슨 URL 외부 링크
- 이벤트: 이벤트 목록 + 시작/종료일 표시
- 랭킹: 서버 필터(전체/스카니아/베라 등 15개), 더보기(페이지네이션)

## 동작 흐름

**캐릭터 순서 변경**
1. 설정 탭 진입 → 캐릭터 목록 sortOrder 오름차순 로드
2. `⠿` 핸들 드래그 → `arrayMove`로 로컬 상태 즉시 반영
3. `PATCH /api/characters/me/order` 호출 → DB 저장

**소식 조회**
1. 소식 탭 진입 → 공지 탭 기본 선택
2. 탭 클릭 시 최초 1회만 API 호출 (캐시)
3. 랭킹 탭: 서버 필터 변경 시 목록 초기화 후 재조회, 더보기로 page+1 추가 로드

## 주의사항 / 연관 사항

- 기존 캐릭터들의 `sortOrder`는 모두 0 (DDL auto=update로 컬럼 추가됨). 같은 sortOrder끼리는 등록 순서(id) 불확정 → 최초 순서 변경 한 번으로 고정 가능
- 관리자 스케줄러 키(`maplelog-admin-2024`)는 배포 전 환경변수로 분리 권장
- 하단 탭이 6개로 늘어 아이콘/텍스트를 20px/10px으로 축소 (기존 22px/11px)
- 랭킹 API는 전날 날짜 기준 — 당일 00시 직후에는 전전날 데이터가 나올 수 있음
- `GrowthPage.tsx`의 `[테스트] 전체 저장` 버튼은 TODO 주석 있음 — 배포 전 삭제 필요
