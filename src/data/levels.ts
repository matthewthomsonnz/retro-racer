import { CornerSeverity } from "./CornerSeverity.ts";

export const levelOneData = {
  name: "Canyon Run",
  track: {
    width: 35,
    segments: [
      { straight: 180 },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { left: CornerSeverity.SIX.value } },
      { straight: 280 },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { right: CornerSeverity.FOUR.value } },
      { straight: 280 },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { left: CornerSeverity.FOUR.value } },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { right: CornerSeverity.FIVE.value } },
      { straight: 280 },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { left: CornerSeverity.FIVE.value } },
      { straight: 280 },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { left: CornerSeverity.FIVE.value } },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { left: CornerSeverity.FIVE.value } },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { right: CornerSeverity.FIVE.value } },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { left: CornerSeverity.FIVE.value } },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { right: CornerSeverity.FIVE.value } },
      { straight: 280 },
    ]
  },
  assets: [

  ]
};