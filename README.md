# Zurio Voice

**Ein Tastendruck, dann sprechen.** Zurio Voice öffnet aus jedem Programm
heraus einen leeren Chat bei ChatGPT oder Claude, setzt den Cursor ins Feld und
startet das Diktat — damit zwischen Gedanke und Sprechen nichts mehr liegt als
eine Taste.

- `⌘⇧Y` → neuer Chat bei ChatGPT
- `⌘⇧U` → neuer Chat bei Claude

Die Tasten legst du selbst fest; die beiden sind Beispiele. Abgeschickt wird
nichts — Return drückst du.

## Was Zurio Voice nicht tut

Kein Mangel, sondern der Zweck:

- Keine eigene Aufnahme, keine eigene Spracherkennung. Es drückt den
  Diktierknopf der Seite, mehr nicht.
- Kein Speichern von Text, Ton oder Verlauf. Nur deine Einstellungen, und die
  bleiben im Browser.
- Kein automatisches Absenden.
- Kein Zugriff auf markierten Text, Zwischenablage oder Bildschirm.
- Zugriffsrechte auf genau zwei Adressen: `chatgpt.com` und `claude.ai`.
- Keine Telemetrie, keine Analysedienste, kein Aufruf an Dritte.

**Wohin der Ton geht:** an OpenAI beziehungsweise Anthropic — genau wie beim
Klick auf deren Diktierknopf. Zurio Voice sitzt nicht dazwischen.

## Voraussetzungen

- **Browser der Chrome-Familie** (Brave, Chrome, Edge, Vivaldi, Opera). Firefox
  und Safari können keine systemweiten Kürzel für Erweiterungen.
- **Browser läuft.** Minimiert genügt, geschlossen nicht.
- **Konto bei ChatGPT oder Claude**, in diesem Browser angemeldet.

Entwickelt und geprüft mit Brave auf macOS.

## Installation

### 1. Ordner holen

Auf <https://github.com/tireeshore/zurio-voice> über **Code → Download ZIP**
laden und entpacken. Der Ordner muss an seinem Platz bleiben — wird er
verschoben oder gelöscht, hört die Erweiterung auf zu arbeiten.

### 2. Erweiterung laden

1. `brave://extensions/` aufrufen (Chrome: `chrome://extensions/`, Edge:
   `edge://extensions/`).
2. Oben rechts **Entwicklermodus** einschalten. Er muss eingeschaltet bleiben.
3. **Entpackte Erweiterung laden** → den Unterordner **`extension`** wählen
   (der mit `manifest.json`).

### 3. Kürzel eintragen und auf „Global" stellen

Ohne diesen Schritt reagiert die Erweiterung auf keine Taste. Der Browser macht
ihn nicht von allein.

1. `brave://extensions/shortcuts` aufrufen. Die für deinen Browser richtige
   Adresse steht auch auf der Einstellungsseite von Zurio Voice.
2. Bei **„Neuen Chat bei ChatGPT öffnen"** aufs Stiftsymbol, `⌘⇧Y` drücken.
3. Rechts daneben von „In Brave" auf **„Global"** stellen. Nur so wirkt das
   Kürzel, wenn ein anderes Programm vorne ist.
4. Dasselbe für **„Neuen Chat bei Claude öffnen"** mit `⌘⇧U`.

Andere Tasten sind möglich — nimm eine Kombination, die kein anderes Programm
belegt.

### 4. Ausprobieren, Mikrofon erlauben

In ein anderes Programm wechseln, Kürzel drücken. Der Browser kommt nach vorne,
ein leerer Chat öffnet sich, der Cursor steht im Feld. Beim ersten Mal fragt der
Browser nach dem Mikrofon → **Zulassen**. Die Frage kommt einmal je Anbieter und
gilt dauerhaft.

Dann dasselbe für den zweiten Anbieter.

### 5. Einstellungen (freiwillig)

Klick auf das Zurio-Voice-Symbol in der Werkzeugleiste. Die Standardwerte passen
für den normalen Gebrauch.

## Einstellungen

| Einstellung | Wirkung |
|---|---|
| **Zieladresse** je Anbieter | Welche Seite das Kürzel öffnet — so lässt sich auch ein bestimmtes Projekt ansteuern. Muss bei `chatgpt.com` beziehungsweise `claude.ai` liegen. |
| **Diktat automatisch starten** je Anbieter | Aus: Der Cursor steht im Feld, das Mikrofon startest du selbst. |
| **Tabs** | Neuer Tab je Aufruf, oder offenen Tab wiederverwenden. Beim Wiederverwenden geht dort nicht abgeschickter Text verloren. |

## Wenn etwas nicht klappt

Störungen erscheinen als Meldung oben auf der Seite und als rotes
Ausrufezeichen am Symbol. Mit der Maus über das Symbol fahren zeigt mehr.

| Meldung | Was tun |
|---|---|
| **Du bist nicht angemeldet** | Anmelden, Kürzel erneut drücken. |
| **Keine Internetverbindung** | Verbindung herstellen. |
| **Das Mikrofon ist blockiert** | In der Adresszeile auf das Symbol vor der Adresse, Mikrofon auf „Zulassen", Seite neu laden. |
| **Das Diktat ist nicht angesprungen** | Der Cursor steht im Feld. Tippen oder Diktierknopf selbst drücken. |
| **Das Eingabefeld war nicht zu finden** | Der Anbieter hat die Oberfläche geändert — bitte melden. |

**Das Kürzel bewirkt gar nichts.** Der Reihe nach:

1. Läuft der Browser? Hintergrund ist in Ordnung, geschlossen nicht.
2. Steht unter `brave://extensions/shortcuts` bei beiden Zeilen eine Taste
   **und** rechts „Global"? Mit Abstand der häufigste Grund.
3. Belegt ein anderes Programm dieselbe Kombination?
4. Nur macOS, nur wenn 2 und 3 stimmen: **Systemeinstellungen → Datenschutz &
   Sicherheit** prüfen, ob der Browser bei **Bedienungshilfen** oder
   **Eingabeüberwachung** eingetragen und eingeschaltet ist.

## Melden

Ändert ein Anbieter seine Oberfläche, findet Zurio Voice Eingabefeld oder
Diktierknopf nicht mehr. Die Erweiterung schreibt dann selbst auf, was sie
stattdessen vorgefunden hat:

Rechtsklick → **Untersuchen** → Reiter **Console** → im Suchfeld `Zurio Voice`.
Die gefundenen Zeilen kopieren und mitschicken an
<https://github.com/tireeshore/zurio-voice/issues>.

## Aktualisieren und Entfernen

**Aktualisieren:** Neues ZIP laden, alten Ordner ersetzen, unter
`brave://extensions/` den Neuladen-Pfeil klicken. Kürzel, Mikrofonerlaubnis und
Einstellungen bleiben.

**Entfernen:** Unter `brave://extensions/` auf **Entfernen**. Die gespeicherten
Einstellungen verschwinden mit; der entpackte Ordner kann gelöscht werden.

## Lizenz

MIT — siehe [LICENSE](LICENSE).
