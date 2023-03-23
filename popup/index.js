(async function () {
  class Storage {
    async getLanguageSettings() {
      const slLang = await chrome.storage.sync.get("sl");
      const tlLang = await chrome.storage.sync.get("tl");
      return {
        sl: slLang.sl?.text ?? "not chosen",
        tl: tlLang.tl?.text ?? "not chosen",
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

      this.currentOutput = null;

      this.clearButton = document.querySelector("#reset-button");
      this.clearButton.addEventListener(
        "click",
        this.resetLanguages.bind(this)
      );

      this.langListSource = Array.from(
        document.getElementById("languages-list-source").children
      );
      this.langListSource.forEach((element) => {
        element.addEventListener("click", (event) =>
          this.toggleHighlight("sl", event)
        );
      });

      this.langListTarget = Array.from(
        document.getElementById("languages-list-target").children
      );
      this.langListTarget.forEach((element) => {
        element.addEventListener("click", (event) =>
          this.toggleHighlight("tl", event)
        );
      });

      this.errorText = document.getElementById("error-text");
    }

    async init() {
      const { sl, tl } = await this.storage.getLanguageSettings();

      this.langListSource.forEach((element) => {
        if (element.innerText === sl) {
          element.classList.add("selected");
        }
      });

      this.langListTarget.forEach((element) => {
        if (element.innerText === tl) {
          element.classList.add("selected");
        }
      });
    }

    toggleHighlight(key, event) {
      if (event.target.classList.contains("selected")) return;
      if (this.checkSameLanguage(key, event)) {
        this.showErrorText();
        return;
      }

      this.clearSelection(key);
      event.target.classList.add("selected");
      this.storage.saveLanguageSettings(key, event);
    }

    checkSameLanguage(key, event) {
      if (key === "sl") {
        return this.langListTarget.some((element) => {
          return (
            element.classList.contains("selected") &&
            element.innerText === event.target.innerText
          );
        });
      }

      if (key === "tl") {
        return this.langListSource.some((element) => {
          return (
            element.classList.contains("selected") &&
            element.innerText === event.target.innerText
          );
        });
      }

      return false;
    }

    clearSelection(key) {
      if (key === "sl") {
        this.langListSource.forEach((element) => {
          element.classList.remove("selected");
        });
      } else {
        this.langListTarget.forEach((element) => {
          element.classList.remove("selected");
        });
      }
    }

    resetLanguages() {
      this.clearSelection("sl");
      this.clearSelection("tl");

      this.langListSource.forEach((element) => {
        if (element.value === "en") {
          element.classList.add("selected");
        }
      });

      this.langListTarget.forEach((element) => {
        if (element.value === "ja") {
          element.classList.add("selected");
        }
      });

      this.storage.resetLanguageSettings();
    }

    showErrorText() {
      this.errorText.innerText =
        "⚠ Source Language and Target Language can not be the same.";
      setTimeout(() => {
        this.errorText.innerText = null;
      }, 3000);
    }
  }

  const storage = new Storage();
  const element = new Elements(storage);

  element.init();
})();
