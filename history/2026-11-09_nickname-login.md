# 닉네임 로그인 추가 및 넥슨 OAuth UI 숨김

**날짜**: 2026-11-09  
**작업 범위**: BE + FE

## 배경 및 목적

기존에는 Nexon API 키 또는 OAuth만으로 로그인 가능해 진입 장벽이 높았다. 캐릭터 닉네임만 입력해도 앱을 사용할 수 있도록 간편 로그인 경로를 추가하고, 넥슨 계정 OAuth 버튼은 프론트에서 숨겼다.

## 변경 파일 목록

| 파일 경로 | 변경 유형 | 주요 내용 |
|-----------|-----------|-----------|
| `BE/.../member/entity/AuthType.java` | 수정 | `NICKNAME` 값 추가 |
| `BE/.../auth/dto/NicknameLoginRequest.java` | 신규 | `nickname` 필드 DTO |
| `BE/.../member/repository/MemberRepository.java` | 수정 | `findByNicknameAndAuthType` 쿼리 추가 |
| `BE/.../auth/service/AuthService.java` | 수정 | `loginWithNickname()` 메서드 추가, `NexonApiClient` 의존성 추가 |
| `BE/.../auth/controller/AuthController.java` | 수정 | `POST /api/auth/nickname` 엔드포인트 추가 |
| `BE/.../member/entity/Member.java` | 수정 | `getEffectiveApiKey()` - NICKNAME이면 null 반환 |
| `FE/.../types/auth.ts` | 수정 | `AuthType`에 `'NICKNAME'` 추가, `NicknameLoginRequest` 타입 추가 |
| `FE/.../api/auth.ts` | 수정 | `loginWithNickname` API 호출 추가 |
| `FE/.../store/AuthContext.tsx` | 수정 | `loginWithNickname` 컨텍스트 함수 추가 |
| `FE/.../pages/LoginPage.tsx` | 수정 | 넥슨 OAuth 버튼 제거, 닉네임/API키 탭 전환 UI로 교체 |

## 주요 변경 내용

### 백엔드 (BE)

- `AuthType.NICKNAME` 추가
- `POST /api/auth/nickname` 엔드포인트: `NicknameLoginRequest { nickname }` 수신
- `AuthService.loginWithNickname()`:
  1. `NexonApiClient.getCharacterOcid(nickname)` → 존재하지 않으면 `NexonApiException` 발생
  2. `getCharacterBasic(ocid)` → 실제 캐릭터명(대소문자 보정) 획득
  3. `findByNicknameAndAuthType(characterName, NICKNAME)` 으로 기존 멤버 조회, 없으면 생성
  4. JWT Access/Refresh Token 발급
- `Member.getEffectiveApiKey()`: NICKNAME 타입은 `null` 반환 → `ScheduleSyncScheduler`에서 자동 스킵됨

### 프론트엔드 (FE)

- `LoginPage`: "닉네임으로 시작" / "API 키로 로그인" 탭 전환 UI
  - 닉네임 로그인 후: `characterApi.register({ characterName: nickname })` 호출로 캐릭터 등록
  - API 키 로그인 후: 기존과 동일하게 `characterApi.autoRegister()` 호출
- 넥슨 OAuth 버튼 완전 제거 (코드에서 삭제)

## 동작 흐름 (닉네임 로그인)

```
1. 사용자가 닉네임 입력 후 "시작하기" 클릭
2. POST /api/auth/nickname { nickname: "캐릭터명" }
3. BE: Nexon API로 캐릭터 존재 확인 → NICKNAME 멤버 생성/조회 → JWT 발급
4. FE: 토큰 저장 후 POST /api/characters { characterName: "캐릭터명" }
5. 홈("/")으로 이동
```

## 주의사항 / 연관 사항

- NICKNAME 타입 멤버는 스케줄 자동 동기화(`ScheduleSyncScheduler`) 비활성화됨 — API 키 없이는 Nexon의 개인 스케줄 API 호출 불가
- `SnapshotScheduler`는 API 키 불필요 → NICKNAME 멤버도 스냅샷(레벨·경험치) 정상 저장됨
- 메이플 캐릭터명은 대소문자가 혼재 가능 — Nexon API 응답의 `characterName`을 정규화된 키로 사용
- 같은 닉네임으로 재로그인 시 기존 멤버 재사용 (upsert 아님, findOrCreate)
- OAuth 로직(`NexonOAuthService`, `OAuthCallbackPage`)은 코드에 유지됨 — 나중에 다시 활성화 가능