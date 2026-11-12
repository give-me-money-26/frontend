import { useEffect, useState } from "react";
import { isAbort } from "../api/client";
import { getBuildings } from "../api/endpoints";

let cache = null;

function useBuildings() {
  const [buildings, setBuildings] = useState(cache);

  useEffect(() => {
    if (cache) return undefined;

    const controller = new AbortController();
    getBuildings(controller.signal)
      .then((list) => {
        cache = Object.fromEntries(list.map((item) => [item.id, item]));
        setBuildings(cache);
      })
      .catch((error) => {
        if (!isAbort(error)) setBuildings(null);
      });

    return () => controller.abort();
  }, []);

  return buildings;
}

export default useBuildings;
