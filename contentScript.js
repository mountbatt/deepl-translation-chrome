function swapInput(translation) {
  var selectedText = window.getSelection().toString();
  
  if (selectedText) {
    var newText = translation; // Ersetze dies mit dem gewünschten neuen Text

    var activeElement = document.activeElement;
    var tagName = activeElement.tagName.toLowerCase();

    if ((tagName === "input" && activeElement.type === "text") || tagName === "textarea") {
      var start = activeElement.selectionStart;
      var end = activeElement.selectionEnd;

      var currentValue = activeElement.value;
      var replacedValue = currentValue.substring(0, start) + newText + currentValue.substring(end);
      
      // replace
      activeElement.value = replacedValue;
      // trigger input event change to notify vue.js etc.
      activeElement.dispatchEvent(new Event('input'));
      
    } else if (tagName === "div" && activeElement.isContentEditable) {
      var range = window.getSelection().getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(newText));
    } else {
      // Find all elements containing text
      var textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, li, i, figcaption'); // Beispiel: div- und p-Tags
    
      textElements.forEach(function(element) {
        if (element.innerText.includes(selectedText)) {
          element.innerText = element.innerText.replace(selectedText, newText);
        }
      });
    }
  }
}

// Receive clicks on context menu option
chrome.runtime.onMessage.addListener((translation) => {
  swapInput(translation);
});

