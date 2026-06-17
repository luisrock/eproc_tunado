# Plano: Refatoração da reconstrução da linha da tabela de minutas

> ✅ **Status: EXECUTADO (v0.0.12).** Passos 1–4 implementados e validados no
> frontend. Ajuste de escopo: o botão "Conferir" fica oculto no rodapé curado
> (disponível na célula original via opção "Manter botões originais").
> Detalhes e checklists no [handoff](./handoff-implementacao.md).

## Objetivo

Tornar a reconstrução da linha da tabela de minutas (em [`ept.js`](../ept.js)) robusta a qualquer combinação de critérios de exibição de colunas do eProc, corrigir o sumiço dos botões "Editar"/"Conferir" e adicionar uma opção de configuração para preservar a célula original de "Recursos disponíveis" intacta ao final da linha.

Requisitos inegociáveis:

- Sem regressão de funcionalidades.
- A extensão deve funcionar independentemente dos critérios de seleção de colunas do usuário.
- Nunca exibir `undefined`: se um dado/coluna não estiver presente, simplesmente omitir.
- DRY sempre que possível.
- Não alterar o comportamento do botão "edição rápida".

## Arquivos envolvidos

- [`ept.js`](../ept.js) — script principal; contém o laço de transformação.
- [`toggle.js`](../toggle.js) — controle dos toggles da popup.
- [`popup.html`](../popup.html) — UI da popup.
- [`background.js`](../background.js) — service worker (provavelmente sem mudanças).
- [`table-styles.css`](../table-styles.css) — estilos customizáveis (ajuste mínimo opcional).
- [`manifest.json`](../manifest.json), [`changelog.html`](../changelog.html), [`README.md`](../README.md) — versão e changelog.

## Diagnóstico

A transformação ocorre em [`ept.js`](../ept.js) no laço `$("#tabelaMinutas tr:not(.infraTrOrdenacao)").each(...)` (a partir de ~979). Três fragilidades:

1. **Filtro de botões só por `href`** (linhas ~1040-1055): botões AJAX (Conferir, Excluir, etc.) usam `href="javascript:void(0)"` e guardam a ação no atributo `acao` do `<img>` interno. Por isso o "Conferir" fica oculto hoje e o "Editar" das sentenças (que no eProc atualizado virou AJAX/Material icon) some, sobrando apenas a "edição rápida".
2. **Leitura de dados por índice fixo** `td:eq(N)` (linhas ~1010-1036): quebra quando o usuário personaliza as colunas.
3. **Remoção de colunas hardcoded** até `td:eq(20)` (linhas ~1196-1201 e ~1228-1231).

### Evidência (teste do usuário com todas as colunas marcadas)

- Dados errados no rodapé: status virou `17/06/2026` e servidor virou `Indenização por dano moral...` (colunas deslocadas).
- Células vazias surgiram no meio da `tr` (`<td></td><td></td>`).
- A célula de recursos sobrou ao final, gerando um **`#divListaRecursosMinuta` duplicado** (um no rodapé montado pela extensão e outro na célula original).

Conclusão: localizar células por ordem é inviável. Mapear por cabeçalho + âncoras de conteúdo.

## Invariantes e fatos do eProc

- A primeira `<tr>` da tabela contém os `<th>` com os rótulos das colunas. O cabeçalho reflete automaticamente o que o usuário marca em `divCriteriosExibicao`.
- Colunas **sempre presentes** (não controladas pelos critérios): checkbox (seleção), **Tipo**, **Código**, **Nro. processo**, **Recursos disponíveis**.
- A coluna **"Recursos disponíveis" é sempre a última**.
- Ordem com **nenhum** critério marcado: `Tipo, Código, Nro. processo, Recursos disponíveis` (mais o checkbox inicial).
- Ordem com **todos** os critérios marcados: `Tipo, Código, Órgão, Juízo Processo, Nro. processo, Cod. assunto, Assunto, Usuário, Data criação, Status, Data do status, Assinante indicado, Assinante(s) efetivo(s), Agendamento, Localizadores, Situação do processo, Nº Dias situação, Classe do processo, Classificações, Descrição, Destinatário, Juízo de Origem, Validade, Precedente Relevante, Recursos disponíveis`.
- Os rótulos de colunas ordenáveis vêm cercados de textos das setas (ex.: "Ordenar Agendamento Ascendente Agendamento Ordenar Agendamento Descendente"). Portanto, **não** usar o texto bruto do `<th>`; o rótulo limpo está em `td.infraTdRotuloOrdenacao` dentro do `<th>`.
- Identificador estável por coluna: o `onclick="infraAcaoOrdenar('CAMPO', ...)"` do link de ordenação. É a chave primária de mapeamento.

## Estratégia

Ancorar tudo em referências estruturais (classes/IDs) e em um mapa de colunas derivado do cabeçalho. Nada de índices fixos.

### Mapa de colunas (`EPT_buildColumnMap`)

Varre os `<th>` do cabeçalho, na ordem, e cria `{ chave -> índice }`. Para cada `<th>`:

- Se contém `#lnkInfraCheck` -> `checkbox`.
- Senão, se há `infraAcaoOrdenar('CAMPO', ...)`, mapear `CAMPO` para a chave semântica:
  - `DesTipoDocumentoMinuta` -> `tipo`
  - `CodDocumento` -> `codigo`
  - `SigOrgao` -> `orgao`
  - `SigOrgaoJuizoProcesso` -> `juizo`
  - `NumProcesso` -> `processo`
  - `CodAssuntoPrincipal` -> `cod_assunto`
  - `IdentPrincipalUsuarioInclusao` -> `usuario`
  - `Inclusao` -> `criacao`
  - `DesStatusMinuta` -> `status`
  - `IdentPrincipalUsuarioAssinanteIndicado` -> `assinante_indicado`
  - `IdMinutaAgendamento` -> `agendamento`
  - `SigLocalizadorPrincipal` -> `localizadores`
  - (demais campos podem ser mapeados, mas só os acima são usados)
- Fallback por texto de `td.infraTdRotuloOrdenacao` quando não houver link de ordenação.
- `recursos`: garantido por dupla via — `<th>` cujo rótulo contém "Recursos" E/OU a **última coluna**.

A extensão usa de fato: `processo` (sempre presente), `orgao`, `usuario`, `criacao`, `status` (opcionais). Qualquer ausência -> omitir (string vazia), nunca `undefined`.

### Âncoras estruturais por linha (sem índices)

- `contentTd = row.find('.linkMinuta').closest('td')` (coluna Código, sempre presente).
- `recursosTd = row.find('#divListaRecursosMinuta').closest('td')` com fallback para `row.children('td').last()`.
- `checkboxTd = row.find('.infraCheckbox').closest('td')` com fallback para o primeiro `td`.

### Helpers DRY (no topo de `ept.js`, junto aos demais `EPT_*`)

- `EPT_buildColumnMap(table)` — descrito acima.
- `EPT_getCellText(row, columnMap, key)` — retorna texto da célula por chave, ou `""` se ausente (regra omitir-não-undefined).
- `EPT_getButtonAction(aEl)` — extrai a ação do `<a>` na ordem: regex `acao=([a-z_]+)` no `href`; senão atributo `acao` do `<img>` interno; senão `alt`/tooltip do `<img>`.
- `EPT_isEssentialAction(action, aEl)` — whitelist: `minuta_verificar_agendamento`/`minuta_editar` (Editar), `minuta_assinar`, `minuta_conferir`, `minuta_devolver`, `minuta_lembrete_cadastrar`; "Editar" também aceito por `alt="Editar minuta"`.
- `EPT_createQuickEditLink()` — cria o `<a class="infraLink ept-btn-edicao-rapida" data-ept-quick-edit="true">edição rápida</a>` (extrai a criação hoje embutida em ~1058-1067, sem alterar comportamento).
- `EPT_collapseRow(row, { contentTd, keepRecursosTd })` — mantém checkbox + `contentTd` (+ `recursosTd` quando pedido), remove os demais `td`, e ajusta `colspan` do `contentTd` para cobrir as colunas removidas. Substitui as duas remoções hardcoded.

## Modos de operação

Decisão por linha conforme a flag `ept_keep_actions`:

- **Curado (padrão, flag OFF)** — comportamento atual: detecta ações, oculta as não essenciais, monta o rodapé com os botões curados dentro de `#divListaRecursosMinuta` + "edição rápida"; colapsa mantendo checkbox + conteúdo. Correção intencional: "Conferir"/"Editar" AJAX passam a aparecer.
- **Manter original (flag ON)** — preserva a célula original de "Recursos disponíveis" como último `td` (todos os botões intactos); o rodapé da célula de texto recebe **apenas** a "edição rápida" (link standalone, sem clonar `divListaRecursosMinuta`) + a info do servidor; colapsa mantendo checkbox + conteúdo + recursos. No cabeçalho, manter também o `<th>` "Recursos disponíveis" ao final.

Em ambos os modos o `#divListaRecursosMinuta` permanece único (fim do bug de ID duplicado).

## Flag de configuração `ept_keep_actions` (padrão DESLIGADO)

- [`popup.html`](../popup.html): novo `feature-item` com `button#toggle-ept_keep_actions` (classe inicial `toggle-off`), título "Manter botões originais", descrição curta.
- [`toggle.js`](../toggle.js): adicionar `"ept_keep_actions"` à lista `variables` (~111) e à referência de botões (~165). `undefined` já é tratado como OFF por `toggleOnOff`.
- [`ept.js`](../ept.js): adicionar `"ept_keep_actions"` à lista de `getStorageData` (~873-881) e ler dentro do bloco `ept_tabletext`.
- **Não** usar `checkAndSetDefault` (que assume `true`) para esta flag — garante padrão `false` e zero regressão. Sem mudanças em [`background.js`](../background.js).

## Garantias / não-regressão

- "Edição rápida" (handler delegado em `.ept-btn-edicao-rapida`, `handleQuickEditClick`) inalterada; só sua criação vira helper.
- Modo curado preserva o comportamento atual, exceto pela correção que faz "Conferir"/"Editar" AJAX aparecerem.
- Preservação dos `linkMinuta` ocultos (compatibilidade eProc 9.15) mantida.
- Robustez validada contra: nenhum critério marcado, todos marcados, e seleções intermediárias.
- Nenhum `undefined` na UI: dados ausentes são omitidos.

## Validação (visão geral; detalhe no handoff)

Implementação incremental, **um passo por vez**, com pedido de validação no frontend antes de avançar:

1. Mapa de colunas + leitura/colapso robustos (modo curado), sem `undefined`, para qualquer seleção de colunas.
2. Detecção robusta de botões (Conferir/Editar AJAX aparecem).
3. Flag + UI + modo "Manter botões originais".
4. Versão, changelog e QA final.
