# AeroHarvest Frontend

성심교정 건물 배기 흐름을 설치 전 의사결정 데이터로 바꾸는 3D 사전 타당성 서비스입니다.
2026 컴퓨터정보공학부 학술제 (대주제: 경기도 및 캠퍼스 문제 해결) · 팀 최저시급

캠퍼스 지도에서 건물을 고르고, 3D로 배기구와 바람 흐름을 확인한 뒤, 조건을 바꿔 발전량 · 수익 · 환경 효과를 비교합니다.
3D는 정밀 CFD 해석이 아니라 배기구 위치와 배치를 검토하기 위한 시각화입니다.

## 기술 스택

- React 19, Vite, React Router 7
- three.js (3D 시뮬레이터)
- zustand (화면 간 공유 상태)
- CSS Modules, ESLint, Prettier

## 실행

```bash
npm install
npm run dev           # 개발 서버 (http://localhost:5173)
npm run build         # 프로덕션 빌드
npm run lint          # ESLint 검사
npm run format        # Prettier로 전체 포맷
npm run format:check  # 포맷 검사만
```

VS Code를 쓴다면 Prettier 확장을 설치하고 Format On Save를 켜 두세요.

## 페이지

| 경로           | 페이지         | 설명                                                                |
| -------------- | -------------- | ------------------------------------------------------------------- |
| `/`            | OnboardingPage | 로고 스플래시 → 위치 선택, 이용 안내 · 서비스 기획 · 계산 조건 패널 |
| `/map`         | MapPage        | 캠퍼스 지도에서 건물 선택 → 로딩 화면                               |
| `/simulator`   | SimulatorPage  | 3D 시뮬레이터 (보기 / 조작 모드), 데이터 카드                       |
| `/revenue`     | DetailPage     | 수익 분석 상세                                                      |
| `/environment` | DetailPage     | 환경 영향 상세                                                      |

라우트는 `src/router.jsx`에서 관리합니다. `/` 외의 페이지는 헤더가 있는 `Layout` 안에 있습니다.

## 폴더 구조

```
src/
├─ pages/            # 라우트 단위 페이지 (PageName/PageName.jsx + .module.css)
├─ components/
│  ├─ common/        # 여러 페이지에서 쓰는 컴포넌트
│  ├─ layout/        # Header, Layout
│  ├─ onboarding/    # 온보딩 화면
│  ├─ map/           # 캠퍼스 지도, 건물 팝업, 로딩 화면
│  ├─ simulator/     # 시뮬레이터 화면, 3D 화면, 데이터 카드
│  └─ detail/        # 상세 분석 화면
├─ three/            # three.js 장면과 건물 · 터빈 3D 모델
├─ state/            # 공유 상태 (simulatorStore.js)
├─ data/             # 정적 데이터 (캠퍼스 건물, 계산 조건 기본값)
├─ hooks/            # 커스텀 훅
├─ assets/           # 아이콘(icons), 이미지(images)
├─ index.css         # 디자인 토큰(색 · 폰트 · 반경)과 전역 스타일
└─ router.jsx
```

## API

- Base URL: `https://aeromap.khoon.net/api/v1`
- 사용 API: `GET /buildings`, `GET /buildings/{buildingId}`, `GET /assumptions/defaults`, `POST /simulations`, `POST /simulations/compare`

## 공유 상태

화면 간에 주고받는 값은 `src/state/simulatorStore.js` 하나로 관리합니다.

- 화면에서 채우는 값: `buildingId`, `mode`, `hour`, `distanceM`, `angleDegrees`, `conditions`
- API 응답으로 채우는 값: `result`, `loading`, `error`, `baseline`, `compare`

건물 id는 API 명세와 같은 값을 씁니다 (`NICHOLLS`, `DASOL`, `MARIA`, `KIM-SOU-HWAN`, `STUDENT-HALL`). 필드를 추가하거나 이름을 바꿀 때는 팀원과 먼저 공유합니다.

## 코드 규칙

- **스타일:** CSS Modules(`*.module.css`)만 사용하고, 클래스 이름은 camelCase로 씁니다.
- **색상:** 색 값은 `src/index.css`의 CSS 변수로만 정의하고, 컴포넌트에서는 `var(--color-...)`로 씁니다. 새 색이 필요하면 토큰을 먼저 추가합니다.
- **아이콘:** 색이 바뀌는 아이콘은 SVG에서 `currentColor`를 쓰고 `?react`로 불러옵니다. 색이 고정된 이미지는 `<img>`로 씁니다.
  ```jsx
  import ArrowRightIcon from "../../assets/icons/arrow-right.svg?react";
  ```
- **파일 이름:** 컴포넌트는 PascalCase(`CampusMap.jsx`), 훅은 `use`로 시작(`useViewportSize.js`), 아이콘은 kebab-case(`arrow-right.svg`)로 씁니다.
- **포맷:** PR 전에 `npm run lint`와 `npm run format:check`를 통과시킵니다.

## 협업 규칙

이슈 기반 작업 흐름은 2026년 11월 6일부터 적용했습니다. 그 전 작업은 사후 이슈(#1 ~ #4)로 정리했습니다.

### 작업 순서

1. **이슈 생성:** Feature / Bug 템플릿으로 작성하고 담당자를 지정합니다.
2. **브랜치 생성:** `dev`에서 `타입/이슈번호-요약` 형식으로 만듭니다. (예: `feat/8-simulator-3d`)
3. **커밋 · push:** 아래 커밋 규칙을 따릅니다.
4. **PR 생성:** `dev`로 PR을 올리고, 본문에 `Closes #이슈번호`를 적습니다. 머지되면 이슈가 자동으로 닫힙니다.
5. **리뷰 · 머지:** 팀원이 확인한 뒤 머지합니다. `dev`에 직접 push하지 않습니다.

### 커밋 메시지

`타입: 한글로 작업 내용 #이슈번호`

```
feat: 3D 시뮬레이터 보기·조작 모드 구현 #8
```

| 타입       | 용도                                     |
| ---------- | ---------------------------------------- |
| `feat`     | 새로운 기능 추가                         |
| `fix`      | 버그 수정                                |
| `docs`     | 문서 수정                                |
| `style`    | 코드 포맷팅 등 코드 변경이 없는 수정     |
| `refactor` | 코드 리팩토링                            |
| `chore`    | 패키지, 설정 등 기타 수정                |
| `design`   | CSS 등 UI 디자인 변경                    |
| `rename`   | 파일 · 폴더 이름 변경이나 이동만 한 경우 |
| `remove`   | 파일 삭제만 한 경우                      |

## 팀

프론트엔드: 김채윤, 백서현
