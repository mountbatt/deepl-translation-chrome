  var languageList = {
    BG: "Bulgarian",
    CS: "Czech",
    DA: "Danish",
    DE: "German",
    EL: "Greek",
    "EN-GB": "English (GB)",
    "EN-US": "English (US)",
    ES: "Spanish",
    ET: "Estonian",
    FI: "Finnish",
    FR: "French",
    HU: "Hungarian",
    ID: "Indonesian",
    IT: "Italian",
    JA: "Japanese",
    KO: "Korean",
    LT: "Lithuanian",
    LV: "Latvian",
    NB: "Norwegian",
    NL: "Dutch",
    PL: "Polish",
    PT: "Portuguese",
    RO: "Romanian",
    RU: "Russian",
    SK: "Slovak",
    SL: "Slovenian",
    SV: "Swedish",
    TR: "Turkish",
    UK: "Ukrainian",
    ZH: "Chinese"
  };

  // Funktion zum Erstellen des Kontextmenüs
  function createContextMenu() {

    chrome.contextMenus.removeAll(function() {
      chrome.storage.sync.get("deepl_api_targetlang", function(result) {
        if (result.deepl_api_targetlang) {
          var selectedLanguages = result.deepl_api_targetlang;

          // Schleife über die ausgewählten Sprachen
          selectedLanguages.forEach(function(language) {
            chrome.contextMenus.create({
              id: language,
              title: "[Translate to " + languageList[language] + "] → %s",
              contexts: ["selection"],
            });
          });
        }
      });
    });
  }
  // Initialer Aufruf zum Erstellen des Kontextmenüs
  createContextMenu();

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'reloadContextMenu') {
      // Funktion zum Erstellen des Kontextmenüs aufrufen
      createContextMenu();
    }
  });


  async function getDeepLApiKey() {
    return new Promise((resolve) => {
      chrome.storage.sync.get("deepl_api_key", function(result) {
        resolve(result.deepl_api_key);
      });
    });
  }

  async function getDeepLApiTaghandling() {
    return new Promise((resolve) => {
      chrome.storage.sync.get("deepl_api_taghandling", function(result) {
        resolve(result.deepl_api_taghandling);
      });
    });
  }

  async function getDeepLApiUrl() {
    return new Promise((resolve) => {
      chrome.storage.sync.get("deepl_api_url", function(result) {
        resolve(result.deepl_api_url);
      });
    });
  }

  async function getDeepLApiSourceLang() {
    return new Promise((resolve) => {
      chrome.storage.sync.get("deepl_api_sourcelang", function(result) {
        resolve(result.deepl_api_sourcelang);
      });
    });
  }

  async function getDetDeepLApiFormality() {
    return new Promise((resolve) => {
      chrome.storage.sync.get("deepl_api_formality", function(result) {
        resolve(result.deepl_api_formality || "default");
      });
    });
  }

  // Call DeepL API
  async function callDeepL(text, source_lang, target_lang, taghandling, formality) {

    const API_KEY = await getDeepLApiKey();
    const API_URL = await getDeepLApiUrl();

    if (API_KEY === "") {
      return ("Please enter your DeepL API Key in the Extension-Settings!");
    }

    const headers = new Headers();
    headers.append("Authorization", `DeepL-Auth-Key ${API_KEY}`);
    headers.append(
      "Content-Type",
      "application/x-www-form-urlencoded;charset=UTF-8"
    );

    const body =
      "text=" +
      encodeURIComponent(text) +
      "&source_lang=" +
      source_lang +
      "&target_lang=" +
      target_lang +
      "&tag_handling=" +
      taghandling +
      "&formality=" + formality +
      "&preserve_formatting=1&split_sentences=1";

    const options = {
      method: "post",
      headers,
      body,
    };

    const req = new Request(API_URL, options);
    console.log(body)

    try {
      const resp = await fetch(req);
      const jsn = await resp.json();
      if (jsn.message) {
        return `DeepL message: ${jsn.message}`;
      }
      return jsn.translations[0].text;
    } catch (err) {
      return `DeepL message: ${err.message}`;
    }
  }

  // Respond to translation requests
  chrome.contextMenus.onClicked.addListener(async (info, tabs) => {

    // default: 
    let from = "DE";
    let to = "EN-GB";

    var taghandling = await getDeepLApiTaghandling();
    var sourceLang = await getDeepLApiSourceLang();
    var formality = await getDetDeepLApiFormality();
    if (sourceLang) {
      from = sourceLang;
    }
    if (sourceLang == "auto") {
      from = "";
    }

    var languageCode = info.menuItemId;
    if (languageCode) {
      to = languageCode;
    }

    const translation = await callDeepL(info.selectionText, from, to, taghandling, formality);
    chrome.tabs.sendMessage(tabs.id, translation);
  });