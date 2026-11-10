import useViewportSize from "./useViewportSize";

const DESIGN_WIDTH = 1440;
const RESPONSIVE_WIDTH = 1024;

function useDesignScale() {
  const { contentWidth } = useViewportSize();
  if (contentWidth < RESPONSIVE_WIDTH) return 1;
  return Math.min(1, contentWidth / DESIGN_WIDTH);
}

export default useDesignScale;
