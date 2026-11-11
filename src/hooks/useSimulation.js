import { useEffect } from "react";
import { isAbort } from "../api/client";
import { simulate } from "../api/endpoints";
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

export function runSimulation(patch) {
  const { set } = useSim.getState();
  if (patch) set(patch);

  controller?.abort();
  controller = new AbortController();
  set({ loading: true, error: null });

  simulate(toRequest(useSim.getState()), controller.signal)
    .then((result) => {
      if (useSim.getState().buildingId !== result.buildingId) return;
      set({
        result,
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

function useSimulation() {
  const needsResult = useSim((s) => s.result?.buildingId !== s.buildingId);

  useEffect(() => {
    if (needsResult) runSimulation();
  }, [needsResult]);
}

export default useSimulation;
