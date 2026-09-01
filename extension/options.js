// Zurio Voice — Einstellungsseite
//
// Liest die Einstellungen beim Öffnen, prüft die Zieladressen vor dem Speichern
// und meldet sichtbar, was passiert ist. Die Standardwerte und die Prüfung
// stehen in `settings.js`, damit das Hintergrundskript dieselben benutzt.

(function () {
  "use strict";

  const form = document.getElementById("settings-form");
  const status = document.getElementById("status");

  const fields = {
    chatgpt: {
      url: document.getElementById("chatgpt-url"),
      error: document.getElementById("chatgpt-url-error"),
      dictation: document.getElementById("chatgpt-dictation")
    },
    claude: {
      url: document.getElementById("claude-url"),
      error: document.getElementById("claude-url-error"),
      dictation: document.getElementById("claude-dictation")
    }
  };

  const tabNew = document.getElementById("tab-new");
  const tabReuse = document.getElementById("tab-reuse");

  let statusTimer = null;

  function say(message, isAlarm) {
    status.textContent = message;
    status.classList.toggle("alarm", Boolean(isAlarm));
    clearTimeout(statusTimer);
    if (!isAlarm) {
      statusTimer = setTimeout(function () {
        status.textContent = "";
      }, 4000);
    }
  }

  function fill(settings) {
    for (const providerKey of Object.keys(fields)) {
      fields[providerKey].url.value = settings[providerKey].url;
      fields[providerKey].dictation.checked = settings[providerKey].dictation;
      showError(providerKey, null);
    }
    tabReuse.checked = settings.reuseTab;
    tabNew.checked = !settings.reuseTab;
  }

  function showError(providerKey, message) {
    const field = fields[providerKey];
    field.url.classList.toggle("invalid", Boolean(message));
    if (message) {
      field.error.textContent = message;
      field.error.hidden = false;
    } else {
      field.error.textContent = "";
      field.error.hidden = true;
    }
  }

  // Nichts wird gespeichert, solange eine Adresse nicht taugt. Halb gespeicherte
  // Einstellungen wären schlimmer als gar keine: Man sähe nicht, was gilt.
  function collect() {
    let firstBad = null;

    for (const providerKey of Object.keys(fields)) {
      const complaint = checkTargetUrl(providerKey, fields[providerKey].url.value);
      showError(providerKey, complaint);
      if (complaint && !firstBad) {
        firstBad = fields[providerKey].url;
      }
    }

    if (firstBad) {
      firstBad.focus();
      return null;
    }

    return {
      chatgpt: {
        url: fields.chatgpt.url.value.trim(),
        dictation: fields.chatgpt.dictation.checked
      },
      claude: {
        url: fields.claude.url.value.trim(),
        dictation: fields.claude.dictation.checked
      },
      reuseTab: tabReuse.checked
    };
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const settings = collect();
    if (!settings) {
      say("Nichts gespeichert — eine Zieladresse stimmt nicht.", true);
      return;
    }
    writeSettings(settings)
      .then(function () {
        say("Gespeichert. Gilt ab dem nächsten Tastendruck.", false);
      })
      .catch(function (error) {
        say("Speichern fehlgeschlagen: " + error.message, true);
      });
  });

  document.getElementById("reset").addEventListener("click", function () {
    fill(normalizeSettings(null));
    say("Standardwerte eingetragen. Zum Übernehmen speichern.", false);
  });

  // Der Browser sagt selbst, unter welcher Adresse seine Tastenverwaltung
  // liegt. Sonst müsste in der Anleitung ein Satz je Browser stehen, und die
  // Nutzerin müsste raten, welcher für sie gilt.
  function shortcutAddress() {
    const agent = navigator.userAgent;
    if (navigator.brave) {
      return "brave://extensions/shortcuts";
    }
    if (agent.includes("Edg/")) {
      return "edge://extensions/shortcuts";
    }
    if (agent.includes("Vivaldi")) {
      return "vivaldi://extensions/shortcuts";
    }
    if (agent.includes("OPR/")) {
      return "opera://extensions/shortcuts";
    }
    return "chrome://extensions/shortcuts";
  }

  const shortcutUrl = shortcutAddress();
  document.getElementById("shortcut-url").textContent = shortcutUrl;
  document.getElementById("copy-shortcut-url").addEventListener("click", function () {
    navigator.clipboard
      .writeText(shortcutUrl)
      .then(function () {
        say("Adresse kopiert.", false);
      })
      .catch(function () {
        say("Kopieren ging nicht — Adresse bitte von Hand übernehmen.", true);
      });
  });

  readSettings()
    .then(fill)
    .catch(function (error) {
      say("Einstellungen ließen sich nicht lesen: " + error.message, true);
    });
})();
