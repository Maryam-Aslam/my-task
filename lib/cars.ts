/**
 * Feature cars for the homepage models showcase.
 * Paste a direct image link into `src` for each car.
 */
export type CarMedia = {
  key: string;
  chapter: string;
  variant: "light" | "dark" | "mist";
  outline: string;
  src: string;
  alt: string;
  accent: string;
};

export const FEATURES: Record<string, CarMedia> = {
  "Range Rover": {
    key: "range-rover", chapter: "01", variant: "light", outline: "RANGE ROVER",
    src: "/media/one",
    alt: "Range Rover Autobiography (L460) in Charente Grey",
    accent: "#8a9a93",
  },
  "Range Rover Sport": {
    key: "range-rover-sport", chapter: "02", variant: "dark", outline: "SPORT",
    src: "/media/two.png",
    alt: "Range Rover Sport (L461) in Varesine Blue",
    accent: "#18b777",
  },
  "Range Rover Velar": {
    key: "range-rover-velar", chapter: "03", variant: "mist", outline: "VELAR",
    src: "/media/three.png",
    alt: "Range Rover Velar D300 (L560) in white",
    accent: "#08794d",
  },
};

export const imgSrc = (m: CarMedia, _w = 1800) => m.src;