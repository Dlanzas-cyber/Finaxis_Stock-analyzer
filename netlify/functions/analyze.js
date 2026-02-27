// ════════════════════════════════════════════════════════════
// AXIOS-IQ · analyze.js
// Netlify Function — Gemini AI analysis
// API key lives in Netlify env vars — user never sees it
// ════════════════════════════════════════════════════════════

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  // ── Read env var (set once in Netlify dashboard) ─────────
  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({
        error: 'GEMINI_KEY environment variable not configured in Netlify',
        hint: 'Go to Netlify → Site Settings → Environment Variables → Add GEMINI_KEY'
      })
    };
  }

  // ── Parse request body ────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { ticker, metrics, lang } = body;
  if (!ticker || !metrics) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'ticker and metrics are required' }) };
  }

  // ── Build the focused prompt ──────────────────────────────
  const prompt = buildPrompt(ticker, metrics, lang || 'es');

  // ── Call Gemini ───────────────────────────────────────────
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

  let geminiRes;
  try {
    geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.25,        // Low temp for factual financial analysis
          maxOutputTokens: 2048,
          topP: 0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ]
      })
    });
  } catch (e) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Gemini request failed: ' + e.message }) };
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => '');
    return {
      statusCode: geminiRes.status,
      headers: CORS,
      body: JSON.stringify({ error: `Gemini API error ${geminiRes.status}`, detail: errText.slice(0, 400) })
    };
  }

  const geminiData = await geminiRes.json();

  // ── Extract text from Gemini response ────────────────────
  const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Strip markdown fences if present
  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Find JSON object in response
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'AI did not return valid JSON', raw: rawText.slice(0, 600) })
    };
  }

  let analysis;
  try {
    analysis = JSON.parse(jsonMatch[0]);
  } catch (e) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'JSON parse failed: ' + e.message, raw: rawText.slice(0, 600) })
    };
  }

  // ── Return combined response ──────────────────────────────
  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({
      ...analysis,
      model_used: geminiData.modelVersion || 'gemini-2.0-flash',
      analysis_timestamp: new Date().toISOString(),
    })
  };
};

// ════════════════════════════════════════════════════════════
// PROMPT BUILDER
// Data-fed: AI interprets real numbers, doesn't invent them
// Removed: macro analysis, price search, hallucination risk
// ════════════════════════════════════════════════════════════
function buildPrompt(ticker, metrics, lang) {
  const langInstr = {
    es: 'Redacta TODA la respuesta en español.',
    pt: 'Redige TODA a resposta em português de Portugal.',
    en: 'Write the ENTIRE response in English.',
  }[lang] || 'Redacta TODA la respuesta en español.';

  const BULL = { es: 'Alcista', pt: 'Alta',  en: 'Bullish'  }[lang] || 'Alcista';
  const BEAR = { es: 'Bajista', pt: 'Baixa', en: 'Bearish'  }[lang] || 'Bajista';
  const NEUT = { es: 'Neutro',  pt: 'Neutro', en: 'Neutral' }[lang] || 'Neutro';

  // Format metrics for prompt — null values marked clearly
  const m = metrics;
  const pct  = (v) => v != null ? (v * 100).toFixed(1) + '%' : 'N/A';
  const num  = (v, d = 2) => v != null ? v.toFixed(d) : 'N/A';
  const curr = m.currency || 'USD';

  const metricsText = `
COMPANY: ${m.company_name} (${m.ticker}) · ${m.exchange} · ${curr}
DATA SOURCE: Yahoo Finance (real-time) · ${m.timestamp}

PRICE & MARKET
  Current price      : ${num(m.current_price)} ${curr}
  Change today       : ${m.price_change_pct != null ? (m.price_change_pct * 100).toFixed(2) + '%' : 'N/A'}
  Market cap         : ${m.market_cap_fmt || 'N/A'}
  52-week high       : ${num(m.week52_high)} ${curr}
  52-week low        : ${num(m.week52_low)} ${curr}
  52w position       : ${(m.current_price && m.week52_low && m.week52_high) ? Math.round(((m.current_price - m.week52_low) / (m.week52_high - m.week52_low)) * 100) + '% of range' : 'N/A'}

VALUATION
  P/E trailing       : ${num(m.pe_trailing, 1)}x
  P/E forward        : ${num(m.pe_forward, 1)}x
  EV/EBITDA          : ${num(m.ev_ebitda, 1)}x
  Price/Book         : ${num(m.price_to_book, 2)}x
  EPS trailing       : ${num(m.eps_trailing)} ${curr}
  EPS forward est.   : ${num(m.eps_forward)} ${curr}
  Analyst target     : ${m.analyst_target_mean ? num(m.analyst_target_mean) + ' ' + curr + ' (mean, ' + (m.analyst_count || '?') + ' analysts)' : 'N/A'}
  Analyst range      : ${m.analyst_target_low && m.analyst_target_high ? num(m.analyst_target_low) + '–' + num(m.analyst_target_high) + ' ' + curr : 'N/A'}

DIVIDEND
  Dividend yield     : ${pct(m.dividend_yield)}
  Annual dividend    : ${m.dividend_rate != null ? num(m.dividend_rate) + ' ' + curr : 'N/A'}
  Payout ratio       : ${pct(m.payout_ratio)}

PROFITABILITY
  Gross margin       : ${pct(m.gross_margin)}
  Operating margin   : ${pct(m.operating_margin)}
  Net profit margin  : ${pct(m.profit_margin)}
  ROE                : ${pct(m.roe)}
  ROA                : ${pct(m.roa)}
  Revenue growth YoY : ${pct(m.revenue_growth)}
  Earnings growth YoY: ${pct(m.earnings_growth)}

BALANCE SHEET
  Total debt         : ${m.total_debt_fmt || 'N/A'}
  Cash & equivalents : ${m.total_cash_fmt || 'N/A'}
  Debt/Equity        : ${m.debt_to_equity != null ? (m.debt_to_equity / 100).toFixed(2) + 'x' : 'N/A'}
  Free Cash Flow     : ${m.free_cashflow_fmt || 'N/A'}

RISK
  Beta               : ${num(m.beta, 2)}
`;

  return `You are an expert financial analyst specialising in long-term value investing. ${langInstr}

## REAL VERIFIED DATA for ${ticker} (Yahoo Finance — verified, do NOT modify or invent):
${metricsText}

## YOUR TASK
Analyse ${ticker} as a long-term buy-and-hold investment for a private investor focused on quality, moat, and sustainable returns. This analysis replaces what Bloomberg or a professional analyst would write — be specific, not generic.

### Section 1 — FUNDAMENTAL ANALYSIS (min 200 words)
Interpret the key metrics above in the context of this specific business:
- Is the P/E justified given growth and margins? Compare to typical sector peers.
- Are margins healthy? Trending up or down (if you have context from your training, note it but mark it as "from training data, not confirmed above")?
- How strong is the balance sheet? Is debt/equity acceptable for this industry?
- Is FCF generation robust? Can the company fund dividends and buybacks organically?
- Is the valuation vs analyst targets reasonable?

### Section 2 — BUSINESS QUALITY & MOAT (min 180 words)
- What are this company's durable competitive advantages (moat)?
- What type of moat: brand, switching costs, network effects, cost advantage, intangibles?
- How vulnerable is the moat to disruption in the next 5-10 years?
- What signals does the financial data give about management quality (ROIC, capital allocation)?
- What are the main structural risks for a long-term holder?

### Section 3 — FLAGS (4-6 items)
Data-backed observations. Each flag must cite a specific metric from the data above.
Flag types: "ok" (positive signal), "warn" (risk or concern), "info" (neutral context).
Examples: "Gross margin of X% well above sector average — pricing power confirmed", "Payout ratio of X% leaves comfortable buffer for dividend growth"

## RULES
- Use ONLY metrics from the data above for numbers. If a metric is N/A, say so rather than estimating.
- Be specific about THIS company, not generic platitudes.
- Do not invent figures not present in the data.
- Sentiments: choose EXACTLY ONE: ${BULL} | ${NEUT} | ${BEAR}

## RESPOND with ONLY this JSON (no markdown fences, no preamble, no trailing text):
{
  "fundamental": "...",
  "quality": "...",
  "flags": [
    {"type": "ok|warn|info", "text": "..."}
  ],
  "fundamental_sentiment": "${BULL}|${NEUT}|${BEAR}",
  "quality_sentiment": "${BULL}|${NEUT}|${BEAR}",
  "overall": "${BULL}|${NEUT}|${BEAR}",
  "confidence_note": "Brief note on data completeness: which key metrics were N/A?"
}`;
}
