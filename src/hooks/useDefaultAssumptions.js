import { useEffect } from "react";
import { isAbort } from "../api/client";
import { getDefaultAssumptions } from "../api/endpoints";
import { DEFAULT_CONDITIONS } from "../data/conditions";
import { useSim } from "../state/simulatorStore";

const FIELDS = Object.keys(DEFAULT_CONDITIONS);

const toConditions = (assumptions) =>
  Object.fromEntries(
    FIELDS.map((name) => [name, assumptions[name] ?? DEFAULT_CONDITIONS[name]]),
  );

const differs = (applied, defaults) =>
  FIELDS.some((name) => (applied?.[name] ?? null) !== defaults[name]);

function useDefaultAssumptions() {
  useEffect(() => {
    const controller = new AbortController();
    getDefaultAssumptions(controller.signal)
      .then((assumptions) => {
        const defaults = toConditions(assumptions);
        const { conditions, result, set } = useSim.getState();
        const isStale =
          !conditions && result && differs(result.appliedConditions, defaults);
        set({ defaults, ...(isStale && { result: null }) });
      })
      .catch((error) => {
        if (!isAbort(error)) useSim.getState().set({ error });
      });

    return () => controller.abort();
  }, []);
}

export default useDefaultAssumptions;
