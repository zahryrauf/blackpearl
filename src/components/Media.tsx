import SceneCanvas from './SceneCanvas';
import type { Y } from '@/lib/data';

/** Shows the first uploaded photo, or a drawn seascape when a listing has none. */
export default function Media({ y, index = 0, animate = false, yacht }: { y: Pick<Y, 'name' | 'images' | 'palette' | 'sceneX' | 'sceneW' | 'lengthM'>; index?: number; animate?: boolean; yacht?: { L: number; x: number; dy?: number } }) {
  const img = y.images?.[index];
  // eslint-disable-next-line @next/next/no-img-element
  if (img) return <img src={img} alt={y.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />;
  return <SceneCanvas palette={y.palette} seed={Math.round(y.lengthM)} animate={animate} yacht={yacht || { L: y.sceneW, x: y.sceneX, dy: 0.1 }} label={`${y.name}, a ${Math.round(y.lengthM)} metre yacht`} />;
}
