export const deskThemes = {
  orange: {
    label: "日なた", swatch: "#ebaa75", background: "#f8e9cc",
    desk: 0xf2c7a3, accent: 0xf09882, detail: 0xf9d987, leaf: 0x9dbb8b,
    wall: 0xfff1d3, side: 0xf0d8be, floor: 0xe4c5ad, trim: 0xb39788,
    light: 0xffe599, ink: 0x595f82, frame: 0xe5dfce,
  },
  purple: {
    label: "薄紫", swatch: "#bc9bd8", background: "#e7dcef",
    desk: 0xd7c5e4, accent: 0xd695c1, detail: 0xf2c4e1, leaf: 0xa0bfa7,
    wall: 0xf3ebf9, side: 0xc1b7dc, floor: 0xbeb3d8, trim: 0x8c87ad,
    light: 0xffebc7, ink: 0x605d84, frame: 0xe4dced,
  },
  green: {
    label: "若葉", swatch: "#89b394", background: "#e5efd5",
    desk: 0xc1d5ad, accent: 0x81b187, detail: 0xf9e39a, leaf: 0x78a970,
    wall: 0xeaf4da, side: 0xb1cbbb, floor: 0xb4cbb6, trim: 0x7e9589,
    light: 0xfaeab3, ink: 0x4e6661, frame: 0xe1e9d2,
  },
  blue: {
    label: "青空", swatch: "#83b4dd", background: "#e2eff8",
    desk: 0xb7d3eb, accent: 0x7ba6d6, detail: 0xfbe0a9, leaf: 0x94bfb2,
    wall: 0xeaf6ff, side: 0xb7c3de, floor: 0xb6c9e0, trim: 0x7a92b5,
    light: 0xffefcc, ink: 0x506589, frame: 0xe0ebf1,
  },
  rose: {
    label: "桜色", swatch: "#e294ae", background: "#fae3e8",
    desk: 0xf3c0c7, accent: 0xe88daa, detail: 0xf9d3be, leaf: 0xa6c1a2,
    wall: 0xffedf0, side: 0xc8b8d0, floor: 0xd4b9d0, trim: 0xa18a9f,
    light: 0xffe8c0, ink: 0x765b71, frame: 0xeddbde,
  },
} as const;

export type DeskTheme = keyof typeof deskThemes;
export const deskThemeNames = Object.keys(deskThemes) as DeskTheme[];
export const defaultDeskTheme: DeskTheme = "green";

export const deskLightingLabels = { day: "昼", night: "夜" } as const;
export type DeskLighting = keyof typeof deskLightingLabels;
export const deskLightingModes = Object.keys(deskLightingLabels) as DeskLighting[];
export const defaultDeskLighting: DeskLighting = "day";
