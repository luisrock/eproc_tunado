// EPT - Table Style Injector (Versão Básica)
// Aplica apenas as classes CSS necessárias para permitir estilização personalizada

function applyTableClasses() {
  const tabelaMinutas = document.getElementById('tabelaMinutas');
  if (tabelaMinutas) {
    tabelaMinutas.classList.add('ept-enhanced');
    debugLog('EPT: Classe ept-enhanced aplicada à tabela');
  }
}

function enhanceMinutaContent(row) {
  // Célula de conteúdo é a única com colspan (definido dinamicamente por
  // EPT_collapseRow conforme o número de colunas). Não depender de um valor fixo.
  const contentCell = row.querySelector('td[colspan]');
  if (!contentCell) return;

  debugLog('EPT: Aplicando classes à minuta...');

  // Cabeçalho = primeira div com margin-bottom: 30px
  const headerDiv = contentCell.querySelector('div[style*="margin-bottom: 30px"]');
  if (headerDiv) {
    headerDiv.classList.add('ept-minuta-header');
  }

  // Conteúdo = section
  const sectionContent = contentCell.querySelector('section[data-estilo_padrao="paragrafo"]');
  if (sectionContent) {
    sectionContent.classList.add('ept-minuta-text');
  }

  // Footer = rodapé da minuta (classe no markup ou estilo legado).
  const footerDiv =
    contentCell.querySelector(".ept-minuta-footer") ||
    contentCell.querySelector("div[style*='margin-top: 30px']") ||
    contentCell.querySelector("div[style*='margin-top:30px']");
  if (footerDiv) {
    footerDiv.classList.add("ept-minuta-footer");
  }
}

function applyTableEnhancements() {
  debugLog('EPT: Aplicando classes CSS para estilização...');
  
  applyTableClasses();
  
  const minutaRows = document.querySelectorAll('#tabelaMinutas tr:not(.infraTrOrdenacao)');
  minutaRows.forEach(row => {
    enhanceMinutaContent(row);
  });
  
  debugLog('EPT: Classes aplicadas!');
}

function observeMinutaUpdates() {
  const targetNode = document.getElementById('tabelaMinutas');
  if (!targetNode) return;

  const config = { childList: true, subtree: true };
  
  const callback = function(mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && node.tagName === 'TR' && !node.classList.contains('infraTrOrdenacao')) {
            setTimeout(() => {
              enhanceMinutaContent(node);
            }, 100);
          }
        });
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
  
  debugLog('EPT: Observer ativado');
}

// API básica
window.EPT_TableStyler = {
  apply: applyTableEnhancements,
  observe: observeMinutaUpdates,
  enhanceContent: enhanceMinutaContent
}; 