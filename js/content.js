function getHTML() {
  const html = "<!DOCTYPE html><html>" + document.head.outerHTML + "</html>";
  chrome.runtime.sendMessage({ html });
}
getHTML();
