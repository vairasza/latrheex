(async function () {
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
          text: "🇬🇧 English",
        },
      });

      chrome.storage.sync.set({
        tl: {
          value: "ja",
          text: "🇯🇵 Japanese",
        },
      });
    }
  }

  class Elements {
    constructor(storage) {
      this.storage = storage;

      this.langList = document.getElementById("languages");
      this.slElement = document.getElementById("output-sl");
      this.tlElement = document.getElementById("output-tl");
      this.errorText = document.getElementById("error-text");
      this.clearButton = document.querySelector("#reset-button");

      this.clearCurrentOutput();

      this.slElement.addEventListener("click", () => {
        this.currentOutput = this.slElement;
        this.setSlHighlight();
        this.showLanguageList();
      });

      this.tlElement.addEventListener("click", () => {
        this.currentOutput = this.tlElement;
        this.setTlHighlight();
        this.showLanguageList();
      });

      for (const child of this.langList.children) {
        child.addEventListener(
          "click",
          this.languageListChildrenCallback.bind(this)
        );
      }

      this.clearButton.addEventListener(
        "click",
        this.resetLanguages.bind(this)
      );
    }

    setTlHighlight() {
      this.tlElement.classList.add("selected");
    }

    setSlHighlight() {
      this.slElement.classList.add("selected");
    }

    removeTlHighlight() {
      this.tlElement.classList.remove("selected");
    }

    removeSlHighlight() {
      this.slElement.classList.remove("selected");
    }

    hideLanguageList() {
      this.langList.hidden = true;
    }

    showLanguageList() {
      this.langList.hidden = false;
    }

    setSlText(text) {
      this.slElement.innerText = text;
    }

    setTlText(text) {
      this.tlElement.innerText = text;
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
