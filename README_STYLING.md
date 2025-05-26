# EPT - Guia de Personalização Visual da Tabela de Minutas

## Como Personalizar os Estilos da Tabela

A extensão **Eproc Tunado (EPT)** oferece uma infraestrutura completa para personalização visual da tabela de minutas. Este guia explica como criar seus próprios estilos.

## Estrutura dos Arquivos

```
eproc_tunado/
├── table-styles.css      ← Arquivo para seus estilos personalizados
├── table-injector.js     ← Sistema que aplica as classes CSS
├── ept.js               ← Script principal (integração)
└── background.js        ← Injeção automática do CSS
```

## Como Funciona

### 1. **Ativação**
- A funcionalidade é ativada quando:
  - ✅ "Mostrar texto na tabela" está habilitado
  - ✅ "Aplicar design moderno" está habilitado

### 2. **Classes CSS Aplicadas Automaticamente**
O sistema aplica automaticamente as seguintes classes:

```css
/* Tabela principal */
#tabelaMinutas.ept-enhanced

/* Elementos de cada minuta expandida */
.ept-minuta-header   /* Cabeçalho (processo, título, órgão) */
.ept-minuta-text     /* Conteúdo do texto da minuta */
.ept-minuta-footer   /* Rodapé (botões + informações) */
```

## Seletores CSS Disponíveis

### **Tabela Principal**
```css
/* Cabeçalhos da tabela (Tipo, Órgão, Prévia) */
#tabelaMinutas.ept-enhanced .infraTrOrdenacao th {
    /* Seus estilos aqui */
}

/* Hover nas linhas da tabela */
#tabelaMinutas.ept-enhanced tr:hover {
    /* Seus estilos aqui */
}
```

### **Conteúdo das Minutas**
```css
/* Cabeçalho da minuta (azul com processo/título/órgão) */
.ept-minuta-header {
    /* Seus estilos aqui */
}

/* Texto da minuta */
.ept-minuta-text {
    /* Seus estilos aqui */
}

/* Rodapé com botões */
.ept-minuta-footer {
    /* Seus estilos aqui */
}
```

### **Botões Específicos**
```css
/* Botão Assinar (verde) */
.ept-minuta-footer a[href*="minuta_assinar"] {
    /* Seus estilos aqui */
}

/* Botão Devolver (vermelho) */
.ept-minuta-footer a[href*="minuta_devolver"] {
    /* Seus estilos aqui */
}

/* Botão Conferir (azul) */
.ept-minuta-footer a[href*="minuta_conferir"] {
    /* Seus estilos aqui */
}

/* Botão Editar */
.ept-minuta-footer a[href*="minuta_verificar_agendamento"] {
    /* Seus estilos aqui */
}

/* Botão Lembretes */
.ept-minuta-footer a[href*="minuta_lembrete_cadastrar"] {
    /* Seus estilos aqui */
}

/* Botão "Retornar tabela" */
button[onclick*="window.location.reload"] {
    /* Seus estilos aqui */
}
```

## Exemplos Práticos

### **Exemplo 1: Cabeçalho Simples**
```css
#tabelaMinutas.ept-enhanced .infraTrOrdenacao th {
    background: #2196F3 !important;
    color: white !important;
    border: none !important;
}
```

### **Exemplo 2: Cartões com Sombra**
```css
.ept-minuta-header {
    background: #f5f5f5 !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
    padding: 16px !important;
}

.ept-minuta-text {
    border: 1px solid #ddd !important;
    border-radius: 8px !important;
    padding: 20px !important;
    margin: 16px 0 !important;
}
```

### **Exemplo 3: Botões Estilizados**
```css
.ept-minuta-footer a[href*="minuta_assinar"] {
    background: #4CAF50 !important;
    color: white !important;
    padding: 8px 16px !important;
    border-radius: 4px !important;
    text-decoration: none !important;
}

.ept-minuta-footer a[href*="minuta_devolver"] {
    background: #f44336 !important;
    color: white !important;
    padding: 8px 16px !important;
    border-radius: 4px !important;
    text-decoration: none !important;
}
```

### **Exemplo 4: Hover Effects**
```css
#tabelaMinutas.ept-enhanced tr:hover {
    background-color: #f0f8ff !important;
    transition: background-color 0.2s ease !important;
}

.ept-minuta-footer a:hover {
    transform: translateY(-1px) !important;
    transition: transform 0.2s ease !important;
}
```

## Workflow de Desenvolvimento

### **1. Edite o arquivo `table-styles.css`**
```bash
# Abra o arquivo no seu editor
code table-styles.css
```

### **2. Adicione seus estilos**
```css
/* Exemplo: Tema escuro */
#tabelaMinutas.ept-enhanced .infraTrOrdenacao th {
    background: #333 !important;
    color: #fff !important;
}

.ept-minuta-header {
    background: #444 !important;
    color: #fff !important;
}
```

### **3. Recarregue a extensão**
1. Vá para `chrome://extensions/`
2. Clique no botão de reload da extensão EPT
3. Recarregue a página do eproc

### **4. Teste e refine**
- Acesse a área de trabalho de minutas
- Expanda algumas minutas para ver os estilos
- Ajuste conforme necessário

## Dicas Importantes

### **1. Use `!important`**
O eproc tem estilos próprios, então use `!important` para sobrescrever:
```css
.ept-minuta-header {
    background: #your-color !important;
}
```

### **2. Estrutura HTML gerada**
Quando uma minuta é expandida, o HTML fica assim:
```html
<td colspan="12">
    <div class="ept-minuta-header">processo | título | órgão</div>
    <section class="ept-minuta-text">texto da minuta</section>
    <div class="ept-minuta-footer">
        <div>
            <a href="...minuta_assinar">Assinar</a>
            <a href="...minuta_devolver">Devolver</a>
            <!-- outros botões -->
        </div>
        <span>servidor, data</span>
    </div>
</td>
```

### **3. Debug CSS**
Para ver se as classes estão sendo aplicadas:
```javascript
// No console do navegador
document.querySelectorAll('.ept-minuta-header').length
```

### **4. Responsividade**
Considere diferentes tamanhos de tela:
```css
@media (max-width: 768px) {
    .ept-minuta-header {
        flex-direction: column !important;
    }
}
```

## Temas Prontos (Exemplos)

### **Tema Material Design**
```css
#tabelaMinutas.ept-enhanced .infraTrOrdenacao th {
    background: #1976D2 !important;
    color: white !important;
}

.ept-minuta-header {
    background: #E3F2FD !important;
    border-left: 4px solid #1976D2 !important;
}
```

### **Tema Minimalista**
```css
.ept-minuta-header {
    background: transparent !important;
    border-bottom: 2px solid #eee !important;
}

.ept-minuta-text {
    border: none !important;
    border-left: 3px solid #ddd !important;
    padding-left: 20px !important;
}
```

## Troubleshooting

### **Estilos não aplicados?**
1. ✅ Verifique se ambos os toggles estão ativos
2. ✅ Recarregue a extensão
3. ✅ Use `!important` nos estilos
4. ✅ Verifique no console se há erros

### **Classes não encontradas?**
- Use o DevTools para inspecionar o HTML
- Verifique se a minuta está expandida
- Confirme se `EPT_TableStyler.apply()` foi executado

### **Performance**
- Evite animações complexas
- Use `transform` ao invés de alterar `top/left`
- Prefira `opacity` para fade effects

---

**Divirta-se criando seus próprios estilos!** 🎨

O sistema está preparado para aceitar qualquer CSS que você quiser aplicar. As classes são injetadas automaticamente, você só precisa estilizar! 