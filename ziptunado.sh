#!/usr/bin/env bash
# Gera eproc-tunado-store.zip para upload na Chrome Web Store (só arquivos da extensão).

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

OUT="eproc-tunado-store.zip"
rm -f "$OUT"

zip -r "$OUT" . \
  -x ".git/*" \
  -x ".git/**/*" \
  -x ".cursor/*" \
  -x ".cursor/**/*" \
  -x ".gitignore" \
  -x "test-urls.js" \
  -x "test-chrome-simple.zsh" \
  -x "url-test-report.json" \
  -x "README.md" \
  -x "*.md" \
  -x ".DS_Store" \
  -x "**/.DS_Store" \
  -x "$OUT" \
  -x "ziptunado.sh"

BYTES=$(wc -c < "$OUT" | tr -d ' ')
echo "Pacote criado: $ROOT/$OUT ($BYTES bytes)"
unzip -l "$OUT"
