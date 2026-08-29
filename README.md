# 🚀 Eproc Tunado - EPT

**Extensão Chrome para aperfeiçoar a interface de minutas do eproc para juízes**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://maurolopes.com.br)
[![Chrome Extension](https://img.shields.io/badge/chrome-extension-green.svg)](https://chrome.google.com/webstore)

## 📋 Sobre

O **Eproc Tunado (EPT)** é uma extensão Chrome que melhora a experiência de trabalho com minutas no eproc:

- 🎨 **Cartões** na lista de minutas (tema refined: branco, filete lateral, zebrado discreto)
- 📄 **Texto da minuta** na própria listagem, com ações no rodapé
- ⚡ **Edição rápida** inline e atalhos de produtividade
- 🌐 **23 hosts** em tribunais federais e estaduais (inclui TJPR)
- ✅ **Compatibilidade** com eproc 9.15

Identidade visual: laranja `#F66942`, com a cor de apoio seguindo o eproc do
usuário — azul na 1ª instância, verde na 2ª, e o roxo `#352245` da extensão
como padrão fora desses casos.

### 🔄 Atualização para eproc 9.15

**Versão 0.0.6** — adaptação para o eproc 9.15:

- **Problema**: links de visualização não funcionavam com o texto na tabela
- **Solução**: os `a.linkMinuta` são preservados (ocultos, posicionados fora da tela) para a função nativa `visualizar()` continuar funcionando

### ✏️ Editor Inline de Minutas (0.0.9)

- Botão `edição rápida` na lista quando a visualização de texto está ativa
- Modal com editor `contenteditable`, sanitização para XHTML e salvamento/desbloqueio (`controlador_ajax.php`)
- Atualização da linha após salvar, sem `window.location.reload()`
- Após `minuta_salvar` e `sbmDesbloquear`, emula `atualizar_info_minuta` para não disparar o alerta “Houve uma mudança no perfil do usuário”
- Debug opcional: `window.EPT_DEBUG_ENABLED = true` e `window.EPT_LOGS`

## 🏛️ Tribunais Suportados

### Justiça Federal
- **JFRJ** - Justiça Federal do Rio de Janeiro
- **JFES** - Justiça Federal do Espírito Santo
- **TRF2** - Tribunal Regional Federal da 2ª Região
- **TRF4** - Tribunal Regional Federal da 4ª Região
- **TRF6** - Tribunal Regional Federal da 6ª Região (1º e 2º graus)
- **JFRS** - Justiça Federal do Rio Grande do Sul
- **JFSC** - Justiça Federal de Santa Catarina
- **JFPR** - Justiça Federal do Paraná

### Justiça Estadual
- **TJRS** - Tribunal de Justiça do Rio Grande do Sul (1º e 2º graus)
- **TJSC** - Tribunal de Justiça de Santa Catarina (1º e 2º graus)
- **TJTO** - Tribunal de Justiça do Tocantins (1º e 2º graus)
- **TJRJ** - Tribunal de Justiça do Rio de Janeiro (1º e 2º graus)
- **TJSP** - Tribunal de Justiça de São Paulo (1º e 2º graus)
- **TJMG** - Tribunal de Justiça de Minas Gerais (1º e 2º graus)
- **TJPR** - Tribunal de Justiça do Paraná (1º e 2º graus)

## ⚙️ Instalação

1. **Clone ou baixe o repositório**
```bash
git clone https://github.com/maurolopes/eproc_tunado.git
```

2. **Abra o Chrome** em `chrome://extensions/` e ative o modo do desenvolvedor

3. **Carregue a extensão** — “Carregar sem compactação” e selecione a pasta `eproc_tunado`

4. **Configure** pelo ícone da extensão na barra do Chrome

Para gerar o zip de upload na Chrome Web Store (ainda não publicado nesta versão):

```bash
./ziptunado.sh
```

O pacote sai em `../eproc-tunado-1.0.0.zip`.

## 🎯 Funcionalidades

### Lista de minutas
- **Visualização de texto**: conteúdo da minuta no cartão (processo, tipo/status, órgão, texto, ações)
- **Visual refined** sempre que a visualização de texto está ligada (não há interruptor extra de “interface aprimorada”)
- **Ações no rodapé**: Editar, Assinar, Devolver, Lembrete e edição rápida (barra segmentada)
- **Mais ações**: revela ou esconde os ícones originais daquela minuta (Conferir e demais)
- **Retunar**: no cabeçalho da tabela, recarrega e reaplica a formatação
- **Minuta em edição**: se o eproc bloquear a linha (laranja + cadeado), o cartão permanece com os dados básicos e o texto “em edição”; ao desbloquear, o preview volta sem recarregar a página

### Produtividade
- **Modo foco** e **focar ações principais** (popup)
- **Clique automático** para manter agendamento na edição
- **Armazenar senha** (campo de senha no tipo correto, para o navegador salvar)

## 🛠️ Configuração (popup)

| Opção | Efeito |
|--------|--------|
| **Ativado** | Liga ou desliga a extensão |
| **Armazenar senha** | Campo de senha como `password` |
| **Modo foco** | Oculta elementos secundários na área de minutas |
| **Focar ações principais** | Só Visualizar e Assinar acima da tabela |
| **Visualização de texto** | Texto na listagem **e** o visual de cartões |
| **Clique automático** | Confirma “manter agendamento” na edição |
| **Manter botões originais** | Já abre cada minuta com os ícones extras visíveis; “Mais ações” continua podendo ocultá-los |

As preferências ficam no `chrome.storage.sync`.

## 🎨 Visual da lista

Com a visualização de texto ligada, o `<html>` recebe:

- `data-ept-table-theme="refined"`
- `data-ept-button-layout="segmented-uniform-white"`
- `data-ept-border-style="lateral"`
- `data-ept-keep-actions="true"` se “Manter botões originais” estiver ligado

Arquivos:

- [`table-styles.css`](table-styles.css) — cartões, cabeçalho, texto, rodapé, Retunar, destaque de edição (`#ffaa00` → fundo `#fff8e6`)
- [`table-themes.css`](table-themes.css) — tema refined, zebrado (`#f6f4f8` nas pares, excluindo a linha laranja), filete lateral, recuo do texto em tela larga

Classes úteis:

```css
#tabelaMinutas.ept-enhanced
.ept-minuta-header
.ept-minuta-text
.ept-minuta-footer
.ept-preview-container.ept-minuta-em-edicao
```

Botões do rodapé (chave estável, inclusive AJAX):

```css
.ept-minuta-footer a[data-ept-action="editar"]
.ept-minuta-footer a[data-ept-action="assinar"]
.ept-minuta-footer a[data-ept-action="devolver"]
.ept-minuta-footer a[data-ept-action="lembrete"]
```

“Conferir” não entra no rodapé curado; use **Manter botões originais** ou **Mais ações**.

Para ajustar o visual, edite os CSS, recarregue a extensão em `chrome://extensions/` e use `!important` (o restante do CSS injetado já usa).

## 🧪 Testes

### URLs (Node.js)

```bash
node test-urls.js
```

Verifica os **23 hosts** do `manifest.json` (no script, só o TJRJ usa sufixo `/eproc/`; os demais são testados na raiz). Gera `url-test-report.json`.

### Chrome (zsh)

```bash
./test-chrome-simple.zsh
```

Abre o Chrome com a extensão carregada e uma aba por host, para teste manual na área de minutas.

## 📁 Estrutura do Projeto

```
eproc_tunado/
├── manifest.json            # MV3, hosts e permissões
├── popup.html               # Popup de opções
├── changelog.html           # Novidades (aberto pela popup)
├── background.js            # Service worker (injeção no frame principal)
├── ept.js                   # Reconstrução da tabela, edição rápida, observadores
├── toggle.js                # Persistência dos toggles
├── table-injector.js        # Classes .ept-enhanced / header / text / footer
├── table-styles.css         # Cartões e componentes
├── table-themes.css         # Tema refined
├── ept.css                  # Estilos da popup
├── ziptunado.sh             # Pacote para a Chrome Web Store
├── test-urls.js
├── test-chrome-simple.zsh
├── icons/
└── README.md
```

A injeção (`webNavigation.onCompleted`) vale só no **frame principal** (`frameId === 0`), para não redeclarar o `ept.js` em iframes (por exemplo `minuta_editar`).

## 🔧 Desenvolvimento

1. Clone e carregue em modo desenvolvedor
2. Altere JS/CSS e recarregue a extensão
3. Teste na área de minutas (`acao=minuta_area_trabalho`)
4. Opcional: `node test-urls.js` e `./test-chrome-simple.zsh`

```javascript
document.querySelectorAll('.ept-minuta-header').length
window.EPT_DEBUG_ENABLED = true
```

## 🐛 Troubleshooting

### Extensão não funciona?
1. Confirme o host (lista de tribunais / `manifest.json`)
2. Confirme que a extensão está **Ativado** na popup
3. Recarregue em `chrome://extensions/`
4. Veja o console da página

### Estilos ou texto não aparecem?
1. **Visualização de texto** precisa estar ligada
2. Recarregue a lista (Retunar) se a tabela já estava aberta
3. Inspecione `html[data-ept-table-theme="refined"]` e `#tabelaMinutas.ept-enhanced`

### Cartão “em edição” preso?
Ao terminar a edição na outra aba, o cadeado nativo some e o texto deve voltar sozinho. Se não voltar, Recarregar páginas do eproc (popup) ou Retunar. Se a minuta bloqueada sumir após Retunar, é a listagem do eproc (ela some do HTML enquanto está bloqueada).

### URLs com problema?
`node test-urls.js` e, se o domínio do tribunal mudou, atualize `manifest.json`.

## 🤝 Contribuição

1. Fork e branch
2. Teste na área de minutas de pelo menos um tribunal
3. Não quebre a independência de colunas (mapa a partir do cabeçalho)
4. Abra um Pull Request

## 📜 Licença

Uso pessoal e profissional de magistrados e servidores do Poder Judiciário.

## 👨‍💻 Autor

**Mauro Lopes** — [maurolopes.com.br](https://maurolopes.com.br)

## 🔄 Changelog

### v1.0.0 (atual)
- ✅ Cartões refined na lista (cabeçalho branco com borda roxa, zebrado discreto, filete lateral, intervalo maior entre minutas)
- ✅ Visual novo sempre que **Visualização de texto** está ligada (removido o interruptor “Interface aprimorada”)
- ✅ Botões do rodapé em barra segmentada; **Mais ações** por minuta
- ✅ **Manter botões originais** no popup (ícones extras já visíveis)
- ✅ Recuo do texto em tela grande (`margin-right: 100px`)
- ✅ **Retunar** no último `th` do cabeçalho
- ✅ **TJPR** (1º e 2º graus)
- ✅ Injeção só no frame principal (`frameId === 0`)
- ✅ **Minuta em edição:** o eproc marca a linha (laranja + cadeado); o cartão EPT é reaplicado com “em edição” e, ao desbloquear, o preview volta sem `location.reload()`

### v0.0.12
- ✅ **Independência de colunas:** reconstrução a partir do cabeçalho (mapa de colunas), qualquer combinação de critérios de exibição
- ✅ **Fim do `divListaRecursosMinuta` duplicado** com muitas colunas marcadas
- ✅ **Detecção robusta de ações** (`href`, `acao` do `<img>` ou tooltip); “Editar” AJAX no rodapé
- ✅ **Manter botões originais** (`ept_keep_actions`, padrão OFF)
- ✅ Estilização por `data-ept-action` no rodapé

### v0.0.11
- ✅ Language Tools: sem `spellcheck="false"` no editor inline
- ✅ Acessibilidade: `role="textbox"` e `aria-labelledby` na edição rápida
- ✅ Tooltips Infra: `infraTooltipOcultar` após reconstruir a linha
- ✅ Título do ícone (“tunado” / “não tunado”) alinhado a `ept_enabled`

### v0.0.10
- ✅ Modal de edição rápida: fecha só pelos botões próprios (X ou Cancelar)

### v0.0.9
- ✅ Editor inline, sanitização XHTML, desbloqueio automático
- ✅ Atualização da tabela após salvar, sem recarregar a página
- ✅ Correção do alerta “Houve uma mudança no perfil do usuário” (`atualizar_info_minuta`)
- ✅ `window.EPT_LOGS` e `window.EPT_DEBUG_ENABLED`

### v0.0.6
- ✅ Compatibilidade com eproc 9.15 (preservação dos `linkMinuta`)
- ✅ Personalização CSS e testes de URL

---

**⚖️ Desenvolvido por magistrado, para magistrados.**
