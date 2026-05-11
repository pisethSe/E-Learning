import React from "react";

const MIN_DURATION = 0.001;

const getVelocity = (distance, durationInSeconds) =>
  distance / Math.max(durationInSeconds, MIN_DURATION);

const InfiniteSlider = ({
  children,
  className = "",
  gap = 24,
  speed = 38,
  speedOnHover = 20,
}) => {
  const items = React.Children.toArray(children);
  const sliderRef = React.useRef(null);
  const trackRef = React.useRef(null);
  const primaryGroupRef = React.useRef(null);
  const frameRef = React.useRef(0);
  const lastFrameTimeRef = React.useRef(0);
  const offsetRef = React.useRef(0);
  const currentVelocityRef = React.useRef(0);
  const targetVelocityRef = React.useRef(0);
  const normalVelocityRef = React.useRef(0);
  const hoverVelocityRef = React.useRef(0);
  const isHoveringRef = React.useRef(false);
  const [groupWidth, setGroupWidth] = React.useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    syncPreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncPreference);

      return () => {
        mediaQuery.removeEventListener("change", syncPreference);
      };
    }

    mediaQuery.addListener(syncPreference);

    return () => {
      mediaQuery.removeListener(syncPreference);
    };
  }, []);

  React.useEffect(() => {
    const primaryGroup = primaryGroupRef.current;

    if (!primaryGroup) {
      return undefined;
    }

    const updateWidth = () => {
      setGroupWidth(primaryGroup.scrollWidth);
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);

      return () => {
        window.removeEventListener("resize", updateWidth);
      };
    }

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(primaryGroup);

    return () => {
      resizeObserver.disconnect();
    };
  }, [items.length, gap]);

  React.useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return undefined;
    }

    if (!groupWidth || prefersReducedMotion) {
      offsetRef.current = 0;
      currentVelocityRef.current = 0;
      targetVelocityRef.current = 0;
      lastFrameTimeRef.current = 0;
      track.style.transform = "translate3d(0, 0, 0)";
      window.cancelAnimationFrame(frameRef.current);

      return undefined;
    }

    normalVelocityRef.current = getVelocity(groupWidth, speed);
    hoverVelocityRef.current = getVelocity(groupWidth, speedOnHover);
    targetVelocityRef.current = isHoveringRef.current
      ? hoverVelocityRef.current
      : normalVelocityRef.current;

    if (currentVelocityRef.current === 0) {
      currentVelocityRef.current = targetVelocityRef.current;
    }

    const animate = (timestamp) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const elapsedSeconds = Math.min(
        (timestamp - lastFrameTimeRef.current) / 1000,
        0.05
      );
      lastFrameTimeRef.current = timestamp;

      const easing = 1 - Math.exp(-6 * elapsedSeconds);
      currentVelocityRef.current +=
        (targetVelocityRef.current - currentVelocityRef.current) * easing;

      let nextOffset =
        offsetRef.current - currentVelocityRef.current * elapsedSeconds;

      while (nextOffset <= -groupWidth) {
        nextOffset += groupWidth;
      }

      offsetRef.current = nextOffset;
      track.style.transform = `translate3d(${nextOffset}px, 0, 0)`;
      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      lastFrameTimeRef.current = 0;
    };
  }, [groupWidth, prefersReducedMotion, speed, speedOnHover]);

  const sliderVars = {
    "--slider-gap": `${gap}px`,
  };

  const renderGroup = (prefix) =>
    items.map((child, index) => (
      <div key={`${prefix}-${index}`} className="infinite-slider__item">
        {child}
      </div>
    ));

  const handlePointerEnter = () => {
    isHoveringRef.current = true;
    targetVelocityRef.current = hoverVelocityRef.current || normalVelocityRef.current;
  };

  const handlePointerLeave = () => {
    isHoveringRef.current = false;
    targetVelocityRef.current = normalVelocityRef.current;
  };

  if (!items.length) {
    return null;
  }

  return (
    <div
      ref={sliderRef}
      className={`infinite-slider ${className}`.trim()}
      data-reduced-motion={prefersReducedMotion}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      onFocusCapture={handlePointerEnter}
      onBlurCapture={handlePointerLeave}
      style={sliderVars}
    >
      <div ref={trackRef} className="infinite-slider__track">
        <div ref={primaryGroupRef} className="infinite-slider__group">
          {renderGroup("primary")}
        </div>
        <div className="infinite-slider__group" aria-hidden="true">
          {renderGroup("duplicate")}
        </div>
      </div>
    </div>
  );
};

export default InfiniteSlider;
