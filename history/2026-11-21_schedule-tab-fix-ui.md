# 스케줄 탭 API 연동 완성 및 UI 개선

**날짜**: 2026-11-21  
**작업 범위**: BE+FE

## 배경 및 목적

Nexon Open API 서비스 단계 등록으로 live API 키를 발급받고, 스케줄 탭의 API 연동을 완성하는 작업. 기존에는 엔드포인트 경로가 잘못되어 403/400 오류가 발생했으며, 데이터 연동 성공 후 UI도 대폭 개선.

## 변경 파일 목록

| 파일 경로 | 변경 유형 | 주요 내용 |
|-----------|-----------|-----------|
| `BE/.../character/client/NexonApiClient.java` | 수정 | 스케줄 엔드포인트 경로 수정, date 파라미터 제거 |
| `BE/.../schedule/service/ScheduleService.java` | 수정 | date 파라미터 제거, OffsetDateTime 파싱으로 변경 |
| `BE/.../schedule/scheduler/ScheduleSyncScheduler.java` | 수정 | (변경 없음, 기존 구조 유지) |
| `BE/.../global/exception/GlobalExceptionHandler.java` | 수정 | ResourceAccessException/SocketTimeoutException 핸들러 추가 |
| `BE/src/main/resources/application-local.properties` | 수정 | NEXON_API_KEY를 test_ → live_ 로 교체 |
| `FE/.../pages/SchedulePage.tsx` | 수정 | UI 전면 개선 |

## 주요 변경 내용

### 백엔드 (BE)

**엔드포인트 경로 수정 (핵심)**
- 기존: `/maplestory/v1/character/schedule` → 403 Access Denied 발생
- 수정: `/maplestory/v1/scheduler/character-state` → 200 정상 응답
- Nexon Open API Swagger UI에서 실제 경로 확인하여 수정

**date 파라미터 제거**
- 기존: `LocalDate.now()`를 date 쿼리 파라미터로 전달 → 400 오류
- 수정: date 파라미터 없이 호출 (Nexon API가 미입력 시 오늘 날짜 자동 적용)

**날짜 파싱 변경**
- Nexon 응답의 `date` 필드가 `"2026-11-21T00:00+09:00"` (ISO OffsetDateTime) 형식
- `LocalDate.parse(str, "yyyy-MM-dd")` → `OffsetDateTime.parse(str).toLocalDate()`로 변경

**에러 핸들러 추가**
- `ResourceAccessException`, `SocketTimeoutException` → 502 Bad Gateway 반환

**API 키 업데이트**
- `application-local.properties`의 `NEXON_API_KEY`를 `test_` → `live_` 키로 교체
- Railway 프로덕션 환경변수도 추후 교체 필요

### 프론트엔드 (FE)

**상단 요약 카드 (SummaryBar)**
- 주간 보스 / 일일 콘텐츠 / 주간 콘텐츠 완료율을 3칸 그리드로 표시
- 완료 시 녹색(`#4ecca3`), 미완료 시 주황색 + 진행 바

**보스 섹션 (BossSection)**
- `registration_flag === 'true'`인 보스만 표시 (기존은 전체 표시)
- 사이클별 그룹: 일일 보스 / 주간 보스 / 월간 보스
- 난이도 한국어 변환: easy→이지, normal→노말, hard→하드, chaos→카오스, extreme→익스트림
- 완료된 보스 opacity 38% dim 처리

**콘텐츠 섹션 (ContentSection)**
- `registration_flag === 'true'`인 항목만 표시
- 미완료 → 위, 완료 → 아래 자동 정렬 + dim 처리
- 완료율 우측 상단 표시

**동기화 버튼**
- 데이터 없을 때: 가운데 큰 "지금 동기화하기" 버튼 (기존 동일)
- 데이터 있을 때: 헤더 우측 소형 "↻ 동기화" 버튼으로 재동기화 가능

**하단 날짜 표시**
- "2026-11-21 기준" 형태로 스케줄 기준 날짜 표시

## 동작 흐름

1. 스케줄 탭 진입 → `GET /api/characters/{id}/schedule/today` 호출
2. 오늘 데이터 없으면 400 → "지금 동기화하기" 버튼 표시
3. 동기화 클릭 → `POST /api/characters/{id}/schedule/sync`
4. BE에서 `GET https://open.api.nexon.com/maplestory/v1/scheduler/character-state?ocid=...` 호출 (유저 API 키 사용)
5. 응답 파싱 후 DB 저장 (기존 날짜 데이터 있으면 update, 없으면 insert)
6. 저장된 데이터 반환 → FE 화면 렌더링

## 주의사항 / 연관 사항

- `character/schedule` 엔드포인트는 403 Access Denied (서비스 키로 접근 불가, 혹은 경로 자체가 다름)
- 올바른 경로는 `scheduler/character-state` (Nexon Swagger에서 직접 확인)
- 스케줄 API는 **유저 본인의 API 키**가 필요 — 닉네임 로그인 사용자는 동기화 불가
- Nexon OAuth는 파트너 서비스만 제공되어 일반 개발자 적용 불가
- 매일 오전 1시 `ScheduleSyncScheduler`가 API Key/OAuth 사용자 캐릭터 자동 동기화
- Railway 환경변수 `NEXON_API_KEY`를 live 키로 교체해야 프로덕션 반영됨
- `application-local.properties`는 `.gitignore`로 커밋 제외되어 있어야 함
