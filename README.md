# 🚀 Eproc Tunado - EPT

**Extensão Chrome para aperfeiçoar a interface de minutas do eproc para juízes**

[![Version](https://img.shields.io/badge/version-0.0.12-blue.svg)](https://maurolopes.com.br)
[![Chrome Extension](https://img.shields.io/badge/chrome-extension-green.svg)](https://chrome.google.com/webstore)

## 📋 Sobre

O **Eproc Tunado (EPT)** é uma extensão Chrome que melhora significativamente a experiência de trabalho com minutas no sistema eproc, oferecendo:

- 🎨 **Interface moderna** para a tabela de minutas
- 📱 **Design responsivo** e otimizado 
- ⚡ **Funcionalidades aprimoradas** para produtividade
- 🎛️ **Personalização completa** de estilos visuais
- 🌐 **Suporte a múltiplos tribunais**
- ✅ **Compatibilidade total** com eproc versão 9.15

### 🔄 Atualização para eproc 9.15

**Versão 0.0.6** - Adaptação para compatibilidade com eproc 9.15:

- **Problema resolvido**: Links de visualização de minutas não funcionavam quando a funcionalidade "Mostrar texto na tabela" estava ativada
- **Solução implementada**: Preservação dos links essenciais (`a.linkMinuta`) durante a modificação da estrutura da tabela
- **Técnica utilizada**: Reincorporação dos links com posicionamento absoluto para garantir funcionalidade da função `visualizar()` do eproc
- **Resultado**: Mantém todas as funcionalidades visuais aprimoradas sem interferir na navegação nativa do sistema

### ✏️ Editor Inline de Minutas (0.0.9)

- Botão `edição rápida` disponível na lista de minutas quando o EPT está ativo.
- Modal próprio com editor `contenteditable`, sanitização para XHTML e salvamento/desbloqueio automáticos (`controlador_ajax.php`).
- Atualização imediata da linha da tabela após salvar (sem `window.location.reload()`).
- Sistema de logs em overlay removido para reduzir atrito de uso e evitar interferência com o editor nativo.

#### Correção: alerta “Houve uma mudança no perfil do usuário”

- Corrigido: após salvar inline e recarregar a lista, o alerta não aparece mais.
- Como foi resolvido: após o `minuta_salvar` e o `sbmDesbloquear`, o EPT agora emula a chamada nativa de pós-salvar:
   - `controlador_ajax.php?acao_ajax=atualizar_info_minuta&acao_origem=minuta_area_trabalho&hash=...`
- Mantido alinhamento com o nativo:
   - `alterarstatus=1` e `cod_tipo_salvamento_versao_conteudo=6` no salvar.
   - Preservação do rodapé da minuta (criador/editor/versão) para evitar impactos em métricas/auditoria.
- Logs de diagnóstico (opcional):
   - Ative no console: `window.EPT_DEBUG_ENABLED = true`
   - Inspecione o histórico: `window.EPT_LOGS`

## 🏛️ Tribunais Suportados

A extensão funciona nos seguintes sistemas eproc:

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

## ⚙️ Instalação

1. **Clone ou baixe o repositório**
```bash
git clone https://github.com/maurolopes/eproc_tunado.git
```

2. **Abra o Chrome e vá para Extensions**
   - Digite `chrome://extensions/` na barra de endereços
   - Ative o "Modo do desenvolvedor" no canto superior direito

3. **Carregue a extensão**
   - Clique em "Carregar sem compactação"
   - Selecione a pasta do projeto `eproc_tunado`

4. **Configure as preferências**
   - Clique no ícone da extensão na barra do Chrome
   - Ative as funcionalidades desejadas

## 🎯 Funcionalidades

### 📊 Interface Aprimorada de Minutas
- **Visualização expandida** do texto das minutas diretamente na tabela
- **Botões de ação** organizados e destacados
- **Informações contextuais** do processo, título e órgão
- **Design moderno** com cartões e espaçamento adequado

### 🎨 Personalização Visual Completa
- **Sistema de classes CSS** para personalização total
- **Temas prontos** (Material Design, Minimalista, etc.)
- **Suporte a CSS customizado** através do arquivo `table-styles.css`
- **Elementos estilizáveis**: cabeçalhos, textos, botões, hover effects

### ⚡ Produtividade
- **Navegação otimizada** entre minutas
- **Acesso rápido** às ações mais comuns
- **Interface responsiva** para diferentes tamanhos de tela

## 🛠️ Configuração

### Ativação Básica
Na popup da extensão, ative (entre outras):
- ✅ **Visualização de texto** — mostra o conteúdo da minuta na listagem
- ✅ **Interface aprimorada** — aplica o design moderno à tabela (`table-styles.css`)

### Configurações Avançadas
- **Toggle individual** para cada funcionalidade
- **Persistência de configurações** entre sessões
- **Aplicação automática** conforme preferências salvas

## 🎨 Personalização Visual

### Como Funciona
O EPT aplica automaticamente classes CSS aos elementos da tabela de minutas, permitindo personalização completa através do arquivo `table-styles.css`.

### Classes CSS Disponíveis

#### Tabela Principal
```css
#tabelaMinutas.ept-enhanced              /* Tabela principal */
#tabelaMinutas.ept-enhanced th           /* Cabeçalhos */
#tabelaMinutas.ept-enhanced tr:hover     /* Hover nas linhas */
```

#### Elementos da Minuta
```css
.ept-minuta-header                       /* Cabeçalho (processo/título/órgão) */
.ept-minuta-text                         /* Conteúdo do texto */
.ept-minuta-footer                       /* Rodapé com botões */
```

#### Botões Específicos
A chave estável `data-ept-action` é aplicada pelo `ept.js` (funciona para links normais e botões AJAX):
```css
.ept-minuta-footer a[data-ept-action="assinar"]   /* Botão Assinar */
.ept-minuta-footer a[data-ept-action="devolver"]  /* Botão Devolver */
.ept-minuta-footer a[data-ept-action="editar"]    /* Botão Editar */
.ept-minuta-footer a[data-ept-action="lembrete"]  /* Botão Lembrete */
/* "Conferir" fica oculto no rodapé curado; use a opção "Manter botões originais". */
```

### Exemplos Práticos

#### Tema Material Design
```css
#tabelaMinutas.ept-enhanced .infraTrOrdenacao th {
    background: #1976D2 !important;
    color: white !important;
    border: none !important;
}

.ept-minuta-header {
    background: #E3F2FD !important;
    border-left: 4px solid #1976D2 !important;
    padding: 16px !important;
    border-radius: 4px !important;
}
```

#### Botões Estilizados
```css
.ept-minuta-footer a[data-ept-action="assinar"] {
    background: #4CAF50 !important;
    color: white !important;
    padding: 8px 16px !important;
    border-radius: 4px !important;
    text-decoration: none !important;
}

.ept-minuta-footer a[data-ept-action="devolver"] {
    background: #f44336 !important;
    color: white !important;
    padding: 8px 16px !important;
    border-radius: 4px !important;
}
```

### Workflow de Personalização

1. **Edite o arquivo `table-styles.css`**
2. **Adicione seus estilos CSS customizados**
3. **Recarregue a extensão** em `chrome://extensions/`
4. **Teste na página do eproc**
5. **Refine conforme necessário**

### Dicas Importantes
- **Use `!important`** para sobrescrever estilos do eproc
- **Teste responsividade** com `@media queries`
- **Use DevTools** para inspecionar elementos e debug
- **Verifique se as classes estão sendo aplicadas** via console

## 🧪 Testes e Verificação

O projeto inclui dois sistemas de teste complementares para garantir qualidade e funcionalidade da extensão.

### 🌐 Teste Automatizado de URLs (Node.js)

#### Como Executar
```bash
# Testar conectividade de todas as URLs do manifest.json
node test-urls.js
```

#### O que o teste faz
- ✅ **Verifica 21 URLs** de diferentes tribunais (no script Node, só **TJRJ** usa `…/eproc/` no fim; os demais hosts são testados na raiz, como antes)
- ✅ **Gera relatório detalhado** com status de cada servidor
- ✅ **Identifica URLs problemáticas** e possíveis causas
- ✅ **Salva resultados** em `url-test-report.json`

#### Exemplo de Saída
```
🔍 Iniciando teste de URLs do Eproc Tunado...
📋 Total de URLs para testar: 21

[1/21] Testando: https://eproc.jfrj.jus.br
✅ Status: 302
...

============================================================
📊 RELATÓRIO FINAL
============================================================
✅ URLs funcionando: 21
❌ URLs com problemas: 0  
📈 Taxa de sucesso: 100.0%
```

### 🚀 Teste Manual no Chrome (Zsh)

#### Como Executar
```bash
# Abrir Chrome com todas as URLs e extensão carregada
./test-chrome-simple.zsh
```

#### O que o teste faz
- ✅ **Detecta e inicia Chrome** automaticamente
- ✅ **Carrega a extensão EPT** com flags de desenvolvimento
- ✅ **Abre 21 abas** com todas as URLs dos tribunais
- ✅ **Configura DevTools** para debug
- ✅ **Permite teste manual** da extensão real

#### Vantagens do Teste Chrome
| Aspecto | Teste Node.js | Teste Chrome |
|---------|---------------|--------------|
| **Conectividade** | ✅ Verifica HTTP | ✅ Verifica HTTP |
| **Extensão Real** | ❌ Não testa | ✅ **Testa extensão** |
| **JavaScript** | ❌ Não executa | ✅ **Executa JS real** |
| **Console Errors** | ❌ Não vê | ✅ **Mostra erros** |
| **Interface** | ❌ Não testa | ✅ **Testa UI real** |
| **Performance** | ❌ Não mede | ✅ **Vê performance** |

#### Verificações no Chrome
1. **Console do Desenvolvedor** (F12)
   - Procure por erros em vermelho
   - Verifique logs do EPT
   - Monitore performance

2. **Funcionalidade da Extensão**
   - Clique no ícone EPT na barra
   - Teste toggles de configuração
   - Verifique se salva preferências

3. **Teste por Tribunal**
   - Navegue até a área de minutas
   - Teste **Visualização de texto** e **Interface aprimorada** na popup
   - Verifique a aplicação do CSS customizado em `table-styles.css`

### 📊 Monitoramento e Manutenção
- **Execute testes periodicamente** para verificar disponibilidade
- **Identifique URLs desatualizadas** antes que afetem usuários
- **Use dados dos relatórios** para manutenção proativa
- **Documente problemas** encontrados para correção

## 📁 Estrutura do Projeto

```
eproc_tunado/
├── manifest.json           # Configurações da extensão
├── popup.html             # Interface da popup
├── background.js          # Service worker
├── ept.js                 # Script principal de funcionalidades
├── toggle.js              # Controle de configurações
├── table-injector.js      # Sistema de injeção de classes CSS
├── table-styles.css       # Estilos customizáveis
├── ept.css               # Estilos base da extensão
├── test-urls.js          # Script de teste Node.js (conectividade)
├── test-chrome-simple.zsh # Script de teste Chrome (funcionalidade)
├── url-test-report.json  # Relatório de testes automatizados
├── icons/                # Ícones da extensão
└── README.md            # Este arquivo
```

## 🔧 Desenvolvimento

### Pré-requisitos
- Chrome/Chromium Browser
- Node.js (para testes de URL)
- Editor de código com suporte a JavaScript/CSS

### Setup de Desenvolvimento
1. **Clone o repositório**
2. **Carregue no Chrome** em modo desenvolvedor
3. **Faça suas modificações**
4. **Execute testes** para validar mudanças:
   ```bash
   # Teste de conectividade
   node test-urls.js
   
   # Teste funcional no Chrome
   ./test-chrome-simple.zsh
   ```
5. **Verifique logs** no console do Chrome (F12)

### Debug
```javascript
// Console do navegador — verificar classes aplicadas
document.querySelectorAll('.ept-minuta-header').length

// Logs opcionais do EPT (ativar antes de reproduzir o fluxo)
window.EPT_DEBUG_ENABLED = true
```

## 🐛 Troubleshooting

### Extensão não funciona?
1. ✅ Verifique se está em um site eproc suportado
2. ✅ Confirme se as opções estão ativadas na popup
3. ✅ Recarregue a extensão em `chrome://extensions/`
4. ✅ Verifique o console para erros JavaScript

### Estilos não aplicados?
1. ✅ Confirme que **Interface aprimorada** está ativa (e, para o texto expandido, **Visualização de texto**)
2. ✅ Use `!important` nos estilos customizados
3. ✅ Verifique se as classes CSS estão corretas
4. ✅ Inspecione elementos com DevTools

### URLs com problema?
1. ✅ Execute `node test-urls.js` para diagnóstico de conectividade
2. ✅ Execute `./test-chrome-simple.zsh` para teste funcional
3. ✅ Verifique se houve mudanças nos domínios dos tribunais
4. ✅ Teste em horários diferentes (manutenções programadas)
5. ✅ Atualize URLs no manifest.json se necessário

### Problemas com testes Chrome?
1. ✅ Verifique se Chrome está instalado em `/Applications/`
2. ✅ Confirme permissões: `chmod +x test-chrome-simple.zsh`
3. ✅ Verifique se está no diretório correto da extensão
4. ✅ Recarregue a extensão em `chrome://extensions/` se necessário

## 📈 Performance

### Otimizações Implementadas
- **Injeção sob demanda** de scripts e estilos
- **Classes CSS eficientes** com seletores específicos
- **Throttling de eventos** para melhor responsividade
- **Lazy loading** de funcionalidades não essenciais

### Boas Práticas
- **Minimize uso de `!important`** quando possível
- **Use transforms** ao invés de alterar posição
- **Prefira opacity** para fade effects
- **Teste performance** em dispositivos menos potentes

## 🤝 Contribuição

### Como Contribuir
1. **Fork o repositório**
2. **Crie uma branch** para sua feature
3. **Faça suas modificações**
4. **Teste de ponta a ponta** em diferentes tribunais
5. **Execute testes de URL** antes do commit
6. **Abra um Pull Request**

### Diretrizes
- **Mantenha compatibilidade** com todos os tribunais suportados
- **Teste em diferentes resoluções** de tela
- **Documente mudanças significativas**
- **Use código limpo** e comentado

## 📜 Licença

Este projeto é desenvolvido para uso pessoal e profissional de magistrados e servidores do Poder Judiciário.

## 👨‍💻 Autor

**Mauro Lopes**
- Website: [maurolopes.com.br](https://maurolopes.com.br)
- Extensão desenvolvida para melhorar a produtividade no trabalho jurisdicional

## 🔄 Changelog

### v0.0.12 (atual)
- ✅ **Independência de colunas:** a linha da tabela de minutas passa a ser reconstruída a partir do cabeçalho (mapa de colunas), funcionando com qualquer combinação de "critérios de exibição" — sem dados trocados, células vazias ou `undefined`.
- ✅ **Fim do `divListaRecursosMinuta` duplicado** que ocorria com muitas colunas marcadas.
- ✅ **Detecção robusta de ações:** botões reconhecidos por `href`, atributo `acao` do `<img>` ou `alt`/tooltip; o "Editar" das sentenças (AJAX) volta a aparecer no rodapé curado.
- ✅ **Nova opção "Manter botões originais"** (`ept_keep_actions`, padrão OFF): preserva a célula original de "Recursos disponíveis" com todos os botões (inclusive "Conferir"), mantendo a "edição rápida" no rodapé do texto.
- ✅ **Estilização por `data-ept-action`** nos botões do rodapé (em vez de seletores por `href`), cobrindo links normais e botões AJAX.

### v0.0.11
- ✅ **Language Tools e similares:** remoção de `spellcheck="false"` no editor inline para permitir revisão gramatical no modal.
- ✅ **Acessibilidade:** `role="textbox"` e `aria-labelledby` no campo de edição rápida.
- ✅ **Tooltips Infra:** após reconstruir a linha ou atualizar o preview, chamada a `infraTooltipOcultar` quando existir, reduzindo balões presos na listagem condensada.
- ✅ **Service worker:** título do ícone da extensão (“tunado” / “não tunado”) passa a refletir corretamente `ept_enabled` (valores assíncronos aguardados; atualização ao mudar o storage).

### v0.0.10
- ✅ **Modal de edição rápida:** fechamento apenas pelos botões próprios (X ou Cancelar), evitando perda ao clicar fora.

### v0.0.9
- ✅ **Editor inline de minutas** com modal dedicado, sanitização XHTML e desbloqueio automático.
- ✅ **Atualização imediata da tabela** após salvar, sem recarregar a página.
- ✅ **Remoção do painel de logs experimental** para evitar conflitos com o editor nativo.
- ✅ **Correção do alerta** “Houve uma mudança no perfil do usuário” em recarga após salvar inline (emulação do `atualizar_info_minuta`).
- ✅ Logs leves internos (`window.EPT_LOGS`) e debug opcional (`window.EPT_DEBUG_ENABLED = true`).

### v0.0.6
- ✅ **Correção crítica** para compatibilidade com eproc 9.15
- ✅ **Preservação dos links** de visualização de minutas
- ✅ **Manutenção da funcionalidade nativa** do sistema eproc
- ✅ Suporte a 21 URLs de tribunais
- ✅ Sistema completo de personalização CSS
- ✅ Testes automatizados de URLs
- ✅ Interface responsiva otimizada
- ✅ Documentação unificada

### v0.0.4
- ✅ Suporte a 21 URLs de tribunais
- ✅ Sistema completo de personalização CSS
- ✅ Testes automatizados de URLs
- ✅ Interface responsiva otimizada
- ✅ Documentação unificada

---

**⚖️ Desenvolvido por magistrado, para magistrados.** 

*Simplifique seu trabalho com minutas e foque no que realmente importa: a prestação jurisdicional.* 