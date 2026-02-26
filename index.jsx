import { useState } from "react";

/* ══════════════════════════════════════════════════════
   TRANSLATIONS
══════════════════════════════════════════════════════ */
const T = {
  es: {
    subtitle: "Terminal de Inteligencia Bursátil",
    searchLabel: "— Introduce el ticker bursátil",
    analyzeBtn: "▶ Analizar",
    analyzing: "Analizando...",
    processingData: "Procesando datos de mercado",
    downloadPdf: "⤓ Descargar PDF",
    reportGenerated: "INFORME GENERADO",
    liveAnalysis: "ANÁLISIS EN VIVO",
    phases: [
      "Buscando datos de mercado en tiempo real...",
      "Analizando contexto macroeconómico...",
      "Evaluando fundamentos y métricas históricas...",
      "Procesando señales técnicas...",
      "Calculando niveles operativos...",
      "Evaluando fiabilidad de los datos...",
      "Generando informe final...",
    ],
    // Sentiments
    macro: "Macro", fundamental: "Fundamental", technical: "Técnico", general: "General",
    // Sections
    priceTitle: "Precio & Niveles Operativos",
    macroTitle: "Macroeconómico",
    fundamentalTitle: "Fundamental",
    technicalTitle: "Técnico",
    confidenceTitle: "Fiabilidad del Análisis",
    // Price panel
    currentPrice: "Precio actual",
    vsYesterday: "vs cierre anterior",
    aiEstimateNote: "Dato estimado por IA vía búsqueda web.\nVerifica en fuente oficial antes de operar.",
    range52w: "Rango 52 semanas + Niveles operativos",
    min52w: "Mín. 52W", max52w: "Máx. 52W",
    legendCurrent: "Precio actual", legendEntry: "Zona entrada", legendTP: "Take Profit", legendSL: "Stop Loss",
    entryZone: "Zona de Entrada", takeProfitLabel: "Take Profit", stopLossLabel: "Stop Loss",
    entryBadge: "ENTRADA", tpBadge: "OBJETIVO", slBadge: "PROTECCIÓN",
    vsPrice: "vs precio", potential: "potencial", risk: "riesgo",
    opRationale: "▸ RAZONAMIENTO OPERATIVO · ",
    // Fundamental charts
    historicMetrics: "─── MÉTRICAS HISTÓRICAS 5 AÑOS",
    financialStructure: "─── ESTRUCTURA FINANCIERA 5 AÑOS",
    divYieldTitle: "Rentabilidad por Dividendo", divYieldSub: "Dividend Yield anual · últimos 5 años",
    divGrowthTitle: "Crecimiento del Dividendo", divGrowthSub: "Variación % del dividendo vs año anterior",
    payoutTitle: "Payout Ratio", payoutSub: "% del beneficio distribuido como dividendo",
    sharesTitle: "Acciones en Circulación", sharesSub: "Shares outstanding · evolución últimos 5 años",
    debtTitle: "Deuda Total", debtSub: "Deuda neta (en millones de moneda local)",
    cashTitle: "Caja Neta", cashSub: "Cash & equivalentes netos (en millones)",
    dataReliability: "FIABILIDAD DEL DATO",
    // Confidence table
    confIntro: "Puntuación de 1–10 estimada por la IA sobre la veracidad y precisión de cada campo. Una puntuación alta indica datos conocidos y bien documentados; una baja indica estimaciones o posible desfase temporal.",
    confFieldLabel: "Campo", confScore: "Puntuación", confBar: "Barra", confNote: "Nota",
    confFields: {
      price_data: "Precio & Datos de Mercado",
      macro: "Análisis Macroeconómico",
      fundamental: "Análisis Fundamental",
      technical: "Análisis Técnico",
      dividend_data: "Datos de Dividendo (5 años)",
      debt_cash_data: "Deuda & Caja Neta (5 años)",
      shares_data: "Acciones en Circulación (5 años)",
      trading_levels: "Niveles Operativos (E/TP/SL)",
    },
    confIcons: { price_data:"💰", macro:"🌍", fundamental:"📊", technical:"📈", dividend_data:"💸", debt_cash_data:"🏦", shares_data:"🔢", trading_levels:"🎯" },
    // Errors
    errCrypto: `🪙 Análisis de criptomonedas no disponible\n\nEsta aplicación está diseñada exclusivamente para renta variable (acciones y ETFs). El ticker introducido parece corresponder a una criptomoneda.\n\nPrueba con tickers de bolsa como: AAPL, MSFT, NVDA, AMZN, SAN, IBE, TSLA...`,
    errInvalid: (t) => `⚠ Ticker no válido: "${t}"\n\nEl símbolo introducido no parece corresponder a ninguna acción cotizada conocida. Por favor, verifica el ticker en tu plataforma bursátil o en Google Finance.\n\nEjemplos válidos: AAPL, MSFT, NVDA, TSLA, SAN, IBE, REP`,
    errRateLimit: (resets) => `⏱ Límite de uso de la API alcanzado\n\nSe ha superado la cuota de solicitudes permitidas en la ventana de 5 horas. Esto es un límite del sistema, no un error de la aplicación.\n\n${resets ? `🔄 El límite se restablecerá aproximadamente a las ${resets}.` : "🔄 Inténtalo de nuevo en unos minutos."}\n\nMientras tanto, puedes revisar los análisis ya generados o consultarlos en PDF.`,
    errGeneric: (t, msg) => `No se pudo analizar "${t}". ${msg}`,
    footerNote: "Análisis generado por IA · Precios y métricas son estimaciones basadas en búsqueda web y datos históricos públicos.\nNo constituye asesoramiento financiero · Verifica siempre en fuentes oficiales antes de tomar decisiones de inversión",
    noData: "Sin datos",
  },

  pt: {
    subtitle: "Terminal de Inteligência Bolsista",
    searchLabel: "— Introduza o ticker bolsista",
    analyzeBtn: "▶ Analisar",
    analyzing: "A analisar...",
    processingData: "A processar dados de mercado",
    downloadPdf: "⤓ Descarregar PDF",
    reportGenerated: "RELATÓRIO GERADO",
    liveAnalysis: "ANÁLISE AO VIVO",
    phases: [
      "A procurar dados de mercado em tempo real...",
      "A analisar contexto macroeconómico...",
      "A avaliar fundamentos e métricas históricas...",
      "A processar sinais técnicos...",
      "A calcular níveis operacionais...",
      "A avaliar fiabilidade dos dados...",
      "A gerar relatório final...",
    ],
    macro: "Macro", fundamental: "Fundamental", technical: "Técnico", general: "Geral",
    priceTitle: "Preço & Níveis Operacionais",
    macroTitle: "Macroeconómico",
    fundamentalTitle: "Fundamental",
    technicalTitle: "Técnico",
    confidenceTitle: "Fiabilidade da Análise",
    currentPrice: "Preço atual",
    vsYesterday: "vs fecho anterior",
    aiEstimateNote: "Dado estimado por IA via pesquisa web.\nVerifique em fonte oficial antes de operar.",
    range52w: "Intervalo 52 semanas + Níveis operacionais",
    min52w: "Mín. 52S", max52w: "Máx. 52S",
    legendCurrent: "Preço atual", legendEntry: "Zona entrada", legendTP: "Take Profit", legendSL: "Stop Loss",
    entryZone: "Zona de Entrada", takeProfitLabel: "Take Profit", stopLossLabel: "Stop Loss",
    entryBadge: "ENTRADA", tpBadge: "OBJETIVO", slBadge: "PROTEÇÃO",
    vsPrice: "vs preço", potential: "potencial", risk: "risco",
    opRationale: "▸ RACIOCÍNIO OPERACIONAL · ",
    historicMetrics: "─── MÉTRICAS HISTÓRICAS 5 ANOS",
    financialStructure: "─── ESTRUTURA FINANCEIRA 5 ANOS",
    divYieldTitle: "Rentabilidade por Dividendo", divYieldSub: "Dividend Yield anual · últimos 5 anos",
    divGrowthTitle: "Crescimento do Dividendo", divGrowthSub: "Variação % do dividendo vs ano anterior",
    payoutTitle: "Payout Ratio", payoutSub: "% do lucro distribuído como dividendo",
    sharesTitle: "Ações em Circulação", sharesSub: "Shares outstanding · evolução últimos 5 anos",
    debtTitle: "Dívida Total", debtSub: "Dívida líquida (em milhões de moeda local)",
    cashTitle: "Caixa Líquida", cashSub: "Cash & equivalentes líquidos (em milhões)",
    dataReliability: "FIABILIDADE DO DADO",
    confIntro: "Pontuação de 1–10 estimada pela IA sobre a veracidade e precisão de cada campo. Pontuação alta indica dados bem documentados; pontuação baixa indica estimativas ou possível desfasamento temporal.",
    confFieldLabel: "Campo", confScore: "Pontuação", confBar: "Barra", confNote: "Nota",
    confFields: {
      price_data: "Preço & Dados de Mercado",
      macro: "Análise Macroeconómica",
      fundamental: "Análise Fundamental",
      technical: "Análise Técnica",
      dividend_data: "Dados de Dividendo (5 anos)",
      debt_cash_data: "Dívida & Caixa Líquida (5 anos)",
      shares_data: "Ações em Circulação (5 anos)",
      trading_levels: "Níveis Operacionais (E/TP/SL)",
    },
    confIcons: { price_data:"💰", macro:"🌍", fundamental:"📊", technical:"📈", dividend_data:"💸", debt_cash_data:"🏦", shares_data:"🔢", trading_levels:"🎯" },
    errCrypto: `🪙 Análise de criptomoedas não disponível\n\nEsta aplicação foi concebida exclusivamente para ações e ETFs cotados em bolsa. O ticker introduzido parece corresponder a uma criptomoeda.\n\nExperimente com tickers como: AAPL, MSFT, NVDA, AMZN, EDP, GALP, NOS...`,
    errInvalid: (t) => `⚠ Ticker inválido: "${t}"\n\nO símbolo introduzido não parece corresponder a nenhuma ação cotada conhecida. Por favor, verifique o ticker na sua plataforma bolsista ou no Google Finance.\n\nExemplos válidos: AAPL, MSFT, NVDA, TSLA, EDP, GALP, NOS`,
    errRateLimit: (resets) => `⏱ Limite de utilização da API atingido\n\nFoi ultrapassada a quota de pedidos permitidos na janela de 5 horas. Este é um limite do sistema, não um erro da aplicação.\n\n${resets ? `🔄 O limite será reposto aproximadamente às ${resets}.` : "🔄 Tente novamente dentro de alguns minutos."}\n\nEntretanto, pode rever as análises já geradas ou consultá-las em PDF.`,
    errGeneric: (t, msg) => `Não foi possível analisar "${t}". ${msg}`,
    footerNote: "Análise gerada por IA · Preços e métricas são estimativas baseadas em pesquisa web e dados históricos públicos.\nNão constitui aconselhamento financeiro · Verifique sempre em fontes oficiais antes de tomar decisões de investimento",
    noData: "Sem dados",
  },

  en: {
    subtitle: "Stock Market Intelligence Terminal",
    searchLabel: "— Enter the stock ticker",
    analyzeBtn: "▶ Analyze",
    analyzing: "Analyzing...",
    processingData: "Processing market data",
    downloadPdf: "⤓ Download PDF",
    reportGenerated: "REPORT GENERATED",
    liveAnalysis: "LIVE ANALYSIS",
    phases: [
      "Fetching real-time market data...",
      "Analyzing macroeconomic context...",
      "Evaluating fundamentals & historical metrics...",
      "Processing technical signals...",
      "Calculating trading levels...",
      "Assessing data reliability...",
      "Generating final report...",
    ],
    macro: "Macro", fundamental: "Fundamental", technical: "Technical", general: "Overall",
    priceTitle: "Price & Trading Levels",
    macroTitle: "Macroeconomic",
    fundamentalTitle: "Fundamental",
    technicalTitle: "Technical",
    confidenceTitle: "Analysis Reliability",
    currentPrice: "Current price",
    vsYesterday: "vs previous close",
    aiEstimateNote: "AI-estimated data via web search.\nAlways verify in official sources before trading.",
    range52w: "52-week range + Trading levels",
    min52w: "52W Low", max52w: "52W High",
    legendCurrent: "Current price", legendEntry: "Entry zone", legendTP: "Take Profit", legendSL: "Stop Loss",
    entryZone: "Entry Zone", takeProfitLabel: "Take Profit", stopLossLabel: "Stop Loss",
    entryBadge: "ENTRY", tpBadge: "TARGET", slBadge: "PROTECTION",
    vsPrice: "vs price", potential: "upside", risk: "risk",
    opRationale: "▸ TRADING RATIONALE · ",
    historicMetrics: "─── 5-YEAR HISTORICAL METRICS",
    financialStructure: "─── 5-YEAR FINANCIAL STRUCTURE",
    divYieldTitle: "Dividend Yield", divYieldSub: "Annual dividend yield · last 5 years",
    divGrowthTitle: "Dividend Growth", divGrowthSub: "% change in dividend vs prior year",
    payoutTitle: "Payout Ratio", payoutSub: "% of earnings distributed as dividend",
    sharesTitle: "Shares Outstanding", sharesSub: "Shares outstanding · 5-year evolution",
    debtTitle: "Total Debt", debtSub: "Net debt (in millions of local currency)",
    cashTitle: "Net Cash", cashSub: "Net cash & equivalents (in millions)",
    dataReliability: "DATA RELIABILITY",
    confIntro: "Score from 1–10 estimated by the AI on the accuracy and reliability of each field. A high score means well-documented data; a low score indicates estimates or possible time lag.",
    confFieldLabel: "Field", confScore: "Score", confBar: "Bar", confNote: "Note",
    confFields: {
      price_data: "Price & Market Data",
      macro: "Macroeconomic Analysis",
      fundamental: "Fundamental Analysis",
      technical: "Technical Analysis",
      dividend_data: "Dividend Data (5 years)",
      debt_cash_data: "Debt & Net Cash (5 years)",
      shares_data: "Shares Outstanding (5 years)",
      trading_levels: "Trading Levels (E/TP/SL)",
    },
    confIcons: { price_data:"💰", macro:"🌍", fundamental:"📊", technical:"📈", dividend_data:"💸", debt_cash_data:"🏦", shares_data:"🔢", trading_levels:"🎯" },
    errCrypto: `🪙 Cryptocurrency analysis not available\n\nThis application is designed exclusively for listed equities and ETFs. The ticker you entered appears to be a cryptocurrency.\n\nTry stock tickers such as: AAPL, MSFT, NVDA, AMZN, TSLA, META, GOOGL...`,
    errInvalid: (t) => `⚠ Invalid ticker: "${t}"\n\nThe symbol entered does not appear to match any known listed stock. Please verify the ticker on your brokerage platform or Google Finance.\n\nValid examples: AAPL, MSFT, NVDA, TSLA, AMZN, META, GOOGL`,
    errRateLimit: (resets) => `⏱ API usage limit reached\n\nThe allowed request quota for the 5-hour window has been exceeded. This is a system limit, not an application error.\n\n${resets ? `🔄 The limit will reset at approximately ${resets}.` : "🔄 Please try again in a few minutes."}\n\nIn the meantime, you can review previously generated analyses or download them as PDF.`,
    errGeneric: (t, msg) => `Could not analyze "${t}". ${msg}`,
    footerNote: "AI-generated analysis · Prices and metrics are estimates based on web search and public historical data.\nNot financial advice · Always verify in official sources before making investment decisions",
    noData: "No data",
  },
};

/* ══════════════════════════════════════════════════════
   CRYPTO BLOCKLIST
══════════════════════════════════════════════════════ */
const CRYPTO_TICKERS = new Set([
  "BTC","ETH","BNB","XRP","ADA","SOL","DOGE","DOT","MATIC","LTC",
  "AVAX","LINK","UNI","ATOM","XLM","VET","ICP","FIL","TRX","ETC",
  "ALGO","MANA","SAND","AXS","THETA","FTM","HBAR","EGLD","NEAR","ONE",
  "FLOW","ROSE","KLAY","ENJ","CHZ","BAT","ZIL","HOT","CELO","QTUM",
  "WAVES","XTZ","DASH","ZEC","EOS","BCH","BSV","XMR","NEO","IOTA",
  "LUNA","UST","USDT","USDC","BUSD","DAI","SHIB","PEPE","WIF","BONK",
  "SUI","APT","ARB","OP","INJ","SEI","TIA","PYTH","JTO","STRK",
  "BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT",
]);

/* ══════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;700&family=Bebas+Neue&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#070a0e;--bg2:#0d1117;--bg3:#111820;
    --border:#1e2d3d;
    --accent:#00d4aa;--accent2:#f59e0b;--accent3:#3b82f6;--accent4:#a78bfa;
    --danger:#ef4444;
    --text:#e2e8f0;--text2:#94a3b8;--text3:#475569;
    --glow:0 0 20px rgba(0,212,170,.15);
  }
  body{background:var(--bg);color:var(--text);font-family:'IBM Plex Mono',monospace}
  .app{min-height:100vh;background:var(--bg);position:relative;overflow-x:hidden}
  .grid-bg{position:fixed;inset:0;background-image:linear-gradient(rgba(0,212,170,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,170,.03) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0}
  .content{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:40px 24px}

  /* HEADER */
  .header{display:flex;align-items:center;gap:16px;margin-bottom:48px;flex-wrap:wrap}
  .logo-mark{width:44px;height:44px;background:var(--accent);clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue';font-size:18px;color:var(--bg);flex-shrink:0}
  .logo-text{font-family:'Bebas Neue';font-size:28px;letter-spacing:4px;color:var(--text)}
  .logo-sub{font-size:10px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-top:-4px}
  .header-right{margin-left:auto;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
  .status-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  .status-text{font-size:10px;color:var(--text3);letter-spacing:2px}

  /* LANGUAGE SWITCHER */
  .lang-switcher{display:flex;gap:6px;align-items:center;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:4px}
  .lang-btn{background:none;border:none;cursor:pointer;padding:4px 8px;border-radius:4px;font-size:18px;transition:all .2s;opacity:.45;line-height:1}
  .lang-btn:hover{opacity:.8;background:rgba(255,255,255,.05)}
  .lang-btn.active{opacity:1;background:rgba(0,212,170,.15);box-shadow:0 0 0 1px var(--accent)}
  .lang-divider{width:1px;height:18px;background:var(--border)}

  /* SEARCH */
  .search-section{margin-bottom:40px}
  .search-label{font-size:10px;color:var(--accent);letter-spacing:3px;text-transform:uppercase;margin-bottom:12px}
  .search-row{display:flex;gap:12px;flex-wrap:wrap}
  .ticker-input{flex:1;max-width:240px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:14px 20px;font-family:'IBM Plex Mono';font-size:22px;font-weight:700;color:var(--accent);letter-spacing:4px;text-transform:uppercase;outline:none;transition:all .2s}
  .ticker-input::placeholder{color:var(--text3);font-weight:300;letter-spacing:2px;font-size:16px}
  .ticker-input:focus{border-color:var(--accent);box-shadow:var(--glow)}
  .analyze-btn{background:var(--accent);color:var(--bg);border:none;border-radius:4px;padding:14px 32px;font-family:'IBM Plex Mono';font-size:13px;font-weight:700;letter-spacing:2px;cursor:pointer;transition:all .2s;text-transform:uppercase;display:flex;align-items:center;gap:10px}
  .analyze-btn:hover:not(:disabled){background:#00f5c0;transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,212,170,.4)}
  .analyze-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}

  /* LOADING */
  .loading-section{padding:60px 0;text-align:center}
  .loading-ticker{font-family:'Bebas Neue';font-size:80px;color:var(--accent);opacity:.15;letter-spacing:8px}
  .loading-bars{display:flex;gap:4px;justify-content:center;margin:24px 0}
  .loading-bar{width:3px;background:var(--accent);border-radius:2px;animation:bar-anim 1.2s ease-in-out infinite}
  .loading-bar:nth-child(1){height:20px;animation-delay:0s}
  .loading-bar:nth-child(2){height:35px;animation-delay:.1s}
  .loading-bar:nth-child(3){height:25px;animation-delay:.2s}
  .loading-bar:nth-child(4){height:40px;animation-delay:.3s}
  .loading-bar:nth-child(5){height:20px;animation-delay:.4s}
  .loading-bar:nth-child(6){height:30px;animation-delay:.5s}
  .loading-bar:nth-child(7){height:15px;animation-delay:.6s}
  @keyframes bar-anim{0%,100%{opacity:.3;transform:scaleY(.6)}50%{opacity:1;transform:scaleY(1)}}
  .loading-text{font-size:11px;color:var(--text3);letter-spacing:3px;text-transform:uppercase}
  .loading-phase{font-size:13px;color:var(--accent);letter-spacing:1px;margin-top:8px}

  /* ERROR BOXES */
  .error-box{border-radius:6px;padding:24px 28px;font-size:13px;line-height:1.9;white-space:pre-line;font-family:'IBM Plex Sans',sans-serif}
  .error-generic{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);color:var(--danger)}
  .error-crypto{background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.3);color:var(--accent4)}
  .error-invalid{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.3);color:var(--accent2)}
  .error-ratelimit{background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.3);color:var(--accent3)}
  .error-title{font-family:'Bebas Neue';font-size:22px;letter-spacing:2px;margin-bottom:8px;display:block}

  /* RESULTS HEADER */
  .results-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:16px}
  .company-ticker{font-family:'Bebas Neue';font-size:72px;color:var(--accent);letter-spacing:4px;line-height:1}
  .analysis-meta{font-size:11px;color:var(--text3);letter-spacing:1px;text-align:right}
  .analysis-date{color:var(--text2);font-size:12px;margin-top:4px}
  .download-btn{background:transparent;color:var(--accent2);border:1px solid var(--accent2);border-radius:4px;padding:10px 20px;font-family:'IBM Plex Mono';font-size:11px;font-weight:500;letter-spacing:2px;cursor:pointer;transition:all .2s;text-transform:uppercase;display:flex;align-items:center;gap:8px}
  .download-btn:hover{background:rgba(245,158,11,.1);box-shadow:0 0 20px rgba(245,158,11,.2)}

  /* SENTIMENTS */
  .sentiment-row{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}
  .sentiment-card{flex:1;min-width:130px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:14px 16px}
  .sentiment-label{font-size:9px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px}
  .sentiment-value{font-family:'Bebas Neue';font-size:26px;letter-spacing:2px}
  .bull{color:var(--accent)}.bear{color:var(--danger)}.neutral{color:var(--accent2)}
  .divider{height:1px;background:var(--border);margin:24px 0}

  /* PANELS */
  .panel{background:var(--bg2);border:1px solid var(--border);border-radius:4px;overflow:hidden;margin-bottom:16px}
  .panel-header{display:flex;align-items:center;gap:12px;padding:16px 24px;border-bottom:1px solid var(--border)}
  .panel-num{font-family:'Bebas Neue';font-size:32px;color:var(--text3);line-height:1}
  .panel-title{font-family:'Bebas Neue';font-size:22px;letter-spacing:3px}
  .panel-tag{margin-left:auto;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;border-radius:2px}
  .panel-body{padding:24px}
  .col-accent .panel-title{color:var(--accent)}   .col-accent .panel-tag{background:rgba(0,212,170,.1);color:var(--accent)}
  .col-accent2 .panel-title{color:var(--accent2)} .col-accent2 .panel-tag{background:rgba(245,158,11,.1);color:var(--accent2)}
  .col-accent3 .panel-title{color:var(--accent3)} .col-accent3 .panel-tag{background:rgba(59,130,246,.1);color:var(--accent3)}
  .col-accent4 .panel-title{color:var(--accent4)} .col-accent4 .panel-tag{background:rgba(167,139,250,.1);color:var(--accent4)}
  .col-price .panel-title{color:var(--accent3)} .col-price .panel-header{background:linear-gradient(90deg,rgba(59,130,246,.08),transparent)}
  .analysis-text{font-family:'IBM Plex Sans',sans-serif;font-size:14px;line-height:1.85;color:var(--text2);white-space:pre-wrap}

  /* CONFIDENCE BADGE */
  .conf-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:12px;font-size:10px;letter-spacing:1px;font-weight:600;margin-left:8px}
  .conf-high{background:rgba(0,212,170,.12);color:var(--accent);border:1px solid rgba(0,212,170,.25)}
  .conf-mid{background:rgba(245,158,11,.12);color:var(--accent2);border:1px solid rgba(245,158,11,.25)}
  .conf-low{background:rgba(239,68,68,.12);color:var(--danger);border:1px solid rgba(239,68,68,.25)}
  .conf-dot{width:5px;height:5px;border-radius:50%;background:currentColor}

  /* PRICE PANEL */
  .price-top-row{display:flex;align-items:flex-start;gap:40px;margin-bottom:28px;flex-wrap:wrap}
  .current-price-block{min-width:180px}
  .current-price-label{font-size:9px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px}
  .current-price-val{font-family:'Bebas Neue';font-size:56px;color:var(--text);letter-spacing:2px;line-height:1}
  .current-price-currency{font-family:'IBM Plex Mono';font-size:16px;color:var(--text3);margin-left:6px;vertical-align:super}
  .price-change-row{display:flex;align-items:center;gap:8px;margin-top:8px}
  .price-change-val{font-family:'IBM Plex Mono';font-size:13px;font-weight:600}
  .price-source-note{font-size:9px;color:var(--text3);line-height:1.5;border-left:2px solid var(--border);padding-left:8px;margin-top:8px}
  .week52-block{flex:1;min-width:280px}
  .week52-label{font-size:9px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-bottom:14px}
  .range-extremes{display:flex;justify-content:space-between;margin-bottom:10px}
  .range-extreme-val{font-family:'IBM Plex Mono';font-weight:700;font-size:15px}
  .range-low .range-extreme-val{color:var(--danger)}.range-high .range-extreme-val{color:var(--accent)}.range-high{text-align:right}
  .range-extreme-lbl{font-size:9px;color:var(--text3);letter-spacing:1px;margin-top:3px}
  .range-bar-wrap{position:relative;height:10px;background:var(--bg3);border-radius:5px;overflow:visible}
  .range-bar-gradient{position:absolute;inset:0;border-radius:5px;background:linear-gradient(90deg,rgba(239,68,68,.4),rgba(245,158,11,.4),rgba(0,212,170,.4))}
  .range-legend{display:flex;gap:16px;margin-top:12px;flex-wrap:wrap}
  .range-legend-item{display:flex;align-items:center;gap:6px}
  .range-legend-txt{font-size:9px;color:var(--text3);letter-spacing:1px;text-transform:uppercase}
  .levels-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:28px}
  @media(max-width:600px){.levels-grid{grid-template-columns:1fr}}
  .level-card{border-radius:4px;padding:20px;position:relative;overflow:hidden}
  .level-entry{background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.25)}
  .level-tp{background:rgba(0,212,170,.06);border:1px solid rgba(0,212,170,.25)}
  .level-sl{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.25)}
  .level-badge{position:absolute;top:0;right:0;font-size:9px;letter-spacing:1px;padding:3px 8px;border-bottom-left-radius:4px}
  .level-entry .level-badge{background:rgba(59,130,246,.2);color:var(--accent3)}
  .level-tp .level-badge{background:rgba(0,212,170,.2);color:var(--accent)}
  .level-sl .level-badge{background:rgba(239,68,68,.2);color:var(--danger)}
  .level-icon{font-size:20px;margin-bottom:10px}
  .level-name{font-size:9px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px}
  .level-entry .level-name{color:rgba(59,130,246,.8)}.level-tp .level-name{color:rgba(0,212,170,.8)}.level-sl .level-name{color:rgba(239,68,68,.8)}
  .level-val{font-family:'Bebas Neue';font-size:30px;letter-spacing:1px}
  .level-entry .level-val{color:var(--accent3)}.level-tp .level-val{color:var(--accent)}.level-sl .level-val{color:var(--danger)}
  .level-subval{font-size:11px;color:var(--text3);margin-top:2px}
  .level-pct{font-size:12px;font-weight:600;margin-top:6px;padding:3px 8px;border-radius:3px;display:inline-block}
  .level-entry .level-pct{background:rgba(59,130,246,.1);color:var(--accent3)}.level-tp .level-pct{background:rgba(0,212,170,.1);color:var(--accent)}.level-sl .level-pct{background:rgba(239,68,68,.1);color:var(--danger)}
  .level-rationale{font-family:'IBM Plex Sans',sans-serif;font-size:12px;color:var(--text3);line-height:1.6;margin-top:20px;border-top:1px solid var(--border);padding-top:16px}

  /* METRIC CHARTS */
  .metrics-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:20px}
  .dual-chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  @media(max-width:700px){.metrics-grid,.dual-chart-grid{grid-template-columns:1fr}}
  .metric-chart-card{background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:18px}
  .metric-chart-title{font-size:9px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px}
  .metric-chart-sub{font-size:10px;color:var(--text2);margin-bottom:14px;font-family:'IBM Plex Sans'}
  .bar-chart{display:flex;align-items:flex-end;gap:8px;height:80px}
  .bar-col{display:flex;flex-direction:column;align-items:center;flex:1;gap:4px;height:100%}
  .bar-col-inner{width:100%;border-radius:3px 3px 0 0;position:relative;min-height:3px;display:flex;align-items:flex-end;justify-content:center}
  .bar-val{font-size:8px;font-weight:700;white-space:nowrap;position:absolute;top:-14px;color:var(--text)}
  .bar-label{font-size:8px;color:var(--text3);margin-top:4px;white-space:nowrap}
  .conf-row{display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)}
  .conf-row-label{font-size:9px;color:var(--text3);letter-spacing:1px}

  /* CONFIDENCE TABLE */
  .conf-table{width:100%;border-collapse:collapse;font-size:11px;margin-top:8px}
  .conf-table th{text-align:left;color:var(--text3);font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:6px 12px;border-bottom:1px solid var(--border);font-weight:400}
  .conf-table td{padding:10px 12px;border-bottom:1px solid var(--bg3);color:var(--text2)}
  .conf-table tr:last-child td{border-bottom:none}
  .conf-table tr:hover td{background:rgba(255,255,255,.02)}
  .conf-score{font-family:'Bebas Neue';font-size:20px;letter-spacing:1px}
  .conf-bar-bg{height:4px;background:var(--bg3);border-radius:2px;margin-top:4px;width:100px}
  .conf-bar-fill{height:100%;border-radius:2px}

  @media print{
    .grid-bg,.search-section,.download-btn,.header-right{display:none!important}
    .app{background:white!important}
    .panel,.metric-chart-card{background:white!important;border:1px solid #ddd!important;break-inside:avoid;margin-bottom:12px}
    .panel-header{background:#f5f5f5!important}
    .analysis-text,.level-rationale{color:#333!important}
    .company-ticker{color:#000!important;font-size:48px!important}
    .panel-title{color:#000!important}
    .current-price-val,.level-val{color:#000!important}
    .sentiment-card,.level-card{background:#f9f9f9!important;border:1px solid #ddd!important}
    .content{max-width:100%!important}
    body{background:white!important;color:#111!important}
    .conf-badge{border:1px solid #ccc!important;background:#f5f5f5!important;color:#333!important}
    .error-box{break-inside:avoid}
  }
`;

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
const sc = s => {
  if (!s) return "neutral";
  const v = s.toLowerCase();
  if (v.includes("alcista") || v.includes("bullish") || v.includes("positiv") || v.includes("alta") || v.includes("upward") || v.includes("crescente")) return "bull";
  if (v.includes("bajista") || v.includes("bearish") || v.includes("negativ") || v.includes("baja") || v.includes("downward") || v.includes("decrescente")) return "bear";
  return "neutral";
};
const pctDiff = (val, ref) => {
  if (!ref || !val || isNaN(val) || isNaN(ref)) return null;
  const d = ((val - ref) / ref) * 100;
  return (d >= 0 ? "+" : "") + d.toFixed(1) + "%";
};
const clamp01 = (v, lo, hi) => hi === lo ? 0 : Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100));
const fmt = (n, dec = 2) => { const num = parseFloat(n); if (isNaN(num)) return "—"; return num.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
const fmtK = n => {
  const num = parseFloat(n); if (isNaN(num)) return "—";
  if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toFixed(1);
};

/* ── Parse errors from API ── */
function parseApiError(data, ticker, lang) {
  const t = T[lang];
  const err = data?.error;
  if (!err) return null;
  if (err.type === "exceeded_limit" || err.type === "rate_limit_error" || (err.type === "error" && JSON.stringify(err).includes("exceeded_limit"))) {
    let resetTime = null;
    try {
      const resetsAt = err.resetsAt || err.resets_at || data?.error?.resetsAt;
      if (resetsAt) {
        resetTime = new Date(typeof resetsAt === "number" ? resetsAt * (resetsAt < 1e12 ? 1000 : 1) : resetsAt)
          .toLocaleTimeString(lang === "en" ? "en-GB" : lang === "pt" ? "pt-PT" : "es-ES", { hour: "2-digit", minute: "2-digit" });
      }
    } catch (_) {}
    return { type: "ratelimit", msg: t.errRateLimit(resetTime) };
  }
  return null;
}

/* ── Detect error type from string ── */
function classifyError(errMsg, ticker, lang) {
  const t = T[lang];
  const m = errMsg.toLowerCase();
  if (m.includes("exceeded_limit") || m.includes("rate_limit") || m.includes("five_hour") || m.includes("quota")) {
    return { type: "ratelimit", msg: t.errRateLimit(null) };
  }
  if (m.includes("invalid ticker") || m.includes("not found") || m.includes("unknown symbol") || m.includes("no encontrado") || m.includes("json")) {
    return { type: "invalid", msg: t.errInvalid(ticker) };
  }
  return { type: "generic", msg: t.errGeneric(ticker, errMsg) };
}

/* ══════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════ */
function ConfBadge({ score }) {
  if (!score) return null;
  const cls = score >= 7 ? "conf-high" : score >= 5 ? "conf-mid" : "conf-low";
  return <span className={`conf-badge ${cls}`}><span className="conf-dot" />{score}/10</span>;
}

function BarChart({ data = [], color = "var(--accent)", unit = "", lang = "es" }) {
  const t = T[lang];
  if (!data || data.length === 0) return <div style={{ color: "var(--text3)", fontSize: 11 }}>{t.noData}</div>;
  const vals = data.map(d => parseFloat(d.value) || 0);
  const maxV = Math.max(...vals.map(Math.abs), 0.01);
  return (
    <div className="bar-chart">
      {data.map((d, i) => {
        const v = parseFloat(d.value) || 0;
        const barH = Math.max((Math.abs(v) / maxV) * 68, 3);
        const isNeg = v < 0;
        return (
          <div className="bar-col" key={i}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", position: "relative", width: "100%" }}>
              <div className="bar-col-inner" style={{ height: barH, background: isNeg ? "var(--danger)" : color, opacity: 0.65 + (i / data.length) * 0.35, width: "100%", borderRadius: isNeg ? "0 0 3px 3px" : "3px 3px 0 0" }}>
                <span className="bar-val" style={{ color: isNeg ? "var(--danger)" : color }}>
                  {unit === "%" ? v.toFixed(1) + "%" : fmtK(v)}
                </span>
              </div>
            </div>
            <div className="bar-label">{d.year}</div>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ data = [], color = "var(--accent)", unit = "", lang = "es" }) {
  if (!data || data.length < 2) return <BarChart data={data} color={color} unit={unit} lang={lang} />;
  const vals = data.map(d => parseFloat(d.value) || 0);
  const minV = Math.min(...vals), maxV = Math.max(...vals), range = maxV - minV || 1;
  const W = 300, H = 80, pad = 8;
  const pts = vals.map((v, i) => [pad + (i / (vals.length - 1)) * (W - pad * 2), H - pad - ((v - minV) / range) * (H - pad * 2)]);
  const polyline = pts.map(p => p.join(",")).join(" ");
  const area = `M${pts[0][0]},${H - pad} ` + pts.map(p => `L${p[0]},${p[1]}`).join(" ") + ` L${pts[pts.length - 1][0]},${H - pad} Z`;
  const gId = `g${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 80 }}>
        <defs>
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gId})`} />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={color} />)}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {data.map((d, i) => (
          <div key={i} style={{ fontSize: 8, color: "var(--text3)", textAlign: "center", flex: 1 }}>
            <div style={{ color, fontSize: 9, fontWeight: 700 }}>{unit === "%" ? parseFloat(d.value).toFixed(1) + "%" : fmtK(parseFloat(d.value))}</div>
            {d.year}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ title, subtitle, data, color, unit, chartType = "bar", confScore, lang }) {
  const t = T[lang];
  return (
    <div className="metric-chart-card">
      <div className="metric-chart-title">{title}</div>
      <div className="metric-chart-sub">{subtitle}</div>
      {chartType === "line"
        ? <LineChart data={data} color={color} unit={unit} lang={lang} />
        : <BarChart data={data} color={color} unit={unit} lang={lang} />}
      <div className="conf-row">
        <span className="conf-row-label">{t.dataReliability}</span>
        <ConfBadge score={confScore} />
      </div>
    </div>
  );
}

function ErrorBox({ error }) {
  const typeMap = { ratelimit: "error-ratelimit", crypto: "error-crypto", invalid: "error-invalid", generic: "error-generic" };
  const titleMap = { ratelimit: "⏱ Rate Limit", crypto: "🪙 Crypto", invalid: "⚠ Ticker", generic: "⚠ Error" };
  const cls = typeMap[error.type] || "error-generic";
  return <div className={`error-box ${cls}`}>{error.msg}</div>;
}

function ConfidencePanel({ confidence = {}, lang }) {
  const t = T[lang];
  const FIELDS = ["price_data","macro","fundamental","technical","dividend_data","debt_cash_data","shares_data","trading_levels"];
  const confColor = s => s >= 7 ? "var(--accent)" : s >= 5 ? "var(--accent2)" : "var(--danger)";
  return (
    <div className="panel col-accent4">
      <div className="panel-header">
        <div className="panel-num">05</div>
        <div className="panel-title">{t.confidenceTitle}</div>
        <div className="panel-tag">CONFIDENCE</div>
      </div>
      <div className="panel-body">
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, lineHeight: 1.6, fontFamily: "'IBM Plex Sans'" }}>{t.confIntro}</div>
        <table className="conf-table">
          <thead>
            <tr>
              <th>{t.confFieldLabel}</th><th>{t.confScore}</th><th>{t.confBar}</th><th>{t.confNote}</th>
            </tr>
          </thead>
          <tbody>
            {FIELDS.map(f => {
              const score = confidence[f] || 0;
              const note = confidence[f + "_note"] || "";
              return (
                <tr key={f}>
                  <td>{t.confIcons[f]} {t.confFields[f]}</td>
                  <td><span className="conf-score" style={{ color: confColor(score) }}>{score}</span><span style={{ fontSize: 10, color: "var(--text3)" }}>/10</span></td>
                  <td><div className="conf-bar-bg"><div className="conf-bar-fill" style={{ width: `${score * 10}%`, background: confColor(score) }} /></div></td>
                  <td style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: "var(--text3)", maxWidth: 260 }}>{note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PricePanel({ r, lang }) {
  const t = T[lang];
  const lo = parseFloat(r.week52_low) || 0, hi = parseFloat(r.week52_high) || 0;
  const price = parseFloat(r.current_price) || 0;
  const eLo = parseFloat(r.entry_zone_low) || 0, eHi = parseFloat(r.entry_zone_high) || 0;
  const tp = parseFloat(r.take_profit) || 0, sl = parseFloat(r.stop_loss) || 0;
  const cur = r.currency || "";
  const changeNum = parseFloat(r.price_change_pct);
  const changeOk = !isNaN(changeNum);
  const changeColor = changeOk ? (changeNum >= 0 ? "var(--accent)" : "var(--danger)") : "var(--text3)";
  const entryMid = (eLo + eHi) / 2;

  return (
    <div className="panel col-price">
      <div className="panel-header">
        <div className="panel-num">01</div>
        <div className="panel-title">{t.priceTitle}</div>
        <div className="panel-tag">MARKET DATA</div>
        <ConfBadge score={r.confidence?.price_data} />
      </div>
      <div className="panel-body">
        <div className="price-top-row">
          <div className="current-price-block">
            <div className="current-price-label">{t.currentPrice}</div>
            <div className="current-price-val">{fmt(r.current_price)}<span className="current-price-currency">{cur}</span></div>
            {changeOk && (
              <div className="price-change-row">
                <span style={{ color: changeColor, fontSize: 18 }}>{changeNum >= 0 ? "▲" : "▼"}</span>
                <span className="price-change-val" style={{ color: changeColor }}>{Math.abs(changeNum).toFixed(2)}%</span>
                <span style={{ fontSize: 10, color: "var(--text3)" }}>{t.vsYesterday}</span>
              </div>
            )}
            <div className="price-source-note">{t.aiEstimateNote}</div>
          </div>
          <div className="week52-block">
            <div className="week52-label">{t.range52w}</div>
            <div className="range-extremes">
              <div className="range-extreme range-low"><div className="range-extreme-val">{fmt(r.week52_low)} {cur}</div><div className="range-extreme-lbl">{t.min52w}</div></div>
              <div className="range-extreme range-high"><div className="range-extreme-val">{fmt(r.week52_high)} {cur}</div><div className="range-extreme-lbl">{t.max52w}</div></div>
            </div>
            <div className="range-bar-wrap">
              <div className="range-bar-gradient" />
              {hi > lo && <>
                <div style={{ position: "absolute", top: -3, height: 16, borderRadius: 3, left: `${clamp01(eLo, lo, hi)}%`, width: `${Math.max(clamp01(eHi, lo, hi) - clamp01(eLo, lo, hi), 2)}%`, background: "rgba(59,130,246,.3)", border: "1px solid var(--accent3)", zIndex: 4 }} />
                <div style={{ position: "absolute", left: `${clamp01(sl, lo, hi)}%`, top: "50%", transform: "translate(-50%,-50%)", zIndex: 5, width: 10, height: 10, background: "var(--danger)", transform: "translate(-50%,-50%) rotate(45deg)", boxShadow: "0 0 8px rgba(239,68,68,.6)" }} />
                <div style={{ position: "absolute", left: `${clamp01(price, lo, hi)}%`, top: "50%", transform: "translate(-50%,-50%)", zIndex: 5, width: 3, height: 20, background: "var(--text)", borderRadius: 2 }} />
                <div style={{ position: "absolute", left: `${clamp01(tp, lo, hi)}%`, top: "50%", transform: "translate(-50%,-50%) rotate(45deg)", zIndex: 5, width: 10, height: 10, background: "var(--accent)", boxShadow: "0 0 8px rgba(0,212,170,.6)" }} />
              </>}
            </div>
            <div className="range-legend">
              {[[t.legendCurrent,"line","var(--text)"],[t.legendEntry,"zone","var(--accent3)"],[t.legendTP,"diamond","var(--accent)"],[t.legendSL,"diamond","var(--danger)"]].map(([lbl,sh,c]) => (
                <div className="range-legend-item" key={lbl}>
                  {sh==="line" ? <div style={{width:3,height:14,background:c,borderRadius:2}} />
                    : sh==="zone" ? <div style={{width:12,height:8,background:"rgba(59,130,246,.3)",border:"1px solid var(--accent3)",borderRadius:2}} />
                    : <div style={{width:8,height:8,background:c,transform:"rotate(45deg)",borderRadius:1}} />}
                  <span className="range-legend-txt">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="levels-grid">
          <div className="level-card level-entry">
            <div className="level-badge">{t.entryBadge}</div><div className="level-icon">⬇</div>
            <div className="level-name">{t.entryZone}</div>
            <div className="level-val">{fmt(r.entry_zone_low)} – {fmt(r.entry_zone_high)}</div>
            <div className="level-subval">{cur}</div>
            <div className="level-pct">{pctDiff(entryMid, price) || "—"} {t.vsPrice}</div>
          </div>
          <div className="level-card level-tp">
            <div className="level-badge">{t.tpBadge}</div><div className="level-icon">🎯</div>
            <div className="level-name">{t.takeProfitLabel}</div>
            <div className="level-val">{fmt(r.take_profit)}</div>
            <div className="level-subval">{cur}</div>
            <div className="level-pct">{pctDiff(tp, price) ? pctDiff(tp, price) + " " + t.potential : "—"}</div>
          </div>
          <div className="level-card level-sl">
            <div className="level-badge">{t.slBadge}</div><div className="level-icon">🛑</div>
            <div className="level-name">{t.stopLossLabel}</div>
            <div className="level-val">{fmt(r.stop_loss)}</div>
            <div className="level-subval">{cur}</div>
            <div className="level-pct">{pctDiff(sl, price) ? pctDiff(sl, price) + " " + t.risk : "—"}</div>
          </div>
        </div>
        {r.entry_rationale && (
          <div className="level-rationale">
            <span style={{ color: "var(--text2)", fontWeight: 600, letterSpacing: 1 }}>{t.opRationale}</span>
            {r.entry_rationale}
          </div>
        )}
      </div>
    </div>
  );
}

function FundamentalPanel({ r, lang }) {
  const t = T[lang];
  return (
    <div className="panel col-accent2">
      <div className="panel-header">
        <div className="panel-num">03</div>
        <div className="panel-title">{t.fundamentalTitle}</div>
        <div className="panel-tag">FUND</div>
        <ConfBadge score={r.confidence?.fundamental} />
      </div>
      <div className="panel-body">
        <div className="analysis-text" style={{ marginBottom: 28 }}>{r.fundamental}</div>
        <div style={{ fontSize: 9, color: "var(--accent2)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>{t.historicMetrics}</div>
        <div className="metrics-grid">
          <MetricCard title={t.divYieldTitle} subtitle={t.divYieldSub} data={r.dividend_yield_5y} color="var(--accent)" unit="%" chartType="bar" confScore={r.confidence?.dividend_data} lang={lang} />
          <MetricCard title={t.divGrowthTitle} subtitle={t.divGrowthSub} data={r.dividend_growth_5y} color="var(--accent2)" unit="%" chartType="bar" confScore={r.confidence?.dividend_data} lang={lang} />
          <MetricCard title={t.payoutTitle} subtitle={t.payoutSub} data={r.payout_ratio_5y} color="var(--accent4)" unit="%" chartType="line" confScore={r.confidence?.dividend_data} lang={lang} />
          <MetricCard title={t.sharesTitle} subtitle={t.sharesSub} data={r.shares_outstanding_5y} color="var(--accent3)" unit="" chartType="line" confScore={r.confidence?.shares_data} lang={lang} />
        </div>
        <div style={{ fontSize: 9, color: "var(--accent2)", letterSpacing: 3, textTransform: "uppercase", margin: "24px 0 16px" }}>{t.financialStructure}</div>
        <div className="dual-chart-grid">
          <MetricCard title={t.debtTitle} subtitle={t.debtSub} data={r.net_debt_5y} color="var(--danger)" unit="" chartType="bar" confScore={r.confidence?.debt_cash_data} lang={lang} />
          <MetricCard title={t.cashTitle} subtitle={t.cashSub} data={r.net_cash_5y} color="var(--accent)" unit="" chartType="line" confScore={r.confidence?.debt_cash_data} lang={lang} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PROMPT BUILDER
══════════════════════════════════════════════════════ */
function buildPrompt(ticker, lang) {
  const langInstr = lang === "en" ? "Respond entirely in English." : lang === "pt" ? "Responda inteiramente em português de Portugal." : "Responde íntegramente en español.";
  const sentimentVals = lang === "en" ? '"Bullish / Neutral / Bearish"' : lang === "pt" ? '"Alcista / Neutro / Bajista"' : '"Alcista / Neutro / Bajista"';

  return `You are an expert financial analyst with real-time web search access.
${langInstr}

Use web_search to gather for ticker "${ticker}":
- Current price, daily change %, 52-week high/low
- Dividends last 5 years (yield, growth, payout)
- Shares outstanding last 5 years
- Net debt and net cash last 5 years
- Recent relevant financial news

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "company_name": "Full company name",
  "sector": "Sector",
  "country": "Country",
  "currency": "USD",
  "current_price": 0.00,
  "price_change_pct": 0.00,
  "week52_low": 0.00,
  "week52_high": 0.00,
  "entry_zone_low": 0.00,
  "entry_zone_high": 0.00,
  "take_profit": 0.00,
  "stop_loss": 0.00,
  "entry_rationale": "2-3 sentence explanation of trading level rationale",
  "dividend_yield_5y": [{"year":"2020","value":0.0},{"year":"2021","value":0.0},{"year":"2022","value":0.0},{"year":"2023","value":0.0},{"year":"2024","value":0.0}],
  "dividend_growth_5y": [{"year":"2020","value":0.0},{"year":"2021","value":0.0},{"year":"2022","value":0.0},{"year":"2023","value":0.0},{"year":"2024","value":0.0}],
  "payout_ratio_5y": [{"year":"2020","value":0.0},{"year":"2021","value":0.0},{"year":"2022","value":0.0},{"year":"2023","value":0.0},{"year":"2024","value":0.0}],
  "shares_outstanding_5y": [{"year":"2020","value":0},{"year":"2021","value":0},{"year":"2022","value":0},{"year":"2023","value":0},{"year":"2024","value":0}],
  "net_debt_5y": [{"year":"2020","value":0},{"year":"2021","value":0},{"year":"2022","value":0},{"year":"2023","value":0},{"year":"2024","value":0}],
  "net_cash_5y": [{"year":"2020","value":0},{"year":"2021","value":0},{"year":"2022","value":0},{"year":"2023","value":0},{"year":"2024","value":0}],
  "macro": "Detailed macroeconomic analysis (min 250 words) in the requested language",
  "fundamental": "Detailed fundamental analysis (min 250 words): business model, revenue, margins, P/E, EV/EBITDA, ROE, ROIC, moat, dividend, valuation and price target",
  "technical": "Detailed technical analysis (min 250 words): trends, MA 20/50/200, RSI, MACD, support/resistance, short/medium/long-term outlook",
  "macro_sentiment": ${sentimentVals},
  "fundamental_sentiment": ${sentimentVals},
  "technical_sentiment": ${sentimentVals},
  "overall": ${sentimentVals},
  "confidence": {
    "price_data": 7, "price_data_note": "...",
    "macro": 8, "macro_note": "...",
    "fundamental": 7, "fundamental_note": "...",
    "technical": 6, "technical_note": "...",
    "dividend_data": 7, "dividend_data_note": "...",
    "debt_cash_data": 7, "debt_cash_data_note": "...",
    "shares_data": 8, "shares_data_note": "...",
    "trading_levels": 5, "trading_levels_note": "..."
  }
}

Use real numeric values from web search. If no dividend, use 0 for all dividend fields.`;
}

/* ══════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════ */
const LANGS = [
  { code: "es", flag: "🇪🇸", label: "ES" },
  { code: "pt", flag: "🇵🇹", label: "PT" },
  { code: "en", flag: "🇬🇧", label: "EN" },
];

const SENT_KEYS = ["macro_sentiment","fundamental_sentiment","technical_sentiment","overall"];

export default function App() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("");
  const [result, setResult] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const [lang, setLang] = useState("es");

  const t = T[lang];

  async function analyze() {
    if (!ticker.trim()) return;
    const rawTicker = ticker.trim().toUpperCase();

    // Crypto check
    if (CRYPTO_TICKERS.has(rawTicker)) {
      setErrorState({ type: "crypto", msg: t.errCrypto });
      setResult(null);
      return;
    }

    setLoading(true);
    setErrorState(null);
    setResult(null);

    const phases = t.phases;
    let pi = 0;
    setPhase(phases[pi]);
    const timer = setInterval(() => { pi = Math.min(pi + 1, phases.length - 1); setPhase(phases[pi]); }, 4500);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 7000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: buildPrompt(rawTicker, lang) }],
        }),
      });

      const data = await res.json();

      // Check for API-level error (rate limit, etc.)
      if (data.error) {
        const apiErr = parseApiError(data, rawTicker, lang);
        if (apiErr) { setErrorState(apiErr); return; }
        // Try to parse known error type from message
        const msg = data.error.message || JSON.stringify(data.error);
        if (msg.includes("exceeded_limit") || msg.includes("five_hour")) {
          setErrorState({ type: "ratelimit", msg: t.errRateLimit(null) });
          return;
        }
        throw new Error(msg);
      }

      // Extract JSON from response
      const fullText = data.content.map(b => b.type === "text" ? b.text : "").join("\n");
      const jsonMatch = fullText.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Likely invalid ticker — model couldn't find it
        setErrorState({ type: "invalid", msg: t.errInvalid(rawTicker) });
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (_) {
        setErrorState({ type: "invalid", msg: t.errInvalid(rawTicker) });
        return;
      }

      // Sanity check: if company_name is empty/unknown, treat as invalid
      if (!parsed.company_name || parsed.company_name.toLowerCase().includes("unknown") || parsed.company_name.toLowerCase().includes("not found")) {
        setErrorState({ type: "invalid", msg: t.errInvalid(rawTicker) });
        return;
      }

      setResult({
        ...parsed, ticker: rawTicker,
        date: new Date().toLocaleDateString(lang === "en" ? "en-GB" : lang === "pt" ? "pt-PT" : "es-ES", { day: "2-digit", month: "long", year: "numeric" }),
      });
    } catch (e) {
      const msg = e.message || "";
      setErrorState(classifyError(msg, rawTicker, lang));
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }

  const sentLabels = [t.macro, t.fundamental, t.technical, t.general];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="grid-bg" />
        <div className="content">

          {/* Header */}
          <div className="header">
            <div className="logo-mark">FX</div>
            <div>
              <div className="logo-text">FINAXIS</div>
              <div className="logo-sub">{t.subtitle}</div>
            </div>
            <div className="header-right">
              {/* Language switcher */}
              <div className="lang-switcher">
                {LANGS.map((l, i) => (
                  <div key={l.code} style={{ display: "flex", alignItems: "center" }}>
                    {i > 0 && <div className="lang-divider" />}
                    <button
                      className={`lang-btn ${lang === l.code ? "active" : ""}`}
                      onClick={() => setLang(l.code)}
                      title={l.label}
                    >
                      {l.flag}
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="status-dot" />
                <div className="status-text">{t.liveAnalysis}</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="search-section">
            <div className="search-label">{t.searchLabel}</div>
            <div className="search-row">
              <input
                className="ticker-input" placeholder="AAPL"
                value={ticker}
                onChange={e => setTicker(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && !loading && analyze()}
                maxLength={10}
              />
              <button className="analyze-btn" onClick={analyze} disabled={loading || !ticker.trim()}>
                {loading ? t.analyzing : t.analyzeBtn}
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="loading-section">
              <div className="loading-ticker">{ticker}</div>
              <div className="loading-bars">{[1,2,3,4,5,6,7].map(i => <div key={i} className="loading-bar" />)}</div>
              <div className="loading-text">{t.processingData}</div>
              <div className="loading-phase">{phase}</div>
            </div>
          )}

          {/* Error */}
          {errorState && !loading && <ErrorBox error={errorState} />}

          {/* Results */}
          {result && !loading && (
            <div>
              <div className="results-header">
                <div>
                  <div className="company-ticker">{result.ticker}</div>
                  <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 16, color: "var(--text2)", marginTop: 4 }}>{result.company_name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", letterSpacing: 2, marginTop: 4 }}>{result.sector} · {result.country}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                  <button className="download-btn" onClick={() => window.print()}>{t.downloadPdf}</button>
                  <div className="analysis-meta">{t.reportGenerated}<br /><span className="analysis-date">{result.date}</span></div>
                </div>
              </div>

              <div className="sentiment-row">
                {SENT_KEYS.map((k, i) => (
                  <div className="sentiment-card" key={k}>
                    <div className="sentiment-label">{sentLabels[i]}</div>
                    <div className={`sentiment-value ${sc(result[k])}`}>{result[k] || "—"}</div>
                  </div>
                ))}
              </div>

              <div className="divider" />
              <PricePanel r={result} lang={lang} />

              <div className="panel col-accent">
                <div className="panel-header">
                  <div className="panel-num">02</div>
                  <div className="panel-title">{t.macroTitle}</div>
                  <div className="panel-tag">MACRO</div>
                  <ConfBadge score={result.confidence?.macro} />
                </div>
                <div className="panel-body"><div className="analysis-text">{result.macro}</div></div>
              </div>

              <FundamentalPanel r={result} lang={lang} />

              <div className="panel col-accent3">
                <div className="panel-header">
                  <div className="panel-num">04</div>
                  <div className="panel-title">{t.technicalTitle}</div>
                  <div className="panel-tag">TECH</div>
                  <ConfBadge score={result.confidence?.technical} />
                </div>
                <div className="panel-body"><div className="analysis-text">{result.technical}</div></div>
              </div>

              <ConfidencePanel confidence={result.confidence} lang={lang} />

              <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 1, marginTop: 24, textAlign: "center", lineHeight: 1.8 }}>
                FINAXIS · {t.footerNote} · {result.date}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
