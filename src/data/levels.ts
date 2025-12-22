import { CornerSeverity } from "./CornerSeverity.ts";

export const levelOneData = {
  name: "Canyon Run",
  track: {
    width: 35,
    segments: [
      { straight: 100, height: 0 },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { left: CornerSeverity.SIX.value }, height: 5 },
      { straight: 180, height: 0 },
      { straight: 180, height: 22 },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { left: CornerSeverity.FIVE.value }, height: 35 },
    ]
  },
  assets: [

  ]
};