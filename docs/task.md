# Basenbox – Tagesablauf Lieferungen (SOP)

> Transkription der Arbeitsanleitung (16 Seiten PDF).
> Screenshot-Beschreibungen stehen in den Blöcken **🖼️ Screenshot**. Dort ist festgehalten, *was* markiert ist (rote Kreise, Pfeile, gelbe Markierungen) und *wo* es auf dem Bildschirm liegt.
> Personenbezogene Kundendaten aus den Screenshots (Namen, Adressen, Telefonnummern, E-Mails) sind bewusst nicht übernommen.

---

## Inhalt

| # | Phase | Tool | Ergebnis-Datei |
|---|-------|------|----------------|
| 1 | Mails vorbereiten | Mail + Word-Vorlagen | – |
| 2 | Gesamtliste erstellen | Backoffice + Excel | `TT.MM. Gesamt` |
| 3 | Spezialwünsche in der Gesamtliste anpassen | Excel + Speiseplan | `TT.MM. Gesamt` → an Goran |
| 4 | Etikettenliste | Excel-Vorlage | `TT.MM. Etikettenliste` |
| 5 | Liste Spezialwünsche | Excel-Vorlage | `TT.MM. Spezialwünsche` (+ PDF) |
| 6 | Genaue Mengen | Excel-Rezeptdatei | `TT.MM. genaue Menge` (PDF) |
| 7 | Etiketten drucken | Avery Zweckform (Vorlage 3424) | `TT.MM. Etiketten` |
| 8 | AC Kurbrief | ActiveCampaign (AC) | geplante Kampagne |
| 9 | QR-Code Basenbrief | AC + QR-Code-Generator | aktualisierter QR-Link |

---

## 1. Mails vorbereiten

- **Gaumenfreundinnen** → Vorlage: `Mailvorlage Gaumenfreundinnen.docx` (verlinkt)
- **Goran**

Den jeweiligen Text für den **Wochentag** aus der Vorlage kopieren und in die Mail einfügen.
Die Daten (Anzahl der Gerichte und Boxen) werden später anhand der täglichen Zahlen eingetragen.

---

## 2. Liste erstellen (Gesamtliste)

### Schritt 2.1 – Export aus dem Backoffice

URL: <https://backoffice.basenbox.at/deliveries>

Klickpfad: **Lieferungen → Morgen → Export → Excel**

> **🖼️ Screenshot – Backoffice „Lieferungen"**
> - **Obere Navigationsleiste (links):** Basenbox-Logo „B", dann die Reiter *Boxen*, **Lieferungen** *(rot eingekreist)*, *Bestellungen*, *Teilnehmer* und zwei Icons (Statistik, Bericht). Rechts oben: *Support ▾*.
> - **Überschrift:** „44 Lieferungen für den 05.09.2024". Ein **roter Pfeil** führt von dieser Zeile nach rechts unten zum Export-Button.
> - **Rechts neben der Überschrift:** Dropdowns *Österreich* und *Wien u.U.*
> - **Linke Button-Gruppe:** *GESTERN* · *HEUTE* · **MORGEN** *(dunkel = aktiv, rot eingekreist)*
> - **Rechte Button-Gruppe:** *FILTER* · *DRUCKEN* (grün) · **EXPORT** (grün, *rot eingekreist*)
> - **Dropdown unter EXPORT:** *CSV* · *Excel* · **Lieferanten (Excel)** *(rot eingekreist)*
> - **Tabellenspalten:** Produkt · Tee · Addons · Name · Adresse · PLZ · Ort · Land · Telefon (Beispielzeile: Produkt „Basenkur Wien x1")
>
> ⚠️ Im Text steht „Excel", eingekreist ist im Screenshot aber **„Lieferanten (Excel)"**.

### Schritt 2.2 – Liste öffnen

### Schritt 2.3 – Liste neu speichern unter

- **Dateiname:** `Datum Gesamt` → z. B. `09.11. Gesamt`
- **Ort:** im aktuellen **KW-Ordner** (verlinkt)

> **🖼️ Screenshot – Windows Explorer, Ordner „VIE KW27"**
> - **Adressleiste:** `… > Wien > VIE KW27` – der Ordnername **VIE KW27** ist *rot eingekreist*.
> - **Linke Seitenleiste:** Start, Katalog, Mateus – Persönlich, Desktop, Downloads, Dokumente, Listentemplate, Speisepläne N…, VIE KW26, **VIE KW27** (ausgewählt), Bilder, Musik.
> - **Dateiliste (Beispielinhalt eines Tages):**
>
>   | Name | Typ |
>   |------|-----|
>   | 1.7. Etiketten. | PDF |
>   | 1.7. Etikettenliste | Excel |
>   | 1.7. Genaue Mengen | PDF |
>   | **1.7. Gesamt** ← *roter Pfeil* | Excel |
>   | 1.7. Goran | Excel |
>   | 1.7. HP | Excel |
>   | 1.7. Spezialwünsche | PDF |
>   | 1.7. Spezialwünsche | Excel |
>   | 2. Woche BasenPartner – Sommeredition | Excel |
>   | 2.7. Etiketten. / 2.7. Etikettenliste / 2.7. Genaue Mengen / 2.7. Gesamt / 2.7. Goran | … |
>
> - Änderungsdatum der „1.7."-Dateien ist der **30.06.2024** → die Dateien werden **am Vortag** erstellt und tragen das **Lieferdatum** im Namen.

---

## 3. Liste der Spezialwünsche anpassen (in der Gesamtliste)

### Schritt 3.1 – Notizen sortieren

Spezialwünsche oder Anmerkungen, die **das Essen bzw. die Box** betreffen, werden aus der Spalte **„Notiz"** in die Spalte **„Spezialwünsche"** verschoben/kopiert.

- In der Spalte **Spezialwünsche** steht alles, was für den **nächsten Tag** zu beachten ist.

### Schritt 3.2 – Mit dem Speiseplan abgleichen

1. Speiseplan öffnen → *Ablage Excel-Datei Speiseplan* (verlinkt)
2. Im **Kalender** prüfen, welcher Speiseplan gekocht wird.
3. Prüfen, welche Spezialwünsche **für diesen Tag relevant** sind, z. B.:
   - Ohne Nüsse
   - Ohne Zwiebel und Knoblauch
4. **Nicht relevante Infos löschen** → kein Spezialfall an diesem Tag:
   - Werden keine Nüsse verwendet → „Ohne Nüsse" **löschen**.
   - Jemand möchte keinen Sauerkrauteintopf → durch ein **2. anderes Gericht ersetzen** (am besten anrufen und fragen, welches; sonst selbst entscheiden).
   - Bei **Allergien** das betroffene Gericht austauschen.
5. **Relevante Spezialwünsche bleiben erhalten.**

> **🖼️ Screenshot – Ausschnitt Gesamtliste (Spalten Telefon · Notiz · Spezialwünsche)**
> Orange Kopfzeile. Rote Handmarkierungen zeigen die Aktionen:
> - **„1x Bitterstoffe"** in *Notiz* → *rot eingekreist*, **roter Pfeil nach rechts** in die Spalte *Spezialwünsche* = **verschieben**.
> - **„Ohne Koriander"** (in *Spezialwünsche*, neben „Ohne Knoblauch/Zwiebel") → *rot eingekreist* mit **rotem X** = **löschen** (an diesem Tag nicht relevant).
> - **„Bitte ohne Nüsse"** → *rot eingekreist* mit **rotem X** = **löschen** (keine Nüsse im Speiseplan).
> - **„2 x Abendessen, OHNE Frühstück"** in *Notiz* → *rot eingekreist*, **Pfeil nach rechts** = **verschieben**.
> - „Sommeraktion: 40€ Rabatt auf 5 Tage Basenkur" → rot unterstrichen (betrifft nicht das Essen).
> - Reine Lieferinfos bleiben in *Notiz*, z. B. „Stock: 2", „Lieferzeit Bitte Mo–Do bis 16:30 möglich, Freitag bis 14:00", Klingel-/Abstellhinweise.

### ✅ Die Gesamtliste ist nun fertig

> **🖼️ Screenshot – fertige Gesamtliste**
> - Gelbe Zelle oben links: **„03.09. 56 Boxen"** (Datum + Boxenanzahl).
> - Spalten: Bestellung · Firma · Teilnehmer · Straße · Hausnummer · Stiege · Tür · PLZ · Ort · Land · Telefon · Notiz · **Spezialwünsche**.
> - Einträge in *Spezialwünsche* sind **fett**, z. B. „Ohne Knoblauch/Zwiebel", „Ohne Mittag – nur mit Abend", „Ohne Bitterstoffe".

### Schritt 3.3 – Liste an Goran schicken

→ siehe **Mailvorlage Goran**

---

## 4. Etikettenliste

Vorlage: *Excel-Vorlage für Etikettenliste* (verlinkt)

1. Gesamtliste öffnen und die Spalte **Spezialwünsche filtern**.
2. Im Filter **alles anklicken außer „(Leere)"**.
3. Die gefilterten Zeilen in die **Etikettenliste** kopieren.
4. Etikettenliste speichern als **`Datum Etikettenliste`**.

---

## 5. Liste Spezialwünsche

Vorlage: *Excel-Vorlage Spezialwünsche* (verlinkt)

1. Die Spalten **Teilnehmer** und **Spezialwünsche** aus der Etikettenliste kopieren und einfügen.
2. **Datum** und **Boxenanzahl** ergänzen (siehe Gesamtliste).
3. Abgleichen, welche Spezialwünsche **für welches Gericht** relevant sind, und in der passenden Spalte (Früh / Mittag / Abend) ergänzen.
4. Jede Zeile Schritt für Schritt durchgehen und die Kürzel eintragen:

   | Wunsch | Kürzel | Wirkung auf Anzahl |
   |--------|--------|--------------------|
   | Ohne Nüsse | **ON** | – |
   | Ohne Zwiebeln/Knofi | **ZK** | – |
   | Ohne Frühstück | **OF** | −1 |
   | Ohne Mittagessen | **OM** | −1 |
   | Ohne Abendessen | **OA** | −1 |
   | 2x Frühstück | – | +1 |
   | 2x Mittagessen | – | +1 |
   | 2x Abendessen | – | +1 |
   | 3x Frühstück | – | +2 |
   | 3x Mittagessen | – | +2 |
   | 3x Abendessen | – | +2 |

5. Am Ende die Anzahl jeder Mahlzeit zählen:
   - ⚠️ **Achtung** bei Kombinationen wie „Ohne Mittagessen & 2x Abendessen".
   - **Gesamtanzahl** für Frühstück, Mittagessen und Abendessen eintragen.
   - Anzahl der Spezialfälle **„Ohne Nüsse"** und **„Ohne Zwiebel und Knoblauch"** eintragen.

> **🖼️ Screenshot – ausgefüllte Liste Spezialwünsche**
> - **Kopfzeile (gelb):** **„Datum: 01.08."** *(rot eingekreist)* · **„Boxenanzahl: 50"** *(rot eingekreist)* · Spalte **Früh** (grün, *rot eingekreist*) · **Mittag** (orange) · **Abend** (blau).
> - **Zweite Zeile:** Bestellung · Teilnehmer · Spezialwünsche · Summen **49** (Früh) · **49** (Mittag) · **52** (Abend).
> - **Zeilen 1–9 (Beispiele, wie Wünsche auf Spalten verteilt werden):**
>
>   | Spezialwunsch | Früh | Mittag | Abend |
>   |---------------|------|--------|-------|
>   | Ohne Nüsse \| Ohne Knoblauch/Zwiebel | Ohne Nüsse | | Ohne ZK |
>   | Ohne Knoblauch/Zwiebel | | | Ohne ZK |
>   | Ohne Mittag; 2xAbend | | OM (−1) | 2x Abend (+1) |
>   | Ohne Frühstück; 2xAbend | OF (−1) | | 2x Abend (+1) |
>   | Ohne Nüsse | Ohne Nüsse | | |
>
> - **Zeile 10 (Summenzeile):** Früh **„4x Ohne Nüsse"** (grün hinterlegt, *rot eingekreist*) · Abend **„5x ohne ZK"** (blau hinterlegt).
> - **Rechenlogik im Beispiel:** 50 Boxen → Früh 50 − 1 (OF) = **49**, Mittag 50 − 1 (OM) = **49**, Abend 50 + 1 + 1 (zweimal 2x Abend) = **52**.
> - „Ohne Nüsse" steht hier nur in der **Früh**-Spalte, „Ohne ZK" nur beim **Abend** → je nachdem, in welchem Gericht des Tages Nüsse bzw. Zwiebel/Knoblauch vorkommen.

6. Datei speichern als **`Datum Spezialwünsche`**.
7. Datei **als PDF exportieren**.

---

## 6. Genaue Mengen

### Schritt 6.1 – Mengen eintragen

Excel-**Rezeptdatei** öffnen und die Mengen und Spezialwünsche in die Tabelle **„Sortiment neu"** für den jeweiligen Tag eintragen.

> **🖼️ Screenshot – Tabelle „Sortiment neu"**
> - **Spalten:** F/M/A · Wochentag · Anzahl Gesamt · Anzahl Normal · Ohne Nuss · Ohne Z & K
> - **Farbcode F/M/A:** *Abend* = blau · *Frühstück* = grün · *Mittag* = orange
> - **Reihenfolge pro Tag:** Abend → Frühstück → Mittag (Montag bis Freitag untereinander).
> - Rot hinterlegte Zellen in *Ohne Nuss* / *Ohne Z & K* = für dieses Gericht keine Eingabe; weiße Zellen = Sonderanzahl eintragen.
> - **Beispielwerte:** Montag Mittag 49 gesamt / 47 normal / **2** ohne Z & K · Dienstag Abend 58 / 54 / **4** · Dienstag Mittag 56 / 52 / **4** · Mittwoch Frühstück 56 / 55. Ab Donnerstag stehen 0er, teils gelb markiert.
> - **Rechts:** grüner Prüfblock **„Check – muss immer grün sein!!"** (rote Schrift) mit den Spalten Anzahl Normal · Anzahl Nuss · Anzahl Z & K, alle Werte **0** → Kontrolle, dass die Summen aufgehen.
> - Grauer Wasserzeichen-Text „Seite 5" (Seitenumbruchvorschau), blaue gestrichelte Seitenränder.
> - Rote Handpfeile bei den Freitag-Zeilen.

### Schritt 6.2 – Brotmenge vorab eintragen

Am **Sonntag** und **Dienstag** die Frühstücksmenge für **Dienstag** bzw. **Donnerstag** eintragen, damit die Küche weiß, wie viel **Brot gebacken** werden muss.

> **🖼️ Screenshot – Zoom auf „Sortiment neu"**
> - Zeile *Frühstück Montag* (zweite Frühstück-Zeile) = **5,00** → roter Handpfeil.
> - Zeile *Frühstück Dienstag* = **58** → roter Handbogen/Pfeil.
> - Alle anderen Folgetage stehen noch auf **0**.

### Schritt 6.3 – Speichern und Blätter exportieren

1. Im jeweiligen Ordner speichern.
2. Die Tabellenblätter **für den jeweiligen Tag** markieren (mit **Strg + Klick**) und exportieren:
   - **Montag:** Tabellenblätter **1, 2, 3** und **Brot 1**
   - **Dienstag:** Tabellenblätter **4, 5, 6**
3. Speichern als **`Datum genaue Menge`**.

---

## 7. Etiketten (Avery Zweckform, Vorlage 3424)

### Schritt 7.1 – Avery öffnen (verlinkt)

### Schritt 7.2 – Links auf „Daten importieren" klicken

> **🖼️ Screenshot – Avery-Designer**
> - **Blaue Kopfleiste:** „Avery Zweckform – Wir drucken Ideen." Reiter: *Startseite* · *1 – Vorlage wählen* · *2 – Design auswählen* · **3 – Anpassen** (aktiv) · *4 – Vorschau & Drucken*.
> - Darunter: „Avery Zweckform Software Code: **3424**".
> - **Linke vertikale Werkzeugleiste:** Text · Bild · **Daten importieren** *(rot eingekreist)* · Form · QR und Barcodes · 123 Fortlaufende Nummern.
> - **Mitte:** leeres Etikettenraster.

### Schritt 7.3 – „Import / Seriendruck starten" klicken und die Etikettenliste hochladen

### Schritt 7.4 – Häkchen der ersten Zeile entfernen

> **🖼️ Screenshot – Dialog „DATEN IMPORTIEREN | SERIENDRUCK"**
> - **Reiter:** Spreadsheet auswählen · **Daten bearbeiten** (aktiv, blau) · Felder anordnen · Navigator.
> - Text: „Wählen Sie die Zeilen und Spalten die Sie drucken möchten", Datei **`12.01. Etikettenliste.xlsx`** mit Link „Spreadsheet austauschen".
> - Blaue Hinweisbox mit Checkbox: „Entfernen Sie durch Anklicken das Häkchen aus dieser Box wenn Sie die erste Zeile nicht drucken möchten."
> - **Tabelle:** Spalte „Alles markieren", darüber Spalten-Checkboxen mit Sortier-Icon.
> - **Zeile 1** = Kopfzeile (*Teilnehmer · Strasse · Hausnummer*) → Checkbox **leer**, *rot eingekreist*, ein **schwarzer gebogener Pfeil** zeigt darauf.
> - Zeilen 2–6 (Kundendaten) → angehakt.
> - Unten: *ZURÜCK* (grau) · **WEITER** (blau).

### Schritt 7.5 – Felder anordnen

Die Felder von links in das rechte Feld ziehen und so anordnen:

```
Teilnehmer
Strasse Hausnummer/Stiege/Tür
PLZ

Spezialwünsche
```

> **🖼️ Screenshot 1 – „Importierte Datenfelder" (aktuelle Oberfläche)**
> - **Links:** Feldliste *Strasse · Hausnummer · Stiege · Tür · PLZ · Spezialwünsche*, jeweils mit Verschiebe-Icon (✥).
> - **Mitte:** blauer Pfeil nach rechts, Text „**Doppelklick ODER Drag & Drop**".
> - **Rechts – „Datenfelder anordnen:"** Hinweis „Fügen Sie Kommas, Leerstellen und andere Texte zwischen den Feldern hier ein", darunter das fertige Layout (siehe Codeblock oben). Zwischen PLZ und Spezialwünsche bleibt **eine Leerzeile**.
>
> **🖼️ Screenshot 2 – ältere Version desselben Dialogs**
> - Schrittleiste: 1 Spreadsheet auswählen › 2 Felder auswählen › **3 Felder anordnen** › 4 Fertig stellen.
> - Verfügbare Felder: Stiege · Tür · PLZ · Column G · Spezialwuensche.
> - Vorschau rechts mit **gelb hinterlegten** Feldern (Beispieladresse): Name / Straße + Nr. + Stiege + Tür / PLZ + Ort / Spezialwuensche.
> - Unten: „‹ Felder auswählen" · Abbrechen · **Weiter ›** (grün) – eine **Hand-Cursor-Grafik** zeigt auf *Weiter*.

### Schritt 7.6 – Fertig stellen
### Schritt 7.7 – Vorschau und Drucken
### Schritt 7.8 – Download, Etiketten speichern als **`Datum Etiketten`**

---

## 8. AC Kurbrief (ActiveCampaign)

### Schritt 8.1 – E-Mails kopieren

Aus der **Gesamtliste / Lieferliste Goran** (Excel) die **E-Mail-Adressen** herauskopieren.

> **🖼️ Screenshot** – Excel-Spalte **„Email"** (orange Kopfzeile) mit ca. 31 Adressen untereinander.

### Schritt 8.2 – In AC: Contacts → Import

Zum **AC-Programm** wechseln, auf **„Contacts"** klicken und dann rechts oben auf **Import**.

> **🖼️ Screenshot 1 – AC-Dashboard**
> - **Blaue Seitenleiste links:** Search · Getting Started · **Contacts** *(rot eingekreist)* · Campaigns · Automations · Deals · Conversations · Website · Reports.
> - **Hauptbereich:** Reiter Marketing / Ecommerce, Kacheln „Active Contacts: 23,390" und „Contact Trend: 1.1%", darunter Kampagnenliste (z. B. „Kurbrief – 18.12.2024", gesendet; „Kurbrief – 14.01.2025", Draft).
>
> **🖼️ Screenshot 2 – Contacts-Seite**
> - Untermenü links: Contacts · Accounts · Lists · *MANAGE:* Segments · Tags · Fields.
> - Überschrift **„Contacts (25,694)"** *(rot eingekreist)*.
> - **Rechts oben:** „…" · **Import** *(rot eingekreist)* · „Add a contact" (blau).
> - Filterleiste: Tags · List · Status · Search contacts.

### Schritt 8.3 – „Copy and paste your contacts"

Auf **„Copy and paste your contacts"** klicken, alle Mails hineinkopieren und auf **Next** klicken.

> **🖼️ Screenshot 1 – Import-Seite**
> - Text „Have existing contacts in a file? Import a .CSV file of your contacts or copy/paste your contacts for a quick import."
> - Blauer Button *Import From File*, darunter der Link **„Copy and paste your contacts"** *(rot eingekreist)*, darunter *View recent imports*.
> - Darunter Integrationen: Bigcommerce, Capsule CRM, Contactually, Freshbooks, Google Contacts, Google Sheets, Nimble CRM, OnePageCRM, Pipedrive (nicht benötigt).
>
> **🖼️ Screenshot 2 – Modal „Import by pasting your data below"**
> - Textfeld mit **einer E-Mail-Adresse pro Zeile**.
> - Unten rechts: *Cancel* · **Next** (blau).

### Schritt 8.4 – Liste auswählen

Unter **„Select lists"** nach **Kurbrief** suchen, **V_Kurbrief** auswählen und Enter drücken.

> **🖼️ Screenshot – Mapping & Select lists**
> - **Mapping:** Data column (E-Mail-Adresse, „text") → Field Names **„Email Address \*"**.
> - **„Select lists"** *(rot eingekreist)*, Checkbox-Liste:
>   - ☐ M_Pernegg_Gewinnspiel_2409
>   - ☐ M_Einkaufsliste_SOI-Aktion
>   - ☐ M_E-Book_SOI-Aktion
>   - ☐ M_E-Book_SOI-Aktion_2409
>   - ☐ M_Webinar_Zucker_2409
>   - ☐ M_Webinar_Anmelder_2409
>   - ☑ **V_Kurbrief** ← angehakt, „Kurbrief" orange hervorgehoben (Suchtreffer)
>   - ☐ M_Bitterstoff_Gewinnspiel_TN_2410
>   - ☐ M_Guthaben_inaktiv_Bitterstoffe_Aktion_2410
>   - ☐ M_Bitterstoff_Besteller_B21

### Schritt 8.5 – Tag vergeben

Bei **Add tags** den Kurbrief benennen nach dem Schema **`V_Kurbrief_JJ.MM.TT`**, z. B. **`V_Kurbrief_24.12.17`**
- immer der **darauffolgende Tag**
- Format **Jahreszahl.Monat.Tag**
- **V = Vertrieb**

> **🖼️ Screenshot – „Add tags"** – Eingabefeld mit grauem Chip **„V_Kurbrief_24.12.17 ×"**, darunter Hilfetext „Tags allow you to identify your contacts…".

### Schritt 8.6 – „Update existing contacts" ankreuzen

> **🖼️ Screenshot – „Import options"**
> - Dropdown: *Import As Active Contact*
> - ☑ **Update existing contacts while importing** *(gelb markiert)*
> - ☑ Trigger Webhooks → ● *Trigger Contact added and Contact updated webhooks only* / ○ *Trigger all relevant webhooks upon contact import*
> - ☑ Trigger Automations
> - ☑ Create field options when importing new custom field values
>
> Alle Optionen sind angehakt; markiert ist nur die erste.

### Schritt 8.7 – Auf **Import** klicken

> **🖼️ Screenshot** – unten rechts *Back* · **Import** (blau, *rot eingekreist*).

### Schritt 8.8 – Auf **„Import complete!"** warten

> **🖼️ Screenshot** – Wolken-Icon mit Pfeil, „**Import complete!**", Link „View Report to check the status of your import.", Links *Manage Contacts | Import More Contacts | Create a Campaign*, blauer Fortschrittsbalken **100%**.

### Schritt 8.9 – Kontakte per Tag filtern → Edit all

Wieder in AC auf **Contacts** klicken, in der **Tag-Liste** den vorher vergebenen Tag suchen (= `V_Kurbrief_24.12.17`) und auf **Edit all** klicken.

> **🖼️ Screenshot – Contacts (31)**
> - **„1."** (rot) → Tags-Dropdown **„V_Kurbrief_24.12.17"** *(rot eingekreist)* = **zuerst** filtern.
> - **„2."** (rot) → Button **„Edit all"** oben links *(rot eingekreist)* = **danach** klicken.
> - Überschrift zeigt **Contacts (31)** = Anzahl importierter Kontakte.

### Schritt 8.10 – Zur Liste hinzufügen

**Add to a list** → **V_Kurbrief** (ohne Datum) auswählen → **Add** → zum Schluss **„changes to 31 contacts"** → **Apply**.

> **🖼️ Screenshot – „Bulk Editing 31 Contacts"**
> - Links: „Please select an action from the right".
> - Rechts Panel **Actions:** **Add to a list** (aufgeklappt: Dropdown **V_Kurbrief**, blauer Button **Add**) · Add a tag · Remove a tag · Update a field.

### Schritt 8.11 – Campaigns öffnen

Wieder ins AC-Programm, diesmal auf **Campaigns** (Briefumschlag-Symbol) klicken.

> **🖼️ Screenshot**
> - **Briefumschlag-Icon** in der blauen Seitenleiste *(rot eingekreist)* und Überschrift **„Campaigns"** im Untermenü *(rot eingekreist)*.
> - Untermenü: Campaigns · *MANAGE:* Content · Campaign Templates · Message Variables · Archive · *REPORTS:* All Campaigns · Campaigns Performance · Email Client Trends · Open/Read Trends.
> - Rechts: Reiter *List View* / *Calendar*, Beispielkampagne „IL – 01.01.2025" (Draft).

### Schritt 8.12 – Kurbrief suchen → Continue

Den Kurbrief suchen, **diesmal mit umgekehrtem Datum** **Tag.Monat.Jahr**, z. B. **`17.12.2024`**, und auf **Continue** klicken.

> **🖼️ Screenshot – Kampagnenliste**
> - Filter: Type · Status · Label · List, Suchfeld **„17.12.2024"**.
> - Treffer 1: „SoLe – 17.12.2024 – Kunden VIE – Mary's Meals" (Draft) → **nicht** diesen.
> - Treffer 2: **„Kurbrief – 17.12.2024"** *(gelb markiert)*, Draft, Last Modified 16/12/2024, One-Time → Button **Continue** *(gelb markiert)*.

### Schritt 8.13 – Subscribed to list(s)

Nur **V_Kurbrief** (ohne Datum) auswählen.

### Schritt 8.14 – Send to

Den Tag **mit Datum** auswählen: **V_Kurbrief_24.12.17**.

> **🖼️ Screenshot – Recipient Selection**
> - Oben: From Email *office@basenbox.life*, ☑ „Use this email as my reply-to address".
> - **Subscribed to list(s)\*:** **V_Kurbrief** *(gelb markiert)*
> - **Send to\*:** **V_Kurbrief_24.12.17** *(gelb markiert)*
> - Rechts **Calculate recipients: 31** → muss zur Kontaktanzahl aus Schritt 8.9 passen.

### Schritt 8.15 – Schedule

Auf **Schedule** klicken, das Datum auswählen, Uhrzeit **immer 11:00 Uhr**, dann **Set schedule**.

> **🖼️ Screenshot – Schedule (Optional)**
> - **Delivery Date** *(Label gelb)*: 17/12/2024 📅
> - **Delivery Time** *(Label gelb)*: **11 : 00** Europe/Vienna (+01:00, GMT)
> - Unten rechts: *Cancel* · **Set schedule** (blau).

### Schritt 8.16 – Optional: Testmail

Wer sicher gehen will, schickt sich einen Test an die **Support-Mail**: rechts oben **Test and preview**, danach daneben **Finish**.

> **🖼️ Screenshot** – oben rechts „Saved a minute ago" · **Test and preview** · **Finish** (blau) – beide Buttons gemeinsam *rot umkreist*. Links weiterhin „Calculate recipients: 31".

### Schritt 8.17 – Nochmals mit **Finish** bestätigen

> **🖼️ Screenshot**
> - **Finish**-Button ganz rechts oben *(rot eingekreist)*.
> - Briefumschlag mit Häkchen, Text **„Your campaign has been scheduled!"** – „…will be sent at 11:00 (MEZ) on 19/12/2024 by Benji/Lisa Kundenbetreuung."
> - Button *Edit campaign*, darunter „Next, automate a follow-up campaign".

🎉 **Superrrr geschafft!**

---

## 9. QR-Code – Basenbrief

### Schritt 9.1 – Link kopieren

**AC öffnen → Campaign → Kurbrief mit heutigem Datum → View Report → Message → „Welt"-Symbol (View the web copy) → Link kopieren**

> **🖼️ Screenshot – Message-Ansicht im Report**
> - Links oben: Button *Show Overlay*.
> - Mail-Kopf: From: Basenbox <support@basenbox.life> · To: Testadresse · Subject: „So habe ich 8kg abgenommen,"
> - **Rechts oben** Icon-Reihe: **🌐 Globus** (Tooltip **„View the web copy"**) · Facebook · X · Reddit · LinkedIn · Tumblr → den **Globus** anklicken.

### Schritt 9.2 – Link beim QR-Code hinterlegen

**QR-Code-Generator öffnen → beim QR-Code „Basenbrief digital" auf den Stift (Inhalt bearbeiten) klicken → neuen Link hinterlegen → Änderung speichern → QR-Code testen**

> ⚠️ **ACHTUNG:** Immer kontrollieren, ob der QR-Code funktioniert.
> ⚠️ **ACHTUNG:** QR-Code **nicht löschen oder ändern**. **NUR** den hinterlegten Link anpassen.

**Login:**
- URL: <https://app.qr-code-generator.com/manage/?login=1>
- Mail: office@basenbox.life
- Passwort: *im Original-PDF / Passwortmanager* (hier nicht übernommen)

> **🖼️ Screenshot – Eintrag im QR-Code-Generator**
> - Typ: *Webseite (URL)* · Name **„Basenbrief digital"** · No folder · erstellt Mar 6, 2024
> - Kurzlink `qrco.de/berUP7` → `www.basenb…`
> - **111 Scans** · *Details →*
> - QR-Code mit Basenbox-Logo „B" in der Mitte.
> - Rechts: Button *Download*, darunter Icons: **✏️ Stift** (Tooltip **„Inhalt bearbeiten"**) · Palette · Ordner · ⋮ → **nur den Stift** benutzen.

---

## Anhang

### Dateibenennung pro Liefertag

| Datei | Name | Entsteht in |
|-------|------|-------------|
| Gesamtliste | `TT.MM. Gesamt` | Phase 2 |
| Etikettenliste | `TT.MM. Etikettenliste` | Phase 4 |
| Spezialwünsche | `TT.MM. Spezialwünsche` (Excel + PDF) | Phase 5 |
| Genaue Mengen | `TT.MM. genaue Menge` | Phase 6 |
| Etiketten | `TT.MM. Etiketten` | Phase 7 |

Ablage: aktueller KW-Ordner, z. B. `Wien\VIE KW27`.

### Datumsformate in AC

| Wo | Format | Beispiel |
|----|--------|----------|
| Tag beim Import | `V_Kurbrief_JJ.MM.TT` | `V_Kurbrief_24.12.17` |
| Kampagnensuche | `TT.MM.JJJJ` | `17.12.2024` |
| Liste (Subscribed to) | ohne Datum | `V_Kurbrief` |
| Versandzeit | immer | 11:00 |

### Auffälligkeiten im Original

- **Export (2.1):** Text sagt „Excel", der Screenshot kreist „Lieferanten (Excel)" ein.
- **Schritt 8.9:** im Text steht „V_Kurb**ir**ef" – gemeint ist `V_Kurbrief_…`.
- **Datumsangaben in den AC-Screenshots** passen nicht zusammen (Tag 24.12.17, Delivery Date 17/12/2024, Bestätigung 19/12/2024). Die Screenshots stammen offenbar von verschiedenen Tagen; maßgeblich ist der Text.