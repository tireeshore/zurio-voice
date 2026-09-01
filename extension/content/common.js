// Zurio Voice — gemeinsamer Seitenteil
//
// Hier steht nur, was für beide Anbieter gleich ist: die Rückfrage beim
// Hintergrundskript, das Warten auf ein Element, das Setzen des Cursors und die
// sichtbare Störungsmeldung. In dieser Datei kommt kein Anbietername vor.
// Alles Anbieterspezifische liegt in `chatgpt.js` beziehungsweise `claude.js`.
//
// Ablauf: erst den Cursor ins Eingabefeld, dann den Diktierknopf drücken.
// Scheitert das Diktat, bleibt der Cursor stehen — so verlangt es `PLAN.md`.

(function () {
  "use strict";

  // Doppelte Ausführung im selben Dokument bringt nichts und würde den Cursor
  // ein zweites Mal umsetzen.
  if (window.zurioVoice) {
    return;
  }

  // Obergrenze fürs Aufgeben, keine Wartezeit vor dem Handeln. Gehandelt wird
  // in dem Augenblick, in dem das Element auftaucht. Läuft die Zeit ab, endet
  // der Versuch sichtbar statt stillschweigend.
  const GIVE_UP_AFTER_MS = 20000;

  // Beide Oberflächen tauschen ihr Eingabefeld während des Ladens noch aus.
  // Deshalb bleibt der Seitenteil nach dem ersten Setzen kurz wach, zieht den
  // Cursor auf ein besser erkanntes Feld nach und holt ihn zurück, wenn die
  // Seite ihn wegnimmt. Auch das ist keine Wartezeit vor dem Handeln, sondern
  // eine Obergrenze fürs Nachfassen. Fünf Sekunden, weil der Austausch bei
  // ChatGPT am Ende einer langsamen Leitung länger dauern kann als bei einer
  // schnellen — und wer in der Zeit klickt, beendet das Nachfassen ohnehin.
  const SETTLE_WINDOW_MS = 5000;

  // Gegen ein Tauziehen mit der Seite: Nach so vielen vergeblichen Versuchen
  // ist der Fokus offensichtlich nicht zu halten, und das wird gemeldet.
  const MAX_RECOVERIES = 5;

  // Der Diktierknopf sitzt im selben Bereich wie das Eingabefeld und ist
  // deshalb kurz nach ihm da. Wer länger braucht, kommt nicht mehr.
  const MIC_GIVE_UP_MS = 10000;

  // So lange wird auf die Bestätigung gewartet, dass der Knopf wirklich
  // umgesprungen ist. Kommt sie nicht, gilt das Diktat als nicht gestartet.
  const MIC_CONFIRM_MS = 4000;

  function log(message) {
    console.info("[Zurio Voice]", message);
  }

  // Kurze Meldung an das Hintergrundskript, ohne Rückantwort.
  function send(type, message) {
    chrome.runtime.sendMessage({ type: type, message: message }).catch(function () {
      // Hintergrundskript nicht erreichbar. Der Konsoleneintrag bleibt als Spur.
    });
  }

  // Ein rotes Ausrufezeichen am Symbol sieht niemand, der gerade sprechen will.
  // Deshalb sagt die Störung es auf der Seite selbst — dort, wohin der Blick
  // ohnehin geht. Der Kasten sitzt in einem eigenen Schattenbereich, damit
  // weder die Seite sein Aussehen verändert noch er das der Seite.
  const BANNER_ID = "zurio-voice-banner";
  const BANNER_LIFETIME_MS = 25000;

  function showBanner(headline, detail) {
    // Einen schon stehenden Kasten geordnet abräumen. Bloßes Entfernen würde
    // seine eigene Nachhut wecken, die ihn sofort wieder einhängt.
    const previous = document.getElementById(BANNER_ID);
    if (previous) {
      if (typeof previous.zurioDismiss === "function") {
        previous.zurioDismiss();
      } else {
        previous.remove();
      }
    }

    const host = document.createElement("div");
    host.id = BANNER_ID;
    const shadow = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = [
      ":host { all: initial; }",
      ".box {",
      "  position: fixed; top: 16px; left: 50%; transform: translateX(-50%);",
      "  z-index: 2147483647; box-sizing: border-box;",
      "  max-width: min(34rem, calc(100vw - 32px)); padding: 12px 14px;",
      "  border-radius: 10px; border-left: 5px solid #c0392b;",
      "  background: #ffffff; color: #1c1c1e;",
      "  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.28);",
      "  font: 14px/1.45 -apple-system, BlinkMacSystemFont, system-ui, sans-serif;",
      "}",
      ".headline { font-weight: 600; margin: 0 0 4px; padding-right: 20px; }",
      ".detail { margin: 0; color: #45454c; }",
      ".close {",
      "  position: absolute; top: 6px; right: 8px;",
      "  border: 0; background: transparent; color: #77777f;",
      "  font: inherit; font-size: 18px; line-height: 1; cursor: pointer;",
      "}"
    ].join("\n");

    const box = document.createElement("div");
    box.className = "box";

    const headlineNode = document.createElement("p");
    headlineNode.className = "headline";
    headlineNode.textContent = "Zurio Voice: " + headline;

    const detailNode = document.createElement("p");
    detailNode.className = "detail";
    detailNode.textContent = detail;

    const close = document.createElement("button");
    close.className = "close";
    close.type = "button";
    close.textContent = "\u00d7";
    close.setAttribute("aria-label", "Meldung schließen");

    box.appendChild(close);
    box.appendChild(headlineNode);
    box.appendChild(detailNode);
    shadow.appendChild(style);
    shadow.appendChild(box);
    document.documentElement.appendChild(host);

    // Manche Oberflächen räumen beim Umbauen alles weg, was sie nicht selbst
    // eingehängt haben. Solange die Meldung gelten soll, wird sie dann wieder
    // eingehängt. Eine echte Weiterleitung überlebt sie damit nicht — dafür
    // hinterlegt der Seitenteil sie beim Hintergrundskript.
    let dismissed = false;
    const guard = new MutationObserver(function () {
      if (!dismissed && !host.isConnected) {
        document.documentElement.appendChild(host);
      }
    });
    guard.observe(document.documentElement, { childList: true });

    function dismiss() {
      dismissed = true;
      guard.disconnect();
      host.remove();
    }

    host.zurioDismiss = dismiss;
    close.addEventListener("click", dismiss);

    // Von selbst wieder weg: Die Meldung soll nicht dauerhaft im Weg stehen.
    setTimeout(dismiss, BANNER_LIFETIME_MS);
  }

  // Cursor und Mikrofon melden sich getrennt und nicht in fester Reihenfolge.
  // Ohne diese Sperre könnte der später eintreffende Erfolg des einen die
  // Störungsanzeige des anderen wieder löschen.
  let failureSeen = false;

  // Jede Störung erscheint an drei Stellen: als Kasten auf der Seite, als rotes
  // Ausrufezeichen am Symbol und in der Konsole. Der Kasten sagt, was zu tun
  // ist; die Konsole sagt, woran es lag.
  function reportFailure(headline, detail, technical, persist) {
    failureSeen = true;
    showBanner(headline, detail);
    chrome.runtime
      .sendMessage({
        type: "zurio:failure",
        message: headline,
        detail: detail,
        // Auf einer Seite, die noch weiterleitet, wird der Kasten mitgelöscht.
        // Dann muss das Hintergrundskript ihn festhalten und nachreichen.
        persist: Boolean(persist)
      })
      .catch(function () {
        // Hintergrundskript nicht erreichbar. Kasten und Konsole bleiben.
      });
    if (technical) {
      console.warn("[Zurio Voice] " + technical);
    }
  }

  function reportSuccess() {
    if (failureSeen) {
      return;
    }
    send("zurio:success");
  }

  // Ein Element taugt nur, wenn es wirklich im Dokument hängt, sichtbar ist und
  // nicht ausgegraut. Breite oder Höhe null genügt zum Verwerfen: ChatGPT hält
  // ein unsichtbares Ersatzfeld voller Breite und null Höhe bereit, und genau
  // darin wäre der Cursor sonst gelandet.
  function isReachable(element) {
    if (!element || !element.isConnected) {
      return false;
    }
    if (element.disabled) {
      return false;
    }
    if (element.getAttribute("aria-hidden") === "true") {
      return false;
    }
    const box = element.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) {
      return false;
    }
    const style = window.getComputedStyle(element);
    return style.visibility !== "hidden" && style.display !== "none";
  }

  // Mehrere Erkennungswege, absteigend nach Stabilität. Der erste, der ein
  // benutzbares Element liefert, gewinnt. Der Rang wird mitgegeben, damit ein
  // später auftauchendes, stabiler erkanntes Feld den Vortritt bekommt.
  function findBySelectors(selectors) {
    for (let rank = 0; rank < selectors.length; rank += 1) {
      const selector = selectors[rank];
      let candidates;
      try {
        candidates = document.querySelectorAll(selector);
      } catch (error) {
        continue;
      }
      for (const candidate of candidates) {
        if (isReachable(candidate)) {
          return { element: candidate, selector: selector, rank: rank };
        }
      }
    }
    return null;
  }

  // Beobachtet den Seiteninhalt, statt eine feste Zeit abzuwarten.
  function observeDocument(onChange) {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class", "style", "hidden", "aria-hidden", "disabled", "contenteditable",
        "aria-label", "aria-pressed", "title"
      ]
    });
    return observer;
  }

  // `abortWhen` bricht das Warten vorzeitig ab, wenn feststeht, dass das
  // Element nicht mehr kommt — etwa weil die Seite auf die Anmeldung
  // umgesprungen ist. Ohne das stünde man zwanzig Sekunden vor einer Seite,
  // von der längst klar ist, dass dort kein Eingabefeld erscheint.
  function waitForElement(selectors, giveUpAfterMs, abortWhen) {
    const immediate = findBySelectors(selectors);
    if (immediate) {
      return Promise.resolve(immediate);
    }

    return new Promise(function (resolve, reject) {
      let giveUpTimer = null;

      function finish() {
        observer.disconnect();
        clearTimeout(giveUpTimer);
      }

      const observer = observeDocument(function () {
        if (abortWhen && abortWhen()) {
          finish();
          reject(new Error("Das Warten wurde abgebrochen"));
          return;
        }
        const found = findBySelectors(selectors);
        if (!found) {
          return;
        }
        finish();
        resolve(found);
      });

      giveUpTimer = setTimeout(function () {
        observer.disconnect();
        reject(new Error("Element ist nicht aufgetaucht"));
      }, giveUpAfterMs);
    });
  }

  // Störungsfall „nicht angemeldet": Beide Anbieter schicken einen abgemeldeten
  // Besucher auf eine eigene Anmeldeadresse. Die Adresse ist ablesbar und
  // ändert sich selten — anders als der Inhalt der Anmeldeseite, den zu raten
  // in diesem Projekt schon zweimal danebengegangen ist.
  function looksLoggedOut(config) {
    if (!config.loginPaths) {
      return false;
    }
    const path = location.pathname;
    return config.loginPaths.some(function (prefix) {
      return path === prefix || path.startsWith(prefix + "/");
    });
  }

  // Nicht jeder Anbieter schickt Abgemeldete auf eine eigene Adresse. Manche
  // lassen sie auf derselben Seite weiterschreiben und blenden nur
  // Anmeldeverweise ein. Dann verrät sich der Zustand am Verweis, nicht an der
  // Adresse.
  //
  // Anders als beim Eingabefeld wird hier nicht auf Sichtbarkeit bestanden.
  // Erster Anlauf tat das und griff nicht: ChatGPTs Verweis auf die
  // Anmeldeseite trägt keinen Text und ist offenbar nicht sichtbar. Für ein
  // Element, das nur abgefragt und nie angeklickt wird, ist Sichtbarkeit auch
  // keine sinnvolle Bedingung — sie war beim Eingabefeld nötig, weil der
  // Cursor sonst in einem unsichtbaren Ersatzfeld landete.
  function showsLoginOffer(config) {
    if (!config.loggedOutSelectors || config.loggedOutSelectors.length === 0) {
      return false;
    }
    return config.loggedOutSelectors.some(function (selector) {
      try {
        return document.querySelector(selector) !== null;
      } catch (error) {
        return false;
      }
    });
  }

  // Störungsfall „Mikrofonerlaubnis fehlt": Der Browser sagt selbst, ob sie
  // erteilt, verweigert oder noch offen ist. Damit lässt sich die entzogene
  // Erlaubnis von einem Knopf unterscheiden, der aus anderem Grund nicht
  // anspringt — zwei Störungen, zwei verschiedene Handgriffe.
  async function micPermission() {
    try {
      const status = await navigator.permissions.query({ name: "microphone" });
      return status.state;
    } catch (error) {
      return "unbekannt";
    }
  }

  // Für den Störungsfall: Was war überhaupt da? Diese Zeile gehört in die
  // Rückmeldung, wenn ein Anbieter seine Oberfläche geändert hat.
  function describeCandidates(selectors) {
    return selectors
      .map(function (selector) {
        let all;
        try {
          all = document.querySelectorAll(selector);
        } catch (error) {
          return selector + " → ungültiger Erkennungsweg";
        }
        const usable = Array.prototype.filter.call(all, isReachable).length;
        return selector + " → " + all.length + " gefunden, " + usable + " benutzbar";
      })
      .join(" | ");
  }

  function hasCursor(element) {
    return document.activeElement === element || element.contains(document.activeElement);
  }

  // Cursor ans Ende setzen, nicht an den Anfang: Steht doch einmal Text im
  // Feld, wird er dadurch nicht überschrieben.
  function placeCursor(element) {
    element.focus({ preventScroll: true });

    if (element.isContentEditable) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    if (typeof element.setSelectionRange === "function" && typeof element.value === "string") {
      const end = element.value.length;
      element.setSelectionRange(end, end);
    }
  }

  // Hält den Cursor für ein kurzes Fenster auf dem jeweils besten Feld. Endet
  // von selbst, sobald die Nutzerin irgendwo hinklickt — ein bewusster Klick
  // wiegt schwerer als unser Nachfassen.
  function keepCursorOnBest(selectors, first, providerLabel) {
    let current = first;
    let recoveries = 0;
    let stopped = false;
    let pendingReview = false;

    const observer = observeDocument(function () {
      if (pendingReview) {
        return;
      }
      pendingReview = true;
      requestAnimationFrame(function () {
        pendingReview = false;
        review();
      });
    });

    function moveTo(next) {
      current.element.removeEventListener("blur", onBlur);
      current = next;
      placeCursor(current.element);
      current.element.addEventListener("blur", onBlur);
      log("Cursor nachgezogen auf einen stabiler erkannten Weg: " + current.selector);
    }

    // Nachziehen nur auf ein echtes Besser, nie auf ein Gleichgut. Sonst
    // schaukeln sich zwei gleichrangige Felder gegenseitig hoch.
    function review() {
      if (stopped) {
        return;
      }
      const best = findBySelectors(selectors);
      if (!best || best.element === current.element) {
        return;
      }
      if (best.rank < current.rank || !isReachable(current.element)) {
        moveTo(best);
      }
    }

    function onBlur() {
      if (stopped) {
        return;
      }
      // Aus dem Blur-Ereignis heraus sofort wieder zu fokussieren ist brüchig.
      // Ein Durchlauf später sitzt der neue Fokus, und wir korrigieren sauber.
      setTimeout(function () {
        if (stopped || hasCursor(current.element)) {
          return;
        }
        const best = findBySelectors(selectors);
        if (best && best.element !== current.element && best.rank < current.rank) {
          moveTo(best);
          return;
        }
        if (recoveries >= MAX_RECOVERIES) {
          log("Der Cursor ließ sich nicht halten, weiteres Nachfassen unterbleibt.");
          stop(false);
          return;
        }
        if (current.element.isConnected) {
          recoveries += 1;
          placeCursor(current.element);
          log("Cursor war weg und wurde zurückgeholt.");
        }
      }, 0);
    }

    function onUserClick(event) {
      if (current.element.contains(event.target)) {
        return;
      }
      log("Klick der Nutzerin — Zurio Voice hält sich ab hier heraus.");
      stop(false);
    }

    function stop(checkResult) {
      if (stopped) {
        return;
      }
      // Letzter Blick, bevor das Fenster zugeht: Ist in derselben Sekunde noch
      // ein stabiler erkanntes Feld aufgetaucht, wandert der Cursor dorthin,
      // statt in einem Platzhalter hängen zu bleiben.
      if (checkResult) {
        review();
      }
      stopped = true;
      observer.disconnect();
      clearTimeout(windowTimer);
      current.element.removeEventListener("blur", onBlur);
      document.removeEventListener("pointerdown", onUserClick, true);

      if (!checkResult) {
        return;
      }
      // Abschlussprüfung: Sitzt der Cursor am Ende wirklich?
      if (current.element.isConnected && !hasCursor(current.element)) {
        reportFailure(
          "Der Cursor ist im Eingabefeld nicht stehen geblieben.",
          "Klick einmal ins Feld, dann kannst du tippen oder den Diktierknopf selbst drücken.",
          providerLabel + ": Cursor blieb nicht im Feld. Erkennungsweg: " + current.selector
        );
        return;
      }
      log("Cursor sitzt im Eingabefeld. Erkennungsweg: " + current.selector);
      reportSuccess();
    }

    current.element.addEventListener("blur", onBlur);
    document.addEventListener("pointerdown", onUserClick, true);
    const windowTimer = setTimeout(function () {
      stop(true);
    }, SETTLE_WINDOW_MS);

    // Läuft das Diktat, ist die Arbeit des Wächters getan und er soll nicht
    // weiter um den Fokus ringen.
    return {
      release: function () {
        stop(false);
      }
    };
  }

  // Für den Störungsfall am Diktierknopf: Welche Knöpfe sitzen überhaupt im
  // Eingabebereich und wie heißen sie? Diese Zeile ersetzt das Nachsehen von
  // Hand und ist die Grundlage für neue Erkennungswege.
  function describeButtons(nearElement) {
    const scope = nearElement.closest("form, fieldset") || nearElement.parentElement;
    if (!scope) {
      return "kein umgebender Bereich gefunden";
    }
    return Array.prototype.map
      .call(scope.querySelectorAll("button"), function (button, index) {
        const label =
          button.getAttribute("aria-label") ||
          button.title ||
          button.textContent.trim().slice(0, 24) ||
          "ohne Beschriftung";
        return index + ": " + label;
      })
      .join(" | ");
  }

  // Für den Störungsfall „vielleicht gar nicht angemeldet": Welche
  // Anmeldeverweise und welche Knöpfe im Kopfbereich hat die Seite? Wieder
  // Selbstauskunft statt Raten — geratene Erkennungswege sind in diesem
  // Projekt schon dreimal danebengegangen.
  function describeAccountControls() {
    const authPattern = /log[-_ ]?in|signin|sign[-_ ]?in|signup|sign[-_ ]?up|register|auth|anmeld|registrier/i;

    const links = Array.prototype.filter.call(document.querySelectorAll("a[href]"), function (link) {
      return authPattern.test(link.getAttribute("href") || "");
    });
    const linkText = links.length
      ? links
          .slice(0, 8)
          .map(function (link) {
            return (link.textContent.trim().slice(0, 24) || "ohne Text") + " → " + link.getAttribute("href");
          })
          .join(" | ")
      : "keine";

    const topButtons = Array.prototype.slice.call(
      document.querySelectorAll("header button, nav button, [role='banner'] button"),
      0,
      14
    );
    const buttonText = topButtons.length
      ? topButtons
          .map(function (button) {
            return (
              button.getAttribute("aria-label") ||
              button.textContent.trim().slice(0, 24) ||
              "ohne Beschriftung"
            );
          })
          .join(" | ")
      : "keine";

    return "Anmeldeverweise: " + linkText + "\nKnöpfe im Kopfbereich: " + buttonText;
  }

  // Ob das Diktat wirklich läuft, verrät der Knopf selbst: Er springt um. Wie
  // seine neue Beschriftung lautet, ist gleichgültig — sie muss sich nur
  // ändern. Das gilt in jeder Sprache und bei jedem Anbieter. Wird der Knopf
  // stattdessen ausgetauscht, zählt auch das als umgesprungen.
  function waitForToggle(button, labelBefore) {
    function hasToggled() {
      return !button.isConnected || button.getAttribute("aria-label") !== labelBefore;
    }

    if (hasToggled()) {
      return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
      let giveUpTimer = null;

      const observer = observeDocument(function () {
        if (!hasToggled()) {
          return;
        }
        observer.disconnect();
        clearTimeout(giveUpTimer);
        resolve();
      });

      giveUpTimer = setTimeout(function () {
        observer.disconnect();
        reject(new Error("Der Knopf ist nicht umgesprungen"));
      }, MIC_CONFIRM_MS);
    });
  }

  // Rückfallverhalten aus `PLAN.md`: Scheitert das Diktat, bleibt der Cursor im
  // Feld. Deshalb meldet diese Funktion nur und bricht nichts ab.
  async function startDictation(config, composer, cursorGuard) {
    let found;
    try {
      found = await waitForElement(config.micSelectors, MIC_GIVE_UP_MS);
    } catch (error) {
      reportFailure(
        "Der Diktierknopf war nicht zu finden.",
        "Der Cursor steht im Feld — du kannst tippen oder den Knopf selbst drücken. Vermutlich hat " +
          config.providerLabel +
          " seine Oberfläche geändert.",
        "Diktierknopf nicht gefunden.\nErkennungswege: " +
          describeCandidates(config.micSelectors) +
          "\nVorhandene Knöpfe: " +
          describeButtons(composer) +
          "\n" +
          describeAccountControls()
      );
      return;
    }

    // Erst die Erlaubnis, dann der Klick. Ist das Mikrofon blockiert, bringt
    // der Klick nichts und die Nutzerin bekäme die falsche Auskunft.
    if ((await micPermission()) === "denied") {
      reportFailure(
        "Das Mikrofon ist für diese Seite blockiert.",
        "Erlaubnis wieder erteilen: links in der Adresszeile auf das Symbol vor der Adresse klicken, " +
          "dort Mikrofon auf „Zulassen“ stellen und die Seite neu laden. Der Cursor steht im Feld.",
        config.providerLabel + ": Mikrofonerlaubnis steht auf „denied“, es wurde nicht geklickt."
      );
      return;
    }

    const labelBefore = found.element.getAttribute("aria-label");
    found.element.click();
    log("Diktierknopf gedrückt über: " + found.selector);

    try {
      await waitForToggle(found.element, labelBefore);
    } catch (error) {
      // Der Knopf blieb stehen. Wurde die Erlaubnis erst durch den Klick
      // abgefragt und verweigert, steht sie jetzt auf „denied" — dann ist das
      // der Grund, und die Nutzerin braucht eine andere Auskunft.
      if ((await micPermission()) === "denied") {
        reportFailure(
          "Das Mikrofon ist für diese Seite blockiert.",
          "Erlaubnis wieder erteilen: links in der Adresszeile auf das Symbol vor der Adresse klicken, " +
            "dort Mikrofon auf „Zulassen“ stellen und die Seite neu laden. Der Cursor steht im Feld.",
          config.providerLabel + ": Knopf blieb bei „" + labelBefore + "“, Erlaubnis steht auf „denied“."
        );
        return;
      }
      reportFailure(
        "Das Diktat ist nicht angesprungen.",
        "Der Cursor steht im Feld — du kannst tippen oder den Diktierknopf selbst drücken.",
        config.providerLabel + ": Knopf gedrückt, Beschriftung blieb bei „" + labelBefore + "“.\n" +
          describeAccountControls()
      );
      return;
    }

    cursorGuard.release();
    log("Diktat läuft.");
    reportSuccess();
  }

  // Einstiegspunkt. Die Anbieterdatei reicht nur ihren Namen und ihre
  // Erkennungswege herein.
  async function run(config) {
    let activated = false;
    // Ob das Diktat starten soll, steht in den Einstellungen. Es weiß nur das
    // Hintergrundskript, deshalb kommt die Antwort mit der Rückfrage zurück.
    // Fehlt die Angabe, gilt an — so war es vor P4.
    let dictationWanted = true;
    try {
      const answer = await chrome.runtime.sendMessage({ type: "zurio:claim" });
      activated = Boolean(answer && answer.activate);
      dictationWanted = !answer || answer.dictate !== false;

      // Eine Meldung, die eine Weiterleitung weggewischt hat, kommt hier
      // zurück und wird erneut angezeigt.
      if (answer && answer.banner) {
        showBanner(answer.banner.headline, answer.banner.detail);
      }
    } catch (error) {
      log("Rückfrage beim Hintergrundskript fehlgeschlagen: " + error.message);
      return;
    }

    // Von Hand geöffnete Seite: Zurio Voice hält sich vollständig heraus.
    if (!activated) {
      return;
    }

    // Abgemeldet ist die Seite oft schon beim Laden, manchmal springt sie erst
    // einen Augenblick später um. Deshalb wird beides geprüft: sofort und
    // während des Wartens.
    function loggedOutNow() {
      return looksLoggedOut(config);
    }

    function reportLoggedOut() {
      reportFailure(
        "Du bist bei " + config.providerLabel + " nicht angemeldet.",
        "Melde dich an und drücke das Kürzel noch einmal. Zurio Voice meldet dich nicht an und " +
          "bekommt deine Zugangsdaten auch nicht zu sehen.",
        config.providerLabel + ": Anmeldeadresse erkannt — " + location.pathname,
        true
      );
    }

    if (loggedOutNow()) {
      reportLoggedOut();
      return;
    }

    let found;
    try {
      found = await waitForElement(config.composerSelectors, GIVE_UP_AFTER_MS, loggedOutNow);
    } catch (error) {
      if (loggedOutNow()) {
        reportLoggedOut();
        return;
      }
      reportFailure(
        "Das Eingabefeld war nicht zu finden.",
        "Vermutlich hat " + config.providerLabel + " seine Oberfläche geändert. Klick ins Feld und " +
          "sprich oder tippe von Hand weiter.",
        "Eingabefeld nicht gefunden auf " + location.pathname + ". " + describeCandidates(config.composerSelectors)
      );
      return;
    }

    placeCursor(found.element);
    log("Cursor gesetzt über: " + found.selector);

    if (!hasCursor(found.element)) {
      reportFailure(
        "Das Eingabefeld hat den Cursor nicht angenommen.",
        "Klick einmal ins Feld, dann kannst du tippen oder den Diktierknopf selbst drücken.",
        config.providerLabel + ": Feld gefunden über " + found.selector + ", nahm den Cursor aber nicht an."
      );
      return;
    }

    const cursorGuard = keepCursorOnBest(config.composerSelectors, found, config.providerLabel);

    // Ein Eingabefeld allein heißt nicht angemeldet: ChatGPT lässt auch
    // Abgemeldete tippen, nur diktieren dürfen sie nicht. Der Diktierknopf ist
    // dort sogar vorhanden und tut beim Drücken nichts — ohne diese Prüfung
    // käme deshalb „Das Diktat ist nicht angesprungen", und das wäre zwar
    // wahr, aber die falsche Auskunft. Der Cursor bleibt stehen.
    if (showsLoginOffer(config)) {
      reportFailure(
        "Du bist bei " + config.providerLabel + " nicht angemeldet.",
        "Tippen kannst du hier auch ohne Anmeldung, das Diktat gibt es aber erst danach. " +
          "Melde dich an und drücke das Kürzel noch einmal.",
        config.providerLabel + ": Anmeldeverweis auf der Seite gefunden.\n" + describeAccountControls()
      );
      return;
    }

    // Erst der Cursor, dann das Mikrofon. Ist der automatische Start
    // abgeschaltet oder bringt die Anbieterdatei keine Erkennungswege für den
    // Diktierknopf mit, bleibt es beim Cursor. Der Wächter meldet dann selbst
    // den Erfolg, sobald sein Fenster zugeht.
    if (!dictationWanted) {
      log("Automatischer Diktatstart ist in den Einstellungen abgeschaltet.");
      return;
    }

    if (config.micSelectors && config.micSelectors.length > 0) {
      await startDictation(config, found.element, cursorGuard);
    }
  }

  window.zurioVoice = { run: run };
})();
