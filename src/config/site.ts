export const site = {
  name: "Ceylon Trails",
  tagline: "Local roots. Extraordinary journeys.",
  location: "Sri Lanka",
  // Replace these samples before launch. Links are deliberately gated until configured.
  contactsConfigured: false,
  whatsapp: "94770000000",
  email: "hello@example.com",
  socials: { instagram: "", facebook: "" },
  heroImage: import.meta.env.BASE_URL + "images/sigiriya-hero.png",
};
export const landscape = (index: number) =>
  `${import.meta.env.BASE_URL}images/destinations.png#crop=3,2,${index % 3},${Math.floor(index / 3)}`;
export const portrait = (index: number) =>
  `${import.meta.env.BASE_URL}images/guides.png#crop=2,2,${index % 2},${Math.floor(index / 2)}`;
export function whatsappUrl(message: string) {
  return `https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
