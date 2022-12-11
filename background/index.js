(async function () {
  const configuration = {
    google: {
      title: "google",
      url: "https://translate.google.com/?sl={sl}&tl={tl}&text={text}&op=translate",
      support: ["zh", "en", "fr", "de", "it", "ko", "ja", "pt", "ru", "es"],
    },
    deepl: {
      title: "deepl",
      url: "https://www.deepl.com/translator#{sl}/{tl}/{text}",
      support: ["zh", "en", "fr", "de", "it", "ko", "ja", "pt", "ru", "es"],
    },
    jisho: {
      title: "jisho",
      url: "https://jisho.org/search/{text}",
      support: ["ja"],
    },
  };
  /*
  const languages = {
    chinese: { value: "zh", text: "🇨🇳 Chinese" },
    english: { value: "en", text: "🇬🇧 English" },
    french: { value: "fr", text: "🇫🇷 French" },
    german: { value: "de", text: "🇩🇪 German" },
    italian: { value: "it", text: "🇮🇹 Italian" },
    south_korean: { value: "ko", text: "🇰🇷 South Korea" },
    japanese: { value: "ja", text: "🇯🇵 Japanese" },
    portuguese: { value: "pt", text: "🇵🇹 Portuguese" },
    russian: { value: "ru", text: "🇷🇺 Russian" },
    spanish: { value: "es", text: "🇪🇸 Spanish" },
  };
  */

  async function registerContextMenu() {
    console.log("Language Translation Helper -- registering context menus");

    const slVal = await chrome.storage.sync.get("sl");
    const tlVal = await chrome.storage.sync.get("tl");

    if (slVal.sl && tlVal.tl) {
      chrome.contextMenus.create({
        id: `deepl/${slVal.sl.value}/${tlVal.tl.value}`,
        title: `${slVal.sl.text} => ${tlVal.tl.text}`,
        contexts: ["selection"],
      });
      chrome.contextMenus.create({
        id: `deepl/${tlVal.tl.value}/${slVal.sl.value}`,
        title: `${tlVal.tl.text} => ${slVal.sl.text}`,
        contexts: ["selection"],
      });

      console.log("Language Translation Helper -- context menus created");
    }
  }

  function resetContextMenu() {
    chrome.contextMenus.removeAll();
  }

  chrome.runtime.onInstalled.addListener(() => {
    resetContextMenu();
    registerContextMenu();
  });

  chrome.storage.onChanged.addListener(() => {
    resetContextMenu();
    registerContextMenu();
  });

  chrome.contextMenus.onClicked.addListener((info) => {
    const [id, sl, tl] = info.menuItemId.split("/");
    const url = configuration[id].url;

    chrome.tabs.create({
      url: url
        .replace("{text}", info.selectionText)
        .replace("{sl}", sl)
        .replace("{tl}", tl),
    });
  });
})();
