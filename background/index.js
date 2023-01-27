(async function () {
  const tools = {
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

  function resetLanguageSettings() {
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

  chrome.runtime.onInstalled.addListener(() => {
    resetContextMenu();
    resetLanguageSettings();
    registerContextMenu();
  });

  chrome.storage.onChanged.addListener(() => {
    resetContextMenu();
    registerContextMenu();
  });

  chrome.contextMenus.onClicked.addListener(async (info) => {
    const [id, sl, tl] = info.menuItemId.split("/");
    //const url = configuration[id].url;

    const currentTab = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });

    //do not need text info, just info from storage
    chrome.tabs.sendMessage(currentTab[0].id, {
      id: id,
      sl: sl,
      tl: tl,
      txt: info.selectionText,
    });
  });
})();
