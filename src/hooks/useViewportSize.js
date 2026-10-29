import { useEffect, useState } from "react";

// 창 크기(innerWidth/innerHeight). 시안 크기에 맞춰 화면을 비율대로 줄일 때 쓴다.
function useViewportSize() {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

export default useViewportSize;
