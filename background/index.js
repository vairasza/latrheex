(async function () {
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

    const currentTab = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });

    const response = await fetch(
      `http://localhost:8000?sl=${sl}&tl=${tl}&text=${info.selectionText}`
    );

    const json = await response.json();

    //need server that makes a request to deepl
    chrome.tabs.sendMessage(currentTab[0].id, {
      id: id,
      sl: sl,
      tl: tl,
      originalText: info.selectionText,
      translatedText: json.translation.translations[0].text,
    });
  });
})();
