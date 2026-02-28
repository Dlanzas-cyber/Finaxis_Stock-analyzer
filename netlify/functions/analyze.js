// ════════════════════════════════════════════════════════════
// AXIOS-IQ · analyze.js
// Netlify Function — Gemini AI analysis
// Uses native https module (no fetch) — works on any Node version
// API key lives in Netlify env vars — user never sees it
// ════════════════════════════════════════════════════════════

const https = require('https');

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Helper: https POST → Promise<{status, body}> ─────────────
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
    req.setTimeout(25000, () => { req.destroy(); reject(new Error('Gemini request timed out')); });
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

  const { ticker, metrics, lang } = body;
  if (!ticker || !metrics) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'ticker and metrics required' }) };
  }

  const prompt = buildPrompt(ticker, metrics, lang || 'es');

  const geminiBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.25, maxOutputTokens: 2048, topP: 0.9 },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ]
  });

  let geminiRaw;
  try {
    geminiRaw = await httpsPost(
      'generativelanguage.googleapis.com',
      `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(geminiBody) },
      geminiBody
    );
  } catch (e) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Gemini unreachable: ' + e.message }) };
  }

  if (geminiRaw.status !== 200) {
    let detail = '';
    try { detail = JSON.parse(geminiRaw.body)?.error?.message || geminiRaw.body.slice(0, 300); } catch {}
    return { statusCode: geminiRaw.status, headers: CORS, body: JSON.stringify({ error: 'Gemini error ' + geminiRaw.status, detail }) };
  }

  let geminiData;
  try { geminiData = JSON.parse(geminiRaw.body); }
  catch (e) { return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Gemini response parse error: ' + e.message }) }; }

  const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'AI did not return valid JSON', raw: rawText.slice(0, 400) }) };
  }

  let analysis;
  try { analysis = JSON.parse(jsonMatch[0]); }
  catch (e) { return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'JSON parse failed: ' + e.message, raw: rawText.slice(0, 400) }) }; }

  return {
    statusCode: 200, headers: CORS,
    body: JSON.stringify({ ...analysis, model_used: 'gemini-2.0-flash', analysis_timestamp: new Date().toISOString() })
  };
};

// ════════════════════════════════════════════════════════════
// PROMPT BUILDER
// ════════════════════════════════════════════════════════════
function buildPrompt(ticker, m, lang) {
  const langInstr = { es:'Redacta TODA la respuesta en español.', pt:'Redige TODA a resposta em português de Portugal.', en:'Write the ENTIRE response in English.' }[lang] || 'Redacta TODA la respuesta en español.';
  const BULL = { es:'Alcista', pt:'Alta',  en:'Bullish' }[lang] || 'Alcista';
  const BEAR = { es:'Bajista', pt:'Baixa', en:'Bearish' }[lang] || 'Bajista';
  const NEUT = { es:'Neutro',  pt:'Neutro', en:'Neutral' }[lang] || 'Neutro';
  const pct = v => v != null ? (v*100).toFixed(1)+'%' : 'N/A';
  const num = (v,d=2) => v != null ? Number(v).toFixed(d) : 'N/A';
  const curr = m.currency || 'USD';
  const pos52w = (m.current_price && m.week52_low && m.week52_high && m.week52_high > m.week52_low) ? Math.round(((m.current_price-m.week52_low)/(m.week52_high-m.week52_low))*100)+'% of range' : 'N/A';

  return `You are an expert financial analyst specialising in long-term value investing. ${langInstr}

COMPANY: ${m.company_name} (${ticker}) · ${m.exchange} · ${curr}
DATA: Yahoo Finance · ${m.timestamp}

PRICE: ${num(m.current_price)} ${curr} (${m.price_change_pct!=null?(m.price_change_pct*100).toFixed(2)+'%':'N/A'}) · Cap: ${m.market_cap_fmt||'N/A'} · 52w: ${num(m.week52_low)}–${num(m.week52_high)} (${pos52w})
VALUATION: P/E ${num(m.pe_trailing,1)}x trailing / ${num(m.pe_forward,1)}x fwd · EV/EBITDA ${num(m.ev_ebitda,1)}x · P/B ${num(m.price_to_book,2)}x · EPS ${num(m.eps_trailing)} / ${num(m.eps_forward)} fwd
ANALYSTS: target ${m.analyst_target_mean?num(m.analyst_target_mean)+' '+curr+' mean ('+m.analyst_count+')':'N/A'} · range ${(m.analyst_target_low&&m.analyst_target_high)?num(m.analyst_target_low)+'–'+num(m.analyst_target_high):'N/A'}
DIVIDEND: yield ${pct(m.dividend_yield)} · annual ${m.dividend_rate!=null?num(m.dividend_rate)+' '+curr:'N/A'} · payout ${pct(m.payout_ratio)}
MARGINS: gross ${pct(m.gross_margin)} · operating ${pct(m.operating_margin)} · net ${pct(m.profit_margin)} · ROE ${pct(m.roe)} · ROA ${pct(m.roa)}
GROWTH: revenue ${pct(m.revenue_growth)} YoY · earnings ${pct(m.earnings_growth)} YoY
BALANCE: debt ${m.total_debt_fmt||'N/A'} · cash ${m.total_cash_fmt||'N/A'} · D/E ${m.debt_to_equity!=null?(m.debt_to_equity/100).toFixed(2)+'x':'N/A'} · FCF ${m.free_cashflow_fmt||'N/A'}
RISK: beta ${num(m.beta,2)}

Analyse ${ticker} for a long-term buy-and-hold investor. Be specific to this company, not generic.

Section 1 — FUNDAMENTAL (min 200 words): P/E vs growth/margins/sector peers, margin quality and trend, balance sheet health, FCF vs dividends/buybacks, valuation vs analyst targets.
Section 2 — BUSINESS QUALITY & MOAT (min 180 words): type of moat (brand/switching costs/network effects/cost advantage/intangibles), moat durability vs disruption, management quality signals, main structural risks.
Section 3 — FLAGS (4-6): each must cite a specific metric. Types: ok/warn/info.

RULES: use ONLY numbers above (N/A if not available). Sentiments: EXACTLY ONE of ${BULL}|${NEUT}|${BEAR}.

Respond ONLY with this JSON (no fences, no preamble):
{"fundamental":"...","quality":"...","flags":[{"type":"ok|warn|info","text":"..."}],"fundamental_sentiment":"${BULL}|${NEUT}|${BEAR}","quality_sentiment":"${BULL}|${NEUT}|${BEAR}","overall":"${BULL}|${NEUT}|${BEAR}","confidence_note":"..."}`;
}
