(async function () {
  const languages = {
    zh: "🇨🇳 Chinese",
    en: "🇬🇧 English",
    fr: "🇫🇷 French",
    de: "🇩🇪 German",
    it: "🇮🇹 Italian",
    ko: "🇰🇷 South Korea",
    ja: "🇯🇵 Japanese",
    pt: "🇵🇹 Portuguese",
    ru: "🇷🇺 Russian",
    es: "🇪🇸 Spanish",
  };

  class Storage {
    async getLanguageSettings() {
      const slLang = await chrome.storage.sync.get("sl");
      const tlLang = await chrome.storage.sync.get("tl");
      return {
        sl: slLang.sl ? slLang.sl.text : "not chosen",
        tl: tlLang.tl ? tlLang.tl.text : "not chosen",
      };
    }

    saveLanguageSettings(key, event) {
      console.log(key);
      chrome.storage.sync.set({
        [key]: {
          value: event.target.getAttribute("value"),
          text: event.target.innerText,
        },
      });
    }

    resetLanguageSettings() {
      chrome.storage.sync.set({
        sl: {
          value: "en",
          text: languages.en,
        },
        tl: {
          value: "ja",
          text: languages.ja,
        },
      });
    }
  }

  class Elements {
    constructor(storage) {
      this.storage = storage;

      this.currentOutput = null;

      this.clearButton = document.querySelector("#reset-button");
      this.langSource = document.getElementById("language-sl");
      this.langListSource = document.getElementById("languages-list-source");
      //this.langTarget = document.getElementById("language-tl"); // is list!!!
      //this.langListTarget = document.getElementById("languages-list-target");
      this.langListRender = document.querySelectorAll(
        ".language-button-render"
      );
      this.errorText = document.getElementById("error-text");

      this.langSource.addEventListener("click", () => {
        this.currentOutput = this.langSource;
        this.highlightSourceLanguage();
        this.renderLanguageList();
      });

      /*this.langTarget.addEventListener("click", () => {
        this.currentOutput = this.langTarget;
        this.highlightTargetLanguage();
      });*/

      this.clearButton.addEventListener(
        "click",
        this.resetLanguages.bind(this)
      );
    }

    //render only once, need to delete language list!
    //be aware of already selected languages
    renderLanguageList() {
      const l = document.createElement("div");
      l.style.cssText = "display: flex;";

      let text = "";
      let counter = 0;
      for (let [key, val] of Object.entries(languages)) {
        console.log(key, val);
        if (counter === Object.keys(languages).length / 2) {
          text += `</ul><ul>`;
        }
        text += `<button class="language-button-render" value="${key}">${val}</button>`;
        counter++;
      }

      l.innerHTML = `<ul>${text}</ul>`;
      this.langListSource.appendChild(l);
      this.addListenerLanguageList();
    }

    removeLanguageList() {
      this.langListSource.innerHTML = null;
    }

    addListenerLanguageList() {
      this.langListRender = document.querySelectorAll(
        ".language-button-render"
      );
      this.langListRender.forEach((l) => {
        l.addEventListener("click", (event) => {
          this.setSlText(event.target.innerText);
          this.removeLanguageList();
          const key = this.currentOutput.id === "language-sl" ? "sl" : "tl";
          this.storage.saveLanguageSettings(key, event);
        });
      });
    }

    highlightTargetLanguage() {
      this.langTarget.classList.add("selected");
    }

    highlightSourceLanguage() {
      this.langSource.classList.add("selected");
    }

    removeTlHighlight() {
      this.langTarget.classList.remove("selected");
    }

    removeSlHighlight() {
      this.langSource.classList.remove("selected");
    }

    setSlText(text) {
      this.langSource.innerText = text;
    }

    setTlText(text) {
      this.langTarget.innerText = text;
    }

    setCurrentOutputText(element) {
      this.currentOutput.innerText = element;
    }

    clearCurrentOutput() {
      this.currentOutput = null;
    }

    currentOutputNotNull() {
      return this.currentOutput !== null;
    }

    resetLanguages() {
      this.setSlText("🇬🇧 English");
      this.setTlText("🇯🇵 Japanese");
      this.removeSlHighlight();
      this.removeTlHighlight();
      this.clearCurrentOutput();
      this.storage.resetLanguageSettings();
    }

    showErrorText() {
      this.errorText.innerText =
        "⚠ Source Language and Target Language can not be the same.";
      setTimeout(() => {
        this.errorText.innerText = null;
      }, 3000);
    }

    checkSameLanguage(event) {
      return (
        (this.currentOutput.id !== this.slElement.id &&
          event.target.innerText === this.slElement.innerText) ||
        (this.currentOutput.id !== this.tlElement.id &&
          event.target.innerText === this.tlElement.innerText)
      );
    }

    languageListChildrenCallback(event) {
      this.removeSlHighlight();
      this.removeTlHighlight();

      if (!this.currentOutputNotNull()) return;
      if (this.checkSameLanguage(event)) {
        this.hideLanguageList();
        this.showErrorText();
        return;
      }

      this.setCurrentOutputText(event.target.innerText);
      const key = this.currentOutput.id === "output-sl" ? "sl" : "tl";

      this.storage.saveLanguageSettings(key, event);

      this.clearCurrentOutput();
      this.hideLanguageList();
    }
  }

  const storage = new Storage();
  const elements = new Elements(storage);

  const { sl, tl } = await storage.getLanguageSettings();
  elements.setSlText(sl);
  elements.setTlText(tl);
})();
