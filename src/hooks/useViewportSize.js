import { useEffect, useState } from "react";

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
