import React, { useRef, useState, useEffect } from 'react';
import {
  motion,
  useTransform,
  useMotionTemplate,
  useMotionValue,
  animate,
  MotionValue
} from 'motion/react';
import { Fragrance } from '../types';

function generateEllipsePath(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

interface OrbitItemProps {
  item: React.ReactNode;
  fragrance: Fragrance;
  index: number;
  totalItems: number;
  pathValue: MotionValue<string>;
  itemSizeValue: MotionValue<number>;
  rotationValue: MotionValue<number>;
  progress: MotionValue<number>;
  fill: boolean;
  scaleStrength?: MotionValue<number>;
  focalPoint?: number;
  onSelect: (fragrance: Fragrance) => void;
}

function OrbitItem({
  item,
  fragrance,
  index,
  totalItems,
  pathValue,
  itemSizeValue,
  rotationValue,
  progress,
  fill,
  scaleStrength,
  focalPoint = 50,
  onSelect
}: OrbitItemProps) {
  const itemOffset = fill ? (index / totalItems) * 100 : 0;

  const offsetPercentage = useTransform(progress, (p: number) => {
    return (((p + itemOffset) % 100) + 100) % 100;
  });

  const offsetDistance = useTransform(offsetPercentage, (p: number) => `${p}%`);

  const itemScale = useTransform(() => {
    const rawPos = offsetPercentage.get();
    const strength = scaleStrength ? scaleStrength.get() : 0;
    let dist = Math.abs(rawPos - focalPoint);
    if (dist > 50) dist = 100 - dist;
    let targetScale = 1;
    if (dist < 20) {
      const ratio = dist / 20;
      const cosCurve = (Math.cos(ratio * Math.PI) + 1) / 2;
      targetScale = 0.4 + cosCurve * 0.6;
    } else {
      targetScale = 0.4;
    }
    return 1 - strength * (1 - targetScale);
  });

  const offsetPath = useMotionTemplate`path("${pathValue}")`;
  const zIndexMV = useTransform(itemScale, (s: number) => Math.round(s * 100));
  const counterRotate = useTransform(rotationValue, (r: number) => `rotate(${-r}deg)`);

  return (
    <motion.div
      className="orbit-item group"
      onClick={() => onSelect(fragrance)}
      style={{
        width: itemSizeValue,
        height: itemSizeValue,
        offsetPath,
        offsetRotate: '0deg',
        offsetAnchor: 'center center',
        offsetDistance,
        scale: itemScale,
        zIndex: zIndexMV,
        pointerEvents: 'auto',
        cursor: 'pointer'
      }}
    >
      <motion.div
        style={{
          transform: counterRotate,
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          {item}
          <div className="absolute inset-0 rounded-full border border-white/0 group-hover:border-white/20 transition-all duration-300 pointer-events-none" />
        </div>
      </motion.div>
    </motion.div>
  );
}

interface OrbitImagesProps {
  fragrances: Fragrance[];
  altPrefix?: string;
  baseWidth?: number;
  radiusX?: number;
  radiusY?: number;
  duration?: number;
  itemSize?: number;
  direction?: 'normal' | 'reverse';
  fill?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
  showPath?: boolean;
  pathColor?: string;
  pathWidth?: number;
  easing?: string;
  paused?: boolean;
  centerContent?: React.ReactNode;
  responsive?: boolean;
  progressOverride?: MotionValue<number>;
  radiusXOverride?: MotionValue<number>;
  radiusYOverride?: MotionValue<number>;
  itemSizeOverride?: MotionValue<number>;
  rotationOverride?: MotionValue<number>;
  translateXOverride?: MotionValue<number>;
  focusStrength?: MotionValue<number>;
  onSelectFragrance: (fragrance: Fragrance) => void;
}

export function OrbitImages({
  fragrances = [],
  altPrefix = 'Orbiting fragrance',
  baseWidth = 1400,
  radiusX = 700,
  radiusY = 170,
  duration = 40,
  itemSize = 64,
  direction = 'normal',
  fill = true,
  width = 100,
  height = 100,
  className = '',
  showPath = false,
  pathColor = 'rgba(0,0,0,0.1)',
  pathWidth = 2,
  easing = 'linear',
  paused = false,
  centerContent,
  responsive = false,
  progressOverride,
  radiusXOverride,
  radiusYOverride,
  itemSizeOverride,
  rotationOverride,
  translateXOverride,
  focusStrength,
  onSelectFragrance
}: OrbitImagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const designCenterX = baseWidth / 2;
  const designCenterY = baseWidth / 2;

  const defaultRadiusX = useMotionValue(radiusX);
  const defaultRadiusY = useMotionValue(radiusY);
  const defaultItemSize = useMotionValue(itemSize);
  const defaultRotation = useMotionValue(-8);
  const defaultTranslateX = useMotionValue(0);

  const currentRadiusX = radiusXOverride || defaultRadiusX;
  const currentRadiusY = radiusYOverride || defaultRadiusY;
  const currentItemSize = itemSizeOverride || defaultItemSize;
  const currentRotation = rotationOverride || defaultRotation;
  const currentTranslateX = translateXOverride || defaultTranslateX;

  const pathValue = useTransform([currentRadiusX, currentRadiusY], ([rx, ry]: number[]) => {
    return generateEllipsePath(designCenterX, designCenterY, rx, ry);
  });

  useEffect(() => {
    if (!responsive || !containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      setScale(containerRef.current.clientWidth / baseWidth);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [responsive, baseWidth]);

  const internalProgress = useMotionValue(0);

  useEffect(() => {
    if (paused || progressOverride) return;
    const controls = animate(internalProgress, direction === 'reverse' ? -100 : 100, {
      duration,
      ease: easing as 'linear',
      repeat: Infinity,
      repeatType: 'loop'
    });
    return () => controls.stop();
  }, [internalProgress, duration, easing, direction, paused, progressOverride]);

  const activeProgress = progressOverride || internalProgress;
  const containerWidth = responsive ? '100%' : typeof width === 'number' ? width : '100%';
  const containerHeight = responsive
    ? 'auto'
    : typeof height === 'number'
    ? height
    : typeof width === 'number'
    ? width
    : 'auto';

  return (
    <div
      ref={containerRef}
      className={`orbit-container ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
        aspectRatio: responsive ? '1 / 1' : undefined
      }}
      aria-hidden="false"
    >
      <div
        className={
          responsive
            ? 'orbit-scaling-container orbit-scaling-container--responsive'
            : 'orbit-scaling-container'
        }
        style={{
          width: responsive ? baseWidth : '100%',
          height: responsive ? baseWidth : '100%',
          transform: responsive ? `translate(-50%, -50%) scale(${scale})` : undefined
        }}
      >
        <motion.div
          className="orbit-rotation-wrapper"
          style={{ rotate: currentRotation, x: currentTranslateX }}
        >
          {showPath && (
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${baseWidth} ${baseWidth}`}
              className="orbit-path-svg"
            >
              <path
                d={pathValue.get()}
                fill="none"
                stroke={pathColor}
                strokeWidth={pathWidth / scale}
              />
            </svg>
          )}
          {fragrances.map((fragrance, index) => {
            const itemElement = (
              <motion.img
                src={fragrance.src}
                alt={`${altPrefix} - ${fragrance.name}`}
                draggable={false}
                className="orbit-image drop-shadow-2xl"
                whileHover={{ scale: 1.15 }}
                transition={{ duration: 0.3 }}
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
              />
            );

            return (
              <OrbitItem
                key={fragrance.id}
                item={itemElement}
                fragrance={fragrance}
                index={index}
                totalItems={fragrances.length}
                pathValue={pathValue}
                itemSizeValue={currentItemSize}
                rotationValue={currentRotation}
                progress={activeProgress}
                fill={fill}
                scaleStrength={focusStrength}
                focalPoint={50}
                onSelect={onSelectFragrance}
              />
            );
          })}
        </motion.div>
      </div>
      {centerContent && <div className="orbit-center-content">{centerContent}</div>}
    </div>
  );
}
