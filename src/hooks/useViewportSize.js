import { useEffect, useState } from "react";

// 창 크기(innerWidth/innerHeight)와 스크롤바를 뺀 폭(contentWidth).
// 시안 크기에 맞춰 화면을 비율대로 줄일 때 쓴다.
const readSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
  contentWidth: document.documentElement.clientWidth,
});

function useViewportSize() {
  const [size, setSize] = useState(readSize);

  useEffect(() => {
    const handleResize = () => setSize(readSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

export default useViewportSize;
