document.addEventListener("DOMContentLoaded", function() {
  
  //Get strings
  LocalizeStrings();
  
  var apiKeyInput = document.getElementById("deepl-api-key");
  var apiURLSelect = document.getElementById("deepl-api-url");
  var apiSourceLangSelect = document.getElementById("deepl-api-sourcelang");
  var apiTargetLangSelect = document.getElementById("deepl-api-targetlang");
  var saveButton = document.getElementById("save-button");
  
  saveButton.addEventListener("click", function() {
    var apiKey = apiKeyInput.value;
    var apiURL = apiURLSelect.value;
    var apiSourceLang = apiSourceLangSelect.value;
    var apiTargetLang = Array.from(apiTargetLangSelect.selectedOptions).map(option => option.value);

    chrome.storage.sync.set({ "deepl_api_key": apiKey }, function() {
      console.log("Der API-Key wurde gespeichert.");
    });
    chrome.storage.sync.set({ "deepl_api_url": apiURL }, function() {
      console.log("Die API-URL wurde gespeichert.");
    });
    chrome.storage.sync.set({ "deepl_api_sourcelang": apiSourceLang }, function() {
      console.log("Die apiSourceLang wurde gespeichert.");
    });
    chrome.storage.sync.set({ "deepl_api_targetlang": apiTargetLang }, function() {
      console.log("Die apiTargetLang wurde gespeichert.");
    });
    
    // Nachricht an den Service-Worker senden, um das Kontextmenü neu zu laden
    chrome.runtime.sendMessage({ action: 'reloadContextMenu' });
    
    var successElement = document.getElementById("success");
    successElement.style.display = "block";
    
    setTimeout(function() {
      successElement.style.display = "none";
    }, 3000);

    
  });

  chrome.storage.sync.get("deepl_api_key", function(result) {
    if (result.deepl_api_key) {
      apiKeyInput.value = result.deepl_api_key;
    }
  });
  chrome.storage.sync.get("deepl_api_url", function(result) {
    if (result.deepl_api_url) {
      apiURLSelect.value = result.deepl_api_url;
    }
  });
  chrome.storage.sync.get("deepl_api_sourcelang", function(result) {
    if (result.deepl_api_sourcelang) {
      apiSourceLangSelect.value = result.deepl_api_sourcelang;
    }
  });
  chrome.storage.sync.get("deepl_api_targetlang", function(result) {
    if (result.deepl_api_targetlang) {
      var selectedValues = result.deepl_api_targetlang;
  
      for (var i = 0; i < apiTargetLangSelect.options.length; i++) {
        var option = apiTargetLangSelect.options[i];
  
        if (selectedValues.includes(option.value)) {
          option.selected = true;
        }
      }
    }
  });

});

