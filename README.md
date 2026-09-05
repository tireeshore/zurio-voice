# Zurio Voice

Zurio Voice ist eine Browser-Erweiterung. Auf ein systemweites Tastenkürzel hin
öffnet sie einen leeren Chat bei ChatGPT oder Claude, setzt den Cursor ins
Eingabefeld und startet die Diktierfunktion der Seite. Ziel ist der Weg vom
beliebigen Programm zur Spracheingabe in einem Schritt statt in vieren.

- `⌘⇧Y` öffnet einen neuen Chat bei ChatGPT
- `⌘⇧U` öffnet einen neuen Chat bei Claude

Die Tastenkombinationen werden bei der Installation selbst festgelegt; die
beiden genannten sind Beispiele. Der Prompt wird nicht abgeschickt.

## Funktionsumfang

Zurio Voice nimmt keinen Ton auf und erkennt keine Sprache. Sie betätigt den
Diktierknopf der jeweiligen Seite.

Nicht enthalten sind:

- Speichern von Text, Ton oder Verlauf. Gespeichert werden ausschließlich die
  Einstellungen, im Browser.
- automatisches Absenden des Prompts
- Zugriff auf markierten Text, Zwischenablage oder Bildschirminhalt
- Zugriff auf andere Adressen als `chatgpt.com` und `claude.ai`
- Telemetrie, Analysedienste, Netzwerkaufrufe an Dritte

## Datenverarbeitung

Der gesprochene Ton geht an OpenAI beziehungsweise Anthropic, da deren eigene
Diktierfunktion verwendet wird. Das entspricht dem manuellen Klick auf den
Diktierknopf. Zurio Voice verarbeitet den Ton nicht.

## Voraussetzungen

- Browser der Chrome-Familie: Brave, Chrome, Edge, Vivaldi oder Opera. Firefox
  und Safari unterstützen keine systemweiten Kürzel für Erweiterungen.
- Der Browser muss laufen. Minimiert oder im Hintergrund ist ausreichend.
- Ein Konto bei ChatGPT oder Claude, in diesem Browser angemeldet.

Entwickelt und geprüft mit Brave unter macOS.

## Installation

### 1. Dateien herunterladen

Unter <https://github.com/tireeshore/zurio-voice> über **Code → Download ZIP**
laden und entpacken. Der Ordner muss dauerhaft an seinem Platz bleiben; wird er
verschoben oder gelöscht, ist die Erweiterung nicht mehr funktionsfähig.

### 2. Erweiterung laden

1. `brave://extensions/` aufrufen (Chrome: `chrome://extensions/`, Edge:
   `edge://extensions/`).
2. Oben rechts den **Entwicklermodus** einschalten. Er muss eingeschaltet
   bleiben.
3. **Entpackte Erweiterung laden** wählen und den Unterordner **`extension`**
   auswählen, in dem `manifest.json` liegt.

### 3. Tastenkürzel eintragen und auf „Global" stellen

Dieser Schritt wird vom Browser nicht automatisch ausgeführt. Ohne ihn reagiert
die Erweiterung auf kein Tastenkürzel.

1. `brave://extensions/shortcuts` aufrufen. Die für den jeweiligen Browser
   gültige Adresse steht auch auf der Einstellungsseite von Zurio Voice.
2. Bei **„Neuen Chat bei ChatGPT öffnen"** auf das Stiftsymbol klicken und
   `⌘⇧Y` drücken.
3. Das Auswahlfeld rechts daneben von „In Brave" auf **„Global"** stellen. Nur
   mit dieser Einstellung wirkt das Kürzel, während ein anderes Programm im
   Vordergrund ist.
4. Für **„Neuen Chat bei Claude öffnen"** mit `⌘⇧U` wiederholen.

Andere Tastenkombinationen sind möglich, sofern sie nicht bereits von einem
anderen Programm belegt sind.

### 4. Funktion prüfen und Mikrofon freigeben

In ein anderes Programm wechseln und das Kürzel drücken. Der Browser kommt in
den Vordergrund, ein leerer Chat öffnet sich, der Cursor steht im Eingabefeld.
Beim ersten Aufruf fragt der Browser nach der Mikrofonberechtigung; diese
Abfrage erfolgt einmal je Anbieter und gilt anschließend dauerhaft.

Anschließend mit dem Kürzel des zweiten Anbieters wiederholen.

### 5. Einstellungen prüfen (optional)

Ein Klick auf das Symbol in der Werkzeugleiste öffnet die Einstellungen. Die
Standardwerte sind für den Regelfall geeignet.

## Einstellungen

| Einstellung | Wirkung |
|---|---|
| **Zieladresse** je Anbieter | Bestimmt, welche Seite das Kürzel öffnet, und erlaubt damit auch das Ansteuern eines bestimmten Projekts. Die Adresse muss innerhalb von `chatgpt.com` beziehungsweise `claude.ai` liegen. |
| **Diktat automatisch starten** je Anbieter | Ausgeschaltet: Der Cursor wird im Eingabefeld gesetzt, das Mikrofon wird nicht gestartet. |
| **Tabs** | Je Aufruf einen neuen Tab öffnen oder einen bereits offenen Tab des Anbieters wiederverwenden. Beim Wiederverwenden geht dort nicht abgeschickter Text verloren. |

## Fehlerbehebung

Störungen werden als Meldung oben auf der Seite und als rotes Ausrufezeichen am
Symbol in der Werkzeugleiste angezeigt. Der Mauszeiger über dem Symbol zeigt
Einzelheiten.

| Meldung | Ursache und Abhilfe |
|---|---|
| **Du bist nicht angemeldet** | Beim Anbieter anmelden und das Kürzel erneut drücken. |
| **Keine Internetverbindung** | Verbindung herstellen. |
| **Das Mikrofon ist blockiert** | In der Adresszeile auf das Symbol vor der Adresse klicken, Mikrofon auf „Zulassen" setzen, Seite neu laden. |
| **Das Diktat ist nicht angesprungen** | Der Cursor steht im Eingabefeld. Tippen oder den Diktierknopf manuell betätigen. |
| **Das Eingabefeld war nicht zu finden** | Der Anbieter hat seine Oberfläche geändert. Bitte melden, siehe unten. |

Reagiert die Erweiterung auf das Kürzel überhaupt nicht, der Reihe nach prüfen:

1. Läuft der Browser? Im Hintergrund ist ausreichend, geschlossen nicht.
2. Ist unter `brave://extensions/shortcuts` bei beiden Einträgen eine Taste
   hinterlegt und rechts „Global" eingestellt? Dies ist die häufigste Ursache.
3. Ist die Kombination bereits von einem anderen Programm belegt?
4. Nur unter macOS und nur, wenn Punkt 2 und 3 zutreffen: unter
   **Systemeinstellungen → Datenschutz & Sicherheit** prüfen, ob der Browser
   bei **Bedienungshilfen** oder **Eingabeüberwachung** eingetragen und
   aktiviert ist.

## Fehler melden

Ändert ein Anbieter seine Oberfläche, findet die Erweiterung das Eingabefeld
oder den Diktierknopf nicht mehr. Sie protokolliert in diesem Fall, was sie
stattdessen vorgefunden hat.

Rechtsklick auf der Seite → **Untersuchen** → Reiter **Console** → im Suchfeld
`Zurio Voice` eingeben. Die gefundenen Zeilen kopieren und dem Bericht unter
<https://github.com/tireeshore/zurio-voice/issues> beifügen.

## Aktualisieren und Entfernen

**Aktualisieren:** Aktuelles ZIP herunterladen, den bisherigen Ordner ersetzen
und unter `brave://extensions/` den Neuladen-Pfeil klicken. Tastenkürzel,
Mikrofonberechtigung und Einstellungen bleiben erhalten.

**Entfernen:** Unter `brave://extensions/` auf **Entfernen** klicken. Die
gespeicherten Einstellungen werden dabei gelöscht. Der entpackte Ordner kann
anschließend entfernt werden.

## Lizenz

MIT, siehe [LICENSE](LICENSE).
