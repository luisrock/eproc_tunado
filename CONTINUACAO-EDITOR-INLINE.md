# 📋 Continuação: Editor Inline de Minutas - eProc Tunado

## 🎯 OBJETIVO DO PROJETO

Criar funcionalidade de **edição inline** de minutas jurídicas diretamente na tabela de minutas do eProc, sem precisar abrir o editor em outra página/aba. O editor deve salvar as alterações **SEM BLOQUEAR** a minuta para edições futuras.

---

## 🔍 CONTEXTO E DESCOBERTAS IMPORTANTES

### Sistema Target
- **eProc v9.15** - JFRJ (Justiça Federal do Rio de Janeiro)
- **EPT (eProc Tunado)** - Extensão Chrome existente v0.0.8
- jQuery já disponível no contexto da página

### Fluxo Normal de Edição (Atual)
1. Usuário clica em "Editar" na tabela de minutas
2. Abre nova aba com iframe contendo CKEditor
3. Usuário edita e clica em um dos botões:
   - **"Salvar"** → Salva MAS **BLOQUEIA** a minuta (problema!)
   - **"Salvar e Sair"** → Salva E **NÃO BLOQUEIA** (comportamento desejado!)
4. Editor fecha e retorna à lista

### 🚨 PROBLEMA CRÍTICO DESCOBERTO

**Após salvar com "Salvar" comum, a minuta fica BLOQUEADA:**
- Aparece ícone de cadeado na lista
- Tooltip: "Bloqueada por [usuário] - Data/hora: XX/XX/XXXX XX:XX:XX"
- Alert ao tentar editar novamente: "usuário mudou o perfil para [...]"
- **SOLUÇÃO**: O botão "Salvar e Sair" faz algo diferente que DESBLOQUEIA

### ⚡ DESCOBERTA CHAVE

A diferença entre "Salvar" e "Salvar e Sair" está na **sequência de ações após o salvamento**:
- "Salvar" → POST salvar → mantém sessão → minuta fica bloqueada
- "Salvar e Sair" → POST salvar → **[AÇÃO DESCONHECIDA]** → fecha aba → minuta desbloqueada

**NECESSIDADE ATUAL**: Descobrir qual é essa "ação desconhecida" que desbloqueia a minuta.

---

## 📡 API DE SALVAMENTO (DOCUMENTADA)

### Endpoint
```
POST controlador_ajax.php?acao_ajax=minuta_salvar&acao_origem=minuta_editar&hash={HASH}
```

### Hash
- **Formato**: MD5 de 32 caracteres hexadecimais (a-f0-9)
- **Extração**: Do atributo `hrefpreview` do link da minuta na tabela
- **Limpeza necessária**: Hash vem contaminado com lixo: `'hash', 1200, 700)`
- **Regex de limpeza**: `hash.replace(/[^a-f0-9]/gi, '').substring(0, 32)`

### Parâmetros POST (form-data)
```javascript
{
  id_minuta: "511762531516227673955969923666",  // ID único da minuta
  id_modelo_minuta: "51155916116320267493569895615",
  versao_conteudo_salvo: "5",  // Incrementa a cada save
  html_editor_minuta: "<conteúdo HTML/XML da minuta>"
}
```

### Validação XML Crítica
O campo `html_editor_minuta` deve ser **XHTML válido**:

#### ❌ Tags que causam erro:
```html
<br>        <!-- Self-closing sem barra -->
<hr>
<img src="...">
```

#### ✅ Tags corretas:
```html
<br />      <!-- Self-closing com barra -->
<hr />
<img src="..." />
```

#### Entidades HTML
O servidor **NÃO aceita** entidades nomeadas (`&nbsp;`, `&quot;`, etc).

**Conversão necessária**:
```javascript
const entityMap = {
  '&nbsp;': '&#160;',
  '&quot;': '&#34;',
  '&amp;': '&#38;',
  '&lt;': '&#60;',
  '&gt;': '&#62;',
  '&apos;': '&#39;'
};

html = html.replace(/&[a-z]+;/gi, match => entityMap[match] || match);
```

### Resposta de Sucesso
```json
{
  "sucesso": "1",
  "id_minuta_conteudo_salvo": "511762700213088067881063093191",
  "versao_conteudo_salvo": "6",
  "sin_texto_padrao": null
}
```

---

## 💻 CÓDIGO FUNCIONAL CRIADO

### Arquivo: `console-inline-editor.js` (672 linhas)

**Status**: ✅ Funciona perfeitamente MAS bloqueia minuta após salvar

**Funcionalidades implementadas**:
1. ✅ Adiciona botão "Editar Inline" em cada linha da tabela
2. ✅ Modal responsivo com overlay
3. ✅ Carrega conteúdo da minuta via `hrefpreview` (método seguro do EPT)
4. ✅ Renderiza HTML usando `contenteditable` div
5. ✅ Salva via POST com hash correto
6. ✅ Validação XML (XHTML + conversão de entidades)
7. ✅ Atualiza versão automaticamente
8. ❌ **PROBLEMA**: Replica comportamento do "Salvar" (bloqueia minuta)

**Estrutura do Modal**:
```javascript
const modalHtml = `
  <div id="ept-inline-editor-overlay">
    <div id="ept-inline-editor-modal">
      <div class="ept-modal-header">
        <h2>Editar Minuta - Processo ${processNumber}</h2>
        <button class="ept-modal-close">×</button>
      </div>
      <div class="ept-modal-body">
        <div id="ept-editor-container" contenteditable="true"></div>
      </div>
      <div class="ept-modal-footer">
        <button id="ept-btn-voltar">Voltar</button>
        <button id="ept-btn-salvar">Salvar</button>
      </div>
    </div>
  </div>
`;
```

**Função de Salvamento**:
```javascript
function saveMinuta() {
  const editableDiv = $('#ept-editor-container');
  let htmlContent = editableDiv.html();
  
  // Validação XHTML
  htmlContent = htmlContent.replace(/<(br|hr|img[^>]*)>/gi, '<$1 />');
  
  // Conversão de entidades
  htmlContent = htmlContent.replace(/&nbsp;/g, '&#160;')
                           .replace(/&quot;/g, '&#34;')
                           .replace(/&amp;/g, '&#38;')
                           .replace(/&lt;/g, '&#60;')
                           .replace(/&gt;/g, '&#62;')
                           .replace(/&apos;/g, '&#39;');
  
  const formData = {
    id_minuta: currentMinutaData.id,
    id_modelo_minuta: currentMinutaData.modeloId,
    versao_conteudo_salvo: currentMinutaData.version,
    html_editor_minuta: htmlContent
  };
  
  const saveUrl = `controlador_ajax.php?acao_ajax=minuta_salvar&acao_origem=minuta_editar&hash=${currentMinutaData.hash}`;
  
  $.post(saveUrl, formData, function(response) {
    // Sucesso!
  });
}
```

---

## 🔬 TENTATIVAS DE CAPTURA DO "SALVAR E SAIR"

### Problema
O botão "Salvar e Sair" fecha a aba automaticamente após salvar, impossibilitando capturar no DevTools quais requisições são feitas.

### Tentativas Realizadas

#### 1️⃣ Script de Captura v1 (`debug-capture-save-and-exit.js`)
- Intercepta XHR e Fetch
- Salva em `localStorage` a cada 500ms
- **Resultado**: localStorage vazio (aba fecha rápido demais)

#### 2️⃣ Script de Captura v2 (`debug-capture-save-and-exit-v2.js`)
- Save a cada 300ms
- Dupla garantia: localStorage + sessionStorage
- Save múltiplo (3x) ao detectar clique em "Salvar"
- Save 5x no evento `beforeunload`
- **Resultado**: Ainda não testado completamente

### Eventos Monitorados
```javascript
- click (em qualquer botão com "salvar")
- beforeunload (antes de fechar aba)
- unload (ao fechar aba)
- pagehide (alternativa ao unload)
- visibilitychange (quando aba fica invisível)
```

---

## 🎯 PRÓXIMOS PASSOS

### Prioridade 1: Capturar Comportamento "Salvar e Sair"

**Abordagem Recomendada**:

1. **Usar Network Tab do DevTools com "Preserve Log"**:
   ```
   - F12 → Network → ☑️ Preserve log
   - Clicar "Salvar e Sair"
   - Copiar todas as requisições antes da aba fechar
   ```

2. **Alternativa: Usar Proxy (Burp Suite / Charles)**:
   - Interceptar TODAS as requisições HTTP
   - Comparar diferença entre "Salvar" vs "Salvar e Sair"

3. **Inspecionar Código-Fonte do eProc**:
   - Buscar função JavaScript do botão "Salvar e Sair"
   - Arquivo provável: `minuta_editar.js` ou similar
   - Procurar por: `salvareSair`, `fecharJanela`, `desbloquearMinuta`

### Hipóteses a Investigar

**Hipótese A: Requisição de Unlock**
```
Possível endpoint: controlador_ajax.php?acao_ajax=minuta_desbloquear
```

**Hipótese B: Parâmetro Especial**
```
Diferença pode estar em parâmetro adicional no POST:
- alterarstatus=1
- sin_fechar=S
- sin_desbloquear=S
```

**Hipótese C: Sequência de Timing**
```
Pode precisar aguardar resposta do save antes de desbloquear:
1. POST minuta_salvar (aguardar resposta)
2. POST [ação desconhecida] (desbloquear)
3. Fechar aba
```

**Hipótese D: Cookie/Session Cleanup**
```
Pode ser que "Salvar e Sair" limpe algum cookie/session que indica "em edição"
```

### Prioridade 2: Implementar Desbloqueio

Após descobrir a ação de desbloqueio, modificar `console-inline-editor.js`:

```javascript
function saveMinuta() {
  const formData = { /* ... */ };
  const saveUrl = `controlador_ajax.php?acao_ajax=minuta_salvar&acao_origem=minuta_editar&hash=${hash}`;
  
  $.post(saveUrl, formData, function(response) {
    if (response.sucesso === '1') {
      // 🎯 ADICIONAR AQUI: Ação de desbloqueio
      // Ex: $.post('controlador_ajax.php?acao_ajax=minuta_desbloquear&id_minuta=XXX&hash=YYY');
      
      alert('✅ Minuta salva com sucesso!');
      closeModal();
    }
  });
}
```

### Prioridade 3: Integração Final

1. Mover código para arquivo separado: `inline-editor.js`
2. Adicionar ao `manifest.json`:
   ```json
   {
     "content_scripts": [{
       "matches": ["*://eproc.jfrj.jus.br/eproc/controlador.php?acao=minuta_area_trabalho*"],
       "js": ["jquery.js", "inline-editor.js"],
       "css": ["inline-editor.css"]
     }]
   }
   ```
3. Criar CSS dedicado para modal
4. Adicionar opção de configuração no `popup.html`
5. Testar com múltiplas minutas
6. Versão final: Integrar CKEditor para edição rica

---

## 📂 ARQUIVOS IMPORTANTES

### Código Funcional (mas bloqueia)
- **`console-inline-editor.js`** (672 linhas) - Editor completo, pronto para integração

### Scripts de Captura
- **`debug-capture-save-and-exit.js`** (375 linhas) - v1
- **`debug-capture-save-and-exit-v2.js`** (novo) - v2 agressiva

### Dados Capturados
- **`ept-capture-1762628414393.json`** - Primeira captura (antes de descobrir o problema)
- **`eproc-save-and-exit-1762699077822.json`** - Captura da página LISTA (não do editor)

### Estrutura EPT Existente
```
eproc_tunado/
├── manifest.json       # Manifesto da extensão
├── background.js       # Service worker
├── ept.js              # Lógica principal do EPT
├── ept.css             # Estilos
├── jquery.js           # jQuery 3.x
├── popup.html          # Interface de configuração
├── toggle.js           # Toggle de funcionalidades
├── table-injector.js   # Injetor de tabelas
└── table-styles.css    # Estilos de tabelas
```

---

## 🔧 COMANDOS ÚTEIS

### Limpar localStorage no Console
```javascript
localStorage.clear();
sessionStorage.clear();
```

### Verificar dados capturados
```javascript
Object.keys(localStorage).filter(k => k.startsWith('EPT_CAPTURED'))
```

### Extrair hash de um link
```javascript
const link = document.querySelector('.linkMinuta');
const hrefpreview = link.getAttribute('hrefpreview');
const hashMatch = hrefpreview.match(/hash=([a-f0-9]+)/i);
const hash = hashMatch[1].replace(/[^a-f0-9]/gi, '').substring(0, 32);
console.log(hash);
```

### Testar conversão de entidades
```javascript
const html = '<p>Teste&nbsp;com&nbsp;espaços</p>';
const converted = html.replace(/&nbsp;/g, '&#160;');
console.log(converted); // <p>Teste&#160;com&#160;espaços</p>
```

---

## 📚 REFERÊNCIAS TÉCNICAS

### API eProc Documentada
```
GET  controlador.php?acao=minuta_visualizar_conteudo&id_minuta=XXX&pre_visualizar=sim&hash=YYY
     → Retorna HTML da minuta

POST controlador_ajax.php?acao_ajax=minuta_salvar&acao_origem=minuta_editar&hash=ZZZ
     → Salva minuta (versao_conteudo_salvo incrementa)

POST controlador_ajax.php?acao_ajax=atualizar_info_minuta&hash=AAA
     → Atualiza informações da linha da tabela
```

### Estrutura de Dados da Minuta
```javascript
{
  id: "511762531516227673955969923666",           // ID da minuta
  modeloId: "51155916116320267493569895615",      // ID do modelo
  version: "5",                                    // Versão atual
  hash: "a1cc5f8b915279c6d81447ad52f5847e",       // Hash MD5
  processNumber: "0136076-37.2015.4.02.5101",     // Número do processo
  content: "<html>...</html>"                      // Conteúdo HTML
}
```

### Headers Importantes
```
Content-Type: application/x-www-form-urlencoded
X-Requested-With: XMLHttpRequest (para AJAX)
```

---

## 🎬 PROMPT PARA PRÓXIMO MODELO

```
Olá! Preciso que você continue o desenvolvimento de uma funcionalidade de edição inline de minutas jurídicas para a extensão Chrome "eProc Tunado".

CONTEXTO COMPLETO:
- Leia o arquivo CONTINUACAO-EDITOR-INLINE.md que contém TODAS as descobertas
- Temos um editor funcional em console-inline-editor.js que FUNCIONA mas BLOQUEIA a minuta após salvar
- Descobrimos que o botão "Salvar e Sair" do eProc faz algo especial que DESBLOQUEIA a minuta
- Tentamos capturar o comportamento mas a aba fecha rápido demais

SUA MISSÃO:
1. Analisar o arquivo CONTINUACAO-EDITOR-INLINE.md completamente
2. Propor estratégia para descobrir a ação de desbloqueio do "Salvar e Sair"
3. Implementar essa ação no editor inline
4. Garantir que minutas não fiquem bloqueadas após edição inline

ARQUIVOS IMPORTANTES:
- CONTINUACAO-EDITOR-INLINE.md (este arquivo - LEIA PRIMEIRO!)
- console-inline-editor.js (editor funcional, precisa adicionar desbloqueio)
- debug-capture-save-and-exit-v2.js (script de captura mais recente)

NÃO REFAÇA o que já foi feito. A API de salvamento está documentada e funciona.
O ÚNICO problema é o bloqueio da minuta após salvar.

Comece lendo o documento de continuação e me diga qual abordagem você sugere para resolver o problema do bloqueio.
```

---

## ✅ CHECKLIST DE ESTADO

### Concluído
- [x] Mapear fluxo de edição completo
- [x] Documentar API de salvamento
- [x] Extrair hash corretamente
- [x] Criar modal funcional
- [x] Carregar conteúdo via hrefpreview (seguro)
- [x] Salvar via POST com validação XML
- [x] Conversão de entidades HTML
- [x] Incrementar versão automaticamente
- [x] Identificar problema do bloqueio
- [x] Identificar que "Salvar e Sair" não bloqueia

### Em Progresso
- [ ] Capturar comportamento exato do "Salvar e Sair"
- [ ] Identificar requisição/ação de desbloqueio

### Pendente
- [ ] Implementar desbloqueio no editor inline
- [ ] Testar ciclo completo sem bloqueio
- [ ] Integrar ao manifest.json
- [ ] Adicionar CKEditor para edição rica
- [ ] Criar configurações no popup
- [ ] Deploy em produção

---

## 💡 DICAS IMPORTANTES

1. **Não use fetch() direto**: O EPT usa jQuery `$.get()` e `$.post()` para evitar problemas de CORS/sessão
2. **Hash sempre limpo**: Use regex para remover lixo do hash
3. **XHTML válido**: Tags self-closing DEVEM ter barra final (`<br />`)
4. **Entidades numéricas**: Sempre `&#160;` nunca `&nbsp;`
5. **Versão incrementa**: A cada save, versao_conteudo_salvo += 1
6. **beforeunload é confiável**: Mas pode não ter tempo de executar tudo

---

## 🐛 PROBLEMAS CONHECIDOS

1. **localStorage não persiste** quando aba fecha muito rápido
2. **sessionStorage** também afetado pelo fechamento rápido
3. **Network Tab** do DevTools perde logs se não marcar "Preserve Log"
4. **Iframe do editor** dificulta inspeção do código JavaScript original

---

## 📞 INFORMAÇÕES DE CONTATO

- Sistema: eProc v9.15 - JFRJ
- Extensão: eProc Tunado v0.0.8
- Tecnologias: Chrome Extension (Manifest V3), jQuery, CKEditor
- Ambiente: https://eproc.jfrj.jus.br/eproc/

---

**Data de criação deste documento**: 09/11/2025  
**Última atualização**: 09/11/2025  
**Status**: Aguardando captura do comportamento "Salvar e Sair"  
**Próxima ação**: Usar Network Tab com Preserve Log ou proxy HTTP

---

## 🎯 RESUMO EXECUTIVO

**O QUE FUNCIONA**: Editor inline completo que carrega, edita e salva minutas perfeitamente.

**O QUE FALTA**: Descobrir e implementar a ação que o botão "Salvar e Sair" executa para desbloquear a minuta após o salvamento.

**ABORDAGEM**: Capturar requisições HTTP do botão "Salvar e Sair" e replicar no editor inline.

**PRIORIDADE**: ALTA - Todo o resto está pronto e funcional.
