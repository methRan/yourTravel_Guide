import { landscape } from "../config/site";
import type { Destination } from "../types";
export const destinations: Destination[] = [
  {
    id: "sigiriya",
    name: "Sigiriya",
    region: "THE CULTURAL TRIANGLE",
    image: landscape(0),
    description:
      "An ancient rock fortress rising above a sea of green. Climb at first light, then wander through villages where life moves a little slower.",
    duration: "1–2 days",
    activities: [
      "Climb the UNESCO-listed rock fortress",
      "Watch sunrise from Pidurangala",
      "Enjoy a village cooking experience",
    ],
  },
  {
    id: "ella",
    name: "Ella",
    region: "THE HILL COUNTRY",
    image: landscape(1),
    description:
      "Misty mountains, winding railway tracks, and tea as far as the eye can see. A place to take a deep breath and stay a little longer.",
    duration: "2–3 days",
    activities: [
      "Visit the Nine Arch Bridge",
      "Hike Little Adam’s Peak",
      "Ride the scenic hill-country train",
    ],
  },
  {
    id: "mirissa",
    name: "Mirissa",
    region: "THE SOUTH COAST",
    image: landscape(2),
    description:
      "Salt in the air, palm-fringed bays, and long, unhurried evenings. Find your own stretch of the southern coast.",
    duration: "2–3 days",
    activities: [
      "Relax on the beach",
      "Explore Coconut Tree Hill",
      "Enjoy fresh seafood by the ocean",
    ],
  },
  {
    id: "yala",
    name: "Yala National Park",
    region: "THE WILD SOUTH",
    image: landscape(3),
    description:
      "Where wild elephants roam and leopards slip through the trees. Explore with a respectful local safari team; sightings are never guaranteed.",
    duration: "1–2 days",
    activities: [
      "Take a guided wildlife safari",
      "Spot native birds",
      "Learn about responsible wildlife travel",
    ],
  },
  {
    id: "kandy",
    name: "Kandy",
    region: "THE CULTURAL HEART",
    image: landscape(4),
    description:
      "A lakeside city full of living traditions. Discover sacred temples, botanical gardens, and the warmth of the central hills.",
    duration: "1–2 days",
    activities: [
      "Visit the Temple of the Tooth",
      "Walk around Kandy Lake",
      "Explore Peradeniya Botanical Gardens",
    ],
  },
  {
    id: "nuwara-eliya",
    name: "Nuwara Eliya",
    region: "TEA COUNTRY",
    image: landscape(5),
    description:
      "Cool mornings and emerald tea gardens. Follow the story of Ceylon tea from leafy hillside to a freshly brewed cup.",
    duration: "1–2 days",
    activities: [
      "Visit a tea estate",
      "Walk through Horton Plains",
      "Taste local Ceylon tea",
    ],
  },
];
