// 두 사람이 같이 쓰는 값. 이 파일을 바꿀 때는 서로 먼저 알리기.
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useSim = create(
  persist(
    (set) => ({
      buildingId: "NICHOLLS", // KIM-SOU-HWAN | DASOL | NICHOLLS | MARIA | STUDENT-HALL
      mode: "view", // 'view' 보기 모드 | 'control' 조작 모드
      hour: 15, // 기준 시간 10~22
      distanceM: 2, // 배기구로부터 거리 1~8 m
      angleDegrees: 0, // 터빈 각도 -80~80°
      conditions: null, // 면적·효율·운전시간 등 (계산 조건 패널)

      result: null, // POST /simulations 응답
      loading: false,
      error: null,
      baseline: null, // 기준 설정 순간의 주문서 복사
      compare: null, // POST /simulations/compare 응답

      set: (patch) => set(patch),
    }),
    {
      name: "aeroharvest-sim",
      storage: createJSONStorage(() => sessionStorage), // 새로고침해도 값 유지
      // eslint-disable-next-line no-unused-vars
      partialize: ({ loading, error, set, ...keep }) => keep,
    },
  ),
);
