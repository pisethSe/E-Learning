// user-frontend/src/components/CardSwap.jsx
import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from "react";
import gsap from "gsap";

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`absolute top-1/2 left-1/2 overflow-hidden rounded-2xl bg-white [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] ${customClass ?? ""} ${rest.className ?? ""}`.trim()}
  />
));
Card.displayName = "Card";

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (el, slot, skew) => {
  if (!el) {
    return;
  }

  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true,
  });
};

const CardSwap = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = "elastic",
  containerClassName = "",
  children,
}) => {
  const config =
    easing === "elastic"
      ? {
          ease: "elastic.out(0.6,0.9)",
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
        }
      : {
          ease: "power1.inOut",
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length],
  );

  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));

  const tlRef = useRef(null);
  const timerRef = useRef(null);
  const isSwappingRef = useRef(false);
  const container = useRef(null);

  useEffect(() => {
    const total = refs.length;
    order.current = Array.from({ length: total }, (_, i) => i);
    isSwappingRef.current = false;

    const placeStack = () => {
      order.current.forEach((idx, i) =>
        placeNow(
          refs[idx]?.current,
          makeSlot(i, cardDistance, verticalDistance, total),
          skewAmount,
        ),
      );
    };

    placeStack();

    const scheduleNextSwap = () => {
      timerRef.current?.kill();

      if (total > 1) {
        timerRef.current = gsap.delayedCall(delay / 1000, swap);
      }
    };

    const swap = () => {
      if (order.current.length < 2 || isSwappingRef.current) {
        return;
      }

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;

      if (!elFront) {
        scheduleNextSwap();
        return;
      }

      isSwappingRef.current = true;
      const dropDistance = Math.max(height + verticalDistance + 72, 420);
      const tl = gsap.timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => {
          order.current = [...rest, front];
          isSwappingRef.current = false;
          scheduleNextSwap();
        },
      });
      tlRef.current = tl;

      tl.to(elFront, {
        y: `+=${dropDistance}`,
        duration: config.durDrop,
        ease: config.ease,
      });

      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        if (!el) {
          return;
        }

        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, "promote");
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease,
          },
          `promote+=${i * 0.15}`,
        );
      });

      const backSlot = makeSlot(
        refs.length - 1,
        cardDistance,
        verticalDistance,
        refs.length,
      );
      tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        "return",
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease,
        },
        "return",
      );
    };

    scheduleNextSwap();

    if (pauseOnHover) {
      const node = container.current;
      if (!node) {
        return () => {
          tlRef.current?.kill();
          timerRef.current?.kill();
          gsap.killTweensOf(refs.map((ref) => ref.current).filter(Boolean));
          isSwappingRef.current = false;
        };
      }

      const pause = () => {
        tlRef.current?.pause();
        timerRef.current?.pause();
      };
      const resume = () => {
        tlRef.current?.play();
        timerRef.current?.resume();
      };
      node.addEventListener("mouseenter", pause);
      node.addEventListener("mouseleave", resume);
      return () => {
        node.removeEventListener("mouseenter", pause);
        node.removeEventListener("mouseleave", resume);
        tlRef.current?.kill();
        timerRef.current?.kill();
        gsap.killTweensOf(refs.map((ref) => ref.current).filter(Boolean));
        isSwappingRef.current = false;
      };
    }
    return () => {
      tlRef.current?.kill();
      timerRef.current?.kill();
      gsap.killTweensOf(refs.map((ref) => ref.current).filter(Boolean));
      isSwappingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cardDistance,
    verticalDistance,
    delay,
    pauseOnHover,
    skewAmount,
    easing,
    width,
    height,
  ]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (e) => {
            child.props.onClick?.(e);
            onCardClick?.(i);
          },
        })
      : child,
  );

  return (
    <div
      ref={container}
      className={`absolute bottom-0 right-0 origin-bottom-right perspective-[900px] overflow-visible will-change-transform ${containerClassName}`.trim()}
      style={{ width, height }}
    >
      {rendered}
    </div>
  );
};

export default CardSwap;
