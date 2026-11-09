# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# 빌드
./gradlew build

# 테스트 전체 실행
./gradlew test

# 단일 테스트 클래스 실행
./gradlew test --tests "com.maplelog.maplelog.SomeTest"

# 앱 실행 (MySQL + Redis가 먼저 실행되어 있어야 함)
./gradlew bootRun

# 실행 가능한 JAR 빌드
./gradlew bootJar
```

## 로컬 환경 요구사항

- MySQL: `localhost:3306`, DB명 `maple_log`
- Redis: `localhost:6379`
- Java 21

`application.properties`에 Nexon Open API 키, OAuth 클라이언트 ID/Secret, JWT secret이 직접 하드코딩되어 있음. 프로덕션 배포 시 환경 변수로 분리 필요.

## 아키텍처

### 패키지 구조

```
com.maplelog.maplelog
├── domain/          # 도메인별 기능 모음
│   ├── auth/        # 인증 (API Key 로그인, Nexon OAuth, JWT 발급)
│   ├── character/   # 캐릭터 등록·조회, Nexon API 연동
│   ├── log/         # 활동 로그 (사용자가 직접 기록)
│   ├── member/      # 회원 엔티티, 닉네임 관리
│   ├── schedule/    # 일일·주간 콘텐츠 스케줄 (넥슨 API 동기화)
│   └── snapshot/    # 캐릭터 일일 스탯 스냅샷 (레벨·전투력·경험치)
└── global/
    ├── config/      # Security, RestClient, Nexon API/OAuth 설정
    ├── entity/      # BaseEntity (createdAt, updatedAt)
    ├── exception/   # GlobalExceptionHandler, NexonApiException
    ├── jwt/         # JwtProvider, JwtAuthenticationFilter
    ├── security/    # CustomUserDetailsService
    └── util/        # WeekKeyUtil (메이플 주간 기준: 목요일 초기화)
```

### 인증 흐름

세 가지 로그인 방식이 공존한다:
1. **닉네임** – `POST /api/auth/nickname`: 캐릭터 닉네임으로 Nexon API 조회 후 JWT 발급. `AuthType.NICKNAME` 멤버 생성. 스케줄러 API 연동 불가 (API 키 없음).
2. **Nexon API Key** – `POST /api/auth/api-key`: 입력된 키로 Nexon API를 직접 호출해 유효성 검증 후 JWT 발급
3. **Nexon OAuth** – `GET /api/auth/oauth/nexon/login` → 콜백 처리 → JWT 발급 (프론트 UI에서 숨김)

JWT는 Access Token + Refresh Token 쌍으로 발급되며, Refresh Token은 Redis에 `RT:{memberId}` 키로 저장된다. 모든 요청은 Stateless (Session 미사용).

`Member.getEffectiveApiKey()`는 OAuth 사용자이면 `nexonAccessToken`을, API Key 사용자이면 `apiKey`를 반환한다. 스케줄러가 Nexon API를 호출할 때 이 메서드로 키를 가져온다.

### Nexon API 연동

`RestClientConfig`에 두 개의 `RestClient` 빈이 있다:
- `nexonRestClient` (`@Qualifier("nexonRestClient")`): 서버 API 키를 기본 헤더로 설정한 클라이언트. `NexonApiClient`에서만 사용.
- `restClient` (`@Primary`): 범용 클라이언트. OAuth 토큰 교환 등에 사용.

캐릭터 스케줄 조회(`getCharacterSchedule`)는 사용자 본인의 API 키 또는 OAuth 토큰이 필요하므로 `nexonRestClient`를 재사용하지 않고 `RestClient.create()`로 별도 인스턴스를 생성해 호출한다.

### 스케줄러

매일 오전 1시 두 개의 스케줄러가 실행된다:
- `SnapshotScheduler`: 모든 캐릭터의 레벨·경험치·전투력을 `CharacterSnapshot`에 저장 (날짜별 중복 방지)
- `ScheduleSyncScheduler`: 모든 캐릭터의 일일·주간·보스 콘텐츠 현황을 Nexon API에서 동기화해 `CharacterSchedule`에 저장

`CharacterSchedule`의 `bossContents`, `dailyContents`, `weeklyContents`는 MySQL JSON 컬럼으로 저장된다 (`@JdbcTypeCode(SqlTypes.JSON)`).

### 공개/인증 API 구분

`SecurityConfig`에서 명시적으로 선언된 공개 엔드포인트:
- `POST /api/auth/**` – 로그인, OAuth 콜백 등
- `GET /api/characters/search`, `GET /api/characters/{characterId}` – 캐릭터 검색·조회

`/api/characters/me/**`는 `{characterId}` 패턴보다 먼저 선언되어 인증 필수로 처리된다.

## 작업 히스토리

작업 기록은 `/Users/choijehyuk/Desktop/Workspace/MapleLog/history/` 폴더에 날짜별 마크다운 파일로 관리된다.

**작업 시작 전**: `ls /Users/choijehyuk/Desktop/Workspace/MapleLog/history/` 로 최근 히스토리를 확인하고 맥락을 파악한다.  
**작업 완료 후**: `/history` 슬래시 커맨드로 해당 대화의 작업 내용을 히스토리 파일로 기록한다.
