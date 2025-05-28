const https = require('https');
const http = require('http');
const fs = require('fs');

// URLs extraídas do manifest.json
const urls = [
  'https://eproc.jfrj.jus.br',
  'https://eproc.jfes.jus.br',
  'https://eproc.trf2.jus.br',
  'https://eproc.trf4.jus.br',
  'https://eproc1g.trf6.jus.br',
  'https://eproc2g.trf6.jus.br',
  'https://eproc.jfrs.jus.br',
  'https://eproc.jfsc.jus.br',
  'https://eproc.jfpr.jus.br',
  'https://eproc1g.tjrs.jus.br',
  'https://eproc2g.tjrs.jus.br',
  'https://eproc1g.tjsc.jus.br',
  'https://eproc2g.tjsc.jus.br',
  'https://eproc1.tjto.jus.br',
  'https://eproc2.tjto.jus.br',
  'https://eproc1g.tjrj.jus.br',
  'https://eproc2g.tjrj.jus.br',
  'https://eproc1g.tjsp.jus.br',
  'https://eproc2g.tjsp.jus.br',
  'https://eproc1g.tjmg.jus.br',
  'https://eproc2g.tjmg.jus.br'
];

// Função para testar uma URL
function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = 10000; // 10 segundos de timeout
    
    const options = {
      method: 'HEAD',
      timeout: timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const req = protocol.request(url, options, (res) => {
      resolve({
        url: url,
        status: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 400,
        message: `Status: ${res.statusCode}`,
        headers: res.headers
      });
    });

    req.on('error', (error) => {
      resolve({
        url: url,
        status: null,
        success: false,
        message: `Erro: ${error.message}`,
        error: error.code
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url: url,
        status: null,
        success: false,
        message: 'Timeout - Servidor não respondeu em 10 segundos'
      });
    });

    req.setTimeout(timeout);
    req.end();
  });
}

// Função principal para testar todas as URLs
async function testAllUrls() {
  console.log('🔍 Iniciando teste de URLs do Eproc Tunado...\n');
  console.log(`📋 Total de URLs para testar: ${urls.length}\n`);
  
  const results = [];
  let successCount = 0;
  let failureCount = 0;

  // Teste sequencial para não sobrecarregar os servidores
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] Testando: ${url}`);
    
    const result = await testUrl(url);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      successCount++;
    } else {
      console.log(`❌ ${result.message}`);
      failureCount++;
    }
    
    // Pequena pausa entre requisições para ser respeitoso com os servidores
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL');
  console.log('='.repeat(60));
  console.log(`✅ URLs funcionando: ${successCount}`);
  console.log(`❌ URLs com problemas: ${failureCount}`);
  console.log(`📈 Taxa de sucesso: ${((successCount / urls.length) * 100).toFixed(1)}%\n`);

  // URLs com problemas
  const failedUrls = results.filter(r => !r.success);
  if (failedUrls.length > 0) {
    console.log('🚨 URLs COM PROBLEMAS:');
    console.log('-'.repeat(40));
    failedUrls.forEach(result => {
      console.log(`❌ ${result.url}`);
      console.log(`   Motivo: ${result.message}`);
      if (result.error) {
        console.log(`   Código do erro: ${result.error}`);
      }
      console.log('');
    });
  }

  // URLs funcionando
  const successUrls = results.filter(r => r.success);
  if (successUrls.length > 0) {
    console.log('✅ URLs FUNCIONANDO:');
    console.log('-'.repeat(40));
    successUrls.forEach(result => {
      console.log(`✅ ${result.url} (${result.message})`);
    });
  }

  // Salvar relatório em arquivo
  const reportData = {
    timestamp: new Date().toISOString(),
    totalUrls: urls.length,
    successCount,
    failureCount,
    successRate: ((successCount / urls.length) * 100).toFixed(1) + '%',
    results: results
  };

  fs.writeFileSync('url-test-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n📄 Relatório detalhado salvo em: url-test-report.json');
}

// Executar o teste
if (require.main === module) {
  testAllUrls().catch(console.error);
}

module.exports = { testAllUrls, testUrl }; 