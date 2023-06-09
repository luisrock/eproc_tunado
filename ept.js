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
  ]);

  // If extension is not enabled, log message and terminate
  if (!data.ept_enabled) {
    console.log("EPT desabilitado!");
    return;
  }

  // Otherwise, start script
  console.log("EPT habilitado!");
  $(document).ready(async function () {
    // Handle password setting
    const ept_passwordData = await getStorageData("ept_password");
    if (ept_passwordData.ept_password) {
      // console.log('password to work');
      let pwdSenha = $("input#pwdSenha");
      console.log(pwdSenha);
      if (pwdSenha) {
        pwdSenha.attr("type", "password");
      }
      //observer at the end, if this doesnt work (when inside an iframe that you'll open laterm it needs an observer)
      let txtSenha = $("input#txtSenha");
      console.log(txtSenha);
      if (txtSenha) {
        txtSenha.attr("type", "password");
      }
    }

    // console.log(ept_passwordData);

    // Handle ept_focus setting
    const ept_focusData = await getStorageData("ept_focus");
    if (ept_focusData.ept_focus) {
      // console.log('focus to work');
      $("#frmMinutaLista").children(":not(#divInfraAreaTabela)").hide();
    }

    // console.log(ept_focusData);

    // Handle actions setting
    const ept_actionsData = await getStorageData("ept_actions");
    if (ept_actionsData.ept_actions) {
      // console.log('actions to work');
      $("#divBarraComandosTabela")
        .children(":not(#btnVisualizar):not(#btnAssinar)")
        .hide();
    }

    // console.log(ept_actionsData);

    // Handle text setting
    const ept_tabletextData = await getStorageData("ept_tabletext");

    // console.log(ept_tabletextData);

    if (ept_tabletextData.ept_tabletext) {
      // console.log('text to work');

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
          //row.children('th:eq(1),th:eq(3),th:eq(4),th:eq(5),th:eq(6),th:eq(7),th:eq(8),th:eq(9),th:eq(10),th:eq(11),th:eq(12)').remove();
          th.attr("width", "70%").html(lThContent);
        }

        let tdProcesso = row.children("td:eq(5)");
        let linkProcesso = tdProcesso.children("a");
        let processo = tdProcesso.html();

        let tdOrgao = row.children("td:eq(3)");
        let orgao = tdOrgao.text();

        let servidor = "";
        let tdServidor = row.children("td:eq(6)");
        if (tdServidor) {
          let labelServidor = tdServidor.children("label");
          if (labelServidor) {
            let onMouseServidor = labelServidor.attr("onmouseover");
            if (onMouseServidor) {
              servidor = onMouseServidor.split("('").pop().split("<br/>")[0];
              //servidor = onMouseServidor;
            }
          }
        }

        let status = "";
        let tdStatus = row.children("td:eq(8)");
        let labelStatus = tdStatus.children("label");
        status = labelStatus.text().replace(/ *\([^)]*\) */g, "");

        let tdCriacao = row.children("td:eq(7)");
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
              .html(cabecalho + section.innerHTML + footer);
            row
              .children(
                "td:eq(1),td:eq(3),td:eq(4),td:eq(5),td:eq(6),td:eq(7),td:eq(8),td:eq(9),td:eq(10),td:eq(11),td:eq(12)"
              )
              .remove();
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

      document.addEventListener("click", function (event) {
        const link = event.target.closest("a");
        if (
          link &&
          link.href.includes(
            "controlador.php?acao=minuta_verificar_agendamento"
          )
        ) {
          // console.log('clicked on link to observer...');
          startObserving();
        }
      });
    }

    function startObserving() {
      const config = { attributes: true, childList: true, subtree: true };
      const callback = function (mutationsList, observer) {
        for (let mutation of mutationsList) {
          if (mutation.type === "childList") {
            const iframes = document.querySelectorAll("iframe");
            iframes.forEach((iframe) => {
              try {
                const btnManterAgendamento =
                  iframe.contentDocument.getElementById("btnManterAgendamento");
                if (btnManterAgendamento) {
                  observer.disconnect();
                  btnManterAgendamento.click();
                  // console.log('clicked on btnManterAgendamento');
                }
              } catch (error) {
                // It might throw errors when accessing contentDocument due to same-origin policy,
                // this is expected and can be ignored.
              }
            });
          }
        }
      };

      const observer = new MutationObserver(callback);
      observer.observe(document.body, config);
    }

    //Iframe para assinar minuta(s). permitir armazensamento de senha
    if (ept_passwordData.ept_password) {
      document.addEventListener("click", function (event) {
        const link = event.target.closest("a");
        const button = event.target.closest("button");
        if (
          (link && link.href.includes("controlador.php?acao=minuta_assinar")) ||
          (button && button.id === "btnAssinar")
        ) {
          startObservingMinutaAssinar();
        }
      });
    }

    function startObservingMinutaAssinar() {
      const config = { attributes: true, childList: true, subtree: true };
      const callback = function (mutationsList, observer) {
        for (let mutation of mutationsList) {
          if (mutation.type === "childList") {
            const iframes = document.querySelectorAll("iframe");
            iframes.forEach((iframe) => {
              try {
                const inputTxtSenha =
                  iframe.contentDocument.getElementById("txtSenha");
                if (inputTxtSenha) {
                  observer.disconnect();
                  //give it an attribute of type = password
                  inputTxtSenha.setAttribute("type", "password");
                }
              } catch (error) {
                // It might throw errors when accessing contentDocument due to same-origin policy,
                // this is expected and can be ignored.
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
