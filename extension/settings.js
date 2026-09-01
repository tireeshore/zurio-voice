// Zurio Voice — Einstellungen
//
// Diese Datei kennt die drei Einstellungen, ihre Standardwerte und die Prüfung
// der Zieladressen. Sie wird von der Einstellungsseite und vom Hintergrundskript
// benutzt, damit beide dieselben Werte annehmen und dieselben verwerfen.
//
// Anbieternamen stehen hier nur als Beschriftung und Standardwert. Der Ablauf
// je Anbieter liegt weiterhin getrennt in `content/chatgpt.js` und
// `content/claude.js`.

const SETTINGS_KEY = "settings";

// Die Rechnernamen sind dieselben wie die Zugriffsrechte im Manifest. Eine
// Zieladresse außerhalb davon nimmt die Erweiterung nicht an.
const PROVIDERS = {
  chatgpt: {
    label: "ChatGPT",
    host: "chatgpt.com",
    defaultUrl: "https://chatgpt.com/"
  },
  claude: {
    label: "Claude",
    host: "claude.ai",
    defaultUrl: "https://claude.ai/new"
  }
};

const DEFAULT_SETTINGS = {
  chatgpt: { url: PROVIDERS.chatgpt.defaultUrl, dictation: true },
  claude: { url: PROVIDERS.claude.defaultUrl, dictation: true },
  reuseTab: false
};

// Gibt bei Erfolg null zurück, sonst den Satz, der auf der Einstellungsseite
// erscheint. Die Meldung sagt, was zu tun ist, nicht nur was falsch war.
function checkTargetUrl(providerKey, value) {
  const provider = PROVIDERS[providerKey];
  const trimmed = String(value || "").trim();

  if (trimmed === "") {
    return "Die Zieladresse fehlt. Standard ist " + provider.defaultUrl;
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch (error) {
    return "Das ist keine vollständige Adresse. Sie muss mit https:// beginnen.";
  }

  if (parsed.protocol !== "https:") {
    return "Die Adresse muss mit https:// beginnen.";
  }

  if (parsed.hostname !== provider.host) {
    return (
      "Die Adresse muss bei " +
      provider.host +
      " liegen. Zurio Voice hat auf keiner anderen Seite Zugriff und würde dort " +
      "stillschweigend nichts tun."
    );
  }

  return null;
}

// Was in der Ablage steht, kann alt, unvollständig oder von Hand verändert
// sein. Deshalb wird jeder Wert einzeln geprüft und im Zweifel durch den
// Standard ersetzt, statt der Erweiterung eine unbrauchbare Adresse zu geben.
function normalizeSettings(stored) {
  const source = stored && typeof stored === "object" ? stored : {};
  const result = { reuseTab: source.reuseTab === true };

  for (const providerKey of Object.keys(PROVIDERS)) {
    const entry = source[providerKey] && typeof source[providerKey] === "object" ? source[providerKey] : {};
    const url = checkTargetUrl(providerKey, entry.url) === null
      ? String(entry.url).trim()
      : PROVIDERS[providerKey].defaultUrl;

    result[providerKey] = {
      url: url,
      // Nur ein ausdrückliches Nein schaltet das Diktat ab. Ein fehlender Wert
      // ist der Zustand vor P4 und bedeutet: an.
      dictation: entry.dictation !== false
    };
  }

  return result;
}

async function readSettings() {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  return normalizeSettings(stored[SETTINGS_KEY]);
}

async function writeSettings(settings) {
  await chrome.storage.local.set({ [SETTINGS_KEY]: normalizeSettings(settings) });
}
