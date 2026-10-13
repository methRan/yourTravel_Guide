import type { Guide } from "../types";
import { portrait } from "../config/site";
import { destinations } from "./destinations";
export const guides: Guide[] = [
  {
    id: "sunil",
    name: "Sunil Perera",
    role: "Founder & local guide",
    years: 20,
    languages: ["English", "Sinhala"],
    specialties: ["Culture & heritage", "Family journeys", "Island road trips"],
    bio: "For Sunil, the best journeys begin with a conversation. Our sample founder has spent two decades sharing the small stories, favourite places, and warm hospitality that make this island special. Replace this biography with your father’s real story before launch.",
    image: portrait(0),
    gallery: [
      destinations[0].image,
      destinations[4].image,
      destinations[1].image,
    ],
  },
  {
    id: "nimal",
    name: "Nimal Fernando",
    role: "Nature & wildlife guide",
    years: 12,
    languages: ["English", "Sinhala"],
    specialties: ["Wildlife", "Birdwatching", "Nature walks"],
    bio: "Patient, curious, and happiest outdoors. Nimal’s sample profile celebrates the island’s wild corners and a thoughtful approach to wildlife tourism.",
    image: portrait(1),
    gallery: [
      destinations[3].image,
      destinations[1].image,
      destinations[5].image,
    ],
  },
  {
    id: "dilani",
    name: "Dilani Jayawardena",
    role: "Culture & food guide",
    years: 8,
    languages: ["English", "Sinhala", "Tamil"],
    specialties: ["Local food", "Culture", "City walks"],
    bio: "From a bustling market to a family kitchen, Dilani’s sample profile is all about meaningful connections and the flavours of everyday Sri Lanka.",
    image: portrait(2),
    gallery: [
      destinations[4].image,
      destinations[0].image,
      destinations[2].image,
    ],
  },
  {
    id: "kasun",
    name: "Kasun Silva",
    role: "Adventure & coast guide",
    years: 6,
    languages: ["English", "Sinhala"],
    specialties: ["Hiking", "Coastal journeys", "Photography"],
    bio: "Early starts, mountain views, and the perfect sunset. Kasun’s sample profile brings an easygoing spirit to active island adventures.",
    image: portrait(3),
    gallery: [
      destinations[1].image,
      destinations[2].image,
      destinations[5].image,
    ],
  },
];
