// Zurio Voice — Seitenteil für ChatGPT
//
// Enthält ausschließlich, woran ChatGPT seine Bedienelemente erkennen lässt.
// Der Ablauf selbst steht in `common.js`. Claude kommt in dieser Datei nicht
// vor: Ändert ChatGPT seine Oberfläche, wird nur hier etwas angefasst.

(function () {
  "use strict";

  // Am Bildschirm bestätigt: Das Eingabefeld ist ein beschreibbarer Bereich mit
  // der Kennung `prompt-textarea` und dem Klassennamen `ProseMirror`. Daneben
  // hält ChatGPT ein unsichtbares Ersatzfeld bereit — ein echtes Textfeld ohne
  // Kennung, volle Breite, null Höhe. Aussortiert wird es von der
  // Sichtbarkeitsprüfung in `common.js`, nicht von dieser Liste.
  //
  // Erkennungswege, absteigend nach Stabilität:
  // 1. Die Kennung trägt ChatGPT seit Jahren und hat sogar den Wechsel vom
  //    echten Textfeld zum beschreibbaren Bereich überlebt.
  // 2./3. Der Weg über das umgebende Formular beziehungsweise den Hauptbereich
  //    hängt an der Seitenstruktur statt an Namen.
  // 4. Der Klassenname des benutzten Editors — brauchbar, aber am ehesten
  //    änderbar.
  // 5./6. Rückfall auf ein echtes Textfeld, falls ChatGPT dorthin zurückkehrt.
  const COMPOSER_SELECTORS = [
    "#prompt-textarea",
    "form div[contenteditable='true']",
    "main div[contenteditable='true']",
    "div.ProseMirror[contenteditable='true']",
    "form textarea",
    "main textarea"
  ];

  // Erkennungswege für den Diktierknopf. Am Bildschirm abgelesen: Im Formular
  // des Eingabebereichs sitzen vier Knöpfe, der dritte trägt die Beschriftung
  // „Diktat starten". Eine Kennung wie `data-testid` hat er nicht, anders als
  // der Plus- und der Absendeknopf.
  //
  // Die Beschriftung hängt an der eingestellten Sprache. Deshalb steht die
  // abgelesene Fassung vorn, dahinter Teilstücke, die auch bei anderer
  // Wortwahl und in englischer Oberfläche greifen. Ein Weg über die Stellung
  // im Formular ist bewusst nicht dabei: Danebengreifen hieße hier, einen
  // fremden Knopf zu drücken.
  const MIC_SELECTORS = [
    "form button[aria-label='Diktat starten']",
    "form button[aria-label*='iktat' i]",
    "form button[aria-label*='iktier' i]",
    "form button[aria-label*='ictat' i]",
    "form button[aria-label*='Mikrofon' i]",
    "form button[aria-label*='microphone' i]"
  ];

  // Am Bildschirm abgelesen: ChatGPT schickt Abgemeldete nirgendwohin. Die
  // Adresse bleibt `https://chatgpt.com/`, es gibt ein Eingabefeld — ein
  // echtes `textarea` statt des sonstigen ProseMirror-Bereichs — und sogar den
  // Knopf „Diktat starten". Der tut dann allerdings nichts.
  //
  // Verraten hat sich der Zustand an den Verweisen: `/auth/login` und
  // `/auth/login_with?...` für Google, Microsoft und Apple, dazu im
  // Kopfbereich mehrfach „Anmelden" und „Kostenlos registrieren". Der Verweis
  // ist der stabilste davon — er trägt die Adresse selbst und hängt nicht an
  // der eingestellten Sprache.
  const LOGGED_OUT_SELECTORS = ["a[href*='/auth/login']"];

  // Landet man doch einmal unmittelbar auf der Anmeldeseite, greift zusätzlich
  // die Adresse. `/auth/login` ist dieselbe, auf die die Verweise oben zeigen.
  const LOGIN_PATHS = ["/auth/login", "/auth"];

  window.zurioVoice.run({
    providerLabel: "ChatGPT",
    composerSelectors: COMPOSER_SELECTORS,
    micSelectors: MIC_SELECTORS,
    loginPaths: LOGIN_PATHS,
    loggedOutSelectors: LOGGED_OUT_SELECTORS
  });
})();
