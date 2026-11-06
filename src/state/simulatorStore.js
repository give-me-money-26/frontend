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
      conditions: null,

      result: null, // POST /simulations 응답
      loading: false,
      error: null,
      baseline: null,
      compare: null, // POST /simulations/compare 응답

      set: (patch) => set(patch),
    }),
    {
      name: "aeroharvest-sim",
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ loading, error, set, ...keep }) => keep,
    },
  ),
);
