# Zurio Voice

Ein Tastendruck, dann sprechen.

Zurio Voice ist eine Browser-Erweiterung. Auf ein Tastenkürzel hin erledigt sie
vier Handgriffe: Browser nach vorne holen, neuen Chat bei ChatGPT oder Claude
öffnen, den Schreibcursor ins Eingabefeld setzen, die Diktierfunktion der Seite
starten. Danach kannst du sofort loslegen.

- `⌘⇧Y` → neuer Chat bei ChatGPT
- `⌘⇧U` → neuer Chat bei Claude

Abgeschickt wird nichts. Return drückst du selbst.

## Was Zurio Voice nicht tut

Das ist keine Einschränkung, sondern der Zweck:

- Es nimmt nichts auf und erkennt keine Sprache. Es drückt den Diktierknopf der
  Seite, mehr nicht.
- Es speichert keinen Text, keinen Ton, keinen Verlauf. Gespeichert werden nur
  deine Einstellungen, und die bleiben in deinem Browser.
- Es schickt nichts ab.
- Es liest weder markierten Text noch Zwischenablage noch Bildschirm.
- Es hat Zugriff auf genau zwei Adressen: `chatgpt.com` und `claude.ai`. Auf
  keiner anderen Seite kann es überhaupt etwas tun.
- Es meldet nichts an irgendwen. Keine Statistik, kein Analysedienst, kein
  Aufruf an Dritte.

## Wohin der gesprochene Ton geht

Zurio Voice benutzt die Diktierfunktion von ChatGPT beziehungsweise Claude.
Dein Ton geht deshalb an OpenAI beziehungsweise Anthropic — genau so, wie wenn
du den Diktierknopf selbst anklickst. Zurio Voice sitzt nicht dazwischen und
bekommt den Ton nie zu sehen oder zu hören.

## Voraussetzungen

- **Ein Browser der Chrome-Familie.** Brave, Chrome, Edge, Vivaldi oder Opera.
  Firefox und Safari können keine systemweiten Kürzel für Erweiterungen und
  fallen damit weg, Chromebooks ebenfalls.
- **Der Browser muss laufen.** Er darf minimiert oder im Hintergrund sein, aber
  nicht geschlossen. Ein geschlossener Browser reagiert auf kein Kürzel.
- **Ein Konto bei ChatGPT oder Claude**, in diesem Browser angemeldet.

Entwickelt und geprüft wurde mit Brave auf macOS.

## Installation

Fünf Schritte. Schritt 3 ist der wichtigste — ohne ihn scheint die Erweiterung
gar nichts zu tun.

### 1. Ordner holen

Auf <https://github.com/tireeshore/zurio-voice> oben rechts auf den grünen
Knopf **Code**, dann **Download ZIP**. Die geladene Datei entpacken und den
entstandenen Ordner an einen Platz legen, an dem er bleiben darf — etwa in
deinen Dokumentenordner. Wird er später verschoben oder gelöscht, hört die
Erweiterung auf zu arbeiten.

### 2. Erweiterung laden

1. Im Browser `brave://extensions/` aufrufen. Bei Chrome ist es
   `chrome://extensions/`, bei Edge `edge://extensions/` und so weiter.
2. Oben rechts den **Entwicklermodus** einschalten.
3. Auf **Entpackte Erweiterung laden** klicken.
4. Im Ordner, den du entpackt hast, den Unterordner **`extension`** auswählen —
   nicht den äußeren Ordner. Der richtige ist der, in dem `manifest.json` liegt.

Zurio Voice erscheint jetzt in der Liste. Der Entwicklermodus muss
eingeschaltet bleiben.

### 3. Tastenkürzel eintragen und auf „Global" stellen

Das macht der Browser **nicht** von allein, obwohl in der Erweiterung
Vorschläge hinterlegt sind. Ohne diesen Schritt passiert beim Tastendruck
nichts.

1. `brave://extensions/shortcuts` aufrufen (bei anderen Browsern entsprechend;
   auf der Einstellungsseite von Zurio Voice steht die für dich richtige
   Adresse zum Kopieren).
2. Bei **„Neuen Chat bei ChatGPT öffnen"** auf das Stiftsymbol klicken und
   `⌘⇧Y` drücken.
3. Rechts daneben das Auswahlfeld von „In Brave" auf **„Global"** stellen. Das
   Feld lässt sich erst ändern, wenn eine Taste eingetragen ist.
4. Dasselbe für **„Neuen Chat bei Claude öffnen"** mit `⌘⇧U`.

„Global" ist der Punkt, auf den es ankommt: Nur so wirkt das Kürzel auch, wenn
gerade ein anderes Programm vorne ist.

Du kannst andere Tasten wählen. Nimm eine Kombination, die kein anderes
Programm belegt.

### 4. Einmal ausprobieren und das Mikrofon erlauben

In ein beliebiges anderes Programm wechseln und `⌘⇧U` drücken.

Der Browser kommt nach vorne, ein leerer Claude-Chat öffnet sich, der Cursor
steht im Feld. Beim allerersten Mal fragt der Browser, ob die Seite dein
Mikrofon benutzen darf — auf **Zulassen** klicken. Diese Frage kommt nur
einmal je Anbieter und gilt danach dauerhaft, auch nach einem Neustart des
Rechners.

Dann dasselbe mit `⌘⇧Y` für ChatGPT.

### 5. Einstellungen ansehen (freiwillig)

Ein Klick auf das Zurio-Voice-Symbol in der Werkzeugleiste öffnet die
Einstellungen. Die Standardwerte passen für den normalen Gebrauch.

## Einstellungen

| Einstellung | Was sie bewirkt |
|---|---|
| **Zieladresse** je Anbieter | Welche Seite das Kürzel öffnet. Muss bei `chatgpt.com` beziehungsweise `claude.ai` liegen; eine andere Adresse wird abgewiesen, weil Zurio Voice dort keinen Zugriff hätte. So lässt sich auch ein bestimmtes Projekt ansteuern. |
| **Diktat automatisch starten** je Anbieter | Aus: Der Cursor steht im Feld, das Mikrofon startest du selbst. |
| **Tabs** | Jedes Mal einen neuen Tab öffnen, oder einen schon offenen Tab des Anbieters wiederverwenden. Beim Wiederverwenden geht ein dort noch nicht abgeschickter Text verloren. |

Änderungen gelten ab dem nächsten Tastendruck und bleiben nach einem Neustart
des Browsers erhalten.

## Wenn etwas nicht klappt

Zurio Voice meldet sich, wenn es nicht weiterkommt: als weißer Kasten oben
mitten auf der Seite und als rotes Ausrufezeichen am Symbol in der
Werkzeugleiste. Fahre mit der Maus über das Symbol, dann steht dort, woran es
lag.

| Meldung | Was zu tun ist |
|---|---|
| **Du bist nicht angemeldet** | Beim Anbieter anmelden, dann das Kürzel noch einmal drücken. |
| **Keine Internetverbindung** | Verbindung herstellen. Hier zeigt der Browser seine eigene Fehlerseite. |
| **Das Mikrofon ist blockiert** | Links in der Adresszeile auf das Symbol vor der Adresse klicken, Mikrofon auf „Zulassen" stellen, Seite neu laden. |
| **Das Diktat ist nicht angesprungen** | Der Cursor steht im Feld. Tippen oder den Diktierknopf selbst drücken. |
| **Das Eingabefeld war nicht zu finden** | Der Anbieter hat vermutlich seine Oberfläche geändert. Bitte melden, siehe unten. |

**Das Kürzel bewirkt gar nichts.** Der Reihe nach prüfen:

1. Läuft der Browser überhaupt? Er darf im Hintergrund sein, aber nicht
   geschlossen.
2. Steht unter `brave://extensions/shortcuts` bei beiden Zeilen eine Taste
   **und** rechts „Global"? Das ist mit Abstand der häufigste Grund.
3. Belegt ein anderes Programm dieselbe Kombination? Dann eine andere wählen.
4. Nur auf macOS und nur, wenn Schritt 2 und 3 stimmen: In den
   Systemeinstellungen unter **Datenschutz & Sicherheit** nachsehen, ob der
   Browser bei **Bedienungshilfen** oder **Eingabeüberwachung** eingetragen und
   eingeschaltet ist. Auf dem Entwicklungsrechner war das nicht nötig, auf
   einem frisch aufgesetzten Mac kann es sein.

**Der Cursor steht im Feld, aber das Mikrofon läuft nicht.** Das ist das
gewollte Rückfallverhalten: Lieber tippen können als gar nichts. Der Kasten auf
der Seite sagt, woran es lag.

## Etwas melden

Ändert ein Anbieter seine Oberfläche, findet Zurio Voice das Eingabefeld oder
den Diktierknopf nicht mehr. Die Erweiterung schreibt in diesem Fall selbst
auf, was sie stattdessen vorgefunden hat.

So kommst du an diese Zeilen:

1. Auf der Seite Rechtsklick → **Untersuchen** → Reiter **Console**.
2. Ins Suchfeld `Zurio Voice` eintippen.
3. Die gefundenen Zeilen kopieren und mitschicken.

Melden über <https://github.com/tireeshore/zurio-voice/issues>.

## Aktualisieren

Neuen ZIP-Ordner herunterladen, den alten Ordner ersetzen, dann unter
`brave://extensions/` bei Zurio Voice auf den Neuladen-Pfeil klicken. Kürzel,
Mikrofonerlaubnis und Einstellungen bleiben erhalten.

## Deinstallieren

Unter `brave://extensions/` auf **Entfernen**. Damit verschwinden auch die
gespeicherten Einstellungen. Der entpackte Ordner kann danach gelöscht werden.
