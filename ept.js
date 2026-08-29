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
        background: rgba(53, 34, 69, 0.65);
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
        box-shadow: 0 20px 45px rgba(53, 34, 69, 0.35);
        width: min(960px, 100%);
        display: flex;
        flex-direction: column;
        animation: eptModalFadeIn 0.25s ease;
        border-top: 6px solid #F66942;
        overflow: hidden;
      }

      .ept-inline-editor-header {
        background: #352245;
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
        background: rgba(255, 255, 255, 0.1);
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
        background: rgba(255, 255, 255, 0.2);
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
        color: #4a3358;
        font-size: 0.875rem;
      }

      .ept-inline-editor-info span {
        background: rgba(53, 34, 69, 0.08);
        padding: 6px 12px;
        border-radius: 6px;
        font-weight: 500;
      }

      .ept-inline-editor-content {
        min-height: 320px;
        max-height: 520px;
        overflow-y: auto;
        border: 2px solid rgba(74, 51, 88, 0.12);
        border-radius: 8px;
        padding: 20px;
        font-size: 0.95rem;
        line-height: 1.6;
        color: #1a202c;
        background: #f9f7fb;
      }

      .ept-inline-editor-content[contenteditable="true"]:focus {
        outline: none;
        border-color: #4a3358;
        box-shadow: 0 0 0 3px rgba(74, 51, 88, 0.15);
        background: #ffffff;
      }

      .ept-inline-editor-footer {
        padding: 18px 28px 28px 28px;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        background: rgba(53, 34, 69, 0.04);
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
        color: #352245;
        border: 2px solid rgba(53, 34, 69, 0.15);
      }

      .ept-inline-editor-btn-cancel:hover {
        border-color: rgba(53, 34, 69, 0.35);
        color: #1f142c;
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
        background: #4a3358;
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
  handleEscape(event) {
    if (event.key === "Escape") {
      EPT_INLINE_EDITOR.closeModal();
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
    closeBtn.addEventListener("click", () => this.closeModal());

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

    const contentArea = document.createElement("div");
    contentArea.className = "ept-inline-editor-content";
    contentArea.setAttribute("contenteditable", "true");
    contentArea.setAttribute("role", "textbox");
    contentArea.setAttribute("aria-labelledby", "ept-editor-title");
    contentArea.innerHTML = modalData.editableContent || "";

    body.appendChild(contentArea);

    const footer = document.createElement("div");
    footer.className = "ept-inline-editor-footer";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "ept-inline-editor-btn ept-inline-editor-btn-cancel";
    cancelBtn.textContent = "Cancelar";
    cancelBtn.addEventListener("click", () => this.closeModal());

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

    window.EPT_INLINE_EDITOR_STATE = this.state;
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
  reconstructArticle(sanitizedEditableContent) {
    if (!this.state || !this.state.articleHTML) {
      throw new Error("Dados originais da minuta não encontrados.");
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = this.state.articleHTML;

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

    const editableElement = state.contentEditableElement;
    if (!editableElement) {
      alert("EPT: Conteúdo editável não encontrado.");
      return;
    }

    const rawContent = editableElement.innerHTML;
    if (!rawContent.trim()) {
      alert("EPT: O conteúdo da minuta está vazio.");
      return;
    }

    try {
      this.setSavingState(true, "Salvando...");

      const sanitizedEditable = this.sanitizeHtmlEntities(rawContent);
      const reconstructedArticle = this.reconstructArticle(sanitizedEditable);
      const sanitizedArticle = this.sanitizeHtmlEntities(reconstructedArticle);
      const xhtmlArticle = this.ensureXhtmlCompliance(sanitizedArticle);
      const tamSecEditaveis = sanitizedEditable.length;

      this.state.articleHTML = xhtmlArticle;
      this.state.editableContent = sanitizedEditable;

      const saveUrl = `${state.baseUrl}/controlador_ajax.php?acao_ajax=minuta_salvar&acao_origem=minuta_editar&hash=${state.hash}`;
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
          EPT_updatePreviewContainer(state.rowElement, sanitizedEditable, 1000);
        }
      } catch (updateError) {
        debugLog("EPT: Erro ao atualizar linha após salvamento:", updateError);
      }

      // Após salvar e tentar desbloquear, emular chamada nativa de atualização de contexto
      try {
        const areaTrabalhoHashMatch = (window.location.href || "").match(/[a-f0-9]{32}/i);
        const areaTrabalhoHash = areaTrabalhoHashMatch ? areaTrabalhoHashMatch[0] : (state.hash || "");
        const atualizarUrl = `${state.baseUrl}/controlador_ajax.php?acao_ajax=atualizar_info_minuta&acao_origem=minuta_area_trabalho${areaTrabalhoHash ? `&hash=${areaTrabalhoHash}` : ""}`;

        EPT_addLog("postsave:update_info:request", { url: atualizarUrl });
        const atualizarResult = await this.postForm(atualizarUrl, "");
        EPT_addLog("postsave:update_info:response", { success: atualizarResult?.sucesso === "1", raw: atualizarResult });
      } catch (postSaveUpdateErr) {
        debugLog("EPT: Falha ao emular atualização pós-salvar:", postSaveUpdateErr);
        EPT_addLog("postsave:update_info:error", { message: postSaveUpdateErr?.message });
      }

      this.setSavingState(true, "Minuta salva!");

      if (unlockFailedMessage) {
        alert(
          "EPT: Minuta salva com sucesso, mas não foi possível desbloquear automaticamente.\n" +
            "Mensagem: " +
            unlockFailedMessage
        );
        EPT_addLog("unlock:warning", { message: unlockFailedMessage });
      }

      setTimeout(() => {
        this.closeModal();
      }, 700);
    } catch (error) {
      console.error("EPT: Erro ao salvar minuta:", error);
      EPT_addLog("save:error", { message: error.message, stack: error.stack });
      alert(`EPT: Não foi possível salvar a minuta.\nMotivo: ${error.message}`);
      this.setSavingState(false, "Salvar");
    }
  },
};

window.EPT_DEBUG_ENABLED = window.EPT_DEBUG_ENABLED || false;

//window.EPT_DEBUG_ENABLED = true; //descomentar para ativar logs em etapa de desenvolvimento

// Simple debug function
function debugLog(...args) {
  if (window.EPT_DEBUG_ENABLED) {
    console.log(...args);
  }
}

/** Fecha o tooltip global do Infra (mesmo mecanismo dos onmouseout do eproc), evitando balão preso após mutar o DOM. */
function EPT_tryHideInfraTooltip() {
  try {
    const fn = window.infraTooltipOcultar;
    if (typeof fn === "function") {
      fn();
    }
  } catch (e) {
    /* silencioso */
  }
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

function EPT_buildPreviewMarkup(htmlContent, maxChars = 1000) {
  const contentInfo = EPT_truncatePreviewContent(htmlContent, maxChars);
  const uniqueId = EPT_generatePreviewId();

  if (contentInfo.isTruncated) {
    return `
      <div class="ept-preview-container" data-ept-preview-container="true" data-ept-preview-id="${uniqueId}">
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
      </div>
    `;
  }

  return `<div class="ept-preview-container" data-ept-preview-container="true" data-ept-preview-id="${uniqueId}">
    ${contentInfo.content}
  </div>`;
}

function EPT_updatePreviewContainer(rowElement, htmlContent, maxChars = 1000) {
  if (!rowElement) {
    return;
  }

  const newMarkup = EPT_buildPreviewMarkup(htmlContent, maxChars);
  const existingContainer = rowElement.querySelector("[data-ept-preview-container]");

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
    const urlEproc = url.split("eproc/")[0] + "eproc";
    $.get(`${urlEproc}/${urlPreview}`).done(function (data) {
      const htmlObject = document.createElement("div");
      htmlObject.innerHTML = data;
      const tituloRaw = htmlObject.querySelector("p.titulo");
      const titulo = tituloRaw && tituloRaw.textContent ? tituloRaw.textContent : meta.tipo || "";
      const section = htmlObject.querySelector('section[data-estilo_padrao="paragrafo"]');
      const sectionContent = EPT_buildPreviewMarkup(section ? section.innerHTML : "", 1000);
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
  const urlEproc = window.location.href.split("eproc/")[0] + "eproc";
  $.get(`${urlEproc}/${urlPreview}`).done(function (data) {
    const htmlObject = document.createElement("div");
    htmlObject.innerHTML = data;
    const section = htmlObject.querySelector('section[data-estilo_padrao="paragrafo"]');
    EPT_withSuppressedTableObserver(function () {
      EPT_updatePreviewContainer(tr, section ? section.innerHTML : "", 1000);
      const tituloRaw = htmlObject.querySelector("p.titulo");
      if (tituloRaw && tituloRaw.textContent) {
        const headerMid = tr.querySelector(".ept-minuta-header > span:nth-child(2)");
        if (headerMid) {
          const br = headerMid.querySelector("br");
          const statusHtml = br
            ? headerMid.innerHTML.substring(headerMid.innerHTML.indexOf("<br"))
            : "&nbsp;";
          headerMid.innerHTML = tituloRaw.textContent + statusHtml;
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
        const currentUrl = window.location.href;
        let baseUrl = "";

        if (currentUrl.includes("eproc/")) {
          baseUrl = currentUrl.split("eproc/")[0] + "eproc";
        } else {
          const pathParts = window.location.pathname.split("/");
          const eprocIndex = pathParts.findIndex((part) => part === "eproc");
          if (eprocIndex !== -1) {
            baseUrl = `${window.location.origin}/${pathParts.slice(1, eprocIndex + 1).join("/")}`;
          } else {
            baseUrl = window.location.origin;
          }
        }

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

          const modalState = {
            articleHTML: article.outerHTML,
            editableContent: editableSection.innerHTML,
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
  