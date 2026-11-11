window.EPT_INLINE_EDITOR = window.EPT_INLINE_EDITOR || {
  state: null,
  stylesInjected: false,
  overlay: null,
  ensureStyles() {
    if (this.stylesInjected) {
      return;
    }

    const styleTag = document.createElement("style");
    styleTag.id = "ept-inline-editor-styles";
    styleTag.textContent = `
      .ept-inline-editor-overlay {
        position: fixed;
        inset: 0;
        background: var(--ept-modal-overlay, rgba(53, 34, 69, 0.65));
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 48px 24px;
        z-index: 999999;
        overflow-y: auto;
      }

      .ept-inline-editor-modal {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 20px 45px var(--ept-modal-shadow, rgba(53, 34, 69, 0.35));
        width: min(960px, 100%);
        display: flex;
        flex-direction: column;
        animation: eptModalFadeIn 0.25s ease;
        border-top: 6px solid #F66942;
        overflow: hidden;
      }

      .ept-inline-editor-header {
        background: var(--ept-modal-header, #352245);
        padding: 20px 28px;
        color: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .ept-inline-editor-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        letter-spacing: -0.01em;
      }

      .ept-inline-editor-subtitle {
        font-size: 0.875rem;
        opacity: 0.85;
      }

      .ept-inline-editor-close {
        background: var(--ept-modal-close-bg, rgba(255, 255, 255, 0.1));
        border: none;
        color: #fff;
        font-size: 1.25rem;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ept-inline-editor-close:hover {
        background: var(--ept-modal-close-bg-hover, rgba(255, 255, 255, 0.2));
      }

      .ept-inline-editor-body {
        padding: 24px 28px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .ept-inline-editor-info {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 24px;
        color: var(--ept-brand-700, #4a3358);
        font-size: 0.875rem;
      }

      .ept-inline-editor-info span {
        background: var(--ept-modal-chip, rgba(53, 34, 69, 0.08));
        padding: 6px 12px;
        border-radius: 6px;
        font-weight: 500;
      }

      .ept-inline-editor-content {
        min-height: 320px;
        max-height: 520px;
        overflow-y: auto;
        border: 2px solid var(--ept-modal-field-bd, rgba(74, 51, 88, 0.12));
        border-radius: 8px;
        padding: 20px;
        font-size: 0.95rem;
        line-height: 1.6;
        color: #1a202c;
        background: var(--ept-modal-field-bg, #f9f7fb);
      }

      /* Minuta dupla: uma aba por conteúdo, cada um com a área inteira. */
      .ept-inline-editor-abas {
        display: flex;
        gap: 4px;
        margin-bottom: -16px;
        border-bottom: 2px solid var(--ept-modal-field-bd, rgba(74, 51, 88, 0.12));
      }

      .ept-inline-editor-aba {
        background: transparent;
        border: none;
        border-bottom: 3px solid transparent;
        margin-bottom: -2px;
        padding: 10px 18px;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #6b7280;
        cursor: pointer;
      }

      .ept-inline-editor-aba:hover {
        color: var(--ept-brand-700, #4a3358);
      }

      .ept-inline-editor-aba[aria-selected="true"] {
        color: var(--ept-brand-700, #4a3358);
        border-bottom-color: #F66942;
      }

      /* Alteração ainda não salva naquela aba. */
      .ept-inline-editor-aba.ept-aba-alterada::after {
        content: " ●";
        color: #F66942;
      }

      .ept-inline-editor-content[hidden] {
        display: none;
      }

      .ept-inline-editor-content[contenteditable="true"]:focus {
        outline: none;
        border-color: var(--ept-brand-700, #4a3358);
        box-shadow: 0 0 0 3px var(--ept-modal-focus, rgba(74, 51, 88, 0.15));
        background: #ffffff;
      }

      .ept-inline-editor-footer {
        padding: 18px 28px 28px 28px;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        background: var(--ept-modal-footer, rgba(53, 34, 69, 0.04));
      }

      .ept-inline-editor-btn {
        border: none;
        border-radius: 6px;
        padding: 10px 18px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ept-inline-editor-btn-cancel {
        background: #ffffff;
        color: var(--ept-brand-800, #352245);
        border: 2px solid var(--ept-modal-btn-bd, rgba(53, 34, 69, 0.15));
      }

      .ept-inline-editor-btn-cancel:hover {
        border-color: var(--ept-modal-btn-bd-hover, rgba(53, 34, 69, 0.35));
        color: var(--ept-modal-btn-hover-fg, #1f142c);
      }

      .ept-inline-editor-btn-save {
        background: #F66942;
        color: #ffffff;
        box-shadow: 0 6px 16px rgba(246, 105, 66, 0.35);
      }

      .ept-inline-editor-btn-save:hover {
        background: #e25c39;
        box-shadow: 0 8px 20px rgba(246, 105, 66, 0.45);
      }

      .ept-inline-editor-btn-save[disabled] {
        background: var(--ept-brand-700, #4a3358);
        box-shadow: none;
        opacity: 0.6;
        cursor: not-allowed;
      }

      @keyframes eptModalFadeIn {
        from {
          opacity: 0;
          transform: translateY(24px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;

    document.head.appendChild(styleTag);
    this.stylesInjected = true;
  },
  closeModal() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    document.removeEventListener("keydown", this.handleEscape, true);
    window.EPT_INLINE_EDITOR_STATE = null;
    this.state = null;
  },
  /**
   * Fechar a pedido do usuário (×, Cancelar, Esc): com alteração ainda não
   * salva, pergunta antes de descartar. closeModal() segue fechando direto,
   * para o fechamento automático depois de salvar.
   */
  pedirFechar() {
    const state = this.state;
    if (!state) {
      this.closeModal();
      return;
    }
    let aviso = "";
    if (state.abas) {
      const nomes = state.abas.filter((aba) => aba.alterada).map((aba) => aba.nome.toLowerCase());
      if (nomes.length) {
        aviso = `Há alteração não salva em ${nomes.join(" e ")}.`;
      }
    } else {
      const area = state.contentEditableElement;
      if (area && area.innerHTML !== area._eptBaseline) {
        aviso = "Há alteração não salva na minuta.";
      }
    }
    if (aviso && !confirm(`EPT: ${aviso}\nFechar e descartar a alteração?`)) {
      return;
    }
    this.closeModal();
  },
  handleEscape(event) {
    if (event.key === "Escape") {
      // Sem isto, o Esc que fecha a pergunta chegaria também ao eproc.
      event.preventDefault();
      event.stopPropagation();
      EPT_INLINE_EDITOR.pedirFechar();
    }
  },
  openModal(modalData) {
    this.ensureStyles();
    this.closeModal();

    this.state = { ...modalData };

    const overlay = document.createElement("div");
    overlay.className = "ept-inline-editor-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    const modal = document.createElement("div");
    modal.className = "ept-inline-editor-modal";

    const header = document.createElement("div");
    header.className = "ept-inline-editor-header";

    const headerTextWrapper = document.createElement("div");
    const title = document.createElement("h2");
    title.className = "ept-inline-editor-title";
    title.id = "ept-editor-title";
    title.textContent = "Edição rápida da minuta";

    headerTextWrapper.appendChild(title);

    if (modalData.subtitle) {
      const subtitle = document.createElement("div");
      subtitle.className = "ept-inline-editor-subtitle";
      subtitle.textContent = modalData.subtitle;
      headerTextWrapper.appendChild(subtitle);
    }

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "ept-inline-editor-close";
    closeBtn.setAttribute("aria-label", "Fechar editor inline");
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", () => this.pedirFechar());

    header.appendChild(headerTextWrapper);
    header.appendChild(closeBtn);

    const body = document.createElement("div");
    body.className = "ept-inline-editor-body";

    if (modalData.info && modalData.info.length) {
      const infoWrapper = document.createElement("div");
      infoWrapper.className = "ept-inline-editor-info";

      modalData.info.forEach((infoItem) => {
        const span = document.createElement("span");
        span.textContent = infoItem;
        infoWrapper.appendChild(span);
      });

      body.appendChild(infoWrapper);
    }

    // Minuta dupla (EMENTA + ACÓRDÃO, RELATÓRIO + VOTO): uma aba por
    // conteúdo, cada um com a área inteira e o seu próprio salvar. Com um
    // corpo só, o modal segue como sempre foi.
    const campos =
      Array.isArray(modalData.campos) && modalData.campos.length > 1 ? modalData.campos : null;
    const contentAreas = [];
    const criarCampo = (html, rotulo, classe) => {
      const area = document.createElement("div");
      area.className = "ept-inline-editor-content";
      area.setAttribute("contenteditable", "true");
      area.setAttribute("role", "textbox");
      if (rotulo) {
        area.setAttribute("aria-label", rotulo);
      } else {
        area.setAttribute("aria-labelledby", "ept-editor-title");
      }
      area.innerHTML = html || "";
      // Original sem marcas da extensão: referência para saber que
      // parágrafos o usuário não tocou (esses não são normalizados).
      area._eptOriginal = area.innerHTML;
      EPT_protegerWidgets(area);
      // Linha de base para saber se houve alteração. Lida de volta do DOM
      // (não da string recebida), porque o navegador normaliza o HTML.
      area._eptBaseline = area.innerHTML;
      area._eptClasse = classe || "paragrafoPadrao";
      EPT_protegerCampoEdicao(area);
      contentAreas.push(area);
      return area;
    };
    const abas = [];
    if (campos) {
      const barra = document.createElement("div");
      barra.className = "ept-inline-editor-abas";
      barra.setAttribute("role", "tablist");
      body.appendChild(barra);
      campos.forEach((campo, i) => {
        const nome = EPT_nomeConteudo(campo.titulo, i);
        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = "ept-inline-editor-aba";
        tab.setAttribute("role", "tab");
        tab.textContent = nome;
        barra.appendChild(tab);
        const area = criarCampo(campo.html, nome, campo.classe);
        area.setAttribute("role", "tabpanel");
        body.appendChild(area);
        const aba = { nome, tab, area, alterada: false, salva: false };
        abas.push(aba);
        tab.addEventListener("click", () => this.selecionarAba(i));
        area.addEventListener("input", () => {
          // Desfazer até o texto salvo conta como "sem alteração".
          aba.alterada = area.innerHTML !== area._eptBaseline;
          tab.classList.toggle("ept-aba-alterada", aba.alterada);
          if (this.state && this.state.abaAtiva === i) {
            this.atualizarBotaoSalvar();
          }
        });
      });
    } else {
      const areaUnica = criarCampo(modalData.editableContent, null, modalData.classeParagrafo);
      areaUnica.addEventListener("input", () => this.atualizarBotaoSalvar());
      body.appendChild(areaUnica);
    }
    const contentArea = contentAreas[0];

    const footer = document.createElement("div");
    footer.className = "ept-inline-editor-footer";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "ept-inline-editor-btn ept-inline-editor-btn-cancel";
    cancelBtn.textContent = "Cancelar";
    cancelBtn.addEventListener("click", () => this.pedirFechar());

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "ept-inline-editor-btn ept-inline-editor-btn-save";
    saveBtn.textContent = "Salvar";
    saveBtn.disabled = false;

    footer.appendChild(cancelBtn);
    footer.appendChild(saveBtn);

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);

    overlay.appendChild(modal);

    // Removido: fechamento ao clicar fora do modal para evitar perda acidental de trabalho
    // overlay.addEventListener("click", (event) => {
    //   if (event.target === overlay) {
    //     this.closeModal();
    //   }
    // });

    document.addEventListener("keydown", this.handleEscape, true);

    document.body.appendChild(overlay);
    contentArea.focus();

    this.overlay = overlay;
    this.state.contentEditableElement = contentArea;
    this.state.contentEditableElements = contentAreas;
    this.state.abas = abas.length ? abas : null;
    this.state.saveButton = saveBtn;
    this.state.cancelButton = cancelBtn;
    this.state.overlay = overlay;

    const canSave = Boolean(
      this.state.idDocumento &&
        this.state.codDocumento &&
        this.state.hash &&
        this.state.baseUrl
    );

    if (canSave) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Salvar";
      saveBtn.addEventListener("click", () => this.saveCurrent());
    } else {
      saveBtn.disabled = true;
      saveBtn.textContent = "Dados insuficientes";
    }

    this.state.canSave = canSave;
    this.setSavingState(false, canSave ? "Salvar" : "Dados insuficientes");
    // Salvar só se habilita depois de alguma alteração no conteúdo.
    if (this.state.abas) {
      this.selecionarAba(0);
    } else {
      this.atualizarBotaoSalvar();
    }

    window.EPT_INLINE_EDITOR_STATE = this.state;
  },
  /** Mostra só a área da aba i e ajusta o botão salvar para ela. */
  selecionarAba(i) {
    const abas = this.state && this.state.abas;
    if (!abas || !abas[i] || this.state.isSaving) {
      return;
    }
    this.state.abaAtiva = i;
    abas.forEach((aba, j) => {
      const ativa = j === i;
      aba.tab.setAttribute("aria-selected", ativa ? "true" : "false");
      aba.area.hidden = !ativa;
    });
    this.state.contentEditableElement = abas[i].area;
    this.atualizarBotaoSalvar();
    abas[i].area.focus();
  },
  /**
   * Estado dos botões do rodapé:
   * - Salvar só habilita com alteração em relação ao conteúdo de base (o
   *   original, ou o da última gravação) — vale para minuta simples e dupla.
   * - Minuta dupla: aba salva e sem alteração nova → "Ementa salva"
   *   (desabilitado) e "Cancelar" vira "Fechar", só enquanto durar esse
   *   estado naquela aba.
   */
  atualizarBotaoSalvar() {
    const state = this.state;
    if (!state || !state.saveButton || state.canSave === false || state.isSaving) {
      return;
    }
    const save = state.saveButton;
    const cancel = state.cancelButton;
    const aba = state.abas && state.abas[state.abaAtiva];
    if (aba) {
      const concluida = aba.salva && !aba.alterada;
      save.textContent = concluida
        ? EPT_rotuloSalvo(aba.nome)
        : `Salvar ${aba.nome.toLowerCase()}`;
      save.disabled = !aba.alterada;
      if (cancel) {
        cancel.textContent = concluida ? "Fechar" : "Cancelar";
      }
      return;
    }
    const area = state.contentEditableElement;
    const alterada = Boolean(area) && area.innerHTML !== area._eptBaseline;
    save.textContent = "Salvar";
    save.disabled = !alterada;
    if (cancel) {
      cancel.textContent = "Cancelar";
    }
  },
  findEditableSection(root) {
    if (!root) return null;

    if (this.state && this.state.editableSectionId) {
      try {
        const selector = `#${window.CSS && CSS.escape ? CSS.escape(this.state.editableSectionId) : this.state.editableSectionId}`;
        const byId = root.querySelector(selector);
        if (byId) return byId;
      } catch (error) {
        debugLog("EPT: Falha ao buscar section por ID:", error);
      }
    }

    return (
      root.querySelector('section[contenteditable="true"][data-estilo_padrao="paragrafo"]') ||
      root.querySelector('section[data-estilo_padrao="paragrafo"]') ||
      root.querySelector('section[contenteditable="true"][data-sin_conteudo_obrigatorio="true"]') ||
      root.querySelector('section[data-nome="despacho_decisao"]') ||
      root.querySelector('section[data-sin_permite_texto_padrao="true"]')
    );
  },
  sanitizeHtmlEntities(html) {
    if (typeof html !== "string") {
      return "";
    }

    let sanitized = html;

    const namedEntityMap = {
      "&nbsp;": "&#160;",
      "&aacute;": "&#225;",
      "&Aacute;": "&#193;",
      "&agrave;": "&#224;",
      "&Agrave;": "&#192;",
      "&acirc;": "&#226;",
      "&Acirc;": "&#194;",
      "&atilde;": "&#227;",
      "&Atilde;": "&#195;",
      "&eacute;": "&#233;",
      "&Eacute;": "&#201;",
      "&ecirc;": "&#234;",
      "&Ecirc;": "&#202;",
      "&iacute;": "&#237;",
      "&Iacute;": "&#205;",
      "&oacute;": "&#243;",
      "&Oacute;": "&#211;",
      "&ocirc;": "&#244;",
      "&Ocirc;": "&#212;",
      "&otilde;": "&#245;",
      "&Otilde;": "&#213;",
      "&uacute;": "&#250;",
      "&Uacute;": "&#218;",
      "&ccedil;": "&#231;",
      "&Ccedil;": "&#199;",
      "&ordm;": "&#186;",
      "&ordf;": "&#170;",
      "&quot;": "&#34;",
      "&apos;": "&#39;",
    };

    for (const [named, numeric] of Object.entries(namedEntityMap)) {
      sanitized = sanitized.split(named).join(numeric);
    }

    sanitized = sanitized.replace(/[\u0080-\uFFFF]/g, (char) => `&#${char.charCodeAt(0)};`);

    return sanitized;
  },
  /**
   * Devolve o article com o(s) corpo(s) editado(s). Recebe uma string (um
   * corpo, caminho de sempre) ou um array alinhado com state.campos (um
   * conteúdo por corpo, localizado pela posição entre as sections que
   * aceitam texto — a mesma ordem usada para montar os campos).
   */
  reconstructArticle(sanitizedEditableContent) {
    if (!this.state || !this.state.articleHTML) {
      throw new Error("Dados originais da minuta não encontrados.");
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = this.state.articleHTML;

    if (Array.isArray(sanitizedEditableContent)) {
      const corpos = tempDiv.querySelectorAll('section[data-sin_permite_texto_padrao="true"]');
      const campos = this.state.campos || [];
      if (corpos.length !== campos.length || campos.length !== sanitizedEditableContent.length) {
        throw new Error("A estrutura da minuta mudou desde que o editor foi aberto. Recarregue e tente de novo.");
      }
      campos.forEach((campo, i) => {
        const sec = corpos[campo.indice];
        sec.innerHTML = sanitizedEditableContent[i];
        try {
          sec.setAttribute("contenteditable", "true");
        } catch (e) {}
      });
      const articleMulti = tempDiv.querySelector("article");
      if (!articleMulti) {
        throw new Error("Estrutura da minuta inválida ao reconstruir article.");
      }
      return articleMulti.outerHTML;
    }

    const editableSection = this.findEditableSection(tempDiv);
    if (!editableSection) {
      throw new Error("Não foi possível localizar a section editável ao reconstruir a minuta.");
    }

    editableSection.innerHTML = sanitizedEditableContent;
    // Atribui contenteditable="true" conforme padrão observado no editor nativo
    try {
      editableSection.setAttribute("contenteditable", "true");
    } catch (e) {}

    const article = tempDiv.querySelector("article");
    if (!article) {
      throw new Error("Estrutura da minuta inválida ao reconstruir article.");
    }

    return article.outerHTML;
  },
  ensureXhtmlCompliance(html) {
    if (typeof html !== "string" || !html.length) {
      return "";
    }

    const selfClosingTags = ["img", "br", "hr", "meta", "link", "input", "source", "track", "base", "area", "col"];

    selfClosingTags.forEach((tag) => {
      const regex = new RegExp(`<${tag}([^>]*)>`, "gi");
      html = html.replace(regex, (match, attrs = "") => {
        if (/\/>\s*$/.test(match)) {
          return match;
        }
        const cleanedAttrs = attrs.replace(/\s+$/, "");
        return `<${tag}${cleanedAttrs} />`;
      });
    });

    selfClosingTags.forEach((tag) => {
      const closingRegex = new RegExp(`</\\s*${tag}\\s*>`, "gi");
      html = html.replace(closingRegex, "");
    });

    html = html.replace(/<br\s*\/?>/gi, "<br />");
    html = html.replace(/<br\s*><\/br>/gi, "<br />");

    return html;
  },
  buildSavePayload(articleHTML, tamSecEditaveis) {
    const formData = new URLSearchParams();
    formData.append("text", articleHTML);
    formData.append("id_minuta", this.state.idDocumento);
    formData.append("alterarstatus", "1");
    formData.append("statusMinutaDesejado", "0");
    formData.append("sbmCadastrarVersaoConteudo", "1");
    formData.append("acao", "minuta_salvar");
    formData.append("cod_tipo_salvamento_versao_conteudo", "6");
    formData.append("tamSecEditaveis", String(tamSecEditaveis));
    return formData.toString();
  },
  buildUnlockPayload() {
    const formData = new URLSearchParams();
    formData.append("text", "");
    formData.append("id", `${this.state.codDocumento || this.state.idDocumento}_6`);
    formData.append("id_minuta", this.state.idDocumento);
    formData.append("sbmDesbloquear", "1");
    return formData.toString();
  },
  setSavingState(isSaving, label) {
    const button = this.state && this.state.saveButton;
    if (!button) {
      return;
    }
    if (typeof label === "string") {
      button.textContent = label;
    }
    const forceDisabled = this.state && this.state.canSave === false;
    button.disabled = forceDisabled ? true : Boolean(isSaving);
    this.state.isSaving = Boolean(isSaving);
  },
  async postForm(url, body) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
      body,
    });

    const text = await response.text();
    let data = {};
    let successFromRaw = false;

    if (text) {
      const trimmed = text.trim();
      try {
        data = JSON.parse(trimmed);
      } catch (error) {
        const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            data = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            data = { raw: trimmed };
          }
        } else {
          data = { raw: trimmed };
        }
      }
    }

    if (!response.ok) {
      const message = data?.mensagem || data?.erro || response.statusText || "Erro na requisição";
      throw new Error(message);
    }

    const failurePatterns = /"sucesso"\s*:\s*"0"|["']sucesso["']\s*=>\s*["']?0|sucesso\s*=\s*0|sucesso\s*:\s*false/i;

    if (data && typeof data.sucesso === "string") {
      successFromRaw = data.sucesso === "1";
    } else if (typeof data.sucesso === "number") {
      successFromRaw = String(data.sucesso) === "1";
    } else if (!successFromRaw && typeof text === "string") {
      const lowerText = text.toLowerCase();
      successFromRaw =
        /"sucesso"\s*:\s*"1"/i.test(text) ||
        /"sucesso"\s*:\s*1/i.test(text) ||
        /'sucesso'\s*=>\s*'1'/.test(lowerText) ||
        /'sucesso'\s*=>\s*1/.test(lowerText) ||
        /\[sucesso\]\s*=>\s*1/.test(lowerText);
    }

    if (!successFromRaw && typeof text === "string" && !failurePatterns.test(text)) {
      successFromRaw = true;
    }

    if (!successFromRaw) {
      data = { ...data, sucesso: "0" };
    } else if (!data || typeof data !== "object") {
      data = { sucesso: "1" };
    } else {
      data.sucesso = "1";
    }

    return data;
  },
  async saveCurrent() {
    const state = this.state;
    if (!state) {
      alert("EPT: Editor não está ativo.");
      return;
    }
    if (!state.canSave) {
      alert("EPT: Dados insuficientes para salvar esta minuta.");
      return;
    }
    if (state.isSaving) {
      return;
    }
    if (!state.hash) {
      alert("EPT: Hash da minuta não encontrado. Recarregue a página e tente novamente.");
      return;
    }
    if (!state.baseUrl) {
      alert("EPT: Não foi possível determinar a URL base do eProc.");
      return;
    }

    // Minuta dupla: salva só a aba ativa. Os outros corpos vão como estão
    // no article guardado (o original, ou o da última gravação), para que um
    // salvar não leve junto edição não salva da outra aba.
    const multi = Boolean(state.abas && state.abas.length > 1);
    const abaAtiva = multi ? state.abas[state.abaAtiva] : null;
    const editableElement = multi ? abaAtiva.area : state.contentEditableElement;
    if (!editableElement) {
      alert("EPT: Conteúdo editável não encontrado.");
      return;
    }

    const rawContent = editableElement.innerHTML;
    // O que vai para o eproc: o HTML do campo já normalizado (parágrafos
    // com classe, sem <span>/style/<font> do navegador, <br><br> → parágrafo).
    const conteudoGravado = EPT_normalizarCorpoMinuta(
      EPT_desprotegerHtml(rawContent),
      editableElement._eptClasse,
      editableElement._eptOriginal
    );
    const vazio = (() => {
      const t = document.createElement("div");
      t.innerHTML = conteudoGravado;
      return !t.textContent.replace(/\u00a0/g, " ").trim();
    })();
    if (vazio) {
      alert(
        multi
          ? `EPT: O conteúdo de ${abaAtiva.nome.toLowerCase()} está vazio.`
          : "EPT: O conteúdo da minuta está vazio."
      );
      return;
    }

    try {
      this.setSavingState(true, "Salvando...");

      let sanitizedList;
      if (multi) {
        const atual = document.createElement("div");
        atual.innerHTML = state.articleHTML;
        const corposAtuais = atual.querySelectorAll('section[data-sin_permite_texto_padrao="true"]');
        sanitizedList = state.campos.map((campo, i) =>
          i === state.abaAtiva
            ? this.sanitizeHtmlEntities(conteudoGravado)
            : this.sanitizeHtmlEntities(corposAtuais[campo.indice] ? corposAtuais[campo.indice].innerHTML : "")
        );
      } else {
        sanitizedList = [this.sanitizeHtmlEntities(conteudoGravado)];
      }
      const sanitizedEditable = sanitizedList.join("");
      const reconstructedArticle = this.reconstructArticle(
        multi ? sanitizedList : sanitizedList[0]
      );
      const sanitizedArticle = this.sanitizeHtmlEntities(reconstructedArticle);
      const xhtmlArticle = this.ensureXhtmlCompliance(sanitizedArticle);
      // Com vários corpos, a soma do tamanho de todas as seções editáveis.
      const tamSecEditaveis = sanitizedList.reduce((n, c) => n + c.length, 0);

      this.state.articleHTML = xhtmlArticle;
      this.state.editableContent = sanitizedEditable;

      // O hash de minuta_salvar é o que o eproc gera na página do EDITOR, não
      // o do preview (state.hash). Com o do preview, o servidor executa o
      // salvar/desbloquear, mas guarda "A ação foi cancelada devido a uma
      // mudança no perfil do usuário" para a próxima tela (ex.: assinar).
      const hashSalvar = (await EPT_hashSalvarDoEditor(state.rowElement, state.baseUrl)) || state.hash;
      EPT_addLog("save:hash", { doEditor: hashSalvar !== state.hash });
      const saveUrl = `${state.baseUrl}/controlador_ajax.php?acao_ajax=minuta_salvar&acao_origem=minuta_editar&hash=${hashSalvar}`;
      const savePayload = this.buildSavePayload(xhtmlArticle, tamSecEditaveis);

      EPT_addLog("save:request", {
        url: saveUrl,
        tamSecEditaveis,
        idDocumento: state.idDocumento,
        codDocumento: state.codDocumento,
      });

      const saveResult = await this.postForm(saveUrl, savePayload);
      if (!saveResult || saveResult.sucesso !== "1") {
        const msg = saveResult?.mensagem || saveResult?.erro || "Resposta inesperada do servidor.";
        EPT_addLog("save:response", { success: false, msg, raw: saveResult });
        throw new Error(msg);
      }
      EPT_addLog("save:response", { success: true, raw: saveResult });

      let unlockFailedMessage = null;
      const unlockPayload = this.buildUnlockPayload();
      try {
        EPT_addLog("unlock:request", {
          url: saveUrl,
          idDocumento: state.idDocumento,
          codDocumento: state.codDocumento,
        });

        const unlockResult = await this.postForm(saveUrl, unlockPayload);
        if (unlockResult && unlockResult.sucesso !== "1") {
          unlockFailedMessage = unlockResult?.mensagem || unlockResult?.erro || "Desbloqueio não confirmado.";
          EPT_addLog("unlock:response", { success: false, raw: unlockResult });
        } else {
          EPT_addLog("unlock:response", { success: true, raw: unlockResult });
        }
      } catch (unlockError) {
        unlockFailedMessage = unlockError.message || "Não foi possível desbloquear a minuta automaticamente.";
        EPT_addLog("unlock:error", { message: unlockError.message });
      }

      try {
        if (state.rowElement) {
          let previewHtml = sanitizedEditable;
          let previewTitulos = [];
          if (multi) {
            // Mesmo formato da lista: cada corpo com o seu limite, numa aba.
            const tmp = document.createElement("div");
            tmp.innerHTML = xhtmlArticle;
            const corpoSalvo = EPT_extractPreviewBody(tmp);
            previewHtml = corpoSalvo.partes;
            previewTitulos = corpoSalvo.titulos;
          }
          EPT_updatePreviewContainer(state.rowElement, previewHtml, 1000, previewTitulos);
        }
      } catch (updateError) {
        debugLog("EPT: Erro ao atualizar linha após salvamento:", updateError);
      }

      // Após salvar e desbloquear, a mesma chamada que o eproc faz ao voltar
      // do editor (atualizaTrMinuta): atualizar_info_minuta.
      //
      // Antes ia com o hash da URL da área de trabalho e corpo vazio. O hash
      // do eproc é por ação; com um que não confere, o servidor redirecionava
      // para a tela inicial e guardava "A ação foi cancelada devido a uma
      // mudança no perfil do usuário", exibida na ação seguinte. E o fetch
      // seguia o redirecionamento, carregando o painel inteiro (lento).
      // Agora: hash que o eproc gerou para esta ação (no script da página),
      // corpo igual ao nativo, e redirecionamento nunca seguido. Sem o hash,
      // a chamada é pulada — nunca vai com hash errado.
      try {
        const hashAtualizar = EPT_hashAcaoAjax("atualizar_info_minuta");
        const tr = state.rowElement;
        const idMinuta = tr && tr.id ? tr.id.replace(/^tr_/, "") : "";
        if (!hashAtualizar || !idMinuta) {
          EPT_addLog("postsave:update_info:skip", { hash: !!hashAtualizar, idMinuta: !!idMinuta });
        } else {
          const atualizarUrl = `${state.baseUrl}/controlador_ajax.php?acao_ajax=atualizar_info_minuta&acao_origem=minuta_area_trabalho&hash=${hashAtualizar}`;
          const filtro = document.getElementById("hdnFiltroExibicao");
          const corpo = new URLSearchParams();
          corpo.append("id_minuta", idMinuta);
          corpo.append("num_linha", tr.getAttribute("num_linha") || "");
          corpo.append("arr_filtro_exibicao", filtro ? filtro.value : "");
          corpo.append("txtTermosPesquisados", "");
          EPT_addLog("postsave:update_info:request", { url: atualizarUrl });
          const resp = await fetch(atualizarUrl, {
            method: "POST",
            credentials: "include",
            redirect: "manual",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: corpo.toString(),
          });
          EPT_addLog("postsave:update_info:response", {
            status: resp.status,
            redirecionado: resp.type === "opaqueredirect",
          });
        }
      } catch (postSaveUpdateErr) {
        debugLog("EPT: Falha ao emular atualização pós-salvar:", postSaveUpdateErr);
        EPT_addLog("postsave:update_info:error", { message: postSaveUpdateErr?.message });
      }

      const rotuloSalvo = multi ? EPT_rotuloSalvo(abaAtiva.nome) : "Minuta salva";
      if (multi) {
        // Fica aberto: o usuário pode passar para a outra aba e editá-la.
        // A nova base é o que foi gravado (rawContent), não a tela: se a
        // pessoa digitou durante o salvamento, isso ainda conta como alteração.
        // Sem digitação no meio, o campo passa a mostrar o HTML normalizado,
        // que é o que ficou gravado.
        abaAtiva.salva = true;
        // O gravado vira o novo "original" desta aba.
        abaAtiva.area._eptOriginal = EPT_serializarHtml(conteudoGravado);
        if (abaAtiva.area.innerHTML === rawContent) {
          abaAtiva.area.innerHTML = conteudoGravado;
          EPT_protegerWidgets(abaAtiva.area);
          abaAtiva.area._eptBaseline = abaAtiva.area.innerHTML;
        } else {
          abaAtiva.area._eptBaseline = rawContent;
        }
        abaAtiva.alterada = abaAtiva.area.innerHTML !== abaAtiva.area._eptBaseline;
        abaAtiva.tab.classList.toggle("ept-aba-alterada", abaAtiva.alterada);
        this.state.isSaving = false;
        this.atualizarBotaoSalvar();
      } else {
        this.setSavingState(true, `${rotuloSalvo}!`);
      }

      if (unlockFailedMessage) {
        alert(
          `EPT: ${rotuloSalvo} com sucesso, mas não foi possível desbloquear automaticamente.\n` +
            "Mensagem: " +
            unlockFailedMessage
        );
        EPT_addLog("unlock:warning", { message: unlockFailedMessage });
      }

      if (!multi) {
        setTimeout(() => {
          this.closeModal();
        }, 700);
      }
    } catch (error) {
      console.error("EPT: Erro ao salvar minuta:", error);
      EPT_addLog("save:error", { message: error.message, stack: error.stack });
      alert(
        `EPT: Não foi possível salvar ${multi ? abaAtiva.nome.toLowerCase() : "a minuta"}.\nMotivo: ${error.message}`
      );
      this.setSavingState(false, "Salvar");
      this.atualizarBotaoSalvar();
    }
  },
};

// ---- Edição rápida: colagem, Shift+Enter e normalização --------------
//
// O modal é um contenteditable puro, sem o CKEditor do eproc. Sem estes
// cuidados, colar do Word/e-mail/site trazia HTML arbitrário para a minuta,
// e o navegador gerava <br>, <span style>, <font>, <div> e texto solto fora
// do padrão <p class="..."> que o eproc usa.

/**
 * Classe de reserva de um corpo, usada só em conteúdo que chegue sem classe
 * (texto solto, <div>). Enter e colagem não passam por aqui: o próprio
 * navegador copia a classe do parágrafo onde está o cursor, como o CKEditor.
 * paragrafoPadrao quando existir no corpo; senão, a classe mais frequente
 * (na ementa, caputEmenta). Nunca a do primeiro parágrafo por acaso — uma
 * sentença pode começar por alínea (paragrafoComRecuo) ou citação.
 */
function EPT_classeParagrafo(section) {
  const contagem = new Map();
  (section ? section.querySelectorAll("p[class]") : []).forEach((p) => {
    const c = p.getAttribute("class").trim();
    if (c) {
      contagem.set(c, (contagem.get(c) || 0) + 1);
    }
  });
  if (!contagem.size || contagem.has("paragrafoPadrao")) {
    return "paragrafoPadrao";
  }
  return Array.from(contagem.entries()).sort((a, b) => b[1] - a[1])[0][0];
}

// Elementos que o CKEditor trata como bloco fechado (widget "anonimizar" e
// afins). No modal ficam não editáveis, para o nome não ser alterado letra a
// letra; a marca sai antes de salvar.
const EPT_SELETOR_PROTEGIDO =
  'span.anonimizar, [data-widget], [data-crc32b], [data-cke-widget-wrapper], [contenteditable="false"]';

function EPT_protegerWidgets(area) {
  area.querySelectorAll(EPT_SELETOR_PROTEGIDO).forEach((el) => {
    if (el.closest("[data-ept-protegido]") && !el.hasAttribute("data-ept-protegido")) {
      return; // já dentro de um protegido
    }
    if (!el.hasAttribute("data-ept-protegido")) {
      el.setAttribute(
        "data-ept-protegido",
        el.hasAttribute("contenteditable") ? el.getAttribute("contenteditable") : ""
      );
    }
    el.setAttribute("contenteditable", "false");
  });
}

/** Desfaz EPT_protegerWidgets numa string de HTML (o atributo original volta). */
function EPT_desprotegerHtml(html) {
  const raiz = document.createElement("div");
  raiz.innerHTML = html || "";
  raiz.querySelectorAll("[data-ept-protegido]").forEach((el) => {
    const original = el.getAttribute("data-ept-protegido");
    el.removeAttribute("data-ept-protegido");
    if (original) {
      el.setAttribute("contenteditable", original);
    } else {
      el.removeAttribute("contenteditable");
    }
  });
  return raiz.innerHTML;
}

/** Serializa pelo DOM, para comparar HTML na mesma forma que o campo usa. */
function EPT_serializarHtml(html) {
  const raiz = document.createElement("div");
  raiz.innerHTML = html || "";
  return raiz.innerHTML;
}

/** Insere texto puro na seleção: 1ª linha no parágrafo atual, cada linha
 * seguinte num parágrafo novo (que herda a classe, como o Enter). Usa
 * execCommand para o Ctrl+Z continuar funcionando. */
function EPT_inserirTextoComoParagrafos(texto) {
  const linhas = String(texto || "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\t/g, " ").replace(/\s+$/, ""))
    .filter((l) => l.trim().length);
  linhas.forEach((linha, i) => {
    if (i > 0) {
      document.execCommand("insertParagraph");
    }
    document.execCommand("insertText", false, linha);
  });
}

/** Colagem e arrasto só como texto. Enter e Shift+Enter ficam com o
 * comportamento do navegador, igual ao do CKEditor (Shift+Enter = <br>). */
function EPT_protegerCampoEdicao(area) {
  area.addEventListener("paste", (event) => {
    const dados = event.clipboardData;
    if (!dados) {
      return;
    }
    event.preventDefault();
    EPT_inserirTextoComoParagrafos(dados.getData("text/plain"));
  });
  area.addEventListener("drop", (event) => {
    const dados = event.dataTransfer;
    if (!dados) {
      return;
    }
    event.preventDefault();
    const range =
      document.caretRangeFromPoint && document.caretRangeFromPoint(event.clientX, event.clientY);
    if (range) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    EPT_inserirTextoComoParagrafos(dados.getData("text/plain"));
  });
}

/**
 * Deixa o HTML do campo no padrão do eproc antes de salvar — mas SÓ nos
 * parágrafos novos ou alterados. Parágrafo de topo cujo id e HTML batem com
 * o original carregado (`original`) fica intocado: uma vírgula corrigida não
 * pode mexer no resto da sentença.
 *
 * Nos parágrafos novos/alterados:
 * - texto e inline soltos no topo, e <div>, viram <p> com a classe de reserva;
 * - <p> sem classe recebe a classe de reserva;
 * - <font> e <span> sem atributo (ou só com style) são desembrulhados;
 *   style sai dos <span> restantes (spans com classe — dispositivo,
 *   anonimizar — ficam);
 * - &nbsp; nas pontas de cada trecho de texto vira espaço; espaço no fim do
 *   parágrafo sai;
 * - id repetido sai (o Chrome copia o id ao dividir um parágrafo com Enter;
 *   o eproc renumera ao gravar).
 * <br> fica como está (Shift+Enter, igual ao nativo). Listas, tabelas e
 * citações não são tocadas.
 */
function EPT_normalizarCorpoMinuta(html, classe, original) {
  const classePadrao = classe || "paragrafoPadrao";
  const raiz = document.createElement("div");
  raiz.innerHTML = html || "";

  // Parágrafos originais intactos (id → HTML), cada id usado uma vez.
  const originais = new Map();
  if (typeof original === "string") {
    const o = document.createElement("div");
    o.innerHTML = original;
    Array.from(o.children).forEach((el) => {
      if (el.id && !originais.has(el.id)) {
        originais.set(el.id, el.outerHTML);
      }
    });
  }
  const intocados = new Set();
  Array.from(raiz.children).forEach((el) => {
    if (el.id && originais.get(el.id) === el.outerHTML) {
      intocados.add(el);
      originais.delete(el.id);
    }
  });
  const livre = (el) => {
    let topo = el;
    while (topo && topo.parentNode !== raiz) {
      topo = topo.parentNode;
    }
    return !intocados.has(topo);
  };

  // 1. <font> e <span> sem função.
  raiz.querySelectorAll("font").forEach((el) => {
    if (livre(el)) {
      el.replaceWith(...el.childNodes);
    }
  });
  raiz.querySelectorAll("span").forEach((el) => {
    if (!livre(el)) {
      return;
    }
    el.removeAttribute("style");
    if (!el.attributes.length) {
      el.replaceWith(...el.childNodes);
    }
  });

  // 2. <div> vira parágrafo (desembrulha se já contém blocos).
  const BLOCO = /^(P|DIV|UL|OL|TABLE|BLOCKQUOTE|H[1-6]|PRE|HR|SECTION)$/;
  raiz.querySelectorAll("div").forEach((div) => {
    if (!livre(div)) {
      return;
    }
    const temBloco = Array.from(div.children).some((c) => BLOCO.test(c.tagName));
    if (temBloco) {
      div.replaceWith(...div.childNodes);
    } else {
      const p = document.createElement("p");
      if (div.getAttribute("class")) {
        p.setAttribute("class", div.getAttribute("class"));
      }
      p.append(...div.childNodes);
      div.replaceWith(p);
    }
  });

  // 3. Texto e inline soltos no topo → <p>.
  let pendente = null;
  Array.from(raiz.childNodes).forEach((no) => {
    if (no.nodeType === 1 && BLOCO.test(no.tagName)) {
      pendente = null;
      return;
    }
    if (no.nodeType !== 1 && no.nodeType !== 3) {
      return;
    }
    if (no.nodeType === 3 && !no.textContent.trim() && !pendente) {
      no.remove();
      return;
    }
    if (!pendente) {
      pendente = document.createElement("p");
      pendente.setAttribute("class", classePadrao);
      raiz.insertBefore(pendente, no);
    }
    pendente.appendChild(no);
  });

  // 4. Classe, ids e espaços. Ids dos intocados entram primeiro: um
  //    parágrafo novo com id copiado é que perde o id.
  const idsVistos = new Set();
  intocados.forEach((el) => idsVistos.add(el.id));
  raiz.querySelectorAll("p").forEach((p) => {
    if (!livre(p)) {
      return;
    }
    if (!p.getAttribute("class")) {
      p.setAttribute("class", classePadrao);
    }
    if (p.id) {
      if (idsVistos.has(p.id)) {
        p.removeAttribute("id");
      } else {
        idsVistos.add(p.id);
      }
    }
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    const textos = [];
    while (walker.nextNode()) {
      textos.push(walker.currentNode);
    }
    textos.forEach((t) => {
      t.textContent = t.textContent.replace(/^\u00a0/, " ").replace(/\u00a0$/, " ");
    });
    for (let k = textos.length - 1; k >= 0; k--) {
      const t = textos[k];
      const limpo = t.textContent.replace(/[ \u00a0]+$/, "");
      t.textContent = limpo;
      if (limpo.length) {
        break;
      }
    }
  });

  return raiz.innerHTML;
}

/**
 * Hash que o eproc gerou para uma acao_ajax nesta página. Fica nos scripts
 * inline (ex.: atualizaTrMinuta monta "controlador_ajax.php?acao_ajax=
 * atualizar_info_minuta&...&hash=<32 hex>"). O DOM é compartilhado com o
 * mundo isolado, então o texto dos scripts é legível daqui.
 */
function EPT_hashAcaoAjax(acao) {
  const re = new RegExp(`acao_ajax=${acao}[^"'\\s]*?hash=([a-f0-9]{32})`, "i");
  for (const s of document.scripts) {
    if (s.src) {
      continue;
    }
    const m = re.exec(s.textContent || "");
    if (m) {
      return m[1];
    }
  }
  return "";
}

/**
 * Hash de minuta_salvar desta minuta, lido da página do editor nativo — o
 * mesmo endereço que o botão "Editar" da linha abre (window.open com
 * acao=minuta_editar). Abrir o editor bloqueia a minuta, como no fluxo
 * nativo; o desbloqueio que a edição rápida faz logo após salvar libera.
 * Retorna "" se não conseguir (quem chama decide o que fazer).
 */
async function EPT_hashSalvarDoEditor(rowElement, baseUrl) {
  try {
    if (!rowElement || !baseUrl) {
      return "";
    }
    const absoluta = (rel) =>
      /^https?:\/\//i.test(rel) ? rel : `${baseUrl}/${rel.replace(/^\//, "")}`;
    const baixar = async (rel) => {
      const resp = await fetch(absoluta(rel), { credentials: "include", redirect: "manual" });
      return resp.ok ? await resp.text() : "";
    };

    let relEditor = EPT_linkAcaoDaLinha(rowElement, "minuta_editar");
    if (!relEditor) {
      // Minuta com agendamento de eventos: o "Editar" da linha abre antes a
      // tela minuta_verificar_agendamento (exibirSubFrm), e é ela que traz o
      // endereço do editor (strLinkVisualizarMinuta). Comum no 1º grau.
      const relAgendamento = EPT_linkAcaoDaLinha(rowElement, "minuta_verificar_agendamento");
      if (!relAgendamento) {
        return "";
      }
      const m = /controlador\.php\?acao=minuta_editar[^"'\s<>]*/i.exec(await baixar(relAgendamento));
      if (!m) {
        return "";
      }
      relEditor = m[0].replace(/&amp;/g, "&");
    }
    const html = await baixar(relEditor);
    const m = /acao_ajax=minuta_salvar[^"'\s<]*?hash=([a-f0-9]{32})/i.exec(html);
    return m ? m[1] : "";
  } catch (e) {
    return "";
  }
}

/**
 * Endereço (como o eproc escreveu, com o hash) de uma ação nos links da
 * linha. O eproc usa onclick="window.open('...')" em uns casos e
 * href="javascript:exibirSubFrm('...')" em outros; procura nos dois.
 */
function EPT_linkAcaoDaLinha(rowElement, acao) {
  const re = new RegExp(`controlador\\.php\\?acao=${acao}&[^'"\\s]*`, "i");
  for (const a of rowElement.querySelectorAll("a")) {
    for (const attr of ["onclick", "href"]) {
      const m = re.exec(a.getAttribute(attr) || "");
      if (m) {
        return m[0].replace(/&amp;/g, "&");
      }
    }
  }
  return "";
}

/**
 * Endereço base do eproc: a pasta onde está o controlador.php da página.
 * Quase todos os tribunais usam /eproc/, mas não todos — TJMMG usa
 * /eproc1g/ e /eproc2g/, STM usa /eproc_1g_prod/ e /eproc_2g_prod/. Cortar
 * a URL em "eproc/" quebrava nesses.
 */
function EPT_baseEproc() {
  return window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "");
}

/** "EMENTA" → "Ementa", "ACÓRDÃO" → "Acórdão"; sem título, "Parte N". */
function EPT_nomeConteudo(titulo, i) {
  const t = (titulo || "").replace(/\s+/g, " ").trim().toLocaleLowerCase("pt-BR");
  if (!t) {
    return `Parte ${i + 1}`;
  }
  return t.charAt(0).toLocaleUpperCase("pt-BR") + t.slice(1);
}

/** "Ementa salva", "Acórdão salvo", "Relatório salvo", "Voto salvo". */
function EPT_rotuloSalvo(nome) {
  return /a$/i.test(nome) || /^parte\b/i.test(nome) ? `${nome} salva` : `${nome} salvo`;
}

window.EPT_DEBUG_ENABLED = window.EPT_DEBUG_ENABLED || false;

//window.EPT_DEBUG_ENABLED = true; //descomentar para ativar logs em etapa de desenvolvimento

// Simple debug function
function debugLog(...args) {
  if (window.EPT_DEBUG_ENABLED) {
    console.log(...args);
  }
}

/**
 * Fecha o balão global do Infra (#divInfraTooltip + #ifrInfraTooltip).
 *
 * O ept.js roda no mundo isolado da extensão: window.infraTooltipOcultar,
 * que é da página, não existe aqui — a versão antiga desta função nunca
 * fechava nada. O DOM é compartilhado, então fazemos o mesmo que o
 * infraTooltipOcultar faz: visibility hidden nos dois elementos.
 */
function EPT_tryHideInfraTooltip() {
  try {
    ["divInfraTooltip", "ifrInfraTooltip"].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) {
        el.style.visibility = "hidden";
      }
    });
  } catch (e) {
    /* silencioso */
  }
}

/**
 * Tira os tooltips do Infra (onmouseover/onmouseout com infraTooltip*) do
 * cartão da minuta. Ficam só os da coluna "Mais ações"
 * (td.ept-recursos-originais), que explicam os ícones.
 *
 * Motivo: o cartão é redesenhado com o mouse por cima; o elemento que abriu
 * o balão some sem disparar o onmouseout, e o balão fica preso na tela.
 */
function EPT_stripCardTooltips(root) {
  if (!root || !root.querySelectorAll) {
    return;
  }
  root
    .querySelectorAll('[onmouseover*="infraTooltip"], [onmouseout*="infraTooltip"]')
    .forEach(function (el) {
      if (el.closest("td.ept-recursos-originais")) {
        return;
      }
      ["onmouseover", "onmouseout"].forEach(function (attr) {
        const v = el.getAttribute(attr);
        if (v && v.indexOf("infraTooltip") !== -1) {
          el.removeAttribute(attr);
        }
      });
    });
}

function EPT_addLog(event, payload) {
  try {
    // Buffer em memória para inspeção rápida
    window.EPT_LOGS = window.EPT_LOGS || [];
    const entry = {
      ts: new Date().toISOString(),
      event: event || "log",
      payload: payload || null,
    };
    window.EPT_LOGS.push(entry);

    // Saída opcional no console quando o debug estiver habilitado
    if (window.EPT_DEBUG_ENABLED) {
      // Formato compacto para facilitar leitura
      console.log("[EPT]", entry.event, entry.payload);
    }
  } catch (e) {
    // Silencioso por segurança
  }
}

// ---- Conteúdo ativo no HTML da minuta ---------------------------------
//
// O HTML da minuta vem do eproc e é escrito por quem tem acesso ao
// gabinete. A extensão o insere na página (cartão da lista, modal da edição
// rápida); sem filtro, um <img onerror=...> gravado numa minuta rodaria na
// sessão de quem abre a lista. Por isso:
// - o HTML é lido sempre num documento inerte (DOMParser: nada executa,
//   nenhuma imagem é carregada);
// - na LISTA, o conteúdo ativo é retirado antes de ir para a página (é só
//   exibição, nada é gravado);
// - na EDIÇÃO RÁPIDA, minuta com conteúdo ativo é recusada: retirar e
//   salvar alteraria o documento sem a pessoa saber.

// Elementos que executam código, carregam outro documento, enviam
// formulário, mudam o estilo da página, ou que o navegador lê de um jeito
// no documento inerte e de outro na página (noscript, template, svg, math…).
const EPT_ELEMENTOS_ATIVOS = [
  "script", "iframe", "frame", "frameset", "object", "embed", "applet",
  "link", "meta", "base", "style", "form", "input", "button", "select",
  "textarea", "noscript", "noembed", "noframes", "template", "xmp",
  "plaintext", "listing", "svg", "math", "animate", "set",
].join(",");

/** Documento inerte a partir de uma string de HTML. */
function EPT_documentoInerte(html) {
  return new DOMParser().parseFromString(String(html || ""), "text/html");
}

/**
 * Procura conteúdo ativo dentro de `root` (elemento de documento inerte).
 * Com `remover`, retira o que achar. Devolve a lista do que foi achado, em
 * texto, sem repetição (ex.: ["<script>", "atributo onerror"]).
 */
function EPT_conteudoAtivo(root, remover) {
  const achados = new Set();
  if (!root) {
    return [];
  }
  Array.from(root.querySelectorAll(EPT_ELEMENTOS_ATIVOS)).forEach((el) => {
    achados.add(`<${el.localName}>`);
    if (remover) {
      el.remove();
    }
  });
  const elementos = Array.from(root.querySelectorAll("*"));
  if (root.nodeType === 1) {
    elementos.push(root);
  }
  elementos.forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const nome = attr.name.toLowerCase();
      // Espaços e caracteres de controle são ignorados pelo navegador antes
      // do esquema ("java\tscript:").
      const valor = attr.value.replace(/[\u0000- ]/g, "").toLowerCase();
      let motivo = "";
      if (nome.startsWith("on")) {
        motivo = `atributo ${nome}`;
      } else if (nome === "srcdoc") {
        motivo = "atributo srcdoc";
      } else if (/^(javascript|vbscript):/.test(valor) || /^data:text\/html/.test(valor)) {
        motivo = `endereço ${valor.split(":")[0]}: em ${nome}`;
      }
      if (motivo) {
        achados.add(motivo);
        if (remover) {
          el.removeAttribute(attr.name);
        }
      }
    });
  });
  return Array.from(achados);
}

/**
 * Página de preview do eproc pronta para a lista: lida em documento inerte
 * e já sem conteúdo ativo. Devolve o <body> (inerte), para consulta com
 * querySelector e leitura de innerHTML.
 */
function EPT_previewSeguro(html) {
  const doc = EPT_documentoInerte(html);
  // O que conta para o aviso do cartão é o documento da minuta (article) —
  // o mesmo alcance da recusa da edição rápida. O resto da página de
  // preview é limpo também, mas sem aviso: é a moldura do eproc.
  const minuta =
    doc.body.querySelector("article") ||
    doc.body.querySelector('section[data-estilo_padrao="paragrafo"]');
  const achados = minuta ? EPT_conteudoAtivo(minuta, false) : [];
  EPT_conteudoAtivo(doc.body, true);
  if (achados.length) {
    EPT_addLog("preview:conteudo_ativo_removido", { achados });
  }
  doc.body._eptConteudoRetirado = achados.length > 0;
  return doc.body;
}

function EPT_generatePreviewId() {
  return `ept-preview-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function EPT_truncatePreviewContent(htmlContent, maxChars = 1000) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  const textContent = tempDiv.textContent || tempDiv.innerText || "";

  if (textContent.length <= maxChars) {
    return {
      content: htmlContent,
      isTruncated: false,
      fullContent: htmlContent,
    };
  }

  const clonedDiv = tempDiv.cloneNode(true);
  let charCount = 0;
  const elementsToKeep = [];
  const children = Array.from(clonedDiv.children);

  for (let i = 0; i < children.length; i++) {
    const element = children[i];
    const elementText = element.textContent || element.innerText || "";

    if (charCount + elementText.length <= maxChars) {
      charCount += elementText.length;
      elementsToKeep.push(element.outerHTML);
    } else {
      const remainingChars = maxChars - charCount;

      if (remainingChars > 50) {
        const tempElement = element.cloneNode(true);
        const walker = document.createTreeWalker(tempElement, NodeFilter.SHOW_TEXT, null, false);
        let usedChars = 0;
        let textNode;

        while ((textNode = walker.nextNode())) {
          const nodeText = textNode.textContent;
          if (usedChars + nodeText.length <= remainingChars) {
            usedChars += nodeText.length;
          } else {
            const allowedChars = remainingChars - usedChars;
            textNode.textContent = nodeText.substring(0, allowedChars);
            let nextNode;
            while ((nextNode = walker.nextNode())) {
              nextNode.textContent = "";
            }
            break;
          }
        }

        elementsToKeep.push(tempElement.outerHTML);
      }
      break;
    }
  }

  return {
    content: elementsToKeep.join(""),
    isTruncated: true,
    fullContent: htmlContent,
  };
}

/**
 * Corpo e título da minuta para o preview da lista.
 *
 * Minuta de 2º grau pode ter mais de um corpo: a EMENTA traz a seção
 * "ementa" (estilo caputEmenta) e, depois do título "ACÓRDÃO", a seção
 * "acordao"; há também RELATÓRIO + VOTO num documento só. O seletor antigo
 * pegava só a primeira section de estilo "paragrafo" e perdia o resto.
 * Aqui entram todas as sections que aceitam texto
 * (data-sin_permite_texto_padrao), na ordem do documento, cada uma numa
 * aba do cartão; os títulos de cada corpo vão juntos para o cabeçalho do cartão
 * ("EMENTA · ACÓRDÃO"). Sem nenhuma dessas sections, cai no seletor antigo.
 *
 * @returns {{partes: string[], titulo: string}} uma entrada por corpo
 *   (uma só fora das minutas duplas); titulo vazio = usar o padrão.
 */
function EPT_extractPreviewBody(root) {
  if (!root) {
    return { partes: [""], titulos: [], titulo: "" };
  }
  const scope = root.querySelector("article") || root;
  const corpos = scope.querySelectorAll('section[data-sin_permite_texto_padrao="true"]');
  if (corpos.length > 1) {
    const partes = [];
    const titulos = [];
    let tituloPendente = "";
    scope.querySelectorAll("section").forEach(function (sec) {
      if (sec.getAttribute("data-estilo_padrao") === "titulo") {
        tituloPendente = sec.textContent.replace(/\s+/g, " ").trim();
      } else if (sec.getAttribute("data-sin_permite_texto_padrao") === "true") {
        partes.push(sec.innerHTML);
        // Alinhado com partes: "" quando o corpo não tem título próprio.
        titulos.push(tituloPendente);
        tituloPendente = "";
      }
    });
    return { partes, titulos, titulo: titulos.filter(Boolean).join(" · ") };
  }
  const section =
    scope.querySelector('section[data-estilo_padrao="paragrafo"]') || corpos[0] || null;
  return { partes: [section ? section.innerHTML : ""], titulos: [], titulo: "" };
}

/**
 * Um corpo do preview, com o limite de caracteres e o seu próprio
 * "Ver texto completo". Nas minutas duplas, cada corpo passa por aqui
 * separadamente — o limite vale para cada um, não para o conjunto.
 */
function EPT_buildPreviewPart(htmlContent, maxChars) {
  const contentInfo = EPT_truncatePreviewContent(htmlContent, maxChars);
  if (!contentInfo.isTruncated) {
    return contentInfo.content;
  }
  const uniqueId = EPT_generatePreviewId();
  return `
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
        </div>`;
}

/**
 * Contêiner do preview. Aceita o HTML de um corpo ou, nas minutas duplas,
 * um array com um HTML por corpo — cada um limitado à parte e numa aba
 * própria (Ementa | Acórdão), como no modal da edição rápida. Só a aba
 * ativa aparece. As abas seguem a ordem do documento; a que abre
 * selecionada é a de `abaAtiva` ou, sem ela, EMENTA (em ementa + acórdão) ou
 * VOTO (em relatório + voto) — a primeira, se não houver nenhuma das duas.
 */
function EPT_abaPadrao(titulos) {
  const nomes = (titulos || []).map((t) => String(t || "").replace(/\s+/g, " ").trim().toLocaleLowerCase("pt-BR"));
  for (const preferida of ["ementa", "voto"]) {
    const i = nomes.indexOf(preferida);
    if (i >= 0) {
      return i;
    }
  }
  return 0;
}

function EPT_buildPreviewMarkup(
  htmlContent,
  maxChars = 1000,
  titulos = [],
  abaAtiva = null,
  conteudoRetirado = false
) {
  const partes = Array.isArray(htmlContent) ? htmlContent : [htmlContent];
  const uniqueId = EPT_generatePreviewId();
  // Conteúdo ativo retirado (EPT_previewSeguro): o cartão mostra menos do
  // que o documento tem, e quem vai assinar precisa saber.
  const aviso = conteudoRetirado
    ? '<div class="ept-preview-aviso" role="note" data-ept-conteudo-retirado="true">Parte do conteúdo desta minuta não é exibida aqui. Confira no editor do eproc antes de assinar.</div>'
    : "";
  if (partes.length < 2) {
    return `<div class="ept-preview-container" data-ept-preview-container="true" data-ept-preview-id="${uniqueId}">
    ${aviso}${EPT_buildPreviewPart(partes[0] || "", maxChars)}
  </div>`;
  }
  const ativa =
    Number.isInteger(abaAtiva) && abaAtiva >= 0 && abaAtiva < partes.length
      ? abaAtiva
      : Math.min(EPT_abaPadrao(titulos), partes.length - 1);
  const escapar = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const abas = partes
    .map((_, i) => {
      const nome = escapar(EPT_nomeConteudo((titulos || [])[i], i));
      return `<button type="button" class="ept-preview-aba" role="tab" data-ept-aba="${i}" aria-selected="${i === ativa}">${nome}</button>`;
    })
    .join("");
  const paineis = partes
    .map(
      (html, i) =>
        `<div class="ept-preview-painel" role="tabpanel" data-ept-painel="${i}"${i === ativa ? "" : " hidden"}>${EPT_buildPreviewPart(html || "", maxChars)}</div>`
    )
    .join("");
  return `<div class="ept-preview-container ept-preview-com-abas" data-ept-preview-container="true" data-ept-preview-id="${uniqueId}" data-ept-aba-ativa="${ativa}">
    ${aviso}<div class="ept-preview-abas" role="tablist">${abas}</div>
    ${paineis}
  </div>`;
}

// Troca de aba no cartão da minuta dupla. Um ouvinte só, no documento, em
// fase de captura: o cartão é reescrito a cada atualização, e o clique na
// aba não deve chegar aos ouvintes da linha (seleção da minuta etc.).
document.addEventListener(
  "click",
  (event) => {
    const aba = event.target && event.target.closest && event.target.closest(".ept-preview-aba");
    if (!aba) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const container = aba.closest("[data-ept-preview-container]");
    if (!container) {
      return;
    }
    const indice = aba.getAttribute("data-ept-aba");
    container.setAttribute("data-ept-aba-ativa", indice);
    container.querySelectorAll(".ept-preview-aba").forEach((b) => {
      b.setAttribute("aria-selected", String(b === aba));
    });
    container.querySelectorAll(".ept-preview-painel").forEach((p) => {
      p.hidden = p.getAttribute("data-ept-painel") !== indice;
    });
  },
  true
);

function EPT_updatePreviewContainer(
  rowElement,
  htmlContent,
  maxChars = 1000,
  titulos = [],
  conteudoRetirado = false
) {
  if (!rowElement) {
    return;
  }

  const existingContainer = rowElement.querySelector("[data-ept-preview-container]");
  // Ao reescrever o cartão (depois de salvar, por exemplo), a aba que a
  // pessoa estava vendo continua selecionada.
  const abaGuardada = existingContainer
    ? parseInt(existingContainer.getAttribute("data-ept-aba-ativa"), 10)
    : NaN;
  const abaAtiva = Number.isInteger(abaGuardada) ? abaGuardada : null;
  const newMarkup = EPT_buildPreviewMarkup(htmlContent, maxChars, titulos, abaAtiva, conteudoRetirado);

  if (existingContainer) {
    existingContainer.outerHTML = newMarkup;
  } else {
    const contentCell = rowElement.querySelector('td[colspan]') || rowElement.querySelector("td:nth-child(2)");
    if (contentCell) {
      const footerDiv = contentCell.querySelector('div[style*="margin-top: 30px"]');
      if (footerDiv) {
        footerDiv.insertAdjacentHTML("beforebegin", newMarkup);
      } else {
        contentCell.insertAdjacentHTML("beforeend", newMarkup);
      }
    }
  }

  if (window.EPT_TableStyler && typeof window.EPT_TableStyler.enhanceContent === "function") {
    window.EPT_TableStyler.enhanceContent(rowElement);
  }

  EPT_stripCardTooltips(rowElement);
  EPT_tryHideInfraTooltip();
}

// =====================================================================
// Helpers de mapeamento de colunas e reconstrução de linha
// Robustos a qualquer combinação de critérios de exibição do eProc.
// =====================================================================

// onclick="infraAcaoOrdenar('CAMPO', ...)" -> chave semântica estável.
const EPT_COLUMN_FIELD_MAP = {
  DesTipoDocumentoMinuta: "tipo",
  CodDocumento: "codigo",
  SigOrgao: "orgao",
  SigOrgaoJuizoProcesso: "juizo",
  NumProcesso: "processo",
  CodAssuntoPrincipal: "cod_assunto",
  IdentPrincipalUsuarioInclusao: "usuario",
  Inclusao: "criacao",
  DesStatusMinuta: "status",
  IdentPrincipalUsuarioAssinanteIndicado: "assinante_indicado",
  IdMinutaAgendamento: "agendamento",
  SigLocalizadorPrincipal: "localizadores",
};

// Fallback por rótulo limpo (td.infraTdRotuloOrdenacao) quando não houver
// link de ordenação no <th>.
const EPT_COLUMN_LABEL_MAP = {
  "tipo": "tipo",
  "código": "codigo",
  "codigo": "codigo",
  "órgão": "orgao",
  "orgao": "orgao",
  "nro. processo": "processo",
  "processo": "processo",
  "usuário": "usuario",
  "usuario": "usuario",
  "data criação": "criacao",
  "data criacao": "criacao",
  "status": "status",
  "recursos disponíveis": "recursos",
  "recursos": "recursos",
};

/**
 * Varre os <th> do cabeçalho da tabela e devolve { map, totalCols }.
 * map: { chaveSemântica -> índice da coluna }. "recursos" é garantido
 * pela última coluna quando não detectado pelo rótulo.
 */
function EPT_buildColumnMap(table) {
  const result = { map: {}, totalCols: 0 };
  if (!table) {
    return result;
  }

  const headerRow = $(table)
    .find("tr:not(.infraTrOrdenacao)")
    .filter(function () {
      return $(this).children("th").length > 0;
    })
    .first();

  if (!headerRow.length) {
    return result;
  }

  const headerCells = headerRow.children("th");
  result.totalCols = headerCells.length;

  headerCells.each(function (index) {
    const th = $(this);
    let key = null;

    if (th.find("#lnkInfraCheck, .infraCheckbox, input[type='checkbox']").length) {
      key = "checkbox";
    }

    if (!key) {
      let campo = null;
      th.find("a[onclick*='infraAcaoOrdenar']").each(function () {
        const onclick = $(this).attr("onclick") || "";
        const m = onclick.match(/infraAcaoOrdenar\(\s*['"]([^'"]+)['"]/);
        if (m) {
          campo = m[1];
          return false;
        }
      });
      if (campo && EPT_COLUMN_FIELD_MAP[campo]) {
        key = EPT_COLUMN_FIELD_MAP[campo];
      }
    }

    if (!key) {
      const rotulo = (
        th.find(".infraTdRotuloOrdenacao").first().text() ||
        th.text() ||
        ""
      )
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
      if (rotulo.includes("recurso")) {
        key = "recursos";
      } else if (EPT_COLUMN_LABEL_MAP[rotulo]) {
        key = EPT_COLUMN_LABEL_MAP[rotulo];
      }
    }

    if (key && !(key in result.map)) {
      result.map[key] = index;
    }
  });

  if (!("recursos" in result.map) && result.totalCols > 0) {
    result.map.recursos = result.totalCols - 1;
  }

  return result;
}

// Mapa/colunas da listagem nativa (antes do colapso EPT). Reusado quando o
// eproc reconstrói uma <tr> via AJAX (bloqueio/desbloqueio de minuta).
let EPT_minutasColumnMap = {};
let EPT_minutasTotalCols = 0;
let EPT_suppressTableObserver = 0;
const EPT_pendingFixRows = new Set();
let EPT_fixRowsTimer = null;

/**
 * Texto (ou HTML, via options.html) da célula de `row` na coluna `key`.
 * Retorna "" se a coluna não existir — nunca undefined.
 */
function EPT_getCellText(row, columnMap, key, options) {
  options = options || {};
  if (!columnMap || typeof columnMap[key] !== "number") {
    return "";
  }
  const cell = $(row).children("td").eq(columnMap[key]);
  if (!cell.length) {
    return "";
  }
  const value = options.html ? cell.html() : cell.text();
  return value == null ? "" : value.trim();
}

/**
 * Colapsa a linha mantendo checkbox + contentTd (+ recursosTd quando
 * options.keepRecursosTd), remove os demais <td> e ajusta o colspan do
 * contentTd para preservar a largura total da linha.
 */
function EPT_collapseRow(row, options) {
  options = options || {};
  const $row = $(row);
  const contentTd =
    options.contentTd && options.contentTd.length ? options.contentTd : null;
  if (!contentTd) {
    return;
  }

  const allTds = $row.children("td");
  const storedCols = parseInt($row.attr("data-ept-total-cols"), 10);
  const totalCols =
    options.totalCols > 0
      ? options.totalCols
      : !isNaN(storedCols) && storedCols > 0
        ? storedCols
        : allTds.length;
  $row.attr("data-ept-total-cols", totalCols);

  const checkboxTd = $row.find(".infraCheckbox").closest("td");
  const keepCheckbox = checkboxTd.length ? checkboxTd.first() : allTds.first();

  const keepRecursosTd =
    options.keepRecursosTd && options.keepRecursosTd.length
      ? options.keepRecursosTd.first()
      : null;

  const keepNodes = [];
  if (keepCheckbox && keepCheckbox.length) {
    keepNodes.push(keepCheckbox[0]);
  }
  keepNodes.push(contentTd[0]);
  if (keepRecursosTd) {
    keepNodes.push(keepRecursosTd[0]);
  }

  allTds.each(function () {
    if (keepNodes.indexOf(this) === -1) {
      $(this).remove();
    }
  });

  const keptOthers = $row.children("td").length - 1;
  const colspan = Math.max(1, totalCols - keptOthers);
  contentTd.attr("colspan", colspan);

  // Só a célula do cartão; a de "Mais ações" mantém os seus tooltips.
  EPT_stripCardTooltips(contentTd[0]);
  EPT_tryHideInfraTooltip();
}

function EPT_withSuppressedTableObserver(fn) {
  EPT_suppressTableObserver++;
  try {
    fn();
  } finally {
    // O MutationObserver dispara depois da pilha atual; só então liberar.
    setTimeout(function () {
      EPT_suppressTableObserver = Math.max(0, EPT_suppressTableObserver - 1);
    }, 0);
  }
}

function EPT_hasCadeado(tr) {
  return !!(tr && tr.querySelector && tr.querySelector('img[src*="cadeado.gif"]'));
}

/** Placeholder "em edição" só com cadeado nativo — o laranja sozinho sobra após o desbloqueio. */
function EPT_isLinhaEmEdicao(tr) {
  return EPT_hasCadeado(tr);
}

function EPT_clearEdicaoHighlight(tr) {
  if (!tr || typeof tr.removeAttribute !== "function") {
    return;
  }
  const bgcolor = (tr.getAttribute("bgcolor") || "").trim().toLowerCase();
  if (bgcolor === "#ffaa00") {
    tr.removeAttribute("bgcolor");
  }
  if (tr.style) {
    const bg = (tr.style.backgroundColor || "").replace(/\s+/g, "");
    if (bg === "rgb(255,170,0)" || bg.toLowerCase() === "#ffaa00") {
      tr.style.backgroundColor = "";
    }
  }
  tr.removeAttribute("data-ept-em-edicao");
}

function EPT_isEptCardRow(tr) {
  if (!tr || typeof tr.querySelector !== "function") {
    return false;
  }
  return !!(
    tr.querySelector(".ept-minuta-header") ||
    tr.querySelector(".ept-minuta-footer") ||
    tr.querySelector("[data-ept-preview-container]")
  );
}

function EPT_formatAssinaturaInfo(servidor, criacao) {
  if (servidor && criacao) {
    return `${servidor}, em ${criacao}`;
  }
  if (servidor) {
    return servidor;
  }
  if (criacao) {
    return `em ${criacao}`;
  }
  return "";
}

function EPT_collectRowMeta($row, columnMap) {
  let processo = EPT_getCellText($row, columnMap, "processo", { html: true });
  if (!processo) {
    const text = $row.text() || "";
    const m = text.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/);
    processo = m ? m[0] : "";
  }
  let status = EPT_getCellText($row, columnMap, "status");
  if (status) {
    status = status.replace(/ *\([^)]*\) */g, "");
  }
  return {
    processo: processo || "",
    orgao: EPT_getCellText($row, columnMap, "orgao"),
    servidor: EPT_getCellText($row, columnMap, "usuario"),
    status: status || "",
    criacao: EPT_getCellText($row, columnMap, "criacao"),
    tipo: EPT_getCellText($row, columnMap, "tipo"),
  };
}

function EPT_collectOriginalLinks($row) {
  const originalLinks = [];
  $row.find("a.linkMinuta").each(function () {
    originalLinks.push({
      href: $(this).attr("href"),
      dataLink: $(this).data("link"),
      hrefPreview: $(this).attr("hrefpreview"),
    });
  });
  return originalLinks;
}

function EPT_restoreHiddenLinkMinuta($row, originalLinks) {
  $row.children("a.linkMinuta").remove();
  (originalLinks || []).forEach(function (linkData) {
    if (linkData.href) {
      $row.append(
        $("<a>", {
          href: linkData.href,
          class: "linkMinuta",
          "data-link": linkData.dataLink,
          hrefpreview: linkData.hrefPreview,
          style: "display: none; position: absolute; left: -9999px;",
        })
      );
    }
  });
}

function EPT_getRowContentTd($row, columnMap) {
  let contentTd = $row.find("td a.linkMinuta").first().closest("td");
  if (!contentTd.length && columnMap && typeof columnMap.codigo === "number") {
    contentTd = $row.children("td").eq(columnMap.codigo);
  }
  if (!contentTd.length) {
    contentTd = $row.children("td[colspan]").first();
  }
  return contentTd;
}

function EPT_getRowRecursosTd($row) {
  let recursosTd = $row.find("#divListaRecursosMinuta").closest("td");
  if (!recursosTd.length) {
    recursosTd = $row.children("td.ept-recursos-originais");
  }
  if (!recursosTd.length) {
    recursosTd = $row.children("td").last();
  }
  return recursosTd;
}

/**
 * Reconstrói o cartão EPT de uma linha. Com options.emEdicao, usa os
 * metadados nativos e o texto "em edição" (sem buscar o preview).
 */
function EPT_transformMinutaRow(row, columnMap, keepActions, options) {
  options = options || {};
  const $row = $(row);
  if ($row.children("th").length) {
    return;
  }

  const emEdicao = !!options.emEdicao;
  const meta = EPT_collectRowMeta($row, columnMap);
  const contentTd = EPT_getRowContentTd($row, columnMap);
  if (!contentTd.length) {
    return;
  }

  let recursosTd = EPT_getRowRecursosTd($row);
  if (recursosTd.length) {
    recursosTd.addClass("ept-recursos-originais");
  }

  const divBotoes = $row.find("#divListaRecursosMinuta");
  const curatedHtml = EPT_buildCuratedActionsHtml(divBotoes);
  const moreBtnHtml = recursosTd.length
    ? `<button type="button" class="ept-btn-mais-acoes" aria-pressed="${keepActions ? "true" : "false"}" aria-label="Mais ações" title="${keepActions ? "Ocultar outras ações" : "Mostrar outras ações"}">Mais ações</button>`
    : "";

  const originalLinks = EPT_collectOriginalLinks($row);
  const urlPreview =
    $row.find("a.linkMinuta").first().attr("hrefpreview") ||
    (originalLinks[0] && originalLinks[0].hrefPreview) ||
    "";

  const applyCard = function (titulo, sectionContent) {
    const statusLinha = meta.status ? `<br>${meta.status}` : "";
    const assinaturaInfo = EPT_formatAssinaturaInfo(meta.servidor, meta.criacao);
    const acoesHtml = `<div class="ept-acoes-minuta">${curatedHtml}</div>${moreBtnHtml}`;
    const cabecalho = `<div style="display:flex; justify-content: space-between; margin-bottom: 30px; margin-top: 15px;">
                                                      <span>${meta.processo}</span> 
                                                      <span align="center">${titulo}${statusLinha}&nbsp;</span>
                                                      <span>${meta.orgao}</span>
                                                  </div>`;
    const footer = `<div class="ept-minuta-footer" style="display:flex;justify-content:flex-start;align-items:center;width:100%;margin-bottom: 5px;margin-top: 30px;">
                                                  ${acoesHtml}
                                                  <span>${assinaturaInfo}</span>
                                              </div>`;
    EPT_withSuppressedTableObserver(function () {
      if (emEdicao) {
        $row.attr("data-ept-em-edicao", "true");
      } else {
        EPT_clearEdicaoHighlight($row[0]);
      }
      if (urlPreview) {
        $row.attr("data-ept-hrefpreview", urlPreview);
      }
      contentTd
        .attr("align", "left")
        .css("padding", "20px")
        .html(cabecalho + sectionContent + footer);
      EPT_collapseRow($row, {
        contentTd,
        keepRecursosTd: recursosTd.length ? recursosTd : null,
        totalCols: EPT_minutasTotalCols,
      });
      EPT_setRecursosVisible($row[0], keepActions);
      EPT_restoreHiddenLinkMinuta($row, originalLinks);
      if (window.EPT_TableStyler) {
        window.EPT_TableStyler.enhanceContent($row[0]);
      }
      EPT_stripCardTooltips($row[0]);
      EPT_tryHideInfraTooltip();
    });
  };

  if (emEdicao) {
    const titulo = meta.tipo || "Minuta";
    const sectionContent =
      '<div class="ept-preview-container ept-minuta-em-edicao" data-ept-preview-container="true"><p>em edição</p></div>';
    applyCard(titulo, sectionContent);
    return;
  }

  if (urlPreview) {
    const url = window.location.href;
    const urlEproc = EPT_baseEproc();
    $.get(`${urlEproc}/${urlPreview}`).done(function (data) {
      const htmlObject = EPT_previewSeguro(data);
      const corpo = EPT_extractPreviewBody(htmlObject);
      const tituloRaw = htmlObject.querySelector("p.titulo");
      const titulo =
        corpo.titulo ||
        (tituloRaw && tituloRaw.textContent ? tituloRaw.textContent : meta.tipo || "");
      const sectionContent = EPT_buildPreviewMarkup(
        corpo.partes,
        1000,
        corpo.titulos,
        null,
        htmlObject._eptConteudoRetirado
      );
      applyCard(titulo, sectionContent);
    });
  } else {
    EPT_withSuppressedTableObserver(function () {
      EPT_collapseRow($row, {
        contentTd,
        keepRecursosTd: recursosTd.length ? recursosTd : null,
        totalCols: EPT_minutasTotalCols,
      });
      EPT_setRecursosVisible($row[0], keepActions);
      EPT_restoreHiddenLinkMinuta($row, originalLinks);
      EPT_tryHideInfraTooltip();
    });
  }
}

function EPT_fixEprocMutatedRow(tr, columnMap, keepActions) {
  if (!tr || !tr.parentNode) {
    return;
  }
  const $row = $(tr);
  const tdCount = $row.children("td").length;
  const isCard = EPT_isEptCardRow(tr);
  const temCadeado = EPT_hasCadeado(tr);
  const map = columnMap || EPT_minutasColumnMap;

  // Cartão intacto: o laranja pode sobrar depois do desbloqueio; o cadeado
  // é o sinal de "ainda bloqueada". Sem cadeado + placeholder → restaurar.
  if (isCard && tdCount <= 3) {
    if (tr.querySelector(".ept-minuta-em-edicao") && !temCadeado) {
      debugLog("EPT: Edição concluída no cartão, restaurando preview", tr.id);
      EPT_restorePreviewAfterEdicao(tr);
    }
    return;
  }
  if (!isCard && !temCadeado && tdCount <= 3) {
    return;
  }

  if (isCard && tdCount > 3) {
    const contentTd = $row.children("td[colspan]").first();
    let recursosTd = $row.children("td.ept-recursos-originais");
    if (!recursosTd.length) {
      recursosTd = $row.find("#divListaRecursosMinuta").closest("td");
    }
    if (contentTd.length) {
      EPT_withSuppressedTableObserver(function () {
        EPT_collapseRow($row, {
          contentTd,
          keepRecursosTd: recursosTd.length ? recursosTd : null,
          totalCols: EPT_minutasTotalCols,
        });
        EPT_setRecursosVisible(tr, keepActions);
      });
    }
    if (!temCadeado && tr.querySelector(".ept-minuta-em-edicao")) {
      debugLog("EPT: Edição concluída (colunas nativas sem cadeado), restaurando preview", tr.id);
      EPT_restorePreviewAfterEdicao(tr);
    }
    return;
  }

  debugLog("EPT: Reaplicando cartão após mutação do eproc", tr.id, {
    emEdicao: temCadeado,
    tdCount,
  });
  EPT_transformMinutaRow($row, map, keepActions, {
    emEdicao: temCadeado,
  });
}

function EPT_restorePreviewAfterEdicao(tr) {
  const $row = $(tr);
  const urlPreview =
    $row.attr("data-ept-hrefpreview") ||
    $row.children("a.linkMinuta").first().attr("hrefpreview") ||
    $row.find("a.linkMinuta").first().attr("hrefpreview");
  const box = tr.querySelector(".ept-minuta-em-edicao");
  EPT_clearEdicaoHighlight(tr);
  if (!urlPreview) {
    if (box) {
      box.classList.remove("ept-minuta-em-edicao");
      box.innerHTML = "";
    }
    return;
  }
  const urlEproc = EPT_baseEproc();
  $.get(`${urlEproc}/${urlPreview}`).done(function (data) {
    const htmlObject = EPT_previewSeguro(data);
    const corpo = EPT_extractPreviewBody(htmlObject);
    EPT_withSuppressedTableObserver(function () {
      EPT_updatePreviewContainer(
        tr,
        corpo.partes,
        1000,
        corpo.titulos,
        htmlObject._eptConteudoRetirado
      );
      const tituloRaw = htmlObject.querySelector("p.titulo");
      const tituloTexto = corpo.titulo || (tituloRaw && tituloRaw.textContent) || "";
      if (tituloTexto) {
        const headerMid = tr.querySelector(".ept-minuta-header > span:nth-child(2)");
        if (headerMid) {
          const br = headerMid.querySelector("br");
          const statusHtml = br
            ? headerMid.innerHTML.substring(headerMid.innerHTML.indexOf("<br"))
            : "&nbsp;";
          headerMid.textContent = tituloTexto;
          headerMid.insertAdjacentHTML("beforeend", statusHtml);
        }
      }
    });
  });
}

function EPT_scheduleEprocRowFix(tr, columnMap, keepActions) {
  if (!tr || tr.tagName !== "TR" || tr.classList.contains("infraTrOrdenacao")) {
    return;
  }
  if (tr.querySelector(":scope > th")) {
    return;
  }
  EPT_pendingFixRows.add(tr);
  clearTimeout(EPT_fixRowsTimer);
  EPT_fixRowsTimer = setTimeout(function () {
    const rows = Array.from(EPT_pendingFixRows);
    EPT_pendingFixRows.clear();
    rows.forEach(function (row) {
      EPT_fixEprocMutatedRow(row, columnMap, keepActions);
    });
  }, 60);
}

function EPT_getMinutaHeaderRow(table) {
  table = table || document.getElementById("tabelaMinutas");
  if (!table) {
    return null;
  }
  return (
    Array.from(table.querySelectorAll("tr")).find((tr) =>
      tr.querySelector(":scope > th")
    ) || null
  );
}

function EPT_anyMinutaRecursosVisible(table) {
  table = table || document.getElementById("tabelaMinutas");
  if (!table) {
    return false;
  }
  const rows = table.querySelectorAll("tr:not(.infraTrOrdenacao)");
  for (let i = 0; i < rows.length; i++) {
    const tr = rows[i];
    if (tr.querySelector(":scope > th")) {
      continue;
    }
    if (EPT_isRecursosVisible(tr)) {
      return true;
    }
  }
  return false;
}

/** Alinha o cabeçalho à coluna extra de "Mais ações" (e desfaz ao fechar). */
function EPT_syncMinutaHeader(showRecursos) {
  const headerRow = EPT_getMinutaHeaderRow();
  if (!headerRow) {
    return;
  }
  const previewTh = headerRow.querySelector("th.ept-th-preview");
  const recursosTh = headerRow.querySelector("th.ept-th-recursos");
  const totalCols = EPT_minutasTotalCols;
  const show = !!(showRecursos && recursosTh);
  if (previewTh && totalCols > 0) {
    const keptOthers = show ? 2 : 1;
    previewTh.setAttribute("colspan", String(Math.max(1, totalCols - keptOthers)));
  }

  const btn = document.getElementById("btnRetunarEPT");
  const host = show && recursosTh ? recursosTh : previewTh;
  const relocateRetunar = function () {
    if (!btn || !host) {
      return;
    }
    headerRow.querySelectorAll("th.ept-th-retunar").forEach(function (th) {
      if (th !== host) {
        th.classList.remove("ept-th-retunar");
      }
    });
    host.classList.add("ept-th-retunar");
    if (btn.parentNode !== host) {
      host.appendChild(btn);
    }
  };

  if (show) {
    recursosTh.classList.remove("ept-th-recursos-collapsed");
    recursosTh.style.display = "table-cell";
    relocateRetunar();
  } else {
    relocateRetunar();
    if (recursosTh) {
      recursosTh.classList.add("ept-th-recursos-collapsed");
      recursosTh.style.display = "none";
    }
  }
}

function EPT_collapseMinutaHeader(row, columnMap, keepActions) {
  const headerThs = $(row).children("th");
  if (!headerThs.length) {
    return false;
  }
  const codigoIdx =
    columnMap && typeof columnMap.codigo === "number" ? columnMap.codigo : 2;
  const checkboxIdx =
    columnMap && typeof columnMap.checkbox === "number" ? columnMap.checkbox : 0;
  const recursosIdx =
    columnMap && typeof columnMap.recursos === "number" ? columnMap.recursos : -1;
  const previewTh = headerThs.eq(codigoIdx);
  if (previewTh.length) {
    previewTh.addClass("ept-th-preview");
    const keepHeaderIdx = [checkboxIdx, codigoIdx];
    if (recursosIdx !== -1) {
      keepHeaderIdx.push(recursosIdx);
      headerThs.eq(recursosIdx).addClass("ept-th-recursos");
    }
    headerThs.each(function (i) {
      if (keepHeaderIdx.indexOf(i) === -1) {
        $(this).remove();
      }
    });
    previewTh.attr("width", "70%");
  }
  $(row).addClass("ept-tr-cabecalho");
  EPT_placeRetunarButton();
  EPT_syncMinutaHeader(!!keepActions);
  return true;
}

// ---- Paleta de cores conforme a instância do eproc --------------------

/**
 * Instância do eproc, lida da classe do <body> ("instancia-1g",
 * "instancia-2g", "instancia_cr", "instancia_ef"). É o mesmo seletor que o
 * CSS base do eproc usa para escolher o gradiente da navbar.
 */
function EPT_detectInstancia() {
  const cls = (document.body && document.body.className) || "";
  const m = /\binstancia[-_]([0-9a-z]+)\b/i.exec(cls);
  return m ? m[1].toLowerCase() : null;
}

/**
 * Paleta correspondente à instância. Fora de 1g/2g fica o ametista, a
 * identidade própria da extensão.
 */
function EPT_paletteForInstancia(inst) {
  if (inst === "1g") return "indigo";
  if (inst === "2g") return "esmeralda";
  return "ametista";
}

/**
 * Gradiente real da navbar do eproc. É a fonte mais fiel para o header do
 * modal: pega inclusive tribunal que tenha customizado o CSS base.
 */
function EPT_readNavGradient() {
  const nav = document.querySelector("#navbar.bg-instancia, .bg-instancia");
  if (!nav) {
    return null;
  }
  const bg = window.getComputedStyle(nav).backgroundImage;
  return bg && bg.indexOf("gradient") !== -1 ? bg : null;
}

/**
 * Header do modal de edição rápida: nas paletas do eproc usa o gradiente
 * nativo da navbar; no ametista mantém o chapado da identidade EPT.
 */
function EPT_syncModalHeader(paleta) {
  const raiz = document.documentElement;
  const grad = paleta === "ametista" ? null : EPT_readNavGradient();
  if (grad) {
    raiz.style.setProperty("--ept-modal-header", grad);
  } else {
    raiz.style.removeProperty("--ept-modal-header");
  }
}

/** Aplica a paleta da instância ao documento e ao modal. */
function EPT_applyInstanciaPalette() {
  const paleta = EPT_paletteForInstancia(EPT_detectInstancia());
  document.documentElement.setAttribute("data-ept-palette", paleta);
  EPT_syncModalHeader(paleta);
}

function EPT_placeRetunarButton() {
  if (document.getElementById("btnRetunarEPT")) {
    return;
  }
  const headerRow = EPT_getMinutaHeaderRow();
  if (!headerRow) {
    return;
  }
  const previewTh =
    headerRow.querySelector("th.ept-th-preview") ||
    headerRow.querySelector(
      ":scope > th:not(:has(#lnkInfraCheck)):not(:has(.infraCheckbox)):not(.ept-th-recursos)"
    );
  if (!previewTh) {
    return;
  }
  previewTh.classList.add("ept-th-retunar");
  const btn = document.createElement("button");
  btn.id = "btnRetunarEPT";
  btn.type = "button";
  btn.className = "ept-btn-retunar";
  btn.textContent = "Retunar";
  btn.title = "Recarregar e reaplicar a formatação";
  btn.addEventListener("click", () => location.reload());
  previewTh.appendChild(btn);
}

// ---- Detecção robusta de ações dos botões de "Recursos disponíveis" ----

// Ações essenciais (mantidas no rodapé curado) -> categoria p/ estilo/rótulo.
// "Conferir" (minuta_conferir) é intencionalmente omitido: muda de estado ao
// clicar (altera o status) e deve ficar junto do "encaminhar para conferência".
// Quem precisar dele usará a célula original (opção "Manter botões originais").
const EPT_ACTION_CATEGORY = {
  minuta_verificar_agendamento: "editar",
  minuta_editar: "editar",
  minuta_assinar: "assinar",
  minuta_devolver: "devolver",
  minuta_lembrete_cadastrar: "lembrete",
};

/**
 * Extrai a ação de um botão (<a> ou wrapper) na ordem:
 * 1) acao=... no href; 2) atributo `acao` do <img> interno; 3) alt/tooltip.
 * Botões AJAX (Conferir etc.) guardam a ação no `acao` do <img>.
 */
function EPT_getButtonAction(aEl) {
  const $el = $(aEl);
  const $a = $el.is("a") ? $el : $el.find("a").first();

  const href = ($a.length ? $a.attr("href") : "") || $el.attr("href") || "";
  let m = href.match(/acao=([a-z_]+)/i);
  if (m) {
    return m[1];
  }

  const img = $el.find("img").first();
  if (img.length && img.attr("acao")) {
    return img.attr("acao");
  }

  const alt =
    (img.length && (img.attr("alt") || img.attr("title"))) ||
    ($a.length && ($a.attr("title") || $a.attr("data-tooltip_titulo"))) ||
    $el.attr("title") ||
    "";
  return (alt || "").trim();
}

/**
 * Categoria semântica (editar/assinar/conferir/devolver/lembrete) ou null se
 * não for essencial. "Editar" das sentenças (AJAX) é reconhecido pelo
 * alt/tooltip "Editar minuta".
 */
function EPT_getActionCategory(action, aEl) {
  if (action && EPT_ACTION_CATEGORY[action]) {
    return EPT_ACTION_CATEGORY[action];
  }

  const labels = [];
  if (action) {
    labels.push(action);
  }
  if (aEl) {
    const $el = $(aEl);
    const $a = $el.is("a") ? $el : $el.find("a").first();
    const img = $el.find("img").first();
    if (img.length) {
      labels.push(img.attr("alt") || "", img.attr("title") || "");
    }
    if ($a.length) {
      labels.push($a.attr("title") || "", $a.attr("data-tooltip_titulo") || "");
    }
    labels.push($el.attr("title") || "");
  }

  if (labels.join(" ").toLowerCase().includes("editar minuta")) {
    return "editar";
  }

  return null;
}

/** Whitelist do handoff: a ação essencial deve ser mantida no rodapé curado. */
function EPT_isEssentialAction(action, aEl) {
  return EPT_getActionCategory(action, aEl) !== null;
}

/** Cria o link "edição rápida" (handler delegado por .ept-btn-edicao-rapida). */
function EPT_createQuickEditLink() {
  return $("<a>", {
    href: "#",
    class: "infraLink ept-btn-edicao-rapida",
    text: "edição rápida",
    title: "Editar minuta inline",
    "data-ept-quick-edit": "true",
  });
}

/**
 * Clona as ações essenciais para o rodapé, sem mutar a célula original
 * (que permanece com todos os ícones, inclusive Conferir).
 * "Edição rápida" só entra se o eproc ofereceu Editar nesta minuta.
 */
function EPT_buildCuratedActionsHtml(divBotoes) {
  const parts = [];
  let hasEditar = false;
  if (divBotoes && divBotoes.length) {
    divBotoes.children().each(function () {
      const $child = $(this);
      if ($child.hasClass("ept-btn-edicao-rapida")) {
        return;
      }
      const action = EPT_getButtonAction(this);
      const category = EPT_getActionCategory(action, this);
      if (!category) {
        return;
      }
      if (category === "editar") {
        hasEditar = true;
      }
      const clone = this.cloneNode(true);
      const anchor = clone.matches("a") ? clone : clone.querySelector("a");
      (anchor || clone).setAttribute("data-ept-action", category);
      parts.push(clone.outerHTML);
    });
  }
  if (hasEditar) {
    parts.push(EPT_createQuickEditLink()[0].outerHTML);
  }
  return parts.join("");
}

function EPT_isRecursosVisible(row) {
  const td = $(row).children("td.ept-recursos-originais")[0];
  if (!td) {
    return false;
  }
  if (td.classList.contains("ept-recursos-collapsed") || td.hidden) {
    return false;
  }
  if (td.style.display === "none") {
    return false;
  }
  const cs = window.getComputedStyle(td);
  return cs.display !== "none" && cs.visibility !== "hidden";
}

function EPT_setRecursosVisible(row, visible) {
  const $row = $(row);
  const $recursos = $row.children("td.ept-recursos-originais");
  const $content = $row.children("td[colspan]");
  if (!$recursos.length) {
    return;
  }

  $row.toggleClass("ept-more-actions-open", !!visible);
  $recursos.toggleClass("ept-recursos-collapsed", !visible);
  $recursos.css("display", visible ? "table-cell" : "none");

  const totalCols = parseInt($row.attr("data-ept-total-cols"), 10);
  if ($content.length && !isNaN(totalCols) && totalCols > 0) {
    const keptOthers = visible ? 2 : 1;
    $content.attr("colspan", Math.max(1, totalCols - keptOthers));
  }

  const btn = $row.find(".ept-btn-mais-acoes")[0];
  if (btn) {
    btn.setAttribute("aria-pressed", visible ? "true" : "false");
    btn.title = visible ? "Ocultar outras ações" : "Mostrar outras ações";
  }

  const table = $row.closest("table")[0];
  EPT_syncMinutaHeader(EPT_anyMinutaRecursosVisible(table));
}

function EPT_bindMoreActionsToggle(table) {
  if (!table || table.dataset.eptMoreActionsBound === "true") {
    return;
  }
  table.dataset.eptMoreActionsBound = "true";
  table.addEventListener("click", function (event) {
    const btn = event.target.closest(".ept-btn-mais-acoes");
    if (!btn || !table.contains(btn)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const tr = btn.closest("tr");
    if (!tr) {
      return;
    }
    EPT_setRecursosVisible(tr, !EPT_isRecursosVisible(tr));
  });
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
      "ept_keep_actions",
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
      // Flag "Manter botões originais" (padrão OFF: undefined -> false).
      const ept_keepActionsData = await getStorageData("ept_keep_actions");
      const keepActions = !!ept_keepActionsData.ept_keep_actions;

      if (window.location.href.includes("acao=minuta_area_trabalho")) {
        if (ept_tabletextData.ept_tabletext) {
          document.documentElement.setAttribute("data-ept-table-theme", "refined");
          document.documentElement.setAttribute("data-ept-button-layout", "segmented-uniform-white");
          document.documentElement.setAttribute("data-ept-border-style", "lateral");
          EPT_applyInstanciaPalette();
          if (keepActions) {
            document.documentElement.setAttribute("data-ept-keep-actions", "true");
          }
        }
      }
  
      // console.log(ept_tabletextData);
  
      if (ept_tabletextData.ept_tabletext && window.location.href.includes('acao=minuta_area_trabalho')) {
        // console.log('text to work');
        
        if (window.EPT_TableStyler) {
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

        // Mapa de colunas derivado do cabeçalho (independe da seleção de
        // critérios de exibição). Calculado uma única vez, antes do laço.
        const { map: columnMap, totalCols } = EPT_buildColumnMap(
          document.getElementById("tabelaMinutas")
        );
        EPT_minutasColumnMap = columnMap;
        EPT_minutasTotalCols = totalCols;

        $("#tabelaMinutas tr:not(.infraTrOrdenacao)").each(function () {
          let row = $(this);
  
          // Cabeçalho da tabela (linha que possui <th>): mantém o checkbox
          // e as colunas estruturais, sem os rótulos "Prévia" / "Recursos".
          const headerThs = row.children("th");
          if (headerThs.length) {
            EPT_collapseMinutaHeader(row, columnMap, keepActions);
            return;
          }

          EPT_transformMinutaRow(row, columnMap, keepActions, {
            emEdicao: EPT_isLinhaEmEdicao(row[0]),
          });
        });
  
        // Observador: o eproc, ao bloquear/desbloquear, reinsere colunas
        // nativas na mesma <tr>. Reaplica o cartão EPT sem location.reload().
        const tabelaMinutas = document.getElementById('tabelaMinutas');
        if (tabelaMinutas) {
          EPT_bindMoreActionsToggle(tabelaMinutas);
          let eptTransformacaoCompleta = false;
          
          setTimeout(() => {
            eptTransformacaoCompleta = true;
            debugLog('EPT: Observador de mudanças na tabela ativado');
          }, 2000);
          
          const observadorTabela = new MutationObserver((mutations) => {
            if (!eptTransformacaoCompleta || EPT_suppressTableObserver) {
              return;
            }

            for (let mutation of mutations) {
              if (mutation.type === 'attributes' &&
                  (mutation.attributeName === 'bgcolor' || mutation.attributeName === 'style')) {
                let tr = mutation.target;
                if (tr.tagName === 'TD' && tr.closest) {
                  tr = tr.closest('tr');
                }
                if (tr && tr.tagName === 'TR') {
                  EPT_scheduleEprocRowFix(tr, columnMap, keepActions);
                }
              }

              if (mutation.type === 'childList') {
                const added = Array.from(mutation.addedNodes).filter(function (n) {
                  return n.nodeType === 1;
                });
                const removed = Array.from(mutation.removedNodes).filter(function (n) {
                  return n.nodeType === 1;
                });
                added.forEach(function (node) {
                  if (node.tagName === 'TR') {
                    EPT_scheduleEprocRowFix(node, columnMap, keepActions);
                  }
                });

                const isLockNode = function (n) {
                  return (
                    (n.matches && n.matches('img[src*="cadeado.gif"]')) ||
                    (n.querySelector && n.querySelector('img[src*="cadeado.gif"]'))
                  );
                };
                const addedTds = added.filter(function (n) {
                  return n.tagName === 'TD';
                });
                const removedTds = removed.filter(function (n) {
                  return n.tagName === 'TD';
                });
                const lockChanged =
                  added.some(isLockNode) || removed.some(isLockNode);
                if (
                  addedTds.length ||
                  removedTds.length ||
                  lockChanged ||
                  added.length > 5 ||
                  removed.length > 5
                ) {
                  let tr = mutation.target;
                  if (tr && tr.closest) {
                    tr = tr.tagName === 'TR' ? tr : tr.closest('tr');
                  }
                  if (tr && tr.tagName === 'TR') {
                    EPT_scheduleEprocRowFix(tr, columnMap, keepActions);
                  }
                }
              }
            }
          });
          
          observadorTabela.observe(tabelaMinutas, {
            childList: true,
            attributes: true,
            attributeFilter: ['bgcolor', 'style'],
            subtree: true
          });
        }
      }

      if (window.location.href.includes("acao=minuta_area_trabalho")) {
        EPT_placeRetunarButton();
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
          // Expandido para suportar tanto href quanto onclick (compatibilidade com diferentes versões do eproc)
          if (link) {
            const href = link.href || '';
            const onclick = link.getAttribute('onclick') || '';
            const title = link.title || link.getAttribute('data-tooltip_titulo') || '';
            
            // Detecta por múltiplos critérios (mantém compatibilidade com versões antigas e novas)
            const isEditarMinutaLink = (
              href.includes("minuta_verificar_agendamento") ||
              onclick.includes("minuta_verificar_agendamento") ||
              (onclick.includes("executarRecursoMinuta") && title.includes("Editar minuta"))
            );
            
            if (isEditarMinutaLink) {
              debugLog('EPT: Detectado clique em link de editar minuta, iniciando observação...');
              startObserving();
              return;
            }
          }
          
          // Também detecta cliques em imagens dentro de labels (caso do ícone de editar)
          const img = event.target.closest("img");
          if (img && img.alt && img.alt.includes("Editar minuta")) {
            const parentLink = img.closest("a");
            if (parentLink) {
              // Verifica href OU onclick para maior compatibilidade
              const href = parentLink.href || '';
              const onclick = parentLink.getAttribute('onclick') || '';
              if (href.includes("minuta_verificar_agendamento") || onclick.includes("minuta_verificar_agendamento")) {
                debugLog('EPT: Detectado clique em ícone de editar minuta, iniciando observação...');
                startObserving();
                return;
              }
            }
          }
          
          // Detecta cliques em ícones Material Design (versões mais novas do eproc)
          const materialIcon = event.target.closest("i.material-icons");
          if (materialIcon && materialIcon.textContent.includes("edit_document")) {
            const parentLink = materialIcon.closest("a");
            if (parentLink) {
              const onclick = parentLink.getAttribute('onclick') || '';
              const title = parentLink.title || parentLink.getAttribute('data-tooltip_titulo') || '';
              if (onclick.includes("minuta_verificar_agendamento") || title.includes("Editar minuta")) {
                debugLog('EPT: Detectado clique em ícone Material Design de editar minuta, iniciando observação...');
                startObserving();
                return;
              }
            }
          }
        });
  
        // Listener adicional para eventos delegados (com prioridade menor)
        document.addEventListener("click", function (event) {
          // Se já está observando, não fazer nada
          if (isObserving) return;

          // Detecta cliques em qualquer elemento que tenha atributos relacionados à edição de minuta
          // Expandido para incluir onclick e title (compatibilidade com diferentes versões do eproc)
          const target = event.target;
          const closestLink = target.closest(
            "a[href*='minuta_verificar_agendamento'], " +
            "a[onclick*='minuta_verificar_agendamento'], " +
            "a[title*='Editar minuta'], " +
            "a[data-tooltip_titulo*='Editar minuta']"
          );
          
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

      function getEprocBaseUrl() {
        if (window.EPT_EPROC_BASE_URL) {
          return window.EPT_EPROC_BASE_URL;
        }
        const baseUrl = EPT_baseEproc();
        window.EPT_EPROC_BASE_URL = baseUrl;
        return baseUrl;
      }

      function buildPreviewUrl(relativePath) {
        if (!relativePath) {
          return getEprocBaseUrl();
        }

        const trimmedPath = relativePath.trim();
        if (/^https?:\/\//i.test(trimmedPath)) {
          return trimmedPath;
        }

        const baseUrl = getEprocBaseUrl();
        if (trimmedPath.startsWith("/")) {
          return `${baseUrl}${trimmedPath}`;
        }

        return `${baseUrl}/${trimmedPath}`;
      }

      async function handleQuickEditClick(button) {
        const $button = $(button);
        const row = $button.closest("tr");

        if (!row.length) {
          debugLog("EPT: Não foi possível localizar a linha da minuta para edição rápida.");
          return;
        }

        const linkPreview = row.find("a.linkMinuta").first();
        const hrefPreview = linkPreview.attr("hrefpreview");

        if (!hrefPreview) {
          alert("EPT: Não foi possível localizar o conteúdo original da minuta.");
          return;
        }

        const baseUrl = getEprocBaseUrl();
        const previewUrl = buildPreviewUrl(hrefPreview);
        if (!previewUrl) {
          alert("EPT: URL de preview inválida.");
          return;
        }

        $button.addClass("ept-btn-edicao-rapida--loading");
        const originalText = $button.text();
        $button.text("carregando...");

        try {
        EPT_addLog("preview:request", { url: previewUrl });

        const response = await fetch(previewUrl, { credentials: "include" });
          if (!response.ok) {
          EPT_addLog("preview:error", {
            status: response.status,
            statusText: response.statusText,
          });
            throw new Error(`Status ${response.status}`);
          }

          const buffer = await response.arrayBuffer();
          const parser = new DOMParser();

          const utf8Decoder = new TextDecoder("utf-8");
          let decodedHtml = utf8Decoder.decode(buffer);
          let doc = parser.parseFromString(decodedHtml, "text/html");

          const contentType = response.headers.get("content-type");
          let declaredCharset = null;

          if (contentType) {
            const match = contentType.match(/charset=([^;]+)/i);
            if (match) {
              declaredCharset = match[1].trim().toLowerCase();
            }
          }

          if (!declaredCharset) {
            const metaCharset = doc.querySelector("meta[charset]");
            if (metaCharset) {
              declaredCharset = metaCharset.getAttribute("charset")?.trim().toLowerCase() || null;
            }
          }

          if (!declaredCharset) {
            const metaContentType = doc.querySelector("meta[http-equiv='Content-Type']");
            if (metaContentType) {
              const contentAttr = metaContentType.getAttribute("content");
              if (contentAttr) {
                const match = contentAttr.match(/charset=([^;]+)/i);
                if (match) {
                  declaredCharset = match[1].trim().toLowerCase();
                }
              }
            }
          }

          if (declaredCharset && /(?:iso-8859-1|latin1|windows-1252)/i.test(declaredCharset)) {
            const latinDecoder = new TextDecoder("latin1");
            decodedHtml = latinDecoder.decode(buffer);
            doc = parser.parseFromString(decodedHtml, "text/html");
          }

          const body = doc.body;
          if (body.querySelector("meta[http-equiv='Content-Type'][content*='iso-8859-1']")) {
            const latin1Decoder = new TextDecoder("latin1");
            const latin1Html = latin1Decoder.decode(buffer);
            const docLatin1 = parser.parseFromString(latin1Html, "text/html");
            if (docLatin1.querySelector("article")) {
              doc.body.innerHTML = docLatin1.body.innerHTML;
            }
          }

          const article = doc.querySelector("article");

          if (!article) {
            EPT_addLog("preview:error", { reason: "Article não encontrado" });
            throw new Error("Article não encontrado no preview da minuta.");
          }

          // Minuta com conteúdo ativo (script, on*, iframe…) não entra na
          // edição rápida: exibir exigiria retirar esse conteúdo, e salvar
          // o retiraria do documento sem a pessoa saber.
          const conteudoAtivo = EPT_conteudoAtivo(article, false);
          if (conteudoAtivo.length) {
            EPT_addLog("preview:recusada_conteudo_ativo", { achados: conteudoAtivo });
            alert(
              "EPT: Esta minuta tem conteúdo que a edição rápida não aceita (" +
                conteudoAtivo.slice(0, 4).join(", ") +
                (conteudoAtivo.length > 4 ? "…" : "") +
                ").\nPara não alterar o documento, a edição rápida não foi aberta. Use o botão Editar do eproc."
            );
            return;
          }

          const editableSection =
            article.querySelector('section[contenteditable="true"][data-estilo_padrao="paragrafo"]') ||
            article.querySelector('section[data-estilo_padrao="paragrafo"]') ||
            article.querySelector('section[contenteditable="true"][data-sin_conteudo_obrigatorio="true"]') ||
            article.querySelector('section[data-nome="despacho_decisao"]') ||
            article.querySelector('section[data-sin_permite_texto_padrao="true"]');

          if (!editableSection) {
            throw new Error("Section editável não encontrada na minuta.");
          }

          const idDocumento = article.getAttribute("data-id_documento") || "";
          const codDocumento = article.getAttribute("data-cod_documento") || "";
          const idModelo = article.getAttribute("data-id_modelo") || "";
          const sectionId = editableSection.id || "";

          const hashMatch = hrefPreview.match(/[a-f0-9]{32}/i);
          const hash = hashMatch ? hashMatch[0] : "";

          EPT_addLog("preview:loaded", {
            idDocumento,
            codDocumento,
            idModelo,
            editableSectionId: sectionId,
            hash,
          });

          const tituloSection = article.querySelector('section[data-nome="titulo"] .titulo');
          const processoSpan = article.querySelector('section[data-nome="identificacao_processo"] span[data-numero_processo]');
          const orgaoDiv = article.querySelector(".timbre_orgao");
          const versaoSpan = article.querySelector('span[data-versao_documento_rodape]');

          const subtitle = processoSpan ? `Processo ${processoSpan.textContent.trim()}` : null;
          const infoItems = [];

          if (tituloSection) {
            infoItems.push(`Título: ${tituloSection.textContent.trim()}`);
          }
          if (orgaoDiv) {
            infoItems.push(`Órgão: ${orgaoDiv.textContent.trim()}`);
          }
          if (versaoSpan) {
            infoItems.push(`Versão: ${versaoSpan.textContent.trim()}`);
          }
          if (codDocumento) {
            infoItems.push(`Documento: ${codDocumento}`);
          }

          // Um campo por corpo, com o título que o precede no documento
          // (mesma leitura do preview da lista).
          const campos = [];
          let tituloPendente = "";
          let indiceCorpo = 0;
          article.querySelectorAll("section").forEach(function (sec) {
            if (sec.getAttribute("data-estilo_padrao") === "titulo") {
              tituloPendente = sec.textContent.replace(/\s+/g, " ").trim();
            } else if (sec.getAttribute("data-sin_permite_texto_padrao") === "true") {
              campos.push({
                indice: indiceCorpo,
                titulo: tituloPendente,
                html: sec.innerHTML,
                classe: EPT_classeParagrafo(sec),
              });
              indiceCorpo += 1;
              tituloPendente = "";
            }
          });

          const modalState = {
            campos: campos.length > 1 ? campos : null,
            articleHTML: article.outerHTML,
            editableContent: editableSection.innerHTML,
            classeParagrafo: EPT_classeParagrafo(editableSection),
            editableSectionId: sectionId,
            idDocumento,
            codDocumento,
            idModelo,
            baseUrl,
            hash,
            subtitle,
            info: infoItems,
            rowElement: row[0],
          };

          window.EPT_INLINE_EDITOR_STATE = modalState;
          EPT_INLINE_EDITOR.openModal(modalState);
        } catch (error) {
          console.error("EPT: Erro ao abrir editor inline:", error);
        EPT_addLog("preview:error", { message: error.message });
          alert("EPT: Não foi possível carregar a minuta para edição. Tente novamente.");
        } finally {
          $button.removeClass("ept-btn-edicao-rapida--loading");
          $button.text(originalText);
        }
      }

      $(document).on("click", ".ept-btn-edicao-rapida", async function (event) {
        event.preventDefault();
        event.stopPropagation();

        if ($(this).hasClass("ept-btn-edicao-rapida--loading")) {
          return;
        }

        await handleQuickEditClick(this);
      });

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
  