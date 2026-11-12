import { useEffect } from "react";
import { isAbort } from "../api/client";
import { compareSimulations, simulate } from "../api/endpoints";
import { defaultConditions, useSim } from "../state/simulatorStore";

let controller;

const toRequest = (s) => ({
  ...(s.conditions ?? defaultConditions(s)),
  buildingId: s.buildingId,
  sourceMode: s.sourceMode,
  hour: s.hour,
  windSpeedMS: s.windSpeedMS,
  distanceM: s.distanceM,
  angleDegrees: s.angleDegrees,
});

const isCurrent = (baseline, buildingId) => {
  const s = useSim.getState();
  return s.baseline === baseline && s.buildingId === buildingId;
};

export function runSimulation(patch) {
  const { set } = useSim.getState();
  if (patch) set(patch);

  controller?.abort();
  controller = new AbortController();
  set({ loading: true, error: null });

  const state = useSim.getState();
  const current = toRequest(state);
  const baseline =
    state.baseline?.buildingId === current.buildingId ? state.baseline : null;

  const pending = baseline
    ? compareSimulations(baseline, current, controller.signal)
    : simulate(current, controller.signal).then((result) => ({
        current: result,
      }));

  pending
    .then((response) => {
      if (!isCurrent(state.baseline, current.buildingId)) return;
      const result = response.current;
      set({
        result,
        compare: baseline ? response : null,
        loading: false,
        ...(result.sourceMode === "TIME_SLOT" && {
          windSpeedMS: result.windSpeedMS,
        }),
      });
    })
    .catch((error) => {
      if (!isAbort(error)) set({ error, loading: false });
    });
}

export function setBaseline() {
  useSim.getState().set({ baseline: toRequest(useSim.getState()) });
  runSimulation();
}

export function clearBaseline() {
  controller?.abort();
  useSim.getState().set({ baseline: null, compare: null, loading: false });
}

function useSimulation() {
  const needsResult = useSim((s) => s.result?.buildingId !== s.buildingId);

  useEffect(() => {
    if (needsResult) runSimulation();
  }, [needsResult]);
}

export default useSimulation;
