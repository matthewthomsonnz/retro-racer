import { CornerSeverity } from "./CornerSeverity.ts";

export const levelOneData = {
  name: "Canyon Run",
  track: {
    width: 15,
    segments: [
      { straight: 80 },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { left: CornerSeverity.THREE.value } },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { right: CornerSeverity.THREE.value } },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { left: CornerSeverity.THREE.value } },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { right: CornerSeverity.THREE.value } },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { left: CornerSeverity.THREE.value } },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { right: CornerSeverity.THREE.value } },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { left: CornerSeverity.THREE.value } },
      { left: 'PALM_BEACH', right: 'GREEK_ISLAND_SHOPS', curve: { right: CornerSeverity.THREE.value } },
      { straight: 80 },
    ]
  },
  assets: [

  ]
};