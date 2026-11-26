import type { DeskLighting, DeskTheme } from "./profile-desk-themes.ts";

export const deskViews = { left: -25, front: 0, standard: 16, right: 25 } as const;
export type DeskView = keyof typeof deskViews;
export type DeskProjection = [[number, number], [number, number], [number, number]];
export const defaultDeskView: DeskView = "standard";
export const deskRotationLimit = 35;

export function deskPosterFilename(theme: DeskTheme, view: DeskView, lighting: DeskLighting) {
  const angle = view === "right" ? "" : `-${view}`;
  const time = lighting === "day" ? "" : "-night";
  return `profile-desk-${theme}${angle}${time}.webp`;
}

export function closestDeskView(angle: number): DeskView {
  return (Object.keys(deskViews) as DeskView[]).reduce((closest, view) =>
    Math.abs(angle - deskViews[view]) < Math.abs(angle - deskViews[closest]) ? view : closest,
  defaultDeskView);
}
