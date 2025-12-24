import { CornerSeverity } from "./CornerSeverity.ts";

export const levelOneData = {
  name: "Canyon Run",
  track: {
    width: 35,
    segments: [
      { straight: 100, height: 0 ,  bankAngle: 0},
      { left: 'PALM_BEACH', bankAngle: 0, right: 'GREEK_ISLAND_SHOPS', curve: { left: CornerSeverity.SIX.value }, height: 5 },
      { straight: 180, height: 20, bankAngle: 0 },
      { straight: 180, height: 12 , bankAngle: 0},
      { left: 'PALM_BEACH', bankAngle: 0, right: 'GREEK_ISLAND_SHOPS', curve: { left: CornerSeverity.FIVE.value }, height: -25 },
      { straight: 8180, height: 12, bankAngle: 0 },
    ]
  },
  assets: [

  ]
};