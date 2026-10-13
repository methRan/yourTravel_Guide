# Sample image and font assets

The site uses bundled **AI-generated sample imagery**, not photographs of real guides or verified destination photography:

- `public/images/sigiriya-hero.png`: generated travel illustration inspired by Sigiriya.
- `public/images/destinations.png`: generated six-scene travel contact sheet. Central data files select a panel with `#crop=columns,rows,column,row`; the `Photo` component frames it in CSS.
- `public/images/guides.png`: generated four-person contact sheet depicting fictional guides. The portraits do not represent your father or any real team members.

These are replaceable demo assets. Before launching, use your real business/guide photographs with permission and licensed destination photographs with verified location accuracy. Generated scenes are artistic illustrations and must not be represented as documentary photography. The footer labels the imagery as generated samples.

For replacement, put optimised WebP/JPEG files in `public/images/`, update the central content files, and retain licensing records. Use `import.meta.env.BASE_URL + 'images/your-photo.webp'`. An ordinary image path needs no crop fragment or component changes. Aim for 1600–2200px hero images, 800–1000px cards, and 600–800px portraits. The bundled source PNGs prioritise a working initial demo; replace them with optimised photographs for a faster public site.

DM Serif Display and DM Sans are bundled from https://github.com/google/fonts under the SIL Open Font License. License notices are in `public/fonts/`. Fonts and sample images need no third-party network access. The layout also has system font fallbacks.
