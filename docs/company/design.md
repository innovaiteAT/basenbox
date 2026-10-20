# Design: Basenbox

Visuelle Regeln im Stil von basenbox.life. Werte aus dem Live-CSS (Elementor-Kit), Stand 21.10.2026. Alles mit "Vorschlag" ist meine Ergänzung, nicht von der Marke.

## Marke in einem Satz
Bunt. Bio. Basisch. Frisch, freundlich, gesund, ohne Hokuspokus. Pflanzliche Bio-Küche aus Wien.

## Farben
| Rolle | Hex | Einsatz |
|---|---|---|
| Primär (Marken-Grün) | `#95C11F` | Buttons, H2/H4, Links, Vollflächen-Sections |
| Text / Dunkel | `#3C3C3B` | Fließtext, Footer-Hintergrund |
| Weiß | `#FFFFFF` | Header, Karten, Text auf Grün/Dunkel |
| Gelb | `#FBBA00` | Akzent |
| Orange | `#F59A28` | Akzent |
| Himmelblau | `#6EC1E4` | Akzent |
| Rot | `#E63312` / `#CB2F0D` / `#E84133` | sparsam, Aktionen/Hinweise |
| Dunkelgrün | `#00983A` | Akzent, Bio/Natur |

Regeln:
- Grün dominiert. Die Akzentfarben ("bunt") immer nur einzeln und klein einsetzen.
- Weiß auf Grün (`#95C11F`) hat knappen Kontrast. Für kleinen Text Dunkelgrau `#3C3C3B` auf Grün oder Weiß nur bei großer Schrift.

```css
:root {
  --bb-green: #95C11F;
  --bb-ink: #3C3C3B;
  --bb-white: #FFFFFF;
  --bb-yellow: #FBBA00;
  --bb-orange: #F59A28;
  --bb-blue: #6EC1E4;
  --bb-red: #E63312;
  --bb-forest: #00983A;
}
```

## Typografie
- **Überschriften und Buttons: "Happy"** (KG Happy Solid), Gewicht 300, Laufweite eng (`letter-spacing: -3px` bei H1/H2), Groß-/Kleinschreibung wie im Satz, kein Uppercase.
- **Fließtext: "Archer"**, Slab-Serif, Gewicht 500.
- Fallbacks (Vorschlag): Happy → `Fredoka`, Archer → `Rokkitt` (lädt die Seite selbst), dann `sans-serif`.
- Lizenz klären: Happy und Archer sind keine freien Fonts. Ohne Lizenz die Fallbacks nutzen.

| Element | Schrift | Größe | Farbe |
|---|---|---|---|
| H1 | Happy 300 | 35px / 35px | Weiß (auf Foto/Grün) |
| H2 | Happy 300 | 40px | `#95C11F` |
| H3 | Happy 300 | 24px | Weiß (auf Grün/Dunkel) |
| H4 | Happy 300 | 20px | `#95C11F` |
| Body | Archer 500 | 16px / 24px (Intro-Text 25px / 37,5px) | `#3C3C3B` |
| Button | Happy 300 | 18px | Weiß |

## Komponenten
- **Button (primär):** Hintergrund `#95C11F`, Text weiß, `border-radius: 3px`, `padding: 20px 40px`, Schatten `0 0 10px rgba(0,0,0,.5)`. Texte klein und direkt: "Basenkur bestellen", "jetzt bestellen".
- **Links:** `#95C11F`, ohne Unterstreichung.
- **Header:** weiß, ca. 66px hoch, weicher Schatten (`0 4px 6px -1px rgba(0,0,0,.1)`).
- **Footer:** `#3C3C3B`, Text weiß.
- **Sections:** abwechselnd weiß und vollflächig grün. Viel Weißraum.
- **Bilder:** quadratische Food-Fotos und freigestellte Gerichte, keine Rundungen (`border-radius: 0`).
- **Vertrauenselemente:** Bio-Siegel, EU-Bio-Logo, Presse-Logos (Puls 4, Kurier, Wienerin, 2 Minuten 2 Millionen) in einer Reihe, dezent.

## Bildsprache
- Helle, farbige Gerichte von oben oder frontal, natürliches Licht.
- Echte Menschen und Gründer:innen, Testimonials mit Foto, Vorname und Beruf.
- Keine Stockfoto-Optik, keine Diät-Klischees.

## Tonalität
- **Du-Form**, kurz, warm, selbstbewusst.
- Claims in Punkt-Sätzen: "täglich. frisch. geliefert." und "Bunt. Bio. Basisch."
- Überschriften oft klein geschrieben: "basisch entgiften", "3 Gerichte".
- Nutzenbotschaften: entgiften, entsäuern, abnehmen, Zeit sparen.
- Fakten statt Heilversprechen: 100 % Bio, pflanzlich, glutenfreie Zutaten (nicht zertifiziert), clean, Geld-zurück-Garantie.
- Social: dezente Emojis (🌱 💚 ✨), Hashtags wie `#basenbox`, `#basenkur`, Aufforderung zur Interaktion ("Schreib uns INFO").

## Dos und Don'ts
- Do: viel Grün, runde freundliche Schrift, kurze Sätze, ein klarer Call-to-Action pro Abschnitt.
- Do: Akzentfarben als kleine Farbtupfer (Icons, Labels).
- Don't: Uppercase-Überschriften, dunkle Dramatik, mehr als eine Akzentfarbe pro Element.
- Don't: Gesundheits- oder Heilversprechen ohne Beleg, Fachjargon, Verbotsrhetorik.

## Quelle
Live-Stylesheet und Seite: https://www.basenbox.life/ (Computed Styles und Elementor-Variablen, abgerufen am 21.10.2026). Logo-Form und Illustrationsstil habe ich nicht ausgewertet. Dafür die Originaldateien von der Marke holen.