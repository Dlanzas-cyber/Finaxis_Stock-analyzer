// ════════════════════════════════════════════════════════════
// AXIOS-IQ · quote.js
// Netlify Function — Yahoo Finance proxy (robust version)
// Uses query2 + chart endpoint + quoteSummary with crumb
// ════════════════════════════════════════════════════════════

const https = require('https');

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Helper: https GET → Promise<{status, headers, body}> ──────
function httpsGet(url, reqHeaders = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: reqHeaders }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Request timed out')); });
  });
}

// ── Browser-like headers ───────────────────────────────────────
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'identity',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const ticker = ((event.queryStringParameters || {}).ticker || '').toUpperCase().trim();
  if (!ticker) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'ticker parameter required' }) };
  }

  // ── Step 1: Get crumb + cookies from Yahoo Finance ────────────
  let cookies = '';
  let crumb   = '';
  try {
    const cookieRes = await httpsGet(
      `https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}`,
      BROWSER_HEADERS
    );
    // Extract cookies
    const setCookie = cookieRes.headers['set-cookie'];
    if (setCookie) {
      cookies = (Array.isArray(setCookie) ? setCookie : [setCookie])
        .map(c => c.split(';')[0])
        .join('; ');
    }

    // Get crumb
    if (cookies) {
      const crumbRes = await httpsGet(
        'https://query2.finance.yahoo.com/v1/finance/crumb',
        { ...BROWSER_HEADERS, 'Cookie': cookies }
      );
      if (crumbRes.status === 200) {
        crumb = crumbRes.body.trim().replace(/"/g, '');
      }
    }
  } catch (e) {
    // Non-fatal — proceed without crumb, some endpoints don't need it
  }

  const authHeaders = {
    ...BROWSER_HEADERS,
    ...(cookies ? { 'Cookie': cookies } : {}),
  };

  // ── Step 2: Fetch quoteSummary (fundamentals) ─────────────────
  const modules = 'price,defaultKeyStatistics,financialData,summaryDetail';
  const crumbParam = crumb ? `&crumb=${encodeURIComponent(crumb)}` : '';

  // Try query2 first, then query1 as fallback
  const urls = [
    `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${modules}${crumbParam}`,
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${modules}`,
  ];

  let summaryData = null;
  let lastError   = '';

  for (const url of urls) {
    try {
      const res = await httpsGet(url, authHeaders);
      if (res.status === 200) {
        const parsed = JSON.parse(res.body);
        if (parsed.quoteSummary?.result?.[0]) {
          summaryData = parsed.quoteSummary.result[0];
          break;
        }
        if (parsed.quoteSummary?.error) {
          lastError = parsed.quoteSummary.error.description || 'Unknown Yahoo error';
        }
      } else {
        lastError = `HTTP ${res.status}`;
      }
    } catch (e) {
      lastError = e.message;
    }
  }

  // ── Step 3: Fallback to /v8/chart/ for price at minimum ──────
  if (!summaryData) {
    try {
      const chartUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
      const chartRes = await httpsGet(chartUrl, authHeaders);
      if (chartRes.status === 200) {
        const chartParsed = JSON.parse(chartRes.body);
        const meta = chartParsed.chart?.result?.[0]?.meta;
        if (meta) {
          // Return minimal data from chart endpoint
          const metrics = {
            ticker,
            timestamp: new Date().toISOString(),
            data_source: 'Yahoo Finance (chart endpoint — limited data)',
            company_name: meta.shortName || meta.longName || ticker,
            exchange: meta.exchangeName || '',
            currency: meta.currency || 'USD',
            current_price: meta.regularMarketPrice || null,
            price_change_pct: (meta.regularMarketPrice && meta.previousClose && meta.previousClose > 0)
              ? (meta.regularMarketPrice - meta.previousClose) / meta.previousClose
              : null,
            prev_close: meta.previousClose || null,
            market_cap: null, market_cap_fmt: null,
            week52_high: meta.fiftyTwoWeekHigh || null,
            week52_low: meta.fiftyTwoWeekLow || null,
            pe_trailing: null, pe_forward: null, ev_ebitda: null,
            price_to_book: null, eps_trailing: null, eps_forward: null,
            dividend_yield: null, dividend_rate: null, payout_ratio: null,
            gross_margin: null, operating_margin: null, profit_margin: null,
            roe: null, roa: null, revenue_growth: null, earnings_growth: null,
            total_debt: null, total_cash: null, net_debt: null,
            debt_to_equity: null, free_cashflow: null, operating_cashflow: null,
            total_debt_fmt: null, total_cash_fmt: null, free_cashflow_fmt: null,
            beta: null,
            analyst_recommendation: null, analyst_target_mean: null,
            analyst_target_low: null, analyst_target_high: null, analyst_count: null,
            _partial: true,
          };
          return { statusCode: 200, headers: CORS, body: JSON.stringify(metrics) };
        }
      }
    } catch (e) { /* ignore */ }

    return {
      statusCode: 404, headers: CORS,
      body: JSON.stringify({ error: `No data found for '${ticker}' — ${lastError}. Check the ticker symbol (e.g. AAPL, MSFT, SAN.MC)` })
    };
  }

  // ── Step 4: Extract metrics from quoteSummary ─────────────────
  const price   = summaryData.price || {};
  const stats   = summaryData.defaultKeyStatistics || {};
  const fin     = summaryData.financialData || {};
  const summary = summaryData.summaryDetail || {};

  const raw = (obj) => (obj && obj.raw != null) ? obj.raw : null;
  const fmt = (obj) => (obj && obj.fmt)         ? obj.fmt : null;

  const totalDebt = raw(fin.totalDebt);
  const totalCash = raw(fin.totalCash);

  const metrics = {
    ticker,
    timestamp: new Date().toISOString(),
    data_source: 'Yahoo Finance',
    company_name: price.shortName || price.longName || ticker,
    exchange: price.exchangeName || '',
    currency: price.currency || 'USD',

    current_price: raw(price.regularMarketPrice),
    price_change_pct: raw(price.regularMarketChangePercent),
    prev_close: raw(price.regularMarketPreviousClose),
    market_cap: raw(price.marketCap),
    market_cap_fmt: fmt(price.marketCap),

    week52_high: raw(stats.fiftyTwoWeekHigh) ?? raw(summary.fiftyTwoWeekHigh),
    week52_low:  raw(stats.fiftyTwoWeekLow)  ?? raw(summary.fiftyTwoWeekLow),

    pe_trailing:   raw(summary.trailingPE),
    pe_forward:    raw(stats.forwardPE) ?? raw(summary.forwardPE),
    ev_ebitda:     raw(stats.enterpriseToEbitda),
    price_to_book: raw(stats.priceToBook),
    eps_trailing:  raw(stats.trailingEps),
    eps_forward:   raw(stats.forwardEps),

    dividend_yield:   raw(summary.dividendYield) ?? raw(summary.trailingAnnualDividendYield),
    dividend_rate:    raw(summary.trailingAnnualDividendRate),
    payout_ratio:     raw(summary.payoutRatio),
    ex_dividend_date: summary.exDividendDate?.fmt || null,

    gross_margin:     raw(fin.grossMargins),
    operating_margin: raw(fin.operatingMargins),
    profit_margin:    raw(fin.profitMargins),
    roe:              raw(fin.returnOnEquity),
    roa:              raw(fin.returnOnAssets),
    revenue_growth:   raw(fin.revenueGrowth),
    earnings_growth:  raw(fin.earningsGrowth),

    total_debt:        totalDebt,
    total_cash:        totalCash,
    net_debt:          (totalDebt != null && totalCash != null) ? totalDebt - totalCash : null,
    debt_to_equity:    raw(fin.debtToEquity),
    free_cashflow:     raw(fin.freeCashflow),
    operating_cashflow: raw(fin.operatingCashflow),
    total_debt_fmt:    fmt(fin.totalDebt),
    total_cash_fmt:    fmt(fin.totalCash),
    free_cashflow_fmt: fmt(fin.freeCashflow),

    beta: raw(stats.beta),

    analyst_recommendation: fin.recommendationKey || null,
    analyst_target_mean:    raw(fin.targetMeanPrice),
    analyst_target_low:     raw(fin.targetLowPrice),
    analyst_target_high:    raw(fin.targetHighPrice),
    analyst_count:          raw(fin.numberOfAnalystOpinions),
  };

  return { statusCode: 200, headers: CORS, body: JSON.stringify(metrics) };
};
