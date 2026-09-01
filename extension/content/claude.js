// Zurio Voice — Seitenteil für Claude
//
// Enthält ausschließlich, woran Claude seine Bedienelemente erkennen lässt.
// Der Ablauf selbst steht in `common.js`. ChatGPT kommt in dieser Datei nicht
// vor: Ändert Claude seine Oberfläche, wird nur hier etwas angefasst.

(function () {
  "use strict";

  // Erkennungswege für das Eingabefeld, absteigend nach Stabilität. Claude
  // vergibt dem Feld keine feste Kennung, deshalb beginnt die Liste bei der
  // Seitenstruktur statt bei einem Namen:
  // 1./2. Das Eingabefeld sitzt im Rahmen des Eingabebereichs. Am Bildschirm
  //    bestätigt: Der erste Weg greift sofort, ein unsichtbares Ersatzfeld wie
  //    bei ChatGPT gibt es hier nicht.
  // 3. Der Klassenname des benutzten Editors — brauchbar, aber am ehesten
  //    änderbar.
  // 4. Irgendein beschreibbarer Bereich im Hauptbereich der Seite.
  // 5. Letzter Rückfall: der einzige beschreibbare Bereich im leeren Chat.
  const COMPOSER_SELECTORS = [
    "fieldset div[contenteditable='true']",
    "form div[contenteditable='true']",
    "div.ProseMirror[contenteditable='true']",
    "main div[contenteditable='true']",
    "div[contenteditable='true']"
  ];

  // Erkennungswege für den Diktierknopf. Am Bildschirm abgelesen: Im Rahmen des
  // Eingabebereichs sitzen fünf Knöpfe. Der gesuchte heißt „Diktieren" —
  // ChatGPT nennt denselben Knopf „Diktat starten", die Wortstämme sind also
  // verschieden. Beide Teilstücke stehen deshalb in der Liste.
  //
  // Zwei Nachbarn dürfen auf keinen Fall getroffen werden: „Nachricht senden"
  // steht direkt davor, „Spracheingabe" direkt dahinter. Die Spracheingabe ist
  // Claudes Sprachmodus, gegen den P1 sich ausdrücklich entschieden hat. Keiner
  // der Wege unten kann einen von beiden treffen, und ein Weg über die Stellung
  // im Rahmen kommt genau deshalb nicht in Frage.
  const MIC_SELECTORS = [
    "fieldset button[aria-label='Diktieren']",
    "fieldset button[aria-label*='iktier' i]",
    "form button[aria-label*='iktier' i]",
    "button[aria-label*='iktier' i]",
    "button[aria-label*='iktat' i]",
    "button[aria-label*='ictat' i]",
    "button[aria-label*='Mikrofon' i]",
    "button[aria-label*='microphone' i]"
  ];

  // Wohin Claude einen abgemeldeten Besucher schickt. Erkannt wird an der
  // Adresse, nicht am Inhalt der Anmeldeseite: Die Adresse ist ablesbar und
  // ändert sich selten, der Inhalt wäre wieder geraten.
  const LOGIN_PATHS = ["/login", "/magic-link"];

  window.zurioVoice.run({
    providerLabel: "Claude",
    composerSelectors: COMPOSER_SELECTORS,
    micSelectors: MIC_SELECTORS,
    loginPaths: LOGIN_PATHS
  });
})();
