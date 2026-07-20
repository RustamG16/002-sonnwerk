// SONNWERK site config — the only contract between ingest pipeline / Woo fetch and templates.
// Catalog: REAL products/photos (Bitzan shoot, Gate 0) — prices still placeholder until the
// Woo Store API build-time fetch replaces this block. Journey: real Veo clips, ingested 2026-07-14.

export const brand = {
  name: 'SONNWERK',
  claim: 'Vom Feld in die Flasche.',
  sub: 'Natürlich wirksam. Ehrlich. Für Dich.',
  tagline: 'Natur die wirkt',
  tokens: { bg: '#0D1408', paper: '#F2EBDC', gold: '#E8A33D' },
  domain: 'https://sonn-werk.at',
};

export const journey = {
  // 4 chained Veo clips @12fps, 96 frames each, 8-frame crossfades at seams (ingest 2026-07-14).
  frames: {
    path: '/media/journey/frame_',
    ext: '.webp',
    pad: 4,
    count: 384,
    mobilePath: '/media/journey-mobile/frame_',
    mobileCount: 192, // mobile = clips 1+4 only, crossfade (approved creative decision)
  },
  chapters: [
    { id: 'feld',       label: 'FELD',       title: 'Feld',       copy: ['Sonnenaufgang über unserem Hanffeld in Österreich.', 'Bio-zertifizierter Eigenanbau — kein Zukauf, kein Reseller.'] },
    { id: 'ernte',      label: 'ERNTE',      title: 'Ernte',      copy: ['Jede Pflanze wird von Hand geschnitten.', 'Handarbeit statt Maschine — Arbeit mit dem Pferd statt Traktor.'] },
    { id: 'extraktion', label: 'EXTRAKTION', title: 'Extraktion', copy: ['Schonende Extraktion, laborgeprüft.', 'Was draufsteht, ist drin — jede Charge mit Analysezertifikat.'] },
    { id: 'flasche',    label: 'FLASCHE',    title: 'Flasche',    copy: ['Vom Feld in die Flasche — ohne Umwege.', 'Abgefüllt am Hof, versendet zu Dir.'] },
  ],
};

export type Category = { slug: string; name: string; image: string; hoverLoop?: string | null };

/** Gate 2 hover-loop paths — wired to /media/hover/; clips play on hover when files exist */
export const hoverLoops: Record<string, string | null> = {
  oel: '/media/hover/oel.mp4',
  kosmetik: '/media/hover/kosmetik.mp4',
  gel: '/media/hover/gel.mp4',
  balsam: '/media/hover/balsam.mp4',
  tierprodukte: '/media/hover/tierprodukte.mp4',
};

export const categories: Category[] = [
  { slug: 'oel',           name: 'Öl',           image: '/media/products/cat-oel.webp',          hoverLoop: hoverLoops.oel },
  { slug: 'kosmetik',      name: 'Kosmetik',     image: '/media/products/cat-kosmetik.webp',     hoverLoop: hoverLoops.kosmetik },
  { slug: 'gel',           name: 'Gel',          image: '/media/products/cat-gel.webp',            hoverLoop: hoverLoops.gel },
  { slug: 'balsam',        name: 'Balsam',       image: '/media/products/cat-balsam.webp',       hoverLoop: hoverLoops.balsam },
  { slug: 'tierprodukte',  name: 'Tierprodukte', image: '/media/products/cat-tierprodukte.webp',   hoverLoop: hoverLoops.tierprodukte },
];

export type Product = {
  slug: string; name: string; category: string; price: number; // EUR — placeholder until Woo fetch
  short: string; description: string; anwendung: string; labor: string;
  image: string; rating: number; reviews: number; placeholder: boolean;
  hoverLoop?: string | null;
};

const P = (p: Omit<Product, 'placeholder'>): Product => ({ placeholder: true, ...p });

export const products: Product[] = [
  P({ slug: 'bio-cbd-oel-5',  name: 'Bio-CBD-Öl 5%',  category: 'oel', price: 29.9, rating: 4.8, reviews: 41,
      image: '/media/products/oel-5.webp',
      short: 'Der sanfte Einstieg — Vollspektrum aus eigenem Anbau.',
      description: 'Vollspektrum-CBD-Öl aus bio-zertifiziertem Hanf vom eigenen Feld. Schonend extrahiert, in Bio-Hanfsamenöl gelöst.',
      anwendung: '1–3 Tropfen unter die Zunge, 60 Sekunden wirken lassen. Langsam herantasten.',
      labor: 'Jede Charge unabhängig laborgeprüft. Analysezertifikat pro Flasche abrufbar.' }),
  P({ slug: 'bio-cbd-oel-7', name: 'Bio-CBD-Öl 7%', category: 'oel', price: 39.9, rating: 4.9, reviews: 87,
      image: '/media/products/oel-7.webp',
      short: 'Unser Klassiker aus Bionutzhanf — was draufsteht, ist drin.',
      description: 'Unser meistverkauftes Vollspektrum-Öl aus Bionutzhanf. 7% CBD, laborbestätigt — Transparenz vom Feld in die Flasche.',
      anwendung: '1–3 Tropfen unter die Zunge, 60 Sekunden wirken lassen.',
      labor: 'Jede Charge unabhängig laborgeprüft. Analysezertifikat pro Flasche abrufbar.' }),
  P({ slug: 'bio-cbd-oel-19', name: 'Bio-CBD-Öl 19%', category: 'oel', price: 89.9, rating: 4.9, reviews: 34,
      image: '/media/products/oel-19.webp',
      short: 'Hochkonzentriert für erfahrene Anwender.',
      description: 'Unser stärkstes Vollspektrum-Öl für erfahrene Anwender:innen. 19% CBD aus Bionutzhanf.',
      anwendung: '1–2 Tropfen unter die Zunge. Für Einsteiger empfehlen wir 5% oder 7%.',
      labor: 'Jede Charge unabhängig laborgeprüft.' }),
  P({ slug: 'cbd-gel-waermend-stark', name: 'CBD Gel – Wärmend Stark', category: 'gel', price: 24.9, rating: 4.7, reviews: 52,
      image: '/media/products/gel.webp',
      short: 'Wohltuend für Muskeln & Gelenke — wärmend, 700mg CBD.',
      description: 'Wärmendes CBD-Gel für die gezielte äußere Anwendung nach Sport und langen Tagen. 700mg CBD, stark.',
      anwendung: 'Dünn auf die gewünschte Stelle auftragen und einmassieren.',
      labor: 'Dermatologisch getestet, laborgeprüfter CBD-Gehalt.' }),
  P({ slug: 'cbd-gel-kuehlend-stark', name: 'CBD Gel – Kühlend Stark', category: 'gel', price: 24.9, rating: 4.7, reviews: 38,
      image: '/media/products/gel-kuehlend.webp',
      short: 'Wohltuend für Muskeln & Gelenke — kühlend, 700mg CBD.',
      description: 'Kühlendes CBD-Gel für die gezielte äußere Anwendung direkt nach der Belastung. 700mg CBD, stark.',
      anwendung: 'Dünn auf die gewünschte Stelle auftragen und einmassieren.',
      labor: 'Dermatologisch getestet, laborgeprüfter CBD-Gehalt.' }),
  P({ slug: 'cbd-balsam-waermend-stark', name: 'CBD Balsam – Wärmend Stark', category: 'balsam', price: 29.9, rating: 4.8, reviews: 63,
      image: '/media/products/balsam.webp',
      short: 'Wohltuend für Muskeln & Gelenke — wärmend, 700mg CBD.',
      description: 'Reichhaltiger CBD-Balsam mit Bienenwachs und Kräuterauszügen vom Hof. 700mg CBD, stark.',
      anwendung: 'Nach Belastung großzügig einmassieren.',
      labor: 'Bio-zertifizierte Rohstoffe, laborgeprüfter CBD-Gehalt.' }),
  P({ slug: 'cbd-balsam-kuehlend-stark', name: 'CBD Balsam – Kühlend Stark', category: 'balsam', price: 29.9, rating: 4.7, reviews: 29,
      image: '/media/products/balsam-kuehlend.webp',
      short: 'Wohltuend für Muskeln & Gelenke — kühlend, 700mg CBD.',
      description: 'Kühlender CBD-Balsam für beanspruchte Muskeln und Gelenke. 700mg CBD, stark.',
      anwendung: 'Nach Belastung großzügig einmassieren.',
      labor: 'Bio-zertifizierte Rohstoffe, laborgeprüfter CBD-Gehalt.' }),
  P({ slug: 'tagescreme-nachtcreme-set', name: 'Tagescreme & Nachtcreme Set', category: 'kosmetik', price: 44.9, rating: 4.7, reviews: 22,
      image: '/media/products/creme-set.webp',
      short: 'Glättende Tagescreme mit UV-Schutz + reichhaltige Nachtcreme.',
      description: 'Das Pflege-Duo: glättende & pflegende Tagescreme mit natürlichem UV-Schutz und reichhaltige Nachtcreme mit Age-Defense-Formel.',
      anwendung: 'Morgens Tagescreme, abends Nachtcreme auf die gereinigte Haut auftragen.',
      labor: 'Dermatologisch getestet, natürliche Rohstoffe.' }),
  P({ slug: 'bio-deocreme-rosenholz', name: 'Bio Deocreme – Rosenholz', category: 'kosmetik', price: 12.9, rating: 4.6, reviews: 19,
      image: '/media/products/deocreme.webp',
      short: 'Natürlicher Schutz, sanfter Rosenholz-Duft.',
      description: 'Bio-Deocreme ohne Aluminium, mit sanftem Rosenholz-Duft — in der wiederverwendbaren Dose.',
      anwendung: 'Eine erbsengroße Menge unter den Achseln verteilen.',
      labor: 'Bio-zertifizierte Rohstoffe.' }),
  P({ slug: 'dusch-shampoo-bergkraeuter', name: 'Dusch-Shampoo – Bergkräuter', category: 'kosmetik', price: 14.9, rating: 4.5, reviews: 17,
      image: '/media/products/shampoo.webp',
      short: 'Für Haut & Haar — mit Aloe Vera und Bergkräutern.',
      description: 'Mildes Dusch-Shampoo für Haut & Haar mit Aloe Vera, Meersalz, Weizenprotein und Vitamin E. Ohne Silikone & Mikroplastik.',
      anwendung: 'Wie gewohnt anwenden — für Haut und Haar.',
      labor: 'Ohne Silikone & Mikroplastik.' }),
  P({ slug: 'cbd-oel-fuer-hunde', name: 'CBD-Öl für Hunde 3%', category: 'tierprodukte', price: 27.9, rating: 4.9, reviews: 58,
      image: '/media/products/oel-hunde.webp',
      short: 'Mild dosiert für Deinen Begleiter.',
      description: 'Mildes CBD-Öl, speziell dosiert für Hunde, in Bio-Hanfsamenöl.',
      anwendung: 'Je nach Gewicht 1–3 Tropfen ins Futter. Tierarzt fragen bei Unsicherheit.',
      labor: 'Laborgeprüft, THC-frei (<0,05%).' }),
];

export const byCategory = (slug: string) => products.filter((p) => p.category === slug);
export const bySlug = (slug: string) => products.find((p) => p.slug === slug);
export const euro = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;

export const principles = [
  { title: 'Bio-Zertifiziert', copy: 'Kontrollierter biologischer Anbau in Österreich — Austria Bio Garantie, jede Charge laborgeprüft.' },
  { title: 'Regional', copy: 'Vom eigenen Feld, verarbeitet und abgefüllt am Hof. Keine Importware, keine Zwischenhändler.' },
  { title: 'Handgefertigt', copy: 'Von Hand geerntet, mit dem Pferd bewirtschaftet, in kleinen Chargen gefertigt.' },
];

export const quote = {
  text: 'Man schmeckt, dass da ein Hof dahintersteht und kein Labor.',
  author: 'Kundin aus Kärnten',
};

// Ambient loops: poster-first; src wired to Gate 2 paths (poster shows until mp4 lands in /media/ambient/)
export const ambientPaths = {
  begleiter: '/media/ambient/begleiter.mp4',
  horses: '/media/ambient/horses.mp4',
  harness: '/media/ambient/harness.mp4',
  hanf: '/media/ambient/hanf.mp4',
  feld: '/media/ambient/feld.mp4',
} as const;

export const ambient = {
  begleiter: { src: ambientPaths.begleiter, poster: '/media/ambient/begleiter.webp', alt: 'Grasendes Pferd des Hofkollektivs' },
  horses:    { src: ambientPaths.horses,    poster: '/media/ambient/horses.webp',    alt: 'Arbeit mit dem Pferd am Feld' },
  harness:   { src: ambientPaths.harness,   poster: '/media/ambient/harness.webp', alt: 'Kutschengeschirr des Hofkollektivs' },
  hanf:      { src: ambientPaths.hanf,      poster: '/media/ambient/hanf.webp',    alt: 'Junge Hanfpflanze am Feld' },
  feld:      { src: ambientPaths.feld,      poster: '/media/ambient/feld.webp',    alt: 'Sonnenaufgang über dem Hanffeld' },
};

export const checkout = {
  // Phase 1: checkout hands off to the existing Woo checkout.
  wooCheckoutUrl: 'https://sonn-werk.at/kasse/',
  wooCartUrl: 'https://sonn-werk.at/warenkorb/',
};
