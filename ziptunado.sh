#!/usr/bin/env bash
# Gera eproc-tunado-<versao>.zip no diretório pai (chromeExtensions) para upload
# na Chrome Web Store (apenas arquivos da extensão).

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT="$(dirname "$ROOT")"
cd "$ROOT"

# Lê a versão do manifest.json para nomear o pacote.
# Nenhum pacote sai daqui sem as checagens passarem — em especial a de
# aumento de permissão, que na 1.0.0 desativou a extensão de toda a base.
# Para pular o teste de rede: EPT_PULAR_URLS=1 ./ziptunado.sh
PRERELEASE_ARGS=()
if [ "${EPT_PULAR_URLS:-0}" = "1" ]; then
  PRERELEASE_ARGS+=(--pular-urls)
fi
if ! "$ROOT/prerelease.sh" "${PRERELEASE_ARGS[@]+"${PRERELEASE_ARGS[@]}"}"; then
  echo "" >&2
  echo "Erro: prerelease.sh reprovou. Pacote não gerado." >&2
  exit 1
fi
echo ""

VERSION="$(grep -m1 '"version"' manifest.json | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"
if [ -z "$VERSION" ]; then
  echo "Erro: não foi possível ler a versão de manifest.json" >&2
  exit 1
fi

OUT="$PARENT/eproc-tunado-${VERSION}.zip"
rm -f "$OUT"
# Remove também pacotes antigos (no projeto e no pai).
rm -f "$ROOT"/eproc-tunado-*.zip "$ROOT"/eproc-tunado-store.zip

zip -r "$OUT" . \
  -x ".git/*" \
  -x ".git/**/*" \
  -x ".cursor/*" \
  -x ".cursor/**/*" \
  -x "docs/*" \
  -x "docs/**/*" \
  -x ".gitignore" \
  -x "test-urls.js" \
  -x "release-baseline.json" \
  -x "test-chrome-simple.zsh" \
  -x "url-test-report.json" \
  -x "README.md" \
  -x "*.md" \
  -x ".DS_Store" \
  -x "**/.DS_Store" \
  -x "eproc-tunado-*.zip" \
  -x "ziptunado.sh"

BYTES=$(wc -c < "$OUT" | tr -d ' ')
echo "Pacote criado: $OUT ($BYTES bytes)"
unzip -l "$OUT"
