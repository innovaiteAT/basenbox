# Design: Basenbox

Visuelle Regeln im Basenbox-Stil, abgestimmt auf den Skill `basenbox-pptx`. Abgeleitet aus Logo und Verpackung (Box mit Zitronen-Logo und Badges "bunt · bio · basisch"), Stand 21.10.2026. Alles mit "Vorschlag" ist meine Ergänzung, nicht von der Marke.

## Marke in einem Satz
Bunt. Bio. Basisch. Frisch, freundlich, gesund, ohne Hokuspokus. Pflanzliche Bio-Küche aus Wien.

## Farben
| Rolle | Hex | Einsatz |
|---|---|---|
| Zitrone (Primär) | `#FFE000` | Hauptakzent, Kapitel-Folien, Hero-Kacheln, Diagramm-Hauptwert |
| Orange | `#FFB200` | Zitronen-Schatten, zweiter Diagrammwert, Deko-Kreise |
| Lime | `#C5DB2E` | "bio"-Badge, Aufzählungspunkte |
| Grün | `#6FA81E` | große Zahlen, Icons |
| Koralle | `#E84A3F` | "basisch"-Badge, sparsame Highlights |
| Anthrazit | `#1A1A1A` | Text, fett betonter Titelteil, Abschlussfolie |
| Warmgrau | `#5B5550` | Kicker, Sekundärtext, leichter Titelteil |
| Nebel | `#F4F2EE` | Karten, Icon-Kreise |
| Linie | `#E4E0DA` | Haarlinien in Tabellen, Kennzahlen, Zeitstrahl |
| Weiß | `#FFFFFF` | Hintergrund der Inhaltsfolien |

Regeln:
- Gewichtung: ca. 70 % Weiß, 20 % Anthrazit/Warmgrau, 10 % Zitrone. Lime und Koralle nur als Badge-Akzente.
- Zitrone nie als Schriftfarbe auf Weiß. Auf Zitrone und Lime immer Anthrazit, auf Koralle Weiß.
- Grün nur für große Zahlen und Icons, nie für Fließtext.

```css
:root {
  --bb-lemon: #FFE000;
  --bb-orange: #FFB200;
  --bb-lime: #C5DB2E;
  --bb-green: #6FA81E;
  --bb-coral: #E84A3F;
  --bb-ink: #1A1A1A;
  --bb-stone: #5B5550;
  --bb-mist: #F4F2EE;
  --bb-line: #E4E0DA;
  --bb-white: #FFFFFF;
}
```

## Typografie
- **Eine Schrift für alles: Century Gothic** (geometrisch, nah an der Logo-Wortmarke, in Office auf Windows und Mac vorinstalliert).
- **Titel zweistufig wie das Logo "BASEN**BOX**":** Versalien, leichte Laufweite. Erster Teil normal in Warmgrau, Schlüsselwort fett in Anthrazit. Beispiel: DREI **SÄULEN**.
- **Kicker** über dem Titel: 11 pt, fett, Versalien, weite Laufweite, Warmgrau.
- Titelfolie und Kapitel-Folien in Satzschreibung, fett.
- Fallback (Vorschlag) für Web: `Questrial` oder `Didact Gothic`, dann `sans-serif`.

| Element | Größe | Stil | Farbe |
|---|---|---|---|
| Titel Titelfolie | 40 pt | Satzschreibung, zweistufig | Warmgrau + Anthrazit |
| Kapitelnummer | 190 pt | fett | Anthrazit auf Zitrone |
| Kapiteltitel | 44 pt | fett | Anthrazit auf Zitrone |
| Folientitel | 28–30 pt | Versalien, zweistufig | Warmgrau + Anthrazit |
| Kicker | 11 pt | fett, Versalien | Warmgrau |
| Hero-Zahl | 80 pt | fett | Anthrazit auf Zitrone |
| Kennzahl | 40 pt | fett | Grün, Orange oder Koralle |
| Zwischentitel | 16–19 pt | fett | Anthrazit |
| Fließtext | 13–16 pt, nie unter 12 pt | normal | Warmgrau |

## Motiv: Kreise
- **Badge-Trio** bunt (Zitrone) · bio (Lime) · basisch (Koralle), überlappend, mit weißem Rand. Auf Titel- und Statement-Folie.
- Drei kleine Farbpunkte im Footer jeder Inhaltsfolie.
- Nummerierte Kreise in der Agenda, Icons in Farbkreisen, große Deko-Kreise auf Kapitel- und Abschlussfolie.
- Keine Balken, Streifen oder Linien unter Titeln.

## Komponenten
- **Karten:** Fläche Nebel `#F4F2EE`, abgerundete Ecken, Icon im Farbkreis oben links.
- **Hero-Kachel:** Zitrone, abgerundet, eine große Zahl mit kurzer Beschriftung.
- **Tabellen:** ohne Gitter, nur Haarlinien `#E4E0DA`; Kopfzeile Nebel, hervorgehobene Spalte Zitrone.
- **Icons:** Lucide-Linienicons, Anthrazit (auf Koralle weiß).
- **Logo:** nur die Originaldatei verwenden, nie nachzeichnen. Varianten: Original (weiße Folien), hell (dunkle Folien), einfarbig Anthrazit (Zitronen-Folien).
- **Footer:** Logo klein links, Farbpunkte und Seitenzahl rechts.

## Folienrhythmus
- Weiße Inhaltsfolien als Grundton.
- Zitronengelbe Kapitel-Folien als Taktgeber.
- Anthrazitfarbene Abschlussfolie mit hellem Logo und Kontaktzeilen.
- Folientypen abwechseln: Karten, Kennzahlen, Donut, Zeitstrahl, Bild + Text, Tabelle, Statement. Nicht mehr als zwei gleiche hintereinander.

## Bildsprache
- Helle Fotos mit natürlichem Licht: die Box, Gerichte von oben oder frontal, echte Menschen.
- Fotos mit abgerundeten Ecken (Inhaltsfolien) oder randabfallend (Titelfolie rechts).
- Keine Stockfoto-Optik, keine Diät-Klischees.

## Tonalität
- **Du-Form**, kurz, warm, selbstbewusst.
- Claims in Punkt-Sätzen: "Bunt. Bio. Basisch." und "täglich. frisch. geliefert."
- Eine Botschaft pro Folie, Titel ohne Punkt am Ende.
- Nutzenbotschaften: entgiften, entsäuern, Zeit sparen.
- Fakten statt Heilversprechen: 100 % Bio, pflanzlich, glutenfreie Zutaten (nicht zertifiziert).

## Dos und Don'ts
- Do: viel Weiß, Zitrone als klarer Akzent, Kreise als Motiv, kurze Sätze.
- Do: zweistufige Titel, Lime und Koralle nur als kleine Badges.
- Don't: Zitrone als Textfarbe, weißer Text auf Zitrone, mehr als eine Akzentfarbe pro Element.
- Don't: Akzentstreifen, Linien unter Titeln, Gesundheits- oder Heilversprechen ohne Beleg.

## Abweichungen zur Website
Die Website basenbox.life nutzt ein anderes System (Elementor-Kit, abgerufen am 21.10.2026): Marken-Grün `#95C11F` als Primärfarbe, Text `#3C3C3B`, Schriften "Happy" (Überschriften) und "Archer" (Fließtext), eckige Bilder. Für Präsentationen gilt das Verpackungs-Design oben; für Web-Material vorher klären, welches System gelten soll.