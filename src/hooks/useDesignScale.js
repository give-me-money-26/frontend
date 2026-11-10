import useViewportSize from "./useViewportSize";

const DESIGN_WIDTH = 1440;

function useDesignScale() {
  const { contentWidth } = useViewportSize();
  return Math.min(1, contentWidth / DESIGN_WIDTH);
}

export default useDesignScale;
