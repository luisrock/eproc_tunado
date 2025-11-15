const manifestHosts = [
  "*://eproc.jfrj.jus.br/*",
  "*://eproc.jfes.jus.br/*",
  "*://eproc.trf2.jus.br/*",
  "*://eproc.trf4.jus.br/*",
  "*://eproc1g.trf6.jus.br/*",
  "*://eproc2g.trf6.jus.br/*",
  "*://eproc.jfrs.jus.br/*",
  "*://eproc.jfsc.jus.br/*",
  "*://eproc.jfpr.jus.br/*",
  "*://eproc1g.tjrs.jus.br/*",
  "*://eproc2g.tjrs.jus.br/*",
  "*://eproc1g.tjsc.jus.br/*",
  "*://eproc2g.tjsc.jus.br/*",
  "*://eproc1.tjto.jus.br/*",
  "*://eproc2.tjto.jus.br/*",
  "*://eproc1g.tjrj.jus.br/*",
  "*://eproc2g.tjrj.jus.br/*",
  "*://eproc1g.tjsp.jus.br/*",
  "*://eproc2g.tjsp.jus.br/*",
  "*://eproc1g.tjmg.jus.br/*",
  "*://eproc2g.tjmg.jus.br/*"
];

function toggleOnOff(flag, element, geral = false) {
  if (!element) {
    return;
  }
  let classToAdd = !flag ? "toggle-off" : "toggle-on";
  let classToRemove = flag ? "toggle-off" : "toggle-on";
  element.classList.add(classToAdd);
  element.classList.remove(classToRemove);
  
  // Não precisa alterar texto nos toggles switch, apenas as classes
}

function toggleGeral(ept_enabled) {
  let btnGeral = document.getElementById("toggle");
  if (!btnGeral) {
    return;
  }
  let classToAdd = !ept_enabled ? "toggle-off" : "toggle-on";
  let classToRemove = ept_enabled ? "toggle-off" : "toggle-on";
  let elementText = !ept_enabled ? "Desativado" : "Ativado";
  btnGeral.classList.add(classToAdd);
  btnGeral.classList.remove(classToRemove);
  
  // Atualizar o texto dentro do span
  const labelSpan = btnGeral.querySelector('.toggle-label');
  if (labelSpan) {
    labelSpan.textContent = elementText;
  } else {
    btnGeral.textContent = elementText;
  }
}

async function updateTab(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        location.reload();
      },
    });
  } catch (error) {
    console.log(`Error updating tab: ${error}`);
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  // Display extension version from manifest
  const version = chrome.runtime.getManifest().version;
  const versionElement = document.getElementById("extension-version");
  if (versionElement) {
    versionElement.textContent = `v${version}`;
  }

  // Changelog button handler
  const btnChangelog = document.getElementById("btn-changelog");
  if (btnChangelog) {
    btnChangelog.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.tabs.create({
        url: chrome.runtime.getURL("changelog.html")
      });
      window.close();
    });
  }

  let btnGeral = document.getElementById("toggle");
  let ept_enabled;
  let ept_password;
  let btnPassword = document.getElementById("toggle-ept_password");
  let ept_focus;
  let btnFocus = document.getElementById("toggle-ept_focus");
  let ept_actions;
  let btnActions = document.getElementById("toggle-ept_actions");
  let ept_tabletext;
  let btnText = document.getElementById("toggle-ept_tabletext");
  let ept_edit;
  let btnEdit = document.getElementById("toggle-ept_edit");
  let ept_tablestyle;
  let btnTableStyle = document.getElementById("toggle-ept_tablestyle");
  let btnReload = document.getElementById("btn-reload");

  // Get ept_enabled variable
  chrome.storage.sync.get("ept_enabled", (result) => {
    ept_enabled = result.ept_enabled ?? false;
    toggleGeral(ept_enabled);
    // Retrieve other variables
    let variables = [
      "ept_password",
      "ept_focus",
      "ept_actions",
      "ept_tabletext",
      "ept_edit",
      "ept_tablestyle",
    ];
    variables.forEach((item) => {
      chrome.storage.sync.get(item, (result) => {
        let value = result[item];
        let element = document.getElementById(`toggle-${item}`);
        if (element) {
          toggleOnOff(value, element);
        }
      });
    });
  });

  btnGeral.onclick = () => {
    ept_enabled = !ept_enabled;

    toggleGeral(ept_enabled);

    // Store the updated ept_enabled value
    chrome.storage.sync.set({ ept_enabled });

    // Reloading all matching tabs
    chrome.tabs.query({ url: manifestHosts }, (results) => {
      if (results) {
        results.forEach((item) => {
          updateTab(item.id);
        });
      }
    });

    // adding a delay
    setTimeout(() => {
      window.close();
    }, 1000);
  };

  btnReload.onclick = () => {
    window.close();
    // Recarregando todas as abas do eproc
    chrome.tabs.query({}, (results) => {
      if (results) {
        results.forEach((item) => {
          updateTab(item.id);
        });
      }
    });
  };

  [btnPassword, btnFocus, btnActions, btnText, btnEdit, btnTableStyle].forEach((btn) => {
    if (btn) { // Verificação de segurança caso o elemento não exista
      btn.onclick = () => {
        let item = btn.id.split("-")[1];
        chrome.storage.sync.get(item, (result) => {
          let value = result[item];
          value = !value;
          toggleOnOff(value, btn);
          chrome.storage.sync.set({ [item]: value });
        });
      };
    }
  });
});
