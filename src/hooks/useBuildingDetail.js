import { useEffect } from "react";
import { isAbort } from "../api/client";
import { getBuilding } from "../api/endpoints";
import { useSim } from "../state/simulatorStore";

function useBuildingDetail() {
  const buildingId = useSim((s) => s.buildingId);

  useEffect(() => {
    if (useSim.getState().buildingDetail?.id === buildingId) return undefined;

    const controller = new AbortController();
    getBuilding(buildingId, controller.signal)
      .then((buildingDetail) => {
        if (useSim.getState().buildingId === buildingId) {
          useSim.getState().set({ buildingDetail });
        }
      })
      .catch((error) => {
        if (!isAbort(error)) useSim.getState().set({ error });
      });

    return () => controller.abort();
  }, [buildingId]);
}

export default useBuildingDetail;
