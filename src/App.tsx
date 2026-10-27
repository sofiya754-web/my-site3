import { useRef, useState, useMemo } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValue,
  useAnimationFrame,
  AnimatePresence
} from 'motion/react';
import { Volume2, VolumeX, ShoppingBag, Sparkles } from 'lucide-react';
import { FRAGRANCES, VIDEO_SRC } from './data/fragrances';
import { OrbitImages } from './components/OrbitImages';
import { StaySection } from './components/StaySection';
import { Footer } from './components/Footer';
import { FragranceModal } from './components/FragranceModal';
import { CartDrawer } from './components/CartDrawer';
import { InfoModal } from './components/InfoModal';
import { atelierSound } from './utils/audio';
import { Fragrance, CartItem } from './types';

const TARGET_RADIUS = 650;

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedFragrance, setSelectedFragrance] = useState<Fragrance | null>(null);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [activeInfo, setActiveInfo] = useState<{ title: string; content: string } | null>(null);
  const [activeFragranceIndex, setActiveFragranceIndex] = useState(0);
  const activeFragranceIndexRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const rx = useTransform(scrollYProgress, [0, 0.08, 1], ['0%', '55%', '55%']);
  const ry = useTransform(scrollYProgress, [0, 0.08, 1], ['0%', '55%', '55%']);
  const clipPath = useMotionTemplate`ellipse(${rx} ${ry} at 50% 50%)`;

  const textOpacity = useTransform(
    scrollYProgress,
    [0.03, 0.08, 0.15, 0.22, 0.9, 0.98, 1],
    [0, 1, 1, 0, 0, 1, 1]
  );
  const textBlurVal = useTransform(
    scrollYProgress,
    [0.03, 0.08, 0.15, 0.22, 0.9, 0.98, 1],
    [15, 0, 0, 15, 15, 0, 0]
  );
  const filterText = useMotionTemplate`blur(${textBlurVal}px)`;
  const yElement = useTransform(
    scrollYProgress,
    [0.03, 0.08, 0.15, 0.22, 0.9, 0.98, 1],
    [20, 0, 0, 20, 20, 0, 0]
  );

  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.03, 0.08], [1, 1, 0]);

  const orbitItemSize = useTransform(
    scrollYProgress,
    [0.15, 0.25, 0.85, 0.95, 1],
    [80, 360, 360, 80, 80]
  );
  const orbitRx = useTransform(
    scrollYProgress,
    [0.15, 0.25, 0.85, 0.95, 1],
    [330, TARGET_RADIUS, TARGET_RADIUS, 330, 330]
  );
  const orbitRy = useTransform(
    scrollYProgress,
    [0.15, 0.25, 0.85, 0.95, 1],
    [140, TARGET_RADIUS, TARGET_RADIUS, 140, 140]
  );
  const orbitRotation = useTransform(
    scrollYProgress,
    [0.15, 0.25, 0.85, 0.95, 1],
    [-15, 0, 0, -15, -15]
  );
  const orbitTx = useTransform(
    scrollYProgress,
    [0.15, 0.25, 0.85, 0.95, 1],
    [0, -(TARGET_RADIUS + 200), -(TARGET_RADIUS + 200), 0, 0]
  );
  const focusStrength = useTransform(
    scrollYProgress,
    [0.15, 0.25, 0.85, 0.95, 1],
    [0, 1, 1, 0, 0]
  );

  const orbitProgress = useMotionValue(0);
  const prevScroll = useRef(0);

  useAnimationFrame((_time, delta) => {
    const pos = scrollYProgress.get();
    const scrollDelta = pos - prevScroll.current;
    prevScroll.current = pos;

    let frameSpeed = 0;
    if (pos > 0.15 && pos < 0.85) {
      frameSpeed = scrollDelta * 200;
    } else {
      frameSpeed = (delta / 1000) * 2.5;
    }

    const nextProg = orbitProgress.get() + frameSpeed;
    orbitProgress.set(nextProg);

    // Track fragrance closest to focal point (50)
    const total = FRAGRANCES.length;
    let closestIdx = 0;
    let minDist = 999;
    for (let i = 0; i < total; i++) {
      const itemOffset = (i / total) * 100;
      let offset = (((nextProg + itemOffset) % 100) + 100) % 100;
      let dist = Math.abs(offset - 50);
      if (dist > 50) dist = 100 - dist;
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    }

    if (closestIdx !== activeFragranceIndexRef.current) {
      activeFragranceIndexRef.current = closestIdx;
      setActiveFragranceIndex(closestIdx);
    }
  });

  const handleToggleSound = () => {
    const playing = atelierSound.toggle();
    setIsSoundPlaying(playing);
  };

  const handleAddToCart = (fragrance: Fragrance, engraving?: string) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.fragrance.id === fragrance.id && item.engraving === engraving
      );
      if (existing) {
        return prev.map((item) =>
          item.fragrance.id === fragrance.id && item.engraving === engraving
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { fragrance, quantity: 1, engraving }];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.fragrance.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.fragrance.id !== id));
  };

  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  // Rotate to specific fragrance index
  const jumpToFragrance = (fragrance: Fragrance, index: number) => {
    activeFragranceIndexRef.current = index;
    setActiveFragranceIndex(index);
    setSelectedFragrance(fragrance);
    // Align orbit progress to place this item near focal point (50)
    const targetOffset = 50 - (index / FRAGRANCES.length) * 100;
    orbitProgress.set(targetOffset);
  };

  const activeFragrance = FRAGRANCES[activeFragranceIndex] || FRAGRANCES[0];

  const handleNextEdition = () => {
    if (!selectedFragrance) return;
    const idx = FRAGRANCES.findIndex((f) => f.id === selectedFragrance.id);
    const nextIdx = (idx + 1) % FRAGRANCES.length;
    setSelectedFragrance(FRAGRANCES[nextIdx]);
  };

  const handlePrevEdition = () => {
    if (!selectedFragrance) return;
    const idx = FRAGRANCES.findIndex((f) => f.id === selectedFragrance.id);
    const prevIdx = (idx - 1 + FRAGRANCES.length) % FRAGRANCES.length;
    setSelectedFragrance(FRAGRANCES[prevIdx]);
  };

  return (
    <div className="bg-black text-white selection:bg-stone-800 selection:text-white">
      <div ref={containerRef} className="relative w-full h-[600vh] bg-black">
        <div className="sticky top-0 w-full h-screen overflow-hidden text-white">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>

          {/* Top-left brand signature */}
          <div
            className="absolute z-10 flex flex-col items-start text-left text-black select-none leading-[0.95] pointer-events-auto"
            style={{ top: '120px', left: 'clamp(24px, 6vw, 96px)' }}
          >
            <div className="flex items-baseline">
              <span
                style={{
                  fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(36px, 5.5vw, 72px)',
                  fontWeight: 500,
                  lineHeight: 1.05,
                  letterSpacing: '-0.01em'
                }}
              >
                За
              </span>
              <span
                style={{
                  fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(36px, 5.5vw, 72px)',
                  fontWeight: 400,
                  lineHeight: 1.05,
                  marginLeft: '0.15em'
                }}
              >
                гранью
              </span>
            </div>
            <span
              style={{
                fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                fontWeight: 300,
                fontSize: 'clamp(28px, 4.4vw, 56px)',
                letterSpacing: '-0.01em',
                lineHeight: 1.05,
                marginTop: '0.08em'
              }}
            >
              Коллекции
            </span>

            {/* Quick Scent Dots on hero */}
            <div className="flex items-center gap-2 mt-4 pt-2">
              {FRAGRANCES.map((frag, idx) => (
                <button
                  key={frag.id}
                  onClick={() => jumpToFragrance(frag, idx)}
                  className="w-2.5 h-2.5 rounded-full bg-black/30 hover:bg-black hover:scale-125 transition-all duration-200 cursor-pointer"
                  title={frag.name}
                  aria-label={`View ${frag.name}`}
                />
              ))}
            </div>
          </div>

          {/* Scroll hint arrow */}
          <motion.div
            className="absolute z-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white select-none pointer-events-none"
            style={{ bottom: '40px', opacity: scrollHintOpacity }}
          >
            <span className="text-[11px] uppercase tracking-[0.16em] text-white/75 mb-2 font-sans font-medium">
              Прокрутите для просмотра
            </span>
            <div className="relative w-[20px] h-[34px] overflow-hidden">
              <svg
                className="scroll-arrow absolute inset-0"
                width="20"
                height="34"
                viewBox="0 0 20 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M10 4 V28 M3 21 L10 28 L17 21"
                  stroke="#ffffff"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>

          {/* Clip-path reveal with orbital choreography */}
          <motion.div
            className="absolute z-20 flex items-center justify-center overflow-hidden"
            style={{
              clipPath,
              rotate: -15,
              width: '150vw',
              height: '150vh',
              left: '-25vw',
              top: '-25vh'
            }}
          >
            <div className="absolute inset-0 bg-white" />
            <div
              className="relative flex flex-col items-center justify-center"
              style={{ width: '100vw', height: '100vh', transform: 'rotate(15deg)' }}
            >
              <motion.div className="w-[90vw] max-w-[1200px] aspect-square relative z-0">
                <OrbitImages
                  fragrances={FRAGRANCES}
                  direction="normal"
                  duration={40}
                  fill={true}
                  showPath={false}
                  responsive={true}
                  baseWidth={800}
                  progressOverride={orbitProgress}
                  radiusXOverride={orbitRx}
                  radiusYOverride={orbitRy}
                  itemSizeOverride={orbitItemSize}
                  rotationOverride={orbitRotation}
                  translateXOverride={orbitTx}
                  focusStrength={focusStrength}
                  onSelectFragrance={(f) => setSelectedFragrance(f)}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Text overlays with scroll interpolation */}
          <div className="absolute inset-0 z-[60] pointer-events-none">
            {/* Active Perfume Name, Description & CTA - Crisp Screen-Space Vector Typography */}
            <motion.div
              className="absolute z-50 flex flex-col justify-center pointer-events-none"
              style={{
                opacity: focusStrength,
                top: '50%',
                transform: 'translateY(-50%)',
                left: 'clamp(51%, 50% + 14px, 55%)',
                width: 'min(440px, 44vw)'
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFragrance.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="pointer-events-auto cursor-pointer"
                  onClick={() => setSelectedFragrance(activeFragrance)}
                >
                  <h2
                    className="font-serif text-black leading-[1.08] tracking-tight mb-2.5 sm:mb-3 select-none"
                    style={{
                      fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
                      fontSize: 'clamp(36px, 4.5vw, 68px)',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    {activeFragrance.name}
                  </h2>

                  <p
                    className="font-sans text-black/85 max-w-md mb-3.5 sm:mb-4 select-none"
                    style={{
                      fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                      fontSize: 'clamp(16px, 1.25vw, 19px)',
                      fontWeight: 400,
                      lineHeight: 1.5,
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    {activeFragrance.desc}
                  </p>

                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-sans uppercase text-black hover:opacity-75 border-b border-black/40 hover:border-black transition-all pb-0.5"
                      style={{
                        fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                        fontSize: 'clamp(13px, 1vw, 14px)',
                        fontWeight: 500,
                        letterSpacing: '0.08em'
                      }}
                    >
                      Открыть аромат →
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Center brand text */}
            <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
              <motion.div
                className="flex flex-col items-center whitespace-nowrap pointer-events-auto cursor-pointer"
                onClick={() => setSelectedFragrance(FRAGRANCES[0])}
                style={{
                  filter: filterText,
                  opacity: textOpacity,
                  WebkitFontSmoothing: 'antialiased',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'translateZ(0)'
                }}
              >
                <div className="flex items-baseline text-black leading-none mb-1">
                  <span
                    className="font-serif text-black tracking-tight"
                    style={{
                      fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
                      fontSize: 'clamp(42px, 5.5vw, 64px)',
                      fontWeight: 500,
                      lineHeight: 1.05
                    }}
                  >
                    За{' '}
                  </span>
                  <span
                    className="font-serif italic text-black tracking-tight ml-2"
                    style={{
                      fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
                      fontSize: 'clamp(42px, 5.5vw, 64px)',
                      fontWeight: 400,
                      lineHeight: 1.05
                    }}
                  >
                    гранью
                  </span>
                </div>
                <span
                  className="font-sans text-black tracking-tight mt-[-2px]"
                  style={{
                    fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                    fontSize: 'clamp(28px, 3.5vw, 44px)',
                    fontWeight: 300,
                    lineHeight: 1.05
                  }}
                >
                  Коллекции
                </span>
              </motion.div>
            </div>

            {/* Top-right info */}
            <motion.div
              className="absolute top-28 md:top-32 right-6 md:right-[214px] flex flex-col items-start text-left pointer-events-auto cursor-pointer"
              onClick={() =>
                setActiveInfo({
                  title: '2K26 Сообщество и Ателье',
                  content:
                    'Beyond The Collection воспевает высокое парфюмерное искусство, вдохновленное духом открытых дорог и гранд-туризма. Участники закрытого клуба получают частные приглашения в Крю и приоритетный доступ к ежегодным изданиям Flacon de Cristal.'
                })
              }
              style={{ y: yElement, filter: filterText, opacity: textOpacity }}
            >
              <span
                className="font-serif leading-none mb-2 text-black"
                style={{
                  fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(36px, 3.5vw, 44px)',
                  fontWeight: 500
                }}
              >
                2K26
              </span>
              <span
                className="font-sans uppercase text-black leading-[18px] text-left"
                style={{
                  fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '0.08em'
                }}
              >
                ВСТУПАЙТЕ В ЗАКРЫТОЕ
                <br />
                СООБЩЕСТВО
              </span>
            </motion.div>

            {/* Bottom-left number */}
            <motion.div
              className="absolute bottom-8 left-6 md:bottom-16 md:left-16 flex flex-col items-start text-black pointer-events-auto cursor-text"
              style={{ y: yElement, filter: filterText, opacity: textOpacity }}
            >
              <span
                className="font-serif leading-none mb-1 text-black"
                style={{
                  fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(36px, 3.5vw, 44px)',
                  fontWeight: 500
                }}
              >
                0651
              </span>
              <span
                className="font-sans uppercase text-black"
                style={{
                  fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '0.08em'
                }}
              >
                КОЛЛЕКЦИЯ
              </span>
            </motion.div>

            {/* Bottom-right CTA */}
            <div className="absolute bottom-12 md:bottom-16 right-6 md:right-[10vw] flex flex-col items-start z-10 pointer-events-auto">
              <motion.p
                className="font-sans uppercase text-black leading-[1.5] mb-4 text-left w-[260px] cursor-text"
                style={{
                  y: yElement,
                  filter: filterText,
                  opacity: textOpacity,
                  fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                  fontSize: '13px',
                  fontWeight: 400,
                  letterSpacing: '0.06em'
                }}
              >
                ПРИСОЕДИНЯЙТЕСЬ К ЗАКРЫТОМУ СООБЩЕСТВУ ЗНАТОКОВ. ОТКРОЙТЕ ДЛЯ СЕБЯ ВЕЛИЧИЕ ВЫСОКОЙ ПАРФЮМЕРИИ.
              </motion.p>
              <motion.div
                className="flex gap-0 pointer-events-auto items-center"
                style={{ y: yElement, filter: filterText, opacity: textOpacity }}
              >
                <button
                  onClick={() => setSelectedFragrance(FRAGRANCES[0])}
                  className="bg-black hover:bg-stone-900 transition-colors text-white rounded-[40px] px-7 md:px-8 py-3.5 uppercase z-10 cursor-pointer shadow-lg"
                  style={{
                    fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                    fontSize: '13px',
                    fontWeight: 500,
                    letterSpacing: '0.08em'
                  }}
                >
                  КУПИТЬ КОЛЛЕКЦИЮ
                </button>
                <button
                  onClick={() => setSelectedFragrance(FRAGRANCES[0])}
                  className="bg-black hover:bg-stone-900 transition-colors w-[46px] h-[46px] flex items-center justify-center rounded-[50%] text-white -ml-2 z-0 cursor-pointer shadow-lg"
                  aria-label="Открыть покупку коллекции"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-1"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            </div>
          </div>

          {/* Persistent High-Contrast Header Navigation */}
          <header className="fixed top-0 left-0 w-full px-4 sm:px-6 md:px-12 py-3.5 sm:py-4 md:py-5 flex justify-between items-center z-[100] pointer-events-none transition-all">
            {/* Bentley Winged B Crest Logo */}
            <a
              href="#"
              className="pointer-events-auto inline-flex items-center gap-2.5 sm:gap-3 bg-white/90 text-black px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-md border border-black/10 shadow-sm transition-all hover:bg-white select-none"
              aria-label="Bentley"
            >
              <svg width="44" height="32" viewBox="0 0 84 60" fill="none" aria-hidden="true" className="shrink-0 text-black">
                <g fill="currentColor">
                  <path d="M42 22 C30 22 19 16 4 12 C9 26 18 33 30 33 L42 33 Z" />
                  <path d="M42 22 C54 22 65 16 80 12 C75 26 66 33 54 33 L42 33 Z" />
                  <path d="M34 25 C36 28 39 30 42 30 C45 30 48 28 50 25 L42 22 Z" opacity="0.7" />
                </g>
                <text
                  x="42"
                  y="52"
                  textAnchor="middle"
                  fontFamily="var(--font-serif), 'Cormorant Garamond', Georgia, serif"
                  fontSize="24"
                  fontStyle="italic"
                  fontWeight="500"
                  fill="currentColor"
                >
                  B
                </text>
              </svg>
              <div className="flex flex-col text-left">
                <span
                  style={{
                    fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                    fontWeight: 600,
                    fontSize: '13px',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: '#000'
                  }}
                >
                  Bentley
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                    fontWeight: 500,
                    fontSize: '9.5px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(0,0,0,0.6)'
                  }}
                >
                  BENTLEY PARFUMUS CREW
                </span>
              </div>
            </a>

            {/* Right Header Navigation & Actions */}
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
              {/* Atelier Ambient Sound Toggle */}
              <button
                onClick={handleToggleSound}
                className="hidden sm:inline-flex items-center gap-2 bg-white/90 hover:bg-white text-black rounded-full px-3.5 sm:px-4 py-2 transition-all cursor-pointer backdrop-blur-md border border-black/10 shadow-sm"
                style={{
                  fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
                title={isSoundPlaying ? 'Выключить атмосферу ателье' : 'Включить атмосферу ателье'}
              >
                {isSoundPlaying ? (
                  <>
                    <Volume2 size={13} className="text-amber-600 animate-pulse" />
                    <span>Атмосфера вкл.</span>
                  </>
                ) : (
                  <>
                    <VolumeX size={13} className="text-black/60" />
                    <span>Атмосфера</span>
                  </>
                )}
              </button>

              {/* Bespoke Story Trigger */}
              <button
                onClick={() =>
                  setActiveInfo({
                    title: 'Искусство флакона',
                    content:
                      'Созданный в сотрудничестве с мастерами Bentley в Крю, каждый флакон повторяет аэродинамические линии Continental GT, дополнен вручную прошитой кожей Connolly и рифленой металлической крышкой.'
                  })
                }
                className="hidden md:inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-black rounded-full px-3.5 sm:px-4 py-2 transition-all cursor-pointer backdrop-blur-md border border-black/10 shadow-sm"
                style={{
                  fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                <Sparkles size={12} className="text-amber-600" />
                <span>Мастерство</span>
              </button>

              {/* Atelier Bag */}
              <button
                onClick={() => setIsBagOpen(true)}
                className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-black rounded-full px-3.5 sm:px-4 py-2 transition-all cursor-pointer backdrop-blur-md border border-black/10 shadow-sm relative"
                style={{
                  fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
                aria-label="Открыть корзину"
              >
                <ShoppingBag size={14} />
                <span className="hidden sm:inline">Корзина</span>
                {totalCartCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-black text-white font-mono text-[10px] font-bold flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* Shop the collection CTA */}
              <button
                onClick={() => setSelectedFragrance(FRAGRANCES[0])}
                className="inline-flex items-center gap-2.5 bg-black text-white rounded-full pl-4 sm:pl-5 pr-2 py-2 hover:bg-stone-900 transition-all cursor-pointer shadow-md"
                style={{
                  fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                <span className="hidden sm:inline">Смотреть коллекцию</span>
                <span className="sm:hidden">Купить</span>
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-white/20 text-white">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </header>
        </div>
      </div>

      {/* Scent Editions Discovery Bar */}
      <section className="relative z-30 bg-[#0a0a0a] border-y border-white/10 py-8 px-6 md:px-16">
        <div className="max-w-[1480px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div
              className="uppercase mb-1 text-white/50"
              style={{
                fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.1em'
              }}
            >
              Чистые композиции
            </div>
            <h3
              className="text-2xl md:text-3xl text-white font-medium"
              style={{
                fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
                letterSpacing: '-0.01em'
              }}
            >
              Шесть граней высокой парфюмерии
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {FRAGRANCES.map((frag, idx) => (
              <button
                key={frag.id}
                onClick={() => jumpToFragrance(frag, idx)}
                className="px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-white/90 hover:text-white transition-all cursor-pointer flex items-center gap-2"
                style={{
                  fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '0.04em'
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: frag.colorAccent }}
                />
                <span>{frag.name}</span>
                <span className="text-white/40 text-[12px] font-normal">${frag.price}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stay in the Collection Section */}
      <StaySection />

      {/* Footer Section */}
      <Footer onOpenInfo={(title, content) => setActiveInfo({ title, content })} />

      {/* Fragrance Details Modal */}
      <FragranceModal
        fragrance={selectedFragrance}
        onClose={() => setSelectedFragrance(null)}
        onAddToCart={handleAddToCart}
        onSelectNext={handleNextEdition}
        onSelectPrev={handlePrevEdition}
      />

      {/* Atelier Bag Drawer */}
      <CartDrawer
        isOpen={isBagOpen}
        onClose={() => setIsBagOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
      />

      {/* Information Modal */}
      <InfoModal info={activeInfo} onClose={() => setActiveInfo(null)} />
    </div>
  );
}
