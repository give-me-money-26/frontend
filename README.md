# AeroHarvest Frontend

React 19 + Vite + React Router 7

## 실행

```bash
npm install
npm run dev          # 개발 서버 (http://localhost:5173)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 검사
npm run format       # Prettier로 전체 포맷
npm run format:check # 포맷 검사만 (PR 올리기 전 확인)
```

VS Code를 쓴다면 Prettier 확장을 설치하고 "Format On Save"를 켜 두세요. 포맷 규칙은 `.prettierrc`에 있습니다.

## 페이지

| 경로         | 페이지         | 설명                                            |
| ------------ | -------------- | ----------------------------------------------- |
| `/`          | OnboardingPage | 로고 스플래시(0.8초) → 위치 선택                |
| `/simulator` | SimulatorPage  | 헤더 레이아웃 포함. `?location=` 으로 위치 전달 |

라우트는 `src/router.jsx` 한 곳에서 관리합니다.

## 폴더 구조

```
src/
├─ pages/                  # 라우트 단위 페이지 (PageName/PageName.jsx + .module.css)
├─ components/
│  ├─ common/              # 여러 페이지에서 쓰는 공용 컴포넌트 (Logo 등)
│  ├─ layout/              # Header, Layout
│  ├─ onboarding/          # 온보딩 전용 컴포넌트
│  └─ simulator/           # 시뮬레이터 전용 컴포넌트
├─ assets/
│  ├─ icons/               # UI 아이콘 SVG (색은 currentColor)
│  └─ images/              # 로고·일러스트 등 고정 이미지
├─ index.css               # 디자인 토큰(색·폰트·반경) + 전역 리셋
└─ router.jsx
```

## 규칙

- **스타일**: CSS Modules(`*.module.css`)만 사용합니다. 클래스명은 camelCase.
- **색상**: 색 값은 `src/index.css`의 CSS 변수로만 정의하고, 컴포넌트에서는 `var(--color-...)`로 사용합니다. 새 색이 필요하면 토큰을 먼저 추가하세요.
- **아이콘**: 색이 바뀌어야 하는 아이콘은 SVG에서 `currentColor`를 쓰고 컴포넌트로 불러옵니다.
  ```jsx
  import ArrowRightIcon from "../../assets/icons/arrow-right.svg?react";
  <ArrowRightIcon aria-hidden="true" />; // 색은 부모의 color를 따름
  ```
  색이 고정된 이미지는 기존처럼 `import src from "...svg"` 후 `<img>`로 씁니다.
- **로고**: `components/common/Logo`를 사용하고, 크기·자간은 `className`으로 지정합니다.
- **파일명**: 컴포넌트는 PascalCase(`LocationSelect.jsx`), 아이콘은 kebab-case(`arrow-right.svg`).

## 협업

- `main`에 직접 커밋하지 않고 작업별 브랜치에서 PR로 합칩니다.
- PR 전에 `npm run lint`와 `npm run format:check`를 통과시켜 주세요.
