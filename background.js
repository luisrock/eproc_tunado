// This function checks if the data object has the property and if not sets it to true
async function checkAndSetDefault(data, property) {
  if (!data.hasOwnProperty(property)) {
    await chrome.storage.sync.set({ [property]: true });
    return true;
  } else {
    return data[property];
  }
}

async function setTabData() {
  let data = await chrome.storage.sync.get([
    "ept_enabled",
    "ept_focus",
    "ept_password",
    "ept_actions",
    "ept_tabletext",
    "ept_edit",
  ]);
  let ept_enabled = checkAndSetDefault(data, "ept_enabled");
  let ept_focus = checkAndSetDefault(data, "ept_focus");
  let ept_password = checkAndSetDefault(data, "ept_password");
  let ept_actions = checkAndSetDefault(data, "ept_actions");
  let ept_tableText = checkAndSetDefault(data, "ept_tabletext");
  let ept_edit = checkAndSetDefault(data, "ept_edit");

  let titleToBe = ept_enabled ? "está tunado!" : "não está tunado.";
  chrome.action.setTitle({
    title: `Eproc ${titleToBe}`,
  });
}

chrome.tabs.onCreated.addListener(setTabData);
chrome.tabs.onUpdated.addListener(setTabData);

// Function to set the icon based on the 'ept_enabled' state
async function updateIcon() {
  let data = await chrome.storage.sync.get("ept_enabled");
  const iconToBe = data.ept_enabled ? "icon16.png" : "icon16off.png";
  chrome.action.setIcon({ path: { 16: `icons/${iconToBe}` } });
}

// Call updateIcon() when the extension starts
updateIcon();

// Listen for storage changes and update the icon if 'ept_enabled' changes
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === "ept_enabled" && oldValue !== newValue) {
      updateIcon();
    }
  }
});

// Injects scripts and modifies the page depending on the data retrieved
async function injectScripts(tabId) {
  let data = await chrome.storage.sync.get([
    "ept_enabled",
    "ept_password",
    "ept_focus",
    "ept_actions",
    "ept_tabletext",
    "ept_edit",
  ]);
  if (data.ept_enabled) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["jquery.js", "ept.js"],
    });
  }
}

// Intercept the web navigation
chrome.webNavigation.onCompleted.addListener(
  (details) => {
    injectScripts(details.tabId);
  },
  { url: [{ hostContains: "eproc" }] }
); //updated the match pattern
