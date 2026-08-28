// Handle installation and updates - show changelog
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // First installation - open changelog
    chrome.tabs.create({
      url: chrome.runtime.getURL('changelog.html')
    });
  } else if (details.reason === 'update') {
    // Extension was updated - open changelog
    const currentVersion = chrome.runtime.getManifest().version;
    const previousVersion = details.previousVersion;

    // Only open if version actually changed
    if (previousVersion !== currentVersion) {
      chrome.tabs.create({
        url: chrome.runtime.getURL('changelog.html')
      });
    }
  }
});

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
  const [
    ept_enabled,
    ept_focus,
    ept_password,
    ept_actions,
    ept_tableText,
    ept_edit,
  ] = await Promise.all([
    checkAndSetDefault(data, "ept_enabled"),
    checkAndSetDefault(data, "ept_focus"),
    checkAndSetDefault(data, "ept_password"),
    checkAndSetDefault(data, "ept_actions"),
    checkAndSetDefault(data, "ept_tabletext"),
    checkAndSetDefault(data, "ept_edit"),
  ]);

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

// Call updateIcon() and sync action title when the extension starts
updateIcon();
setTabData();

// Listen for storage changes and update the icon if 'ept_enabled' changes
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === "ept_enabled" && oldValue !== newValue) {
      updateIcon();
      setTabData();
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
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ["table-styles.css", "table-themes.css"]
      });
      console.log('EPT: CSS da tabela injetado via background');
    } catch (error) {
      console.log('EPT: Erro ao injetar CSS:', error);
    }
    
    // Injeta os scripts
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["jquery.js", "table-injector.js", "ept.js"],
    });
  }
}

// Intercept the web navigation
chrome.webNavigation.onCompleted.addListener(
  (details) => {
    // Só o frame principal. Iframes do eproc (editar minuta, etc.) também
    // disparam onCompleted; reinjetar o ept.js no tab gera
    // "Identifier has already been declared".
    if (details.frameId !== 0) {
      return;
    }
    injectScripts(details.tabId);
  },
  { url: [{ hostContains: "eproc" }] }
);
