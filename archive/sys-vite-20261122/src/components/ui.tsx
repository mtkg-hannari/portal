import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";

/** Fades content in once it scrolls into view. */
export function Reveal({
  children,
  className,
  delayMs,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className ?? ""}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/** An image inside a clipped frame that drifts slightly against the scroll. */
export function ParallaxImage({
  src,
  alt,
  className,
  strength = 22,
}: {
  src: string;
  alt: string;
  className?: string;
  strength?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const wrap = wrapRef.current;
      const img = imgRef.current;
      if (!wrap || !img) return;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress =
        (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      const clamped = Math.max(-1, Math.min(1, progress));
      img.style.transform = `translateY(${(clamped * strength).toFixed(1)}px) scale(1.14)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div ref={wrapRef} className={`overflow-hidden ${className ?? ""}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="parallax-img h-full w-full object-cover will-change-transform"
        loading="lazy"
      />
    </div>
  );
}

/** Section heading in the LP's editorial style: index, English label, Japanese title. */
export function SectionHeading({
  index,
  label,
  title,
}: {
  index: string;
  label: string;
  title: string;
}) {
  return (
    <Reveal>
      <div className="flex items-baseline gap-4">
        <span className="text-sm font-medium tracking-[0.2em] text-[var(--accent)]">
          {index}
        </span>
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--dim)]">
          {label}
        </p>
      </div>
      <h2 className="mt-4 text-2xl font-medium tracking-[0.12em] text-[var(--deep)] sm:text-3xl">
        {title}
      </h2>
      <div className="mt-6 h-px w-full bg-[var(--border)]" />
    </Reveal>
  );
}
