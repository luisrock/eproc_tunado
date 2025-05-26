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
    "ept_tablestyle",
  ]);
  let ept_enabled = checkAndSetDefault(data, "ept_enabled");
  let ept_focus = checkAndSetDefault(data, "ept_focus");
  let ept_password = checkAndSetDefault(data, "ept_password");
  let ept_actions = checkAndSetDefault(data, "ept_actions");
  let ept_tableText = checkAndSetDefault(data, "ept_tabletext");
  let ept_edit = checkAndSetDefault(data, "ept_edit");
  let ept_tablestyle = checkAndSetDefault(data, "ept_tablestyle");

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
    "ept_tablestyle",
  ]);
  if (data.ept_enabled) {
    // Injeta o CSS da tabela se as funcionalidades de texto e estilo estiverem habilitadas
    if (data.ept_tabletext && data.ept_tablestyle) {
      try {
        await chrome.scripting.insertCSS({
          target: { tabId: tabId },
          files: ["table-styles.css"]
        });
        console.log('EPT: CSS da tabela injetado via background');
      } catch (error) {
        console.log('EPT: Erro ao injetar CSS:', error);
      }
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
    injectScripts(details.tabId);
  },
  { url: [{ hostContains: "eproc" }] }
); //updated the match pattern
