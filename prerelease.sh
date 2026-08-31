#!/usr/bin/env bash
# prerelease.sh — checagens obrigatórias antes de empacotar para a Chrome Web Store.
#
# Existe por causa da 1.0.0: ela acrescentou dois hosts ao manifest, o Chrome
# tratou como aumento de permissão, reteve a atualização e desativou a
# extensão até o usuário reautorizar. Ninguém percebeu antes de publicar.
#
# Uso:
#   ./prerelease.sh              roda tudo (inclui o teste de URLs)
#   ./prerelease.sh --pular-urls pula o teste de rede
#   ./prerelease.sh --aprovar    grava o manifest atual como novo baseline
#                                (só depois que a versão foi aprovada E a base
#                                de usuários migrou)

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

BASELINE="release-baseline.json"
PULAR_URLS=0
APROVAR=0
for arg in "$@"; do
  case "$arg" in
    --pular-urls) PULAR_URLS=1 ;;
    --aprovar)    APROVAR=1 ;;
    *) echo "Argumento desconhecido: $arg" >&2; exit 2 ;;
  esac
done

FALHAS=0
ok()    { printf '  \033[32m✓\033[0m %s\n' "$1"; }
falha() { printf '  \033[31m✗\033[0m %s\n' "$1"; FALHAS=$((FALHAS + 1)); }
aviso() { printf '  \033[33m!\033[0m %s\n' "$1"; }
titulo(){ printf '\n\033[1m%s\033[0m\n' "$1"; }

# --- --aprovar: regrava o baseline e sai -------------------------------------
if [ "$APROVAR" -eq 1 ]; then
  python3 - "$BASELINE" << 'PY'
import json, sys
m = json.load(open('manifest.json', encoding='utf-8'))
alvo = sys.argv[1]
try:
    atual = json.load(open(alvo, encoding='utf-8'))
    comentario = atual.get('_comentario')
except Exception:
    comentario = None
saida = {}
if comentario:
    saida['_comentario'] = comentario
saida.update({
    'version': m['version'],
    'permissions': sorted(m.get('permissions', [])),
    'host_permissions': sorted(m.get('host_permissions', [])),
    'optional_host_permissions': sorted(m.get('optional_host_permissions', [])),
})
json.dump(saida, open(alvo, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print(f"Baseline atualizado para a {m['version']}.")
PY
  exit $?
fi

# --- 1. teste de URLs --------------------------------------------------------
titulo "1. URLs dos tribunais"
if [ "$PULAR_URLS" -eq 1 ]; then
  aviso "pulado (--pular-urls)"
elif ! command -v node > /dev/null 2>&1; then
  aviso "node não encontrado; teste de URLs pulado"
else
  if node test-urls.js > /tmp/ept-urls.log 2>&1; then
    ok "$(grep -m1 'URLs funcionando' /tmp/ept-urls.log | tr -d '\r')"
    if grep -q 'URLs com problemas: [1-9]' /tmp/ept-urls.log; then
      aviso "há URLs fora do ar — veja /tmp/ept-urls.log (não bloqueia o pacote)"
    fi
  else
    aviso "o teste de URLs terminou com erro — veja /tmp/ept-urls.log"
  fi
fi

# --- 2. manifest e permissões ------------------------------------------------
titulo "2. Manifest e permissões"
if [ ! -f "$BASELINE" ]; then
  falha "$BASELINE não existe — rode ./prerelease.sh --aprovar para criá-lo"
else
  SAIDA="$(python3 - "$BASELINE" << 'PY'
import json, sys, re

falhas, oks, notas = [], [], []
try:
    m = json.load(open('manifest.json', encoding='utf-8'))
except Exception as e:
    print("FALHA\tmanifest.json não é JSON válido: %s" % e)
    raise SystemExit(0)
oks.append("manifest.json é JSON válido")

b = json.load(open(sys.argv[1], encoding='utf-8'))

# Permissões novas em relação ao que a base já concedeu.
for chave in ("permissions", "host_permissions"):
    novas = sorted(set(m.get(chave, [])) - set(b.get(chave, [])))
    if novas:
        falhas.append(
            "%s acrescenta %d item(ns) que a base (%s) não concedeu: %s"
            % (chave, len(novas), b.get("version"), ", ".join(novas))
        )
        notas.extend([
            "O Chrome vai reter a atualização e desativar a extensão até cada",
            "usuário reautorizar. Duas saídas:",
            "  1. (recomendado) declarar em optional_host_permissions e pedir",
            "     no popup, como foi feito com o TJPR na 1.0.1;",
            "  2. se o aumento for mesmo necessário, publicar assim, ciente do",
            "     custo, e SÓ DEPOIS que a base reautorizar rodar",
            "     ./prerelease.sh --aprovar, para o baseline passar a ser esta",
            "     versão e o alerta parar de se repetir a cada release.",
        ])
    else:
        oks.append("%s: nada novo em relação à %s" % (chave, b.get("version")))

# Versão precisa subir.
def tupla(v):
    return tuple(int(x) for x in re.findall(r"\d+", v))
if tupla(m["version"]) <= tupla(b["version"]):
    falhas.append("versão %s não é maior que a do baseline (%s)"
                  % (m["version"], b["version"]))
else:
    oks.append("versão %s > baseline %s" % (m["version"], b["version"]))

# Arquivos citados pelo manifest têm de existir.
import os
refs = []
refs += list(m.get("icons", {}).values())
refs += list(m.get("action", {}).get("default_icon", {}).values())
if m.get("action", {}).get("default_popup"):
    refs.append(m["action"]["default_popup"])
if m.get("background", {}).get("service_worker"):
    refs.append(m["background"]["service_worker"])
for war in m.get("web_accessible_resources", []):
    refs += war.get("resources", [])
faltando = sorted({r for r in refs if not os.path.exists(r)})
if faltando:
    falhas.append("arquivos citados no manifest e ausentes: %s" % ", ".join(faltando))
else:
    oks.append("os %d arquivos citados no manifest existem" % len(set(refs)))

for o in oks:
    print("OK\t%s" % o)
for f in falhas:
    print("FALHA\t%s" % f)
for n in notas:
    print("NOTA\t%s" % n)
PY
)"
  while IFS=$'\t' read -r tipo msg; do
    [ -z "${tipo:-}" ] && continue
    case "$tipo" in
      OK)   ok "$msg" ;;
      NOTA) printf '      %s\n' "$msg" ;;
      *)    falha "$msg" ;;
    esac
  done <<< "$SAIDA"
fi

# --- 3. sintaxe dos scripts que vão no pacote --------------------------------
titulo "3. Sintaxe dos scripts empacotados"
if command -v node > /dev/null 2>&1; then
  for f in background.js toggle.js ept.js table-injector.js; do
    if node --check "$f" > /dev/null 2>&1; then
      ok "$f"
    else
      falha "$f tem erro de sintaxe"
    fi
  done
else
  aviso "node não encontrado; checagem de sintaxe pulada"
fi

# --- 4. resíduo de teste -----------------------------------------------------
titulo "4. Resíduo de teste no código empacotado"
RESIDUO="$(grep -rn -- "TESTE —\|TODO: remover\|debugger;" \
  background.js toggle.js ept.js table-injector.js popup.html \
  table-styles.css table-themes.css 2>/dev/null || true)"
if [ -n "$RESIDUO" ]; then
  falha "marcador de teste encontrado:"
  printf '      %s\n' "$RESIDUO"
else
  ok "nenhum marcador de teste"
fi

# --- resultado ---------------------------------------------------------------
if [ "$FALHAS" -eq 0 ]; then
  printf '\n\033[32mTudo certo — pode empacotar.\033[0m\n'
  exit 0
fi
printf '\n\033[31m%d verificação(ões) falharam. Pacote NÃO deve ser publicado.\033[0m\n' "$FALHAS"
exit 1
