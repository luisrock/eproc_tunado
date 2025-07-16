window.EPT_DEBUG_ENABLED = window.EPT_DEBUG_ENABLED || false;

//window.EPT_DEBUG_ENABLED = true; //descomentar para ativar logs em etapa de desenvolvimento

// Simple debug function
function debugLog(...args) {
  if (window.EPT_DEBUG_ENABLED) {
    console.log(...args);
  }
}

// Utility function to get data from chrome storage
async function getStorageData(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(key, (result) => {
        if (chrome.runtime.lastError) {
          // handle potential errors
          return reject(chrome.runtime.lastError);
        }
        return resolve(result);
      });
    });
  }
  
  // Main function
  async function executeScript() {
    // Get stored data
    const data = await getStorageData([
      "ept_enabled",
      "ept_password",
      "ept_focus",
      "ept_actions",
      "ept_tabletext",
      "ept_edit",
      "ept_tablestyle",
    ]);
  
    // If extension is not enabled, log message and terminate
    if (!data.ept_enabled) {
      debugLog("EPT desabilitado!");
      return;
    }
  
    // Otherwise, start script
    debugLog("EPT habilitado!");
    $(document).ready(async function () {
      // Handle password setting
      const ept_passwordData = await getStorageData("ept_password");
      if (ept_passwordData.ept_password) {
        // console.log('password to work');
        let pwdSenha = $("input#pwdSenha");
        debugLog(pwdSenha);
        if (pwdSenha) {
          pwdSenha.attr("type", "password");
        }
        //observer at the end, if this doesnt work (when inside an iframe that you'll open laterm it needs an observer)
        let txtSenha = $("input#txtSenha");
        debugLog(txtSenha);
        if (txtSenha) {
          txtSenha.attr("type", "password");
        }
      }
  
      // console.log(ept_passwordData);
  
      // Handle ept_focus setting
      const ept_focusData = await getStorageData("ept_focus");
      if (ept_focusData.ept_focus && window.location.href.includes('acao=minuta_area_trabalho')) {
        // console.log('focus to work');
        $("#frmMinutaLista").children(":not(#divInfraAreaTabela)").hide();
      }
  
      // console.log(ept_focusData);
  
      // Handle actions setting
      const ept_actionsData = await getStorageData("ept_actions");
      if (ept_actionsData.ept_actions && window.location.href.includes('acao=minuta_area_trabalho')) {
        // console.log('actions to work');
        $("#divBarraComandosTabela")
          .children(":not(#btnVisualizar):not(#btnAssinar)")
          .hide();
      }
  
      // console.log(ept_actionsData);
  
      // Handle text setting
      const ept_tabletextData = await getStorageData("ept_tabletext");
      const ept_tablestyleData = await getStorageData("ept_tablestyle");
  
      // console.log(ept_tabletextData);
  
      if (ept_tabletextData.ept_tabletext && window.location.href.includes('acao=minuta_area_trabalho')) {
        // console.log('text to work');
        
        // Aplica estilos modernos à tabela apenas se o toggle estiver habilitado
        if (ept_tablestyleData.ept_tablestyle && window.EPT_TableStyler) {
          debugLog('EPT: Aplicando estilos modernos à tabela...');
          window.EPT_TableStyler.apply();
          window.EPT_TableStyler.observe();
        }

        // Insert the logic for handling 'ept_tabletext' setting here,
        // remember to replace callback-based async operations with async/await, if any.
        //Buscando o texto de cada minuta da lista
        //1. remover colunas indesejadas e buscar a URL do preview de texto
        //2. adiciona coluna TEXTO
        //3. fetch para cada URL usada no mouse hover do link com o código da minuta
        //4. Agregar o resultado filtrado na <td> (coluna) de texto
        $("#tabelaMinutas tr:not(.infraTrOrdenacao)").each(function () {
          let row = $(this);
  
          let lThContent = `<table class="infraTableOrdenacao">
                                              <tbody>
                                                  <tr class="infraTrOrdenacao">
                                                      <td rowspan="2" valign="center" class="infraTdRotuloOrdenacao">
                                                          Prévia
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>`;
  
          //substituindo a coluna "código" por "Preview"
          let th = row.children("th:eq(2)");
          if (th) {
            //primeira linha (título das colunas)
            // Remove todas as colunas de cabeçalho exceto checkbox e preview
            row.children('th:eq(1),th:eq(3),th:eq(4),th:eq(5),th:eq(6),th:eq(7),th:eq(8),th:eq(9),th:eq(10),th:eq(11),th:eq(12),th:eq(13),th:eq(14),th:eq(15),th:eq(16),th:eq(17),th:eq(18),th:eq(19),th:eq(20)').remove();
            th.attr("width", "70%").html(lThContent);
          }
          // console.log("row 1: ", row.children("td:eq(1)").text());
          // console.log("row 2: ", row.children("td:eq(2)").text());
          // console.log("row 3: ", row.children("td:eq(3)").text());
          // console.log("row 4: ", row.children("td:eq(4)").text());
          // console.log("row 5: ", row.children("td:eq(5)").text());
          // console.log("row 6: ", row.children("td:eq(6)").text());
          // console.log("row 7: ", row.children("td:eq(7)").text());
          // console.log("row 8: ", row.children("td:eq(8)").text());
          // console.log("row 9: ", row.children("td:eq(9)").text());
  
          let tdProcesso = row.children("td:eq(5)");
          let linkProcesso = tdProcesso.children("a");
          let processo = tdProcesso.html();
  
          let tdOrgao = row.children("td:eq(3)");
          let orgao = tdOrgao.text();
  
          let servidor = "";
          servidor = row.children("td:eq(7)").text();
          // if (tdServidor) {
          //   let labelServidor = tdServidor.children("label");
          //   if (labelServidor) {
          //     let onMouseServidor = labelServidor.attr("onmouseover");
          //     if (onMouseServidor) {
          //       servidor = onMouseServidor.split("('").pop().split("<br/>")[0];
          //       //servidor = onMouseServidor;
          //     }
          //   }
          // }
  
          let status = "";
          let tdStatus = row.children("td:eq(9)");
          let labelStatus = tdStatus.children("label");
          status = labelStatus.text().replace(/ *\([^)]*\) */g, "");
  
          let tdCriacao = row.children("td:eq(8)");
          let criacao = tdCriacao.text();
  
          let divBotoes = row.find("#divListaRecursosMinuta");
          //por ora, mantendo apenas os botões de assinar, devolver, conferir, editar e lembretes
          divBotoes.children().each(function () {
            if (
              !$(this).attr("href") ||
              ($(this).attr("href").includes("acao=minuta_assinar") === false &&
                $(this).attr("href").includes("acao=minuta_devolver") === false &&
                $(this).attr("href").includes("acao=minuta_conferir") === false &&
                $(this)
                  .attr("href")
                  .includes("acao=minuta_verificar_agendamento") === false &&
                $(this)
                  .attr("href")
                  .includes("acao=minuta_lembrete_cadastrar") === false)
            ) {
              $(this).css("display", "none");
            }
          });
          //armazenando os botões...
          let botoes = divBotoes.html();
  
          let l = row.find(".linkMinuta");
          let urlPreview = l.attr("hrefpreview");
          
          // PRESERVAR OS LINKS ORIGINAIS ANTES DE REMOVER COLUNAS
          let originalLinks = [];
          row.find(".linkMinuta").each(function() {
            originalLinks.push({
              href: $(this).attr("href"),
              dataLink: $(this).data("link"),
              hrefPreview: $(this).attr("hrefpreview")
            });
          });
          
          if (urlPreview) {
            //get the page url until 'eproc/', but including 'eproc/'
            let url = window.location.href;
            let urlEproc = url.split("eproc/")[0] + "eproc";
  
            $.get(`${urlEproc}/${urlPreview}`).done(function (data) {
              var htmlObject = document.createElement("div");
              htmlObject.innerHTML = data;
              let titulo_raw = htmlObject.querySelector("p.titulo");
              let titulo = titulo_raw.textContent;
              let section = htmlObject.querySelector(
                'section[data-estilo_padrao="paragrafo"]'
              );
              
              // Função para truncar conteúdo HTML preservando estrutura
              function truncateContent(htmlContent, maxChars = 1000) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;
                const textContent = tempDiv.textContent || tempDiv.innerText || '';
                
                if (textContent.length <= maxChars) {
                  return {
                    content: htmlContent,
                    isTruncated: false,
                    fullContent: htmlContent
                  };
                }
                
                // Criar uma versão truncada removendo elementos inteiros quando necessário
                const clonedDiv = tempDiv.cloneNode(true);
                let charCount = 0;
                let elementsToKeep = [];
                
                // Percorrer todos os elementos filhos diretos
                const children = Array.from(clonedDiv.children);
                
                for (let i = 0; i < children.length; i++) {
                  const element = children[i];
                  const elementText = element.textContent || element.innerText || '';
                  
                  if (charCount + elementText.length <= maxChars) {
                    // Este elemento cabe inteiro
                    charCount += elementText.length;
                    elementsToKeep.push(element.outerHTML);
                  } else {
                    // Este elemento faria ultrapassar o limite
                    const remainingChars = maxChars - charCount;
                    
                    if (remainingChars > 50) { // Só trunca se sobrar um espaço razoável
                      // Truncar o texto deste elemento
                      const tempElement = element.cloneNode(true);
                      const walker = document.createTreeWalker(
                        tempElement,
                        NodeFilter.SHOW_TEXT,
                        null,
                        false
                      );
                      
                      let usedChars = 0;
                      let textNode;
                      
                      while (textNode = walker.nextNode()) {
                        const nodeText = textNode.textContent;
                        if (usedChars + nodeText.length <= remainingChars) {
                          usedChars += nodeText.length;
                        } else {
                          // Truncar este nó de texto
                          const allowedChars = remainingChars - usedChars;
                          textNode.textContent = nodeText.substring(0, allowedChars);
                          // Remover todos os nós de texto seguintes
                          let nextNode;
                          while (nextNode = walker.nextNode()) {
                            nextNode.textContent = '';
                          }
                          break;
                        }
                      }
                      
                      elementsToKeep.push(tempElement.outerHTML);
                    }
                    // Parar aqui - não incluir mais elementos
                    break;
                  }
                }
                
                return {
                  content: elementsToKeep.join(''),
                  isTruncated: true,
                  fullContent: htmlContent
                };
              }
              
              const contentInfo = truncateContent(section.innerHTML, 1000);
              
              // Criar o conteúdo da seção com possibilidade de expansão
              let sectionContent = '';
              if (contentInfo.isTruncated) {
                const uniqueId = `minuta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                sectionContent = `
                  <div id="${uniqueId}-truncated" style="display: block;">
                    ${contentInfo.content}
                    <span 
                      id="${uniqueId}-expand-btn" 
                      style="color: #1976d2; cursor: pointer; font-weight: bold; margin-left: 10px; user-select: none;"
                      title="Clique para ver o texto completo"
                      onclick="
                        document.getElementById('${uniqueId}-truncated').style.display = 'none';
                        document.getElementById('${uniqueId}-full').style.display = 'block';
                      "
                    >
                      ▶ Ver texto completo
                    </span>
                  </div>
                  <div id="${uniqueId}-full" style="display: none;">
                    ${contentInfo.fullContent}
                    <span 
                      id="${uniqueId}-collapse-btn" 
                      style="color: #1976d2; cursor: pointer; font-weight: bold; margin-left: 10px; user-select: none;"
                      title="Clique para ocultar parte do texto"
                      onclick="
                        document.getElementById('${uniqueId}-full').style.display = 'none';
                        document.getElementById('${uniqueId}-truncated').style.display = 'block';
                      "
                    >
                      ▼ Ocultar parte do texto
                    </span>
                  </div>
                `;
              } else {
                sectionContent = contentInfo.content;
              }
              
              //let section = htmlObject.querySelector('body');
              let cabecalho = `<div style="display:flex; justify-content: space-between; margin-bottom: 30px; margin-top: 15px;">
                                                      <span>${processo}</span> 
                                                      <span align="center">${titulo}<br>${status}&nbsp;</span>
                                                      <span>${orgao}</span>
                                                  </div>`;

              let footer = `<div style="display:flex;justify-content:space-between;margin-bottom: 5px;margin-top: 30px;">
                                                  <div id="divListaRecursosMinuta" style="margin:0">${botoes}</div>
                                                  <span style="font-size: 0.8em;">${servidor}, em ${criacao}</span> 
                                              </div>`;
              row
                .children("td:eq(2)")
                .attr("align", "left")
                .attr("colspan", "12")
                .css("padding", "20px")
                .html(cabecalho + sectionContent + footer);
              // Remove todas as colunas exceto a primeira (checkbox) e a segunda (que se torna o conteúdo expandido)
              row
                .children(
                  "td:eq(1),td:eq(3),td:eq(4),td:eq(5),td:eq(6),td:eq(7),td:eq(8),td:eq(9),td:eq(10),td:eq(11),td:eq(12),td:eq(13),td:eq(14),td:eq(15),td:eq(16),td:eq(17),td:eq(18),td:eq(19),td:eq(20)"
                )
                .remove();
                
                             // REINCORPORAR OS LINKS ORIGINAIS APÓS REMOVER COLUNAS
               originalLinks.forEach(function(linkData) {
                 if (linkData.href) {
                   let newLink = $('<a>', {
                     href: linkData.href,
                     class: 'linkMinuta',
                     'data-link': linkData.dataLink,
                     'hrefpreview': linkData.hrefPreview,
                     style: 'display: none; position: absolute; left: -9999px;' // ESCONDER O LINK MAS MANTÊ-LO FUNCIONAL
                   });
                   
                   // ADICIONAR O LINK DIRETAMENTE NA LINHA, NÃO NA CÉLULA
                   row.append(newLink);
                 }
               });

              // Aplica estilos modernos ao conteúdo da minuta recém-carregada
              if (ept_tablestyleData.ept_tablestyle && window.EPT_TableStyler) {
                window.EPT_TableStyler.enhanceContent(row[0]);
              }
            });
          } else {
            // SE NÃO HÁ URLPREVIEW, AINDA PRESERVAR OS LINKS ORIGINAIS
            // Remove todas as colunas exceto a primeira (checkbox) e a segunda (que se torna o conteúdo expandido)
            row
              .children("td:eq(1),td:eq(3),td:eq(4),td:eq(5),td:eq(6),td:eq(7),td:eq(8),td:eq(9),td:eq(10),td:eq(11),td:eq(12),td:eq(13),td:eq(14),td:eq(15),td:eq(16),td:eq(17),td:eq(18),td:eq(19),td:eq(20)")
              .remove();
            
            // REINCORPORAR OS LINKS ORIGINAIS APÓS REMOVER COLUNAS
            originalLinks.forEach(function(linkData) {
              if (linkData.href) {
                let newLink = $('<a>', {
                  href: linkData.href,
                  class: 'linkMinuta',
                  'data-link': linkData.dataLink,
                  'hrefpreview': linkData.hrefPreview,
                  style: 'display: none; position: absolute; left: -9999px;' // ESCONDER O LINK MAS MANTÊ-LO FUNCIONAL
                });
                
                // ADICIONAR O LINK DIRETAMENTE NA LINHA, NÃO NA CÉLULA
                row.append(newLink);
              }
            });
          } //end if(urlPreview)
        }); //end foreach
        //End texto de cada minuta da lista
  
        $("#divBarraComandosTabela").append(
          '<button onClick="window.location.reload();" style="margin-left:50px;background: #7dcfe2;color: #fcfdfe;padding: 2px; cursor:pointer;">Retunar tabela</button>'
        );
      }
  
      //Iframe para editar minuta
  
      const ept_editData = await getStorageData("ept_edit");
      if (ept_editData.ept_edit) {
        // console.log('edit to work');
  
        // Variável global para controlar se já existe uma observação ativa
        let isObserving = false;
        let currentObserver = null;
        let currentPollingInterval = null;
  
        // Função para limpar observação ativa
        function cleanupObservation() {
          if (currentObserver) {
            currentObserver.disconnect();
            currentObserver = null;
          }
          if (currentPollingInterval) {
            clearInterval(currentPollingInterval);
            currentPollingInterval = null;
          }
          isObserving = false;
        }
  
        // Listener global para todos os cliques em links de editar minuta
        document.addEventListener("click", function (event) {
          // Se já está observando, não criar nova observação
          if (isObserving) {
            debugLog('EPT: Observação já ativa, ignorando clique adicional...');
            return;
          }
  
          const link = event.target.closest("a");
          
          // Verifica se é um link que contém a ação de verificar agendamento
          if (
            link &&
            link.href &&
            link.href.includes("controlador.php?acao=minuta_verificar_agendamento")
          ) {
            debugLog('EPT: Detectado clique em link de editar minuta, iniciando observação...');
            startObserving();
            return;
          }
          
          // Também detecta cliques em imagens dentro de labels (caso do ícone de editar)
          const img = event.target.closest("img");
          if (img && img.alt && img.alt.includes("Editar minuta")) {
            const parentLink = img.closest("a");
            if (parentLink && parentLink.href && parentLink.href.includes("minuta_verificar_agendamento")) {
              debugLog('EPT: Detectado clique em ícone de editar minuta, iniciando observação...');
              startObserving();
              return;
            }
          }
        });
  
        // Listener adicional para eventos delegados (com prioridade menor)
        document.addEventListener("click", function (event) {
          // Se já está observando, não fazer nada
          if (isObserving) return;
  
          // Detecta cliques em qualquer elemento que tenha atributos relacionados à edição de minuta
          const target = event.target;
          const closestLink = target.closest("a[href*='minuta_verificar_agendamento']");
          
          if (closestLink) {
            debugLog('EPT: Detectado clique delegado em link de verificar agendamento...');
            startObserving();
          }
        }, true); // Usando capture para pegar eventos antes de outros handlers
  
        function startObserving() {
          // Se já está observando, não iniciar nova observação
          if (isObserving) {
            debugLog('EPT: Tentativa de iniciar observação enquanto outra está ativa. Ignorando...');
            return;
          }
  
          isObserving = true;
          debugLog('EPT: Iniciando observação de mutações para iframe...');
          const config = { attributes: true, childList: true, subtree: true };
          
          // Timeout para evitar observação infinita
          let timeoutId = setTimeout(() => {
            debugLog('EPT: Timeout da observação de iframe atingido');
            cleanupObservation();
          }, 10000); // 10 segundos de timeout
  
          // Função para tentar clicar no botão
          function tryClickButton(doc, source = 'principal') {
            if (!isObserving) return false;
            
            const btnManterAgendamento = doc.getElementById("btnManterAgendamento");
            if (btnManterAgendamento) {
              debugLog(`EPT: Botão "Manter Agendamento" encontrado via ${source}! Clicando automaticamente...`);
              
              // Limpar tudo antes de clicar
              clearTimeout(timeoutId);
              cleanupObservation();
              
              setTimeout(() => {
                btnManterAgendamento.click();
                debugLog('EPT: Clique automático no botão "Manter Agendamento" executado com sucesso!');
              }, 100);
              return true;
            }
            
            // Vamos tentar encontrar por outros métodos
            const btnByName = doc.querySelector('button[name="btnManterAgendamento"]');
            const btnByText = Array.from(doc.querySelectorAll('button')).find(btn => 
              btn.textContent.includes('Manter Agendamento'));
            
            if (btnByName) {
              debugLog(`EPT: Botão encontrado por name via ${source}! Clicando...`);
              clearTimeout(timeoutId);
              cleanupObservation();
              setTimeout(() => {
                btnByName.click();
                debugLog('EPT: Clique executado via name!');
              }, 100);
              return true;
            } else if (btnByText) {
              debugLog(`EPT: Botão encontrado por texto via ${source}! Clicando...`);
              clearTimeout(timeoutId);
              cleanupObservation();
              setTimeout(() => {
                btnByText.click();
                debugLog('EPT: Clique executado via texto!');
              }, 100);
              return true;
            }
            
            return false;
          }
  
          // Polling adicional para verificar iframes regularmente
          let pollingCount = 0;
          currentPollingInterval = setInterval(() => {
            if (!isObserving) return;
            
            pollingCount++;
            debugLog(`EPT: Polling ${pollingCount} - verificando iframes...`);
            
            const iframes = document.querySelectorAll("iframe");
            iframes.forEach((iframe, index) => {
              try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                if (doc && tryClickButton(doc, `polling ${pollingCount} iframe ${index + 1}`)) {
                  return;
                }
              } catch (error) {
                // Ignorar erros silenciosamente no polling
              }
            });
            
            // Parar o polling após 50 tentativas (10 segundos)
            if (pollingCount >= 50) {
              clearInterval(currentPollingInterval);
              currentPollingInterval = null;
            }
          }, 200); // A cada 200ms
  
          // Verifica iframes existentes imediatamente
          const existingIframes = document.querySelectorAll("iframe");
          if (existingIframes.length > 0) {
            debugLog(`EPT: Verificando ${existingIframes.length} iframes já existentes...`);
            existingIframes.forEach((iframe, index) => {
              try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                if (doc && tryClickButton(doc, `iframe existente ${index + 1}`)) {
                  return;
                }
              } catch (error) {
                debugLog(`EPT: Não foi possível acessar iframe existente ${index + 1}:`, error.message);
              }
            });
          }
  
          const callback = function (mutationsList, observer) {
            if (!isObserving) return;
            
            for (let mutation of mutationsList) {
              if (mutation.type === "childList") {
                const iframes = document.querySelectorAll("iframe");
                debugLog(`EPT: Encontrados ${iframes.length} iframes na página`);
                
                iframes.forEach((iframe, index) => {
                  debugLog(`EPT: Verificando iframe ${index + 1}:`, iframe.src || 'sem src');
                  
                  // Adiciona listener para quando o iframe carregar completamente (apenas uma vez)
                  if (!iframe.hasAttribute('data-ept-listener-added')) {
                    iframe.setAttribute('data-ept-listener-added', 'true');
                    iframe.addEventListener('load', function() {
                      debugLog(`EPT: Iframe ${index + 1} carregou completamente`);
                      if (!isObserving) return;
                      
                      try {
                        const doc = iframe.contentDocument || iframe.contentWindow.document;
                        if (doc && tryClickButton(doc, `iframe load event ${index + 1}`)) {
                          return;
                        }
                      } catch (error) {
                        debugLog(`EPT: Erro no load event do iframe ${index + 1}:`, error.message);
                      }
                    });
                  }
                  
                  try {
                    // Tenta acessar o contentDocument do iframe
                    const doc = iframe.contentDocument || iframe.contentWindow.document;
                    if (doc) {
                      debugLog('EPT: Conseguiu acessar contentDocument do iframe');
                      
                      // Lista todos os elementos para debug (apenas se não encontrou antes)
                      const allButtons = doc.querySelectorAll('button');
                      debugLog(`EPT: Encontrados ${allButtons.length} botões no iframe`);
                      if (allButtons.length > 0) {
                        allButtons.forEach((btn, btnIndex) => {
                          debugLog(`EPT: Botão ${btnIndex + 1}: id="${btn.id}", name="${btn.name}", texto="${btn.textContent.trim()}"`);
                        });
                      }
                      
                      if (tryClickButton(doc, `mutation observer ${index + 1}`)) {
                        return;
                      } else {
                        debugLog('EPT: Botão "btnManterAgendamento" não encontrado no iframe');
                      }
                    } else {
                      debugLog('EPT: Não conseguiu acessar contentDocument do iframe');
                    }
                  } catch (error) {
                    debugLog('EPT: Erro ao acessar iframe:', error.message);
                    
                    // Erros esperados devido à política de same-origin
                    // Vamos tentar uma abordagem alternativa
                    if (iframe.src && iframe.src.includes('minuta_verificar_agendamento')) {
                      debugLog('EPT: iframe tem URL de verificar agendamento, tentando novamente...');
                      // Se conseguimos detectar que é o iframe correto, vamos tentar de novo após um delay
                      setTimeout(() => {
                        if (!isObserving) return;
                        try {
                          const doc = iframe.contentDocument || iframe.contentWindow.document;
                          if (doc && tryClickButton(doc, 'segunda tentativa')) {
                            return;
                          }
                        } catch (secondError) {
                          // Se ainda não conseguir, apenas loga o erro para debug
                          debugLog('EPT: Não foi possível acessar o iframe na segunda tentativa (same-origin policy)');
                        }
                      }, 500);
                    } else if (iframe.name || iframe.id) {
                      debugLog(`EPT: iframe sem URL específica, name: "${iframe.name}", id: "${iframe.id}"`);
                    }
                  }
                });
              }
            }
          };
  
          currentObserver = new MutationObserver(callback);
          currentObserver.observe(document.body, config);
        }
      }
  
      //Iframe para assinar minuta(s). permitir armazensamento de senha
      if (ept_passwordData.ept_password) {
        // Variáveis globais para controlar observação de senha
        let isObservingPassword = false;
        let currentPasswordObserver = null;
        let currentPasswordPollingInterval = null;

        // Função para limpar observação ativa de senha
        function cleanupPasswordObservation() {
          if (currentPasswordObserver) {
            currentPasswordObserver.disconnect();
            currentPasswordObserver = null;
          }
          if (currentPasswordPollingInterval) {
            clearInterval(currentPasswordPollingInterval);
            currentPasswordPollingInterval = null;
          }
          isObservingPassword = false;
        }

        // Listener para cliques em links de assinar minuta
        document.addEventListener("click", function (event) {
          if (isObservingPassword) {
            debugLog('EPT: Observação de senha já ativa, ignorando clique adicional...');
            return;
          }

          const link = event.target.closest("a");
          const button = event.target.closest("button");
          
          // Detecta cliques em links de assinar, visualizar lista ou editar
          if (
            (link && (
              link.href.includes("controlador.php?acao=minuta_assinar") ||
              link.href.includes("controlador.php?acao=minuta_visualizar_lista") ||
              link.href.includes("controlador.php?acao=minuta_editar")
            )) ||
            (button && button.id === "btnAssinar")
          ) {
            debugLog('EPT: Detectado clique em link de assinar/visualizar/editar minuta, iniciando observação de senha...');
            startObservingPassword();
            return;
          }
          
          // Detecta cliques em botões do CKEditor (específico para assinar)
          const ckeButton = event.target.closest("a.cke_button__assinar, a[class*='cke_button__assinar']");
          if (ckeButton) {
            debugLog('EPT: Detectado clique em botão CKEditor de assinar, iniciando observação de senha...');
            startObservingPassword();
            return;
          }
          
          // Detecta cliques em imagens dentro de labels (ícones)
          const img = event.target.closest("img");
          if (img && img.alt && (
            img.alt.includes("Assinar minuta") || 
            img.alt.includes("Visualizar") ||
            img.alt.includes("Editar")
          )) {
            const parentLink = img.closest("a");
            if (parentLink && parentLink.href && (
              parentLink.href.includes("minuta_assinar") ||
              parentLink.href.includes("minuta_visualizar_lista") ||
              parentLink.href.includes("minuta_editar")
            )) {
              debugLog('EPT: Detectado clique em ícone de assinar/visualizar/editar minuta, iniciando observação de senha...');
              startObservingPassword();
              return;
            }
          }
        });

        // Listener adicional para eventos delegados
        document.addEventListener("click", function (event) {
          if (isObservingPassword) return;

          const target = event.target;
          const closestLink = target.closest("a[href*='minuta_assinar'], a[href*='minuta_visualizar_lista'], a[href*='minuta_editar']");
          const closestCkeButton = target.closest("a.cke_button__assinar, a[class*='cke_button__assinar']");
          
          if (closestLink) {
            debugLog('EPT: Detectado clique delegado em link de assinar/visualizar/editar...');
            startObservingPassword();
          } else if (closestCkeButton) {
            debugLog('EPT: Detectado clique delegado em botão CKEditor de assinar...');
            startObservingPassword();
          }
        }, true);

        // Listener específico para CKEditor (captura eventos em qualquer elemento filho)
        document.addEventListener("click", function (event) {
          if (isObservingPassword) return;

          // Verifica se o clique foi em qualquer parte de um botão CKEditor de assinar
          const target = event.target;
          const ckeAssinarButton = target.closest("a[class*='cke_button__assinar']") || 
                                   target.closest("a[id*='cke_'][title*='Assinar']") ||
                                   target.closest("a[onclick*='assinar']");
          
          if (ckeAssinarButton) {
            debugLog('EPT: Detectado clique em elemento CKEditor de assinar (captura ampla), iniciando observação de senha...');
            startObservingPassword();
            return;
          }

          // Verifica se clicou em span ou texto dentro de botão CKEditor
          const parentCkeButton = target.parentElement && target.parentElement.closest("a[class*='cke_button__assinar']");
          if (parentCkeButton) {
            debugLog('EPT: Detectado clique em elemento filho de botão CKEditor de assinar, iniciando observação de senha...');
            startObservingPassword();
            return;
          }
        }, true);

        function startObservingPassword() {
          if (isObservingPassword) {
            debugLog('EPT: Tentativa de iniciar observação de senha enquanto outra está ativa. Ignorando...');
            return;
          }

          isObservingPassword = true;
          debugLog('EPT: Iniciando observação de mutações para campos de senha em iframes...');
          const config = { attributes: true, childList: true, subtree: true };
          
          // Timeout para evitar observação infinita
          let timeoutId = setTimeout(() => {
            debugLog('EPT: Timeout da observação de senha atingido');
            cleanupPasswordObservation();
          }, 10000); // 10 segundos de timeout

          // Função para tentar converter campos de senha
          function tryConvertPasswordFields(doc, source = 'principal') {
            if (!isObservingPassword) return false;
            
            let converted = false;
            
            // Procura por txtSenha (pode haver múltiplos)
            const txtSenhaElements = doc.querySelectorAll('input[id="txtSenha"], input[name="txtSenha"]');
            txtSenhaElements.forEach((element, index) => {
              if (element.type !== "password") {
                debugLog(`EPT: Campo txtSenha ${index + 1} encontrado via ${source}! Convertendo para type="password"...`);
                element.setAttribute("type", "password");
                converted = true;
              }
            });
            
            // Procura por pwdSenha (pode haver múltiplos)
            const pwdSenhaElements = doc.querySelectorAll('input[id="pwdSenha"], input[name="pwdSenha"]');
            pwdSenhaElements.forEach((element, index) => {
              if (element.type !== "password") {
                debugLog(`EPT: Campo pwdSenha ${index + 1} encontrado via ${source}! Convertendo para type="password"...`);
                element.setAttribute("type", "password");
                converted = true;
              }
            });
            
            // Procura por outros campos de senha por seletor mais amplo
            const passwordInputs = doc.querySelectorAll('input[name*="senha"], input[id*="senha"], input[name*="Senha"], input[id*="Senha"], input[placeholder*="senha"], input[placeholder*="Senha"]');
            passwordInputs.forEach((input, index) => {
              if (input.type !== "password") {
                debugLog(`EPT: Campo de senha adicional encontrado via ${source} (${input.id || input.name || input.placeholder}): convertendo...`);
                input.setAttribute("type", "password");
                converted = true;
              }
            });
            
            // Busca específica para campos em formulários de assinatura (mais agressiva)
            const formInputs = doc.querySelectorAll('form input[type="text"]');
            formInputs.forEach((input, index) => {
              // Verifica se o input está em um contexto de senha/assinatura
              const isPasswordContext = (
                (input.placeholder && input.placeholder.toLowerCase().includes('senha')) ||
                (input.className && input.className.includes('masked')) ||
                (input.parentElement && input.parentElement.innerHTML.toLowerCase().includes('senha')) ||
                (input.form && input.form.id && input.form.id.toLowerCase().includes('assinar'))
              );
              
              if (isPasswordContext && input.type !== "password") {
                debugLog(`EPT: Campo suspeito de senha em contexto de assinatura encontrado via ${source} (${input.id || input.name || 'sem id/name'}): convertendo...`);
                input.setAttribute("type", "password");
                converted = true;
              }
            });
            
            if (converted) {
              debugLog(`EPT: Campos de senha convertidos com sucesso via ${source}!`);
              // Limpar observação após conversão bem-sucedida
              debugLog('EPT: Parando observação de senha após conversão bem-sucedida...');
              clearTimeout(timeoutId);
              cleanupPasswordObservation();
            }
            
            return converted;
          }

          // Polling adicional para verificar iframes regularmente
          let pollingCount = 0;
          currentPasswordPollingInterval = setInterval(() => {
            if (!isObservingPassword) return;
            
            pollingCount++;
            debugLog(`EPT: Polling senha ${pollingCount} - verificando iframes...`);
            
            const iframes = document.querySelectorAll("iframe");
            iframes.forEach((iframe, index) => {
              try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                if (doc) {
                  tryConvertPasswordFields(doc, `polling ${pollingCount} iframe ${index + 1}`);
                }
              } catch (error) {
                // Ignorar erros silenciosamente no polling
              }
            });
            
            // Parar o polling após 50 tentativas (10 segundos)
            if (pollingCount >= 50) {
              clearInterval(currentPasswordPollingInterval);
              currentPasswordPollingInterval = null;
            }
          }, 200); // A cada 200ms

          // Verifica iframes existentes imediatamente
          const existingIframes = document.querySelectorAll("iframe");
          if (existingIframes.length > 0) {
            debugLog(`EPT: Verificando campos de senha em ${existingIframes.length} iframes já existentes...`);
            existingIframes.forEach((iframe, index) => {
              try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                if (doc) {
                  tryConvertPasswordFields(doc, `iframe existente ${index + 1}`);
                }
              } catch (error) {
                debugLog(`EPT: Não foi possível acessar iframe existente ${index + 1} para senha:`, error.message);
              }
            });
          }

          const callback = function (mutationsList, observer) {
            if (!isObservingPassword) return;
            
            for (let mutation of mutationsList) {
              if (mutation.type === "childList") {
                const iframes = document.querySelectorAll("iframe");
                debugLog(`EPT: Encontrados ${iframes.length} iframes na página para verificação de senha`);
                
                iframes.forEach((iframe, index) => {
                  debugLog(`EPT: Verificando iframe ${index + 1} para campos de senha:`, iframe.src || 'sem src');
                  
                  // Adiciona listener para quando o iframe carregar completamente (apenas uma vez)
                  if (!iframe.hasAttribute('data-ept-password-listener-added')) {
                    iframe.setAttribute('data-ept-password-listener-added', 'true');
                    iframe.addEventListener('load', function() {
                      debugLog(`EPT: Iframe ${index + 1} carregou completamente - verificando campos de senha`);
                      if (!isObservingPassword) return;
                      
                      try {
                        const doc = iframe.contentDocument || iframe.contentWindow.document;
                        if (doc) {
                          tryConvertPasswordFields(doc, `iframe load event ${index + 1}`);
                        }
                      } catch (error) {
                        debugLog(`EPT: Erro no load event do iframe ${index + 1} para senha:`, error.message);
                      }
                    });
                  }
                  
                  try {
                    // Tenta acessar o contentDocument do iframe
                    const doc = iframe.contentDocument || iframe.contentWindow.document;
                    if (doc) {
                      debugLog('EPT: Conseguiu acessar contentDocument do iframe para verificação de senha');
                      
                      // Lista todos os inputs para debug
                      const allInputs = doc.querySelectorAll('input');
                      debugLog(`EPT: Encontrados ${allInputs.length} inputs no iframe`);
                      if (allInputs.length > 0) {
                        allInputs.forEach((input, inputIndex) => {
                          if (input.id && (input.id.includes('senha') || input.id.includes('Senha'))) {
                            debugLog(`EPT: Input de senha ${inputIndex + 1}: id="${input.id}", name="${input.name}", type="${input.type}"`);
                          }
                        });
                      }
                      
                      tryConvertPasswordFields(doc, `mutation observer ${index + 1}`);
                    } else {
                      debugLog('EPT: Não conseguiu acessar contentDocument do iframe para senha');
                    }
                  } catch (error) {
                    debugLog('EPT: Erro ao acessar iframe para senha:', error.message);
                    
                    // Para iframes específicos, tentar novamente após delay
                    if (iframe.src && (
                      iframe.src.includes('minuta_assinar') || 
                      iframe.src.includes('minuta_visualizar_lista') ||
                      iframe.src.includes('minuta_editar')
                    )) {
                      debugLog('EPT: iframe tem URL de assinar/visualizar/editar, tentando novamente para senha...');
                      setTimeout(() => {
                        if (!isObservingPassword) return;
                        try {
                          const doc = iframe.contentDocument || iframe.contentWindow.document;
                          if (doc) {
                            tryConvertPasswordFields(doc, 'segunda tentativa senha');
                          }
                        } catch (secondError) {
                          debugLog('EPT: Não foi possível acessar o iframe na segunda tentativa para senha (same-origin policy)');
                        }
                      }, 500);
                    } else if (iframe.name || iframe.id) {
                      debugLog(`EPT: iframe sem URL específica para senha, name: "${iframe.name}", id: "${iframe.id}"`);
                    }
                  }
                });
              }
            }
          };

          currentPasswordObserver = new MutationObserver(callback);
          currentPasswordObserver.observe(document.body, config);
        }
      }
  
      // Função legada mantida para compatibilidade (simplificada)
      function startObservingMinutaAssinar() {
        const config = { attributes: true, childList: true, subtree: true };
        const callback = function (mutationsList, observer) {
          for (let mutation of mutationsList) {
            if (mutation.type === "childList") {
              const iframes = document.querySelectorAll("iframe");
              iframes.forEach((iframe) => {
                try {
                  const inputTxtSenha = iframe.contentDocument.getElementById("txtSenha");
                  if (inputTxtSenha) {
                    observer.disconnect();
                    inputTxtSenha.setAttribute("type", "password");
                  }
                } catch (error) {
                  // Erros esperados devido à política de same-origin
                }
              });
            }
          }
        };
  
        const observer = new MutationObserver(callback);
        observer.observe(document.body, config);
      }
    });
  }
  
  // Start the script and catch potential errors
  executeScript().catch(console.error);
  