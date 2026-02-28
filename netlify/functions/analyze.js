// ════════════════════════════════════════════════════════════
// AXIOS-IQ · analyze.js  v2
// Netlify Function — Gemini con Google Search integrado
// Un solo endpoint: busca datos reales Y produce análisis
// Sin Yahoo Finance, sin fuentes externas, sin bloqueos
// ════════════════════════════════════════════════════════════

const https = require('https');

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function httpsPost(hostname, path, headers, bodyStr) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname, path, method: 'POST', headers },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(bodyStr);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) {
    return {
      statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: 'GEMINI_KEY not configured in Netlify environment variables' })
    };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON body' }) }; }

  const { ticker, lang } = body;
  if (!ticker) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'ticker required' }) };
  }

  const prompt = buildPrompt(ticker, lang || 'es');

  // ── Gemini with Google Search grounding ───────────────────
  const geminiBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 3000,
      topP: 0.9,
    }
  });

  let raw;
  try {
    raw = await httpsPost(
      'generativelanguage.googleapis.com',
      `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(geminiBody),
      },
      geminiBody
    );
  } catch (e) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Gemini unreachable: ' + e.message }) };
  }

  if (raw.status !== 200) {
    let detail = '';
    try { detail = JSON.parse(raw.body)?.error?.message || raw.body.slice(0, 300); } catch {}
    return {
      statusCode: raw.status, headers: CORS,
      body: JSON.stringify({ error: `Gemini error ${raw.status}`, detail })
    };
  }

  let geminiData;
  try { geminiData = JSON.parse(raw.body); }
  catch (e) { return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Parse error: ' + e.message }) }; }

  // Extract text (may span multiple parts if search was used)
  const parts = geminiData.candidates?.[0]?.content?.parts || [];
  const rawText = parts
    .filter(p => p.text)
    .map(p => p.text)
    .join('');

  if (!rawText) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Empty response from Gemini', raw: JSON.stringify(geminiData).slice(0, 400) }) };
  }

  // Strip markdown fences
  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'No JSON in response', raw: rawText.slice(0, 500) }) };
  }

  let result;
  try { result = JSON.parse(jsonMatch[0]); }
  catch (e) { return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'JSON parse failed: ' + e.message, raw: rawText.slice(0, 500) }) }; }

  return {
    statusCode: 200, headers: CORS,
    body: JSON.stringify({ ...result, _source: 'gemini-search', analysis_timestamp: new Date().toISOString() })
  };
};

// ════════════════════════════════════════════════════════════
// PROMPT — asks Gemini to search AND structure data AND analyze
// ════════════════════════════════════════════════════════════
function buildPrompt(ticker, lang) {
  const langInstr = {
    es: 'Redacta TODO en español.',
    pt: 'Redige TUDO em português de Portugal.',
    en: 'Write EVERYTHING in English.',
  }[lang] || 'Redacta TODO en español.';

  const BULL = { es:'Alcista', pt:'Alta',  en:'Bullish' }[lang] || 'Alcista';
  const BEAR = { es:'Bajista', pt:'Baixa', en:'Bearish' }[lang] || 'Bajista';
  const NEUT = { es:'Neutro',  pt:'Neutro', en:'Neutral' }[lang] || 'Neutro';

  return `You are an expert financial analyst. ${langInstr}

## TASK: Research and analyse the stock ticker: ${ticker}

## MANDATORY SEARCHES — use Google Search to find each of these:
1. "${ticker} stock price today current"
2. "${ticker} P/E ratio EPS market cap"
3. "${ticker} revenue operating margin ROE FCF"
4. "${ticker} dividend yield payout ratio"
5. "${ticker} total debt cash balance sheet"
6. "${ticker} analyst price target consensus"
7. "${ticker} competitive moat business model"

DO NOT skip searches. DO NOT invent numbers. If a value cannot be found, use null.

## HONESTY RULES:
- current_price: only set price_is_realtime:true if you found today's actual price
- All numeric fields: null if not found via search
- confidence scores: 8-9 = confirmed today, 6-7 = recent source, 4-5 = estimated, 1-3 = guessed
- fair_value fields: only fill if you found analyst targets or DCF estimates; otherwise null

## OUTPUT — respond ONLY with this exact JSON (no markdown fences, no extra text):
{
  "company_name": "Full company name",
  "sector": "Sector",
  "country": "Country",
  "exchange": "Exchange",
  "currency": "USD",
  "current_price": 123.45,
  "price_change_pct": 1.23,
  "price_is_realtime": true,
  "price_source_note": "Source and whether real-time or delayed",
  "week52_low": 100.00,
  "week52_high": 200.00,
  "market_cap": "2.8T USD",
  "market_cap_raw": 2800000000000,

  "pe_trailing": 31.5,
  "pe_forward": 28.2,
  "ev_ebitda": 22.1,
  "price_to_book": 8.5,
  "eps_trailing": 6.43,
  "eps_forward": 7.20,

  "dividend_yield_current": 0.52,
  "dividend_yield_confirmed": true,
  "payout_ratio_current": 15.2,
  "payout_ratio_confirmed": true,

  "gross_margin": 46.2,
  "operating_margin": 31.5,
  "profit_margin": 26.4,
  "roe": 147.2,
  "revenue_growth": 4.1,
  "earnings_growth": 10.3,

  "total_debt_fmt": "108B USD",
  "total_cash_fmt": "65B USD",
  "debt_to_equity": 1.87,
  "free_cashflow_fmt": "108B USD",
  "beta": 1.24,

  "analyst_target_mean": 245.00,
  "analyst_target_low": 180.00,
  "analyst_target_high": 300.00,
  "analyst_count": 38,

  "fair_value_low": null,
  "fair_value_high": null,
  "fair_value_mid": null,
  "margin_of_safety_price": null,
  "fair_value_rationale": "Brief explanation of valuation methodology used",

  "flags": [
    {"type": "ok|warn|info", "text": "Concise flag with specific data cited"}
  ],
  "data_sources": ["source1.com", "source2.com"],

  "fundamental": "Fundamental analysis min 200 words — interpret all metrics in context of this specific business",
  "quality": "Business quality and moat min 180 words — competitive advantages, management, structural risks",
  "macro": null,

  "fundamental_sentiment": "${BULL}|${NEUT}|${BEAR}",
  "quality_sentiment": "${BULL}|${NEUT}|${BEAR}",
  "macro_sentiment": "${NEUT}",
  "overall": "${BULL}|${NEUT}|${BEAR}",

  "confidence": {
    "price_data": 8, "price_data_note": "Was price found for today?",
    "fundamental": 7, "fundamental_note": "Which ratios confirmed via search?",
    "quality": 6, "quality_note": "Is moat analysis confirmed or from training?",
    "dividend_data": 7, "dividend_data_note": "Was yield/payout confirmed?",
    "flags_data": 7, "flags_data_note": "Are flags based on confirmed data?",
    "fair_value": 5, "fair_value_note": "What methodology? Analyst targets or estimated?",
    "macro": 0, "macro_note": "Macro not included"
  }
}

Use null for any numeric field you could not confirm. Choose EXACTLY ONE sentiment per field.`;
}
