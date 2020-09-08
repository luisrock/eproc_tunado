chrome.storage.sync.get('enabled', data => {
    if (data.enabled) {
        // console.log(data);
        // console.log(data.enabled);
        console.log('EPT habilitado!');

        
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    //     var myTabId = tabs[0].id;
    //     chrome.tabs.sendMessage(myTabId, {text: "hi"}, function(response) {
    //         alert(response);
    //     });
    // });


        $( document ).ready(function() {

            chrome.storage.sync.get('password', data => {
                if (data.password) {
                    //login e senha (permitir que o Chrome armazene)
                    $('input#pwdSenha').attr('type', 'password');
                    $('input#txtSenha').attr('type', 'password');
                } 
            }); //end password

            chrome.storage.sync.get('focus', data => {
                if (data.focus) {
                    //esconder tudo o que não estiver na tabela de minutas
                    $("#frmMinutaLista").children(":not(#divInfraAreaTabela)").hide(); 
                } 
            }); //end focus

            chrome.storage.sync.get('actions', data => {
                if (data.actions) {
                    //esconder botões, salvo Assinar e Visualizar
                    $("#divBarraComandosTabela").children(":not(#btnVisualizar):not(#btnAssinar)").hide(); 
                } 
            }); //end actions

            chrome.storage.sync.get('text', data => {
                if (data.text) {

                    //Buscando o texto de cada minuta da lista
                    //1. remover colunas indesejadas e buscar a URL do preview de texto
                    //2. adiciona coluna TEXTO
                    //3. fetch para cada URL usada no mouse hover do link com o código da minuta
                    //4. Agregar o resultado filtrado na <td> (coluna) de texto
                    $('#tabelaMinutas tr:not(.infraTrOrdenacao)').each(function() {
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
                        let th = row.children('th:eq(2)');
                        if(th) {
                        //primeira linha (título das colunas)
                        //row.children('th:eq(1),th:eq(3),th:eq(4),th:eq(5),th:eq(6),th:eq(7),th:eq(8),th:eq(9),th:eq(10),th:eq(11),th:eq(12)').remove();
                        th.attr('width','70%').html(lThContent);
                        } 

                        let tdProcesso = row.children('td:eq(4)');
                        let linkProcesso = tdProcesso.children('a');
                        let processo = tdProcesso.html();

                        let tdOrgao = row.children('td:eq(3)');
                        let orgao = tdOrgao.text();

                        let servidor = '';
                        let tdServidor = row.children('td:eq(6)');
                        if(tdServidor) {
                        let labelServidor = tdServidor.children('label');
                            if(labelServidor) {
                                let onMouseServidor = labelServidor.attr('onmouseover');
                                    if(onMouseServidor) {
                                        servidor = onMouseServidor.split("('").pop().split("<br/>")[0];
                                        //servidor = onMouseServidor;
                                    }
                            } 
                        }

                        let status = '';
                        let tdStatus = row.children('td:eq(8)');
                        let labelStatus = tdStatus.children('label');
                        status = labelStatus.text().replace(/ *\([^)]*\) */g, "");

                        let tdCriacao = row.children('td:eq(7)');
                        let criacao = tdCriacao.text();


                        let divBotoes = row.find('#divListaRecursosMinuta');
                        //por ora, mantendo apenas os botões de assinar, devolver, conferir e editar
                        divBotoes.children().each(function() {
                            if( !$(this).attr('href') 
                                || 
                                (
                                    $(this).attr('href').includes('acao=minuta_assinar') === false 
                                    && 
                                    $(this).attr('href').includes('acao=minuta_devolver') === false
                                    && 
                                    $(this).attr('href').includes('acao=minuta_conferir') === false  
                                    && 
                                    $(this).attr('href').includes('acao=minuta_verificar_agendamento') === false
                                ) 
                            ) 
                            {
                                $(this).css('display', 'none');
                            }
                        });
                        //armazenando os botões...
                        let botoes = divBotoes.html();

                        let l = row.find('.linkMinuta');
                        let urlPreview = l.attr('hrefpreview');
                        if(urlPreview) {

                            $.get( `https://eproc.jfrj.jus.br/eproc/${urlPreview}` )
                            .done(function( data ) {
                                var htmlObject = document.createElement('div');
                                htmlObject.innerHTML = data;
                                let titulo_raw = htmlObject.querySelector('p.titulo');
                                let titulo = titulo_raw.textContent;
                                let section = htmlObject.querySelector('section[data-estilo_padrao="paragrafo"]');
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
                                row.children('td:eq(2)').attr('align','left').attr('colspan', '12').css('padding','20px').html(cabecalho + section.innerHTML + footer);
                                row.children('td:eq(1),td:eq(3),td:eq(4),td:eq(5),td:eq(6),td:eq(7),td:eq(8),td:eq(9),td:eq(10),td:eq(11),td:eq(12)').remove();
                            });

                        } //end if(urlPreview)

                    }); //end foreach
                    //End texto de cada minuta da lista
                    $('#divBarraComandosTabela').append('<button onClick="window.location.reload();" style="margin-left:50px;background: #7dcfe2;color: #fcfdfe;padding: 2px; cursor:pointer;">Retunar tabela</button>');

                } //end if 
            }); //end text

            
            chrome.storage.sync.get('edit', data => {
                if (data.edit) {
                    $( "#btnManterAgendamento" ).trigger( "click" );
                } 
            }); //end edit
            
        });

    } else {
        // console.log(data);
        // console.log(data.enabled);
        console.log('EPT desabilitado!');
    }
});



