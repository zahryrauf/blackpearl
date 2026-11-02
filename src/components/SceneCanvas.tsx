'use client';
import { useEffect, useRef } from 'react';
import { scene } from '@/lib/scene';

type Props = { palette?: string; yacht?: { L: number; x: number; dy?: number } | null; seed?: number; animate?: boolean; label?: string };

export default function SceneCanvas({ palette = 'mist', yacht = { L: 0.84, x: 0.08, dy: 0.1 }, seed = 3, animate = false, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const draw = (t = 0) => scene(cv, palette, { seed, yacht: yacht || undefined }, t);
    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(cv);
    let raf = 0, visible = true;
    const io = new IntersectionObserver((e) => (visible = e[0].isIntersecting));
    io.observe(cv);
    if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const t0 = performance.now();
      const loop = (now: number) => { if (visible) draw((now - t0) / 1000); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }
    document.fonts?.ready.then(() => draw());
    return () => { ro.disconnect(); io.disconnect(); cancelAnimationFrame(raf); };
  }, [palette, seed, animate, yacht?.L, yacht?.x, yacht?.dy]); // eslint-disable-line react-hooks/exhaustive-deps
  return <canvas ref={ref} role="img" aria-label={label || 'Illustration of a yacht at sea'} />;
}
