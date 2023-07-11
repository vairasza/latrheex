(function () {
  const languages = [
    { value: "zh", output: "🇨🇳 Chinese" },
    { value: "en", output: "🇬🇧 English" },
    { value: "fr", output: "🇫🇷 French" },
    { value: "de", output: "🇩🇪 German" },
    { value: "it", output: "🇮🇹 Italian" },
    { value: "ko", output: "🇰🇷 South Korean" },
    { value: "ja", output: "🇯🇵 Japanese" },
    { value: "es", output: "🇪🇸 Spanish" },
  ];

  const translateLanguage = (value, languages) => {
    const find = languages.filter((el) => {
      if (el.value === value) {
        return el.output;
      }
    });

    if (find.length !== 1) {
      return "not found";
    }
    return find[0].output;
  };

  /*
    request {
      id: string
      sl: string - source language
      tl: string - target language
      originalText: string - selected text from user
      translatedText: string - translated text for user
    }
    => example {
      id: 'deepl',
      sl: 'ja',
      tl: 'en',
      originalText: 'こんにちは'.
      translatedText: 'Good Day'
    }
  */
  chrome.runtime.onMessage.addListener((request) => {
    const htmlToInject = `
      <div id="latrheex-box"
        style="
          background-color:gray;
          position: fixed;
          right: 10px;
          bottom: 10px;
          width: 450px;
          height: auto;
          z-index: 200;
          font-family: Verdana, Geneva, Tahoma, sans-serif;
          color: black;
          padding: 5px;
        ">
        <div
          style="
            font-size: medium;
            font-style: italic;
            display:flex;
            flex-direction: col;
            margin-bottom: 10px;
          ">
          <span
            style="
              flex-grow: 1;
              margin:auto;
              padding-left: 5px;
            ">
              Translation from ${translateLanguage(
                request.sl,
                languages
              )} to ${translateLanguage(request.tl, languages)}
          </span>
          <div>
            <button
              id="latrheex-button"
              style="
                margin: 3px;
              ">
              x
            </button>
          </div>
        </div>
        <div>
          <a href="https://jisho.org/search/${
            request.originalText
          }" target="_blank">jisho link</a>
        </div>
        <div
          style="
            overflow-y: auto;
            overflow-x: hidden;
            display: flex;
            flex-direction:
            column;
          ">
          <div
            style="
              font-size: small;
              margin-bottom: 5px;
            ">
            ${request.originalText}
          </div>
          <div
            style="
              font-size: medium;
              margin-bottom: 5px;
            ">
            =>
          </div>
          <div
            style="
              font-size: small;
            ">
            ${request.translatedText}
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", htmlToInject);

    const box = document.getElementById("latrheex-box");
    const button = document.getElementById("latrheex-button");

    button.addEventListener("click", () => box.remove());
  });
})();
