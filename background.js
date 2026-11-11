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

// ---- Tribunal opcional ainda não ativado: "!" no ícone ---------------
//
// Tribunais em optional_host_permissions só funcionam depois que o usuário
// concede o acesso, pelo botão do popup. Sem aviso, a pessoa instala, abre o
// eproc e nada acontece. Então, na aba de um desses tribunais ainda sem
// acesso, o ícone ganha um "!" laranja e a dica do mouse diz o que fazer.
// O aviso é por aba: nas outras, o ícone segue normal.
const EPT_ORIGENS_OPCIONAIS =
  chrome.runtime.getManifest().optional_host_permissions || [];

function origemOpcionalDaUrl(url) {
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch (e) {
    return null;
  }
  return (
    EPT_ORIGENS_OPCIONAIS.find(
      (p) => p.replace(/^\*:\/\//, "").replace(/\/\*$/, "") === host
    ) || null
  );
}

async function atualizarAvisoAtivacao(tab) {
  if (!tab || typeof tab.id !== "number" || !tab.url) {
    return;
  }
  const origem = origemOpcionalDaUrl(tab.url);
  if (!origem) {
    return;
  }
  try {
    const concedido = await chrome.permissions.contains({ origins: [origem] });
    await chrome.action.setBadgeText({ tabId: tab.id, text: concedido ? "" : "!" });
    if (!concedido) {
      await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#F66942" });
      if (chrome.action.setBadgeTextColor) {
        await chrome.action.setBadgeTextColor({ tabId: tab.id, color: "#ffffff" });
      }
      await chrome.action.setTitle({
        tabId: tab.id,
        title: "Eproc Tunado: clique aqui para ativar neste tribunal",
      });
    }
  } catch (e) {
    // A aba pode ter sido fechada no meio do caminho.
  }
}

async function atualizarAvisoEmTodasAsAbas() {
  const tabs = await chrome.tabs.query({});
  tabs.forEach(atualizarAvisoAtivacao);
}

// O Chrome zera os valores por aba a cada navegação; por isso, a cada
// atualização da aba o aviso é reavaliado.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  atualizarAvisoAtivacao(tab);
});

// Acesso concedido: recarrega as abas daquele tribunal, para a extensão
// agir (a recarga também tira o "!"). Feito aqui, e não no popup, porque a
// janela de permissão pode fechar o popup antes da resposta.
chrome.permissions.onAdded.addListener(async (permissions) => {
  const origens = (permissions && permissions.origins) || [];
  if (!origens.length) {
    return;
  }
  try {
    const tabs = await chrome.tabs.query({ url: origens });
    tabs.forEach((tab) => chrome.tabs.reload(tab.id));
  } catch (e) {
    atualizarAvisoEmTodasAsAbas();
  }
});
chrome.permissions.onRemoved.addListener(atualizarAvisoEmTodasAsAbas);

atualizarAvisoEmTodasAsAbas();

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
