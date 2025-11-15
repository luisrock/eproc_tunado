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
    contentArea.setAttribute("spellcheck", "false");
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

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        this.closeModal();
      }
    });

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
      "ept_tablestyle",
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

      // Adicionar botão "Retunar" na barra de comandos (fallback para reload manual)
      if (window.location.href.includes('acao=minuta_area_trabalho')) {
        const divBarra = document.getElementById('divBarraComandosTabela');
        const btnAssinar = document.getElementById('btnAssinar');
        
        if (divBarra && btnAssinar && !document.getElementById('btnRetunarEPT')) {
          // Criar espaçador
          const espaco = document.createTextNode('\u00A0'); // &nbsp;
          
          // Criar botão
          const btnRetunar = document.createElement('button');
          btnRetunar.id = 'btnRetunarEPT';
          btnRetunar.type = 'button';
          btnRetunar.className = 'infraButton';
          btnRetunar.textContent = 'Retunar';
          btnRetunar.onclick = () => location.reload();
          btnRetunar.style.cssText = 'background: #352245; color: white; border: 1px solid #F66942; margin-left: 20px;';
          btnRetunar.title = 'Recarregar e reaplicar formatação EPT';
          
          // Inserir após o botão Assinar
          btnAssinar.parentNode.insertBefore(espaco, btnAssinar.nextSibling);
          btnAssinar.parentNode.insertBefore(btnRetunar, btnAssinar.nextSibling.nextSibling);
        }
      }
  
      // console.log(ept_actionsData);
  
      // Handle text setting
      const ept_tabletextData = await getStorageData("ept_tabletext");
      const ept_tablestyleData = await getStorageData("ept_tablestyle");
  
      // console.log(ept_tabletextData);
  
      if (ept_tabletextData.ept_tabletext && window.location.href.includes('acao=minuta_area_trabalho')) {
        // console.log('text to work');
        
        // Aplica estilos modernos à tabela apenas se o toggle estiver habilitado
        if (ept_tablestyleData.ept_tablestyle && window.EPT_TableStyler) {
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
            // Remove todas as colunas de cabeçalho exceto checkbox e preview
            row.children('th:eq(1),th:eq(3),th:eq(4),th:eq(5),th:eq(6),th:eq(7),th:eq(8),th:eq(9),th:eq(10),th:eq(11),th:eq(12),th:eq(13),th:eq(14),th:eq(15),th:eq(16),th:eq(17),th:eq(18),th:eq(19),th:eq(20)').remove();
            th.attr("width", "70%").html(lThContent);
          }
          // console.log("row 1: ", row.children("td:eq(1)").text());
          // console.log("row 2: ", row.children("td:eq(2)").text());
          // console.log("row 3: ", row.children("td:eq(3)").text());
          // console.log("row 4: ", row.children("td:eq(4)").text());
          // console.log("row 5: ", row.children("td:eq(5)").text());
          // console.log("row 6: ", row.children("td:eq(6)").text());
          // console.log("row 7: ", row.children("td:eq(7)").text());
          // console.log("row 8: ", row.children("td:eq(8)").text());
          // console.log("row 9: ", row.children("td:eq(9)").text());
  
          let tdProcesso = row.children("td:eq(5)");
          let linkProcesso = tdProcesso.children("a");
          let processo = tdProcesso.html();
  
          let tdOrgao = row.children("td:eq(3)");
          let orgao = tdOrgao.text();
  
          let servidor = "";
          servidor = row.children("td:eq(7)").text();
          // if (tdServidor) {
          //   let labelServidor = tdServidor.children("label");
          //   if (labelServidor) {
          //     let onMouseServidor = labelServidor.attr("onmouseover");
          //     if (onMouseServidor) {
          //       servidor = onMouseServidor.split("('").pop().split("<br/>")[0];
          //       //servidor = onMouseServidor;
          //     }
          //   }
          // }
  
          let status = "";
          let tdStatus = row.children("td:eq(9)");
          let labelStatus = tdStatus.children("label");
          status = labelStatus.text().replace(/ *\([^)]*\) */g, "");
  
          let tdCriacao = row.children("td:eq(8)");
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

          // Adiciona botão de edição rápida ao final da lista de recursos
          if (!divBotoes.find(".ept-btn-edicao-rapida").length) {
            const quickEditButton = $("<a>", {
              href: "#",
              class: "infraLink ept-btn-edicao-rapida",
              text: "edição rápida",
              title: "Editar minuta inline",
              "data-ept-quick-edit": "true",
            });
            divBotoes.append(quickEditButton);
          }

          //armazenando os botões...
          let botoes = divBotoes.html();
  
          let l = row.find(".linkMinuta");
          let urlPreview = l.attr("hrefpreview");
          
          // PRESERVAR OS LINKS ORIGINAIS ANTES DE REMOVER COLUNAS
          let originalLinks = [];
          row.find(".linkMinuta").each(function() {
            originalLinks.push({
              href: $(this).attr("href"),
              dataLink: $(this).data("link"),
              hrefPreview: $(this).attr("hrefpreview")
            });
          });
          
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
              
              // Função para truncar conteúdo HTML preservando estrutura
              function truncateContent(htmlContent, maxChars = 1000) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;
                const textContent = tempDiv.textContent || tempDiv.innerText || '';
                
                if (textContent.length <= maxChars) {
                  return {
                    content: htmlContent,
                    isTruncated: false,
                    fullContent: htmlContent
                  };
                }
                
                // Criar uma versão truncada removendo elementos inteiros quando necessário
                const clonedDiv = tempDiv.cloneNode(true);
                let charCount = 0;
                let elementsToKeep = [];
                
                // Percorrer todos os elementos filhos diretos
                const children = Array.from(clonedDiv.children);
                
                for (let i = 0; i < children.length; i++) {
                  const element = children[i];
                  const elementText = element.textContent || element.innerText || '';
                  
                  if (charCount + elementText.length <= maxChars) {
                    // Este elemento cabe inteiro
                    charCount += elementText.length;
                    elementsToKeep.push(element.outerHTML);
                  } else {
                    // Este elemento faria ultrapassar o limite
                    const remainingChars = maxChars - charCount;
                    
                    if (remainingChars > 50) { // Só trunca se sobrar um espaço razoável
                      // Truncar o texto deste elemento
                      const tempElement = element.cloneNode(true);
                      const walker = document.createTreeWalker(
                        tempElement,
                        NodeFilter.SHOW_TEXT,
                        null,
                        false
                      );
                      
                      let usedChars = 0;
                      let textNode;
                      
                      while (textNode = walker.nextNode()) {
                        const nodeText = textNode.textContent;
                        if (usedChars + nodeText.length <= remainingChars) {
                          usedChars += nodeText.length;
                        } else {
                          // Truncar este nó de texto
                          const allowedChars = remainingChars - usedChars;
                          textNode.textContent = nodeText.substring(0, allowedChars);
                          // Remover todos os nós de texto seguintes
                          let nextNode;
                          while (nextNode = walker.nextNode()) {
                            nextNode.textContent = '';
                          }
                          break;
                        }
                      }
                      
                      elementsToKeep.push(tempElement.outerHTML);
                    }
                    // Parar aqui - não incluir mais elementos
                    break;
                  }
                }
                
                return {
                  content: elementsToKeep.join(''),
                  isTruncated: true,
                  fullContent: htmlContent
                };
              }
              
              const sectionContent = EPT_buildPreviewMarkup(section.innerHTML, 1000);

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
                .html(cabecalho + sectionContent + footer);
              // Remove todas as colunas exceto a primeira (checkbox) e a segunda (que se torna o conteúdo expandido)
              row
                .children(
                  "td:eq(1),td:eq(3),td:eq(4),td:eq(5),td:eq(6),td:eq(7),td:eq(8),td:eq(9),td:eq(10),td:eq(11),td:eq(12),td:eq(13),td:eq(14),td:eq(15),td:eq(16),td:eq(17),td:eq(18),td:eq(19),td:eq(20)"
                )
                .remove();
                
                             // REINCORPORAR OS LINKS ORIGINAIS APÓS REMOVER COLUNAS
               originalLinks.forEach(function(linkData) {
                 if (linkData.href) {
                   let newLink = $('<a>', {
                     href: linkData.href,
                     class: 'linkMinuta',
                     'data-link': linkData.dataLink,
                     'hrefpreview': linkData.hrefPreview,
                     style: 'display: none; position: absolute; left: -9999px;' // ESCONDER O LINK MAS MANTÊ-LO FUNCIONAL
                   });
                   
                   // ADICIONAR O LINK DIRETAMENTE NA LINHA, NÃO NA CÉLULA
                   row.append(newLink);
                 }
               });

              // Aplica estilos modernos ao conteúdo da minuta recém-carregada
              if (ept_tablestyleData.ept_tablestyle && window.EPT_TableStyler) {
                window.EPT_TableStyler.enhanceContent(row[0]);
              }
            });
          } else {
            // SE NÃO HÁ URLPREVIEW, AINDA PRESERVAR OS LINKS ORIGINAIS
            // Remove todas as colunas exceto a primeira (checkbox) e a segunda (que se torna o conteúdo expandido)
            row
              .children("td:eq(1),td:eq(3),td:eq(4),td:eq(5),td:eq(6),td:eq(7),td:eq(8),td:eq(9),td:eq(10),td:eq(11),td:eq(12),td:eq(13),td:eq(14),td:eq(15),td:eq(16),td:eq(17),td:eq(18),td:eq(19),td:eq(20)")
              .remove();
            
            // REINCORPORAR OS LINKS ORIGINAIS APÓS REMOVER COLUNAS
            originalLinks.forEach(function(linkData) {
              if (linkData.href) {
                let newLink = $('<a>', {
                  href: linkData.href,
                  class: 'linkMinuta',
                  'data-link': linkData.dataLink,
                  'hrefpreview': linkData.hrefPreview,
                  style: 'display: none; position: absolute; left: -9999px;' // ESCONDER O LINK MAS MANTÊ-LO FUNCIONAL
                });
                
                // ADICIONAR O LINK DIRETAMENTE NA LINHA, NÃO NA CÉLULA
                row.append(newLink);
              }
            });
          } //end if(urlPreview)
        }); //end foreach
        //End texto de cada minuta da lista
  
        // Observador para detectar mudanças na tabela feitas pelo eproc (via AJAX)
        // e recarregar quando a edição for concluída (linha reconstruída sem cadeado)
        const tabelaMinutas = document.getElementById('tabelaMinutas');
        if (tabelaMinutas) {
          // Flag para evitar disparar durante transformação inicial
          let eptTransformacaoCompleta = false;
          // Armazena linhas que estão em edição (com bgcolor laranja)
          let linhasEmEdicao = new Set();
          
          // Aguardar um pequeno delay para garantir que a transformação EPT finalizou
          setTimeout(() => {
            eptTransformacaoCompleta = true;
            debugLog('EPT: Observador de mudanças na tabela ativado');
          }, 2000);
          
          const observadorTabela = new MutationObserver((mutations) => {
            if (!eptTransformacaoCompleta) return;
            
            for (let mutation of mutations) {
              // Detecta quando uma linha ganha bgcolor laranja (entrou em edição)
              if (mutation.type === 'attributes' && 
                  (mutation.attributeName === 'bgcolor' || mutation.attributeName === 'style')) {
                const tr = mutation.target;
                if (tr.tagName === 'TR' && !tr.classList.contains('infraTrOrdenacao')) {
                  const bgcolor = tr.getAttribute('bgcolor') || '';
                  const style = tr.getAttribute('style') || '';
                  const temLaranja = bgcolor === '#ffaa00' || style.includes('rgb(255, 170, 0)');
                  
                  if (temLaranja && !linhasEmEdicao.has(tr.id)) {
                    debugLog('EPT: Linha em edição detectada:', tr.id);
                    linhasEmEdicao.add(tr.id);
                  }
                }
              }
              
              // Detecta quando o Eproc reconstrói uma linha (adiciona múltiplos TDs)
              if (mutation.type === 'childList' && mutation.addedNodes.length > 5) {
                const tr = mutation.target;
                if (tr.tagName === 'TR' && linhasEmEdicao.has(tr.id)) {
                  // Verifica se a linha reconstruída NÃO contém mais o cadeado
                  const temCadeado = tr.querySelector('img[src*="cadeado.gif"]');
                  
                  if (!temCadeado) {
                    debugLog('EPT: Edição concluída, recarregando tabela...');
                    setTimeout(() => {
                      location.reload();
                    }, 500);
                    return;
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
  