import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { BUILDINGS } from "../data/campus";
import { DEFAULT_CONDITIONS } from "../data/conditions";
import { DEFAULT_PLACEMENT } from "../data/turbine";
import { DEFAULT_HOUR } from "../data/wind";

export const enterBuilding = (id) => ({
  buildingId: id,
  buildingDetail: null, // GET /buildings/{id} 응답
  hour: DEFAULT_HOUR,
  sourceMode: "DIRECT_SPEED",
  windSpeedMS: BUILDINGS.find((b) => b.id === id).windSpeedMS,
  ...DEFAULT_PLACEMENT,
  result: null, // POST /simulations 응답
  baseline: null,
  compare: null, // POST /simulations/compare 응답
});

export const useSim = create(
  persist(
    (set) => ({
      ...enterBuilding("NICHOLLS"),
      mode: "view",
      conditions: null,
      defaults: null,
      loading: false,
      error: null,

      set: (patch) => set(patch),
    }),
    {
      name: "aeroharvest-sim",
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ loading, error, defaults, set, ...keep }) => keep,
    },
  ),
);

export const defaultConditions = (s) => s.defaults ?? DEFAULT_CONDITIONS;
