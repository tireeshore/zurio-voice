// Zurio Voice — Hintergrundskript
//
// Aufgabe: auf die beiden systemweiten Kürzel reagieren, das Browserfenster
// nach vorne holen und die Zieladresse des Anbieters öffnen. Es merkt sich,
// welche Tabs es selbst geöffnet hat, und beantwortet die Rückfrage des
// Seitenteils. Seit P4 kommen Zieladresse, Diktatschalter und Tabverhalten aus
// den Einstellungen statt aus dem Code.

importScripts("settings.js");

// Welches Kürzel welchen Anbieter meint. Die Anbieter selbst — Beschriftung,
// Rechnername, Standardadresse — stehen in `settings.js`.
const COMMANDS = {
  "open-chatgpt": "chatgpt",
  "open-claude": "claude"
};

// Nur in einem selbst geöffneten Tab darf der Seitenteil den Cursor setzen.
// Ein von Hand aufgerufener Chat bleibt unangetastet — sonst würde jeder
// normale Besuch bei ChatGPT oder Claude den Schreibcursor umsetzen.
const MARKED_TABS_KEY = "markedTabs";

// Der Vermerk gilt nur für die eine Fahrt vom Kürzel zur fertig geladenen
// Seite. Was länger liegen bleibt, gehört zu einem Tab, der nie geladen hat.
const MARK_LIFETIME_MS = 300000;

// Ein Vermerk im Arbeitsspeicher würde verschwinden, sobald der Browser das
// Hintergrundskript schlafen legt — der Seitenteil bekäme dann stillschweigend
// ein Nein. `storage.session` überlebt das und wird beim Schließen des
// Browsers von selbst geleert.
async function readMarkedTabs() {
  const stored = await chrome.storage.session.get(MARKED_TABS_KEY);
  return stored[MARKED_TABS_KEY] || {};
}

async function markTab(tabId) {
  const marked = await readMarkedTabs();
  const now = Date.now();

  for (const [id, markedAt] of Object.entries(marked)) {
    if (now - markedAt > MARK_LIFETIME_MS) {
      delete marked[id];
    }
  }

  marked[tabId] = now;
  await chrome.storage.session.set({ [MARKED_TABS_KEY]: marked });

  // Ein neuer Tastendruck fängt sauber an: Die Meldung des vorigen Versuchs
  // in diesem Tab gilt nicht mehr.
  await clearPendingBanner(tabId);
}

// Einmalig einlösen: Ein zweiter Aufruf derselben Seite bekommt ein Nein.
async function claimTab(tabId) {
  const marked = await readMarkedTabs();
  if (!Object.prototype.hasOwnProperty.call(marked, tabId)) {
    return false;
  }
  delete marked[tabId];
  await chrome.storage.session.set({ [MARKED_TABS_KEY]: marked });
  return true;
}

// Eine Anmeldeseite leitet mehrfach weiter, und jede Weiterleitung löscht den
// Kasten auf der Seite wieder. Deshalb wird eine solche Meldung hier hinterlegt
// und nach jeder Weiterleitung erneut ausgeliefert — eine Minute lang, danach
// war es offensichtlich ein anderer Besuch.
const PENDING_BANNERS_KEY = "pendingBanners";
const BANNER_PENDING_MS = 60000;

async function readPendingBanners() {
  const stored = await chrome.storage.session.get(PENDING_BANNERS_KEY);
  return stored[PENDING_BANNERS_KEY] || {};
}

async function writePendingBanners(banners) {
  await chrome.storage.session.set({ [PENDING_BANNERS_KEY]: banners });
}

async function setPendingBanner(tabId, banner) {
  const banners = await readPendingBanners();
  const now = Date.now();

  for (const [id, entry] of Object.entries(banners)) {
    if (now - entry.storedAt > BANNER_PENDING_MS) {
      delete banners[id];
    }
  }

  banners[tabId] = { headline: banner.headline, detail: banner.detail, storedAt: now };
  await writePendingBanners(banners);
}

async function takePendingBanner(tabId) {
  const banners = await readPendingBanners();
  const entry = banners[tabId];
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.storedAt > BANNER_PENDING_MS) {
    delete banners[tabId];
    await writePendingBanners(banners);
    return null;
  }
  // Bewusst nicht gelöscht: Die nächste Weiterleitung soll sie wieder bekommen.
  return { headline: entry.headline, detail: entry.detail };
}

async function clearPendingBanner(tabId) {
  const banners = await readPendingBanners();
  if (!Object.prototype.hasOwnProperty.call(banners, tabId)) {
    return;
  }
  delete banners[tabId];
  await writePendingBanners(banners);
}

// Störungen enden sichtbar: rotes Ausrufezeichen am Symbol, der ganze Satz im
// Hinweistext des Symbols und ein Eintrag im Protokoll.
function reportFailure(message) {
  console.error("[Zurio Voice]", message);
  chrome.action.setBadgeBackgroundColor({ color: "#C0392B" });
  chrome.action.setBadgeText({ text: "!" });
  chrome.action.setTitle({ title: `Zurio Voice — Störung: ${message}` });
}

function clearFailure() {
  chrome.action.setBadgeText({ text: "" });
  chrome.action.setTitle({ title: "Zurio Voice" });
}

// Mehrere Wege, absteigend nach Stabilität: zuletzt benutztes Fenster, sonst
// irgendein normales Fenster, sonst gar keines.
async function findBrowserWindow() {
  try {
    const lastFocused = await chrome.windows.getLastFocused();
    if (lastFocused && lastFocused.type === "normal") {
      return lastFocused;
    }
  } catch (error) {
    // Kein Fenster vorhanden — der nächste Weg übernimmt.
  }

  const allWindows = await chrome.windows.getAll();
  const normalWindows = allWindows.filter((w) => w.type === "normal");
  return normalWindows.length > 0 ? normalWindows[normalWindows.length - 1] : null;
}

async function raiseWindow(windowId) {
  const browserWindow = await chrome.windows.get(windowId);
  if (browserWindow.state === "minimized") {
    await chrome.windows.update(windowId, { state: "normal" });
  }
  await chrome.windows.update(windowId, { focused: true });
}

// Sucht bei eingeschalteter Wiederverwendung einen offenen Tab des Anbieters —
// in allen Fenstern, nicht nur im vordersten. Wer den Chat schon irgendwo
// offen hat, meint diesen Tab. Der zuletzt benutzte gewinnt.
async function findProviderTab(providerKey) {
  const tabs = await chrome.tabs.query({ url: `https://${PROVIDERS[providerKey].host}/*` });
  if (tabs.length === 0) {
    return null;
  }
  // `lastAccessed` gibt es erst ab Chrome 121. Fehlt es, entscheidet die
  // Reihenfolge, und der zuletzt gefundene Tab gewinnt — nie gar keiner.
  return tabs.reduce((newest, tab) =>
    (tab.lastAccessed || 0) >= (newest.lastAccessed || 0) ? tab : newest
  );
}

async function openTarget(commandName) {
  const providerKey = COMMANDS[commandName];
  if (!providerKey) {
    throw new Error(`Unbekanntes Kürzel: ${commandName}`);
  }

  const settings = await readSettings();
  const url = settings[providerKey].url;

  // Störungsfall „keine Verbindung": Der Tab wird trotzdem geöffnet, damit die
  // Fehlerseite des Browsers zu sehen ist. Zusätzlich wird die Störung am
  // Symbol gemeldet — auf einer Fehlerseite des Browsers darf die Erweiterung
  // keinen eigenen Hinweis einblenden.
  const online = navigator.onLine;
  if (!online) {
    reportFailure(
      `Keine Internetverbindung — ${PROVIDERS[providerKey].label} lässt sich nicht öffnen.`
    );
  }

  if (settings.reuseTab) {
    const existing = await findProviderTab(providerKey);
    if (existing) {
      await raiseWindow(existing.windowId);
      // Der Vermerk steht, bevor die Seite neu lädt und der Seitenteil fragt.
      await markTab(existing.id);
      await chrome.tabs.update(existing.id, { url: url, active: true });
      return online;
    }
  }

  const browserWindow = await findBrowserWindow();

  // Kein offenes Fenster: ein neues Fenster ist zugleich das Nachvornholen.
  if (!browserWindow) {
    const createdWindow = await chrome.windows.create({ url: url, focused: true });
    if (createdWindow && createdWindow.tabs && createdWindow.tabs.length > 0) {
      await markTab(createdWindow.tabs[0].id);
    }
    return online;
  }

  await raiseWindow(browserWindow.id);

  const tab = await chrome.tabs.create({
    windowId: browserWindow.id,
    url: url,
    active: true
  });

  // Der Vermerk steht lange bevor die Seite fertig geladen ist und der
  // Seitenteil fragt.
  await markTab(tab.id);
  return online;
}

chrome.commands.onCommand.addListener((command) => {
  openTarget(command)
    .then((ok) => {
      // Eine gerade gemeldete Störung darf der eigene Erfolg nicht gleich
      // wieder wegwischen.
      if (ok) {
        clearFailure();
      }
    })
    .catch((error) => {
      const providerKey = COMMANDS[command];
      const label = providerKey ? PROVIDERS[providerKey].label : command;
      reportFailure(`${label} ließ sich nicht öffnen: ${error.message}`);
    });
});

// Ein Klick auf das Symbol öffnet die Einstellungen. Dort steht auch, was das
// rote Ausrufezeichen bedeutet.
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Aus der Adresse des fragenden Tabs geht hervor, welcher Anbieter antwortet.
function providerOfUrl(url) {
  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch (error) {
    return null;
  }
  return Object.keys(PROVIDERS).find((key) => PROVIDERS[key].host === hostname) || null;
}

// Beantwortet die Rückfrage des Seitenteils: Stammt dieser Tab von uns, und
// soll hier das Diktat starten?
async function answerClaim(tab) {
  const activate = await claimTab(tab.id);
  if (!activate) {
    // Kein eigener Tab mehr — aber vielleicht eine Meldung, die eine
    // Weiterleitung weggewischt hat.
    return { activate: false, banner: await takePendingBanner(tab.id) };
  }
  const providerKey = providerOfUrl(tab.url);
  const settings = await readSettings();
  return {
    activate: true,
    dictate: providerKey ? settings[providerKey].dictation : true
  };
}

// Rückfragen und Meldungen des Seitenteils.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== "string") {
    return false;
  }

  if (message.type === "zurio:claim") {
    if (!sender.tab) {
      sendResponse({ activate: false });
      return false;
    }
    answerClaim(sender.tab)
      .then(sendResponse)
      .catch((error) => {
        reportFailure(`Rückfrage des Seitenteils fehlgeschlagen: ${error.message}`);
        sendResponse({ activate: false });
      });
    return true;
  }

  if (message.type === "zurio:failure") {
    reportFailure(message.message || "Unbekannte Störung im Seitenteil");
    // Meldungen auf Seiten, die noch weiterleiten, müssen die Weiterleitung
    // überleben. Der Seitenteil sagt selbst, wann das nötig ist.
    if (message.persist && sender.tab) {
      setPendingBanner(sender.tab.id, {
        headline: message.message,
        detail: message.detail || ""
      }).catch(() => {});
    }
    return false;
  }

  if (message.type === "zurio:success") {
    clearFailure();
    if (sender.tab) {
      clearPendingBanner(sender.tab.id).catch(() => {});
    }
    return false;
  }

  return false;
});
