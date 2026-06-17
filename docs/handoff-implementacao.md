# Handoff de implementação — Refatoração da tabela de minutas (EPT)

> Cole este prompt em um contexto limpo para iniciar a implementação.
> Plano completo: [`docs/plano-refatoracao-tabela-minutas.md`](./plano-refatoracao-tabela-minutas.md)

## Contexto

A extensão Chrome "Eproc Tunado" (MV3) reconstrói as linhas da tabela de minutas do eProc em [`ept.js`](../ept.js), dentro do laço `$("#tabelaMinutas tr:not(.infraTrOrdenacao)").each(...)` (~979). Hoje ela:

- Lê dados por índice fixo `td:eq(N)` (~1010-1036) — quebra quando o usuário muda as colunas via "critérios de exibição".
- Filtra botões só pelo `href` (~1040-1055) — botões AJAX (Conferir, Excluir, etc.) guardam a ação no atributo `acao` do `<img>`, então o "Conferir" some, e o "Editar" das sentenças (AJAX no eProc novo) também.
- Remove colunas com índices hardcoded até `td:eq(20)` (~1196-1201 e ~1228-1231).

Sintomas confirmados em teste: dados trocados no rodapé, células vazias, `#divListaRecursosMinuta` duplicado e exibição de `undefined`.

## Regras de execução (OBRIGATÓRIAS)

1. **Um passo por vez.** Ao terminar um passo, PARE e peça validação do usuário no frontend (Chrome, na tabela de minutas real). Só avance após o "ok" explícito.
2. **Sem regressão.** Cada passo deve manter tudo o que já funcionava.
3. **Independência de colunas.** A extensão deve funcionar com qualquer combinação de critérios de exibição (nenhum, todos, intermediários).
4. **Nunca exibir `undefined`.** Dado/coluna ausente -> omitir (string vazia).
5. **DRY.** Reaproveitar helpers.
6. **Não alterar** o comportamento do botão "edição rápida".
7. Marque os checkboxes deste arquivo conforme concluir cada item.

## Fatos do eProc (referência rápida)

- Colunas sempre presentes: checkbox, **Tipo**, **Código**, **Nro. processo**, **Recursos disponíveis**.
- "Recursos disponíveis" é **sempre a última** coluna.
- Nenhum critério marcado -> `Tipo, Código, Nro. processo, Recursos disponíveis`.
- Todos marcados -> `Tipo, Código, Órgão, Juízo Processo, Nro. processo, Cod. assunto, Assunto, Usuário, Data criação, Status, Data do status, Assinante indicado, Assinante(s) efetivo(s), Agendamento, Localizadores, Situação do processo, Nº Dias situação, Classe do processo, Classificações, Descrição, Destinatário, Juízo de Origem, Validade, Precedente Relevante, Recursos disponíveis`.
- Mapear colunas pelo `infraAcaoOrdenar('CAMPO', ...)` do `<th>` (chave estável); rótulo limpo em `td.infraTdRotuloOrdenacao` (o texto bruto do `<th>` inclui as setas de ordenação).
- Âncoras por linha: conteúdo = `td` com `.linkMinuta`; recursos = `td` com `#divListaRecursosMinuta` (fallback: último `td`); checkbox = `td` com `.infraCheckbox` (fallback: primeiro `td`).

---

## Passo 1 — Mapa de colunas + leitura/colapso robustos (modo curado)

Objetivo: a reconstrução atual (curada) passa a funcionar para qualquer seleção de colunas, sem `undefined`, sem células vazias e sem ID duplicado. (Ainda sem mudar a lógica de quais botões aparecem e sem a nova opção.)

- [x] Criar helper `EPT_buildColumnMap(table)` (chaves: `checkbox, tipo, codigo, orgao, juizo, processo, cod_assunto, usuario, criacao, status, assinante_indicado, agendamento, localizadores, recursos`).
- [x] Criar helper `EPT_getCellText(row, columnMap, key)` que retorna `""` se a coluna não existir.
- [x] Criar helper `EPT_collapseRow(row, { contentTd, keepRecursosTd })` (remove demais `td`, ajusta `colspan`).
- [x] Calcular `columnMap` e `totalCols` uma vez, antes do `.each`.
- [x] Substituir as leituras `td:eq(N)` (processo, orgao, usuario, criacao, status) por `EPT_getCellText`.
- [x] Usar âncoras estruturais (`contentTd`, `recursosTd`, `checkboxTd`) em vez de índices.
- [x] Substituir as duas remoções hardcoded de colunas por `EPT_collapseRow`.
- [x] Ajustar o cabeçalho (atual ~992-998) para manter checkbox + "Prévia" via mapa (sem índices).
- [x] Garantir omissão limpa quando órgão/usuário/criação/status não existirem.

Validação no frontend (PARE e peça ok):

- [x] Com **nenhum** critério marcado: linha reconstruída correta, sem `undefined`, sem células vazias.
- [x] Com **todos** os critérios marcados: dados corretos no rodapé (status e servidor certos), sem células vazias, sem `#divListaRecursosMinuta` duplicado.
- [x] Com seleção intermediária: idem.
- [x] Botões essenciais continuam aparecendo como antes (sem regressão).
- [x] "Edição rápida" abre o modal e salva normalmente.

> Correção adicional do Passo 1 (regressão de estilo): `enhanceMinutaContent` em [`table-injector.js`](../table-injector.js) localizava a célula de conteúdo por `td[colspan="12"]` (valor fixo). Com o `colspan` agora dinâmico (`EPT_collapseRow`), o seletor passou a `td[colspan]`, restaurando as classes `.ept-minuta-*` e a estilização dos botões/rodapé.

---

## Passo 2 — Detecção robusta de botões

Objetivo: corrigir o sumiço de "Editar"/"Conferir" detectando a ação por `href` + atributo `acao` do `<img>` + `alt`.

- [x] Criar helper `EPT_getButtonAction(aEl)` (href -> `acao` do img -> alt/tooltip).
- [x] Criar helper `EPT_isEssentialAction(action, aEl)` (whitelist: editar [`minuta_verificar_agendamento`/`minuta_editar`/alt "Editar minuta"], `minuta_assinar`, `minuta_conferir`, `minuta_devolver`, `minuta_lembrete_cadastrar`).
- [x] Substituir o filtro por `href` (~1040-1055) pela iteração usando os novos helpers.

> Nota: além dos helpers, cada botão essencial recebe `data-ept-action` (categoria: editar/assinar/devolver/lembrete) e as regras de [`table-styles.css`](../table-styles.css) passaram de `a[href*="..."]` para `a[data-ept-action="..."]`. Isso era necessário para o "Editar" AJAX (sem `href` correspondente) aparecer e ficar estilizado; a regra de ocultação também passou a usar `:not([data-ept-action])`.
>
> Decisão do usuário: "Conferir" (`minuta_conferir`) fica **oculto** no rodapé curado — muda de estado ao clicar (altera o status da minuta) e deve permanecer junto do "encaminhar para conferência". Quem precisar dele usará a célula original preservada pela opção "Manter botões originais" (Passo 3).

Validação no frontend (PARE e peça ok):

- [x] "Conferir" fica **oculto** no rodapé curado (decisão do usuário — fica reservado para a célula original do Passo 3).
- [x] "Editar" aparece (inclusive testar/observar em minuta de sentença, se possível).
- [x] Botões não essenciais continuam ocultos.
- [x] Sem regressão nos demais botões e na "edição rápida".

---

## Passo 3 — Opção "Manter botões originais" (`ept_keep_actions`, padrão OFF)

Objetivo: permitir preservar a célula original de recursos intacta ao final da `tr`.

- [x] [`popup.html`](../popup.html): novo `feature-item` `button#toggle-ept_keep_actions` (classe inicial `toggle-off`), título "Manter botões originais", descrição curta.
- [x] [`toggle.js`](../toggle.js): adicionar `"ept_keep_actions"` em `variables` e na referência de botões.
- [x] [`ept.js`](../ept.js): adicionar `"ept_keep_actions"` ao `getStorageData` e ler no bloco `ept_tabletext`.
- [x] Criar helper `EPT_createQuickEditLink()`.
- [x] Ramificar a montagem do rodapé/colapso por modo:
  - [x] OFF (curado): comportamento dos Passos 1-2.
  - [x] ON (manter original): rodapé só com "edição rápida" (link standalone) + info do servidor; `EPT_collapseRow(..., { keepRecursosTd })`; cabeçalho mantém também o `<th>` "Recursos disponíveis".
- [x] Garantir `#divListaRecursosMinuta` único em ambos os modos.

> Nota: o container de ações no rodapé recebeu a classe `ept-acoes-minuta` e os seletores de [`table-styles.css`](../table-styles.css) passaram de `#divListaRecursosMinuta` para `.ept-acoes-minuta`, para estilizar a "edição rápida" standalone do modo ON. No modo ON, o `colspan` da prévia no cabeçalho é ajustado para alinhar o `<th>` "Recursos" com a célula preservada.

Validação no frontend (PARE e peça ok):

- [x] Flag OFF: idêntico aos Passos 1-2.
- [x] Flag ON: última célula com TODOS os botões originais funcionando; "edição rápida" permanece no rodapé do texto.
- [x] Alternar a flag e recarregar funciona nos dois sentidos.
- [x] Independência de colunas mantida em ambos os modos.

---

## Passo 4 — Versão, changelog e QA final

- [x] Bump de `version` em [`manifest.json`](../manifest.json) (0.0.11 → **0.0.12**).
- [x] Entrada nova em [`changelog.html`](../changelog.html) (v0.0.12 + badge + funcionalidade na lista).
- [x] Atualizar seção de changelog do [`README.md`](../README.md) (+ seletores `data-ept-action`).
- [~] Ajuste mínimo opcional em [`table-styles.css`](../table-styles.css): dispensado — a célula preservada usa estilos nativos (validado no Passo 3).

Validação no frontend (PARE e peça ok):

- [x] Changelog abre corretamente.
- [x] QA final cruzando: {nenhum, todos, intermediário} x {flag OFF, flag ON}.

---

## Checklist de regressão (rodar ao fim de cada passo)

- [x] Lista de minutas exibe a prévia do texto corretamente.
- [x] "Edição rápida" abre, salva e desbloqueia.
- [x] Links `linkMinuta` ocultos preservados (visualizar nativo funciona).
- [x] Nenhum `undefined` em tela.
- [x] Sem erros no console.
- [x] Botão "Retunar" e observadores de tabela seguem funcionando.

## Checklist de independência de colunas

- [x] Nenhum critério marcado.
- [x] Todos os critérios marcados.
- [x] Pelo menos uma seleção intermediária (ex.: sem "Status" e sem "Usuário criador").

---

## ✅ Status: PLANO EXECUTADO (v0.0.12)

Todos os Passos 1–4 foram implementados e validados no frontend. Pacote
`eproc-tunado-0.0.12.zip` gerado para a Chrome Web Store. Decisão registrada:
o botão "Conferir" fica oculto no rodapé curado (disponível na célula original
via opção "Manter botões originais").
