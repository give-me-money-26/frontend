import { useEffect, useEffectEvent, useState } from "react";
import { errorText } from "./shared";

function useFetch(load, key) {
  const [data, setData] = useState();
  const [error, setError] = useState("");
  const run = useEffectEvent(load);

  useEffect(() => {
    const controller = new AbortController();
    run(controller.signal)
      .then(setData)
      .catch((e) => !controller.signal.aborted && setError(errorText(e)));
    return () => controller.abort();
  }, [key]);

  return [data, error];
}

export default useFetch;
