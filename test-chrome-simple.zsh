#!/bin/zsh

echo "🚀 EPT - Teste Automático de URLs no Chrome"
echo "============================================="

# URLs dos tribunais
urls=(
    "https://eproc.jfrj.jus.br"
    "https://eproc.jfes.jus.br"
    "https://eproc.trf2.jus.br"
    "https://eproc.trf4.jus.br"
    "https://eproc1g.trf6.jus.br"
    "https://eproc2g.trf6.jus.br"
    "https://eproc.jfrs.jus.br"
    "https://eproc.jfsc.jus.br"
    "https://eproc.jfpr.jus.br"
    "https://eproc1g.tjrs.jus.br"
    "https://eproc2g.tjrs.jus.br"
    "https://eproc1g.tjsc.jus.br"
    "https://eproc2g.tjsc.jus.br"
    "https://eproc1.tjto.jus.br"
    "https://eproc2.tjto.jus.br"
    "https://eproc1g.tjrj.jus.br"
    "https://eproc2g.tjrj.jus.br"
    "https://eproc1g.tjsp.jus.br"
    "https://eproc2g.tjsp.jus.br"
    "https://eproc1g.tjmg.jus.br"
    "https://eproc2g.tjmg.jus.br"
)

# Verificar Chrome
if [[ ! -e "/Applications/Google Chrome.app" ]]; then
    echo "❌ Chrome não encontrado!"
    exit 1
fi

echo "✅ Chrome encontrado"
echo "📋 Total de URLs: ${#urls[@]}"
echo ""
echo "🔧 Iniciando Chrome com extensão..."

# Iniciar Chrome com flags de desenvolvimento
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
    --new-window \
    --load-extension="$(pwd)" \
    --auto-open-devtools-for-tabs \
    "about:blank" &

sleep 3

echo "🌐 Abrindo URLs dos tribunais..."
echo ""

# Abrir cada URL
for i in {1..${#urls[@]}}; do
    url=${urls[$i]}
    echo "[$i/${#urls[@]}] Abrindo: $url"
    
    # Usar open para abrir no Chrome
    open -a "Google Chrome" "$url"
    
    sleep 2
done

echo ""
echo "🎉 Teste concluído!"
echo "📝 Verifique cada aba para:"
echo "  • Console de erros (F12)"
echo "  • Funcionamento da extensão EPT"
echo "  • Carregamento dos sites" 