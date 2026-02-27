// ════════════════════════════════════════════════════════════
// AXIOS-IQ · quote.js
// Netlify Function — Yahoo Finance proxy
// Resolves CORS and returns clean metrics for a given ticker
// ════════════════════════════════════════════════════════════

const https = require('https');

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

  const ticker = ((event.queryStringParameters || {}).ticker || '').toUpperCase().trim();
  if (!ticker) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'ticker parameter required' }) };
  }

  // Yahoo Finance quoteSummary — modules selected for long-term analysis
  const modules = [
    'price',               // current price, change, market cap, name
    'defaultKeyStatistics',// P/E, EPS, beta, 52w, EV/EBITDA
    'financialData',       // margins, ROE, debt, FCF, revenue growth
    'summaryDetail',       // dividend yield, payout ratio, forward P/E
  ].join(',');

  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${modules}`;

  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://finance.yahoo.com/',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);

          // Yahoo returns error object when ticker not found
          if (parsed.quoteSummary?.error) {
            const msg = parsed.quoteSummary.error.description || `Ticker '${ticker}' not found`;
            resolve({ statusCode: 404, headers: CORS, body: JSON.stringify({ error: msg }) });
            return;
          }

          const result = parsed.quoteSummary?.result?.[0];
          if (!result) {
            resolve({ statusCode: 404, headers: CORS, body: JSON.stringify({ error: `No data found for '${ticker}'` }) });
            return;
          }

          const price   = result.price || {};
          const stats   = result.defaultKeyStatistics || {};
          const fin     = result.financialData || {};
          const summary = result.summaryDetail || {};

          // ── Helper: safely extract raw numeric value ────────
          const raw = (obj) => (obj && obj.raw != null) ? obj.raw : null;
          const fmt = (obj) => (obj && obj.fmt) ? obj.fmt : null;

          // ── Compute net debt / EBITDA if possible ───────────
          const totalDebt = raw(fin.totalDebt);
          const totalCash = raw(fin.totalCash);
          const netDebt   = (totalDebt != null && totalCash != null) ? totalDebt - totalCash : null;

          const metrics = {
            ticker,
            timestamp: new Date().toISOString(),
            data_source: 'Yahoo Finance',

            // ── Company info ───────────────────────────────────
            company_name : price.shortName || price.longName || ticker,
            exchange     : price.exchangeName || '',
            currency     : price.currency || 'USD',

            // ── Price ─────────────────────────────────────────
            current_price     : raw(price.regularMarketPrice),
            price_change_pct  : raw(price.regularMarketChangePercent),
            prev_close        : raw(price.regularMarketPreviousClose),
            market_cap        : raw(price.marketCap),
            market_cap_fmt    : fmt(price.marketCap),

            // ── 52-week range ──────────────────────────────────
            week52_high : raw(stats.fiftyTwoWeekHigh) ?? raw(summary.fiftyTwoWeekHigh),
            week52_low  : raw(stats.fiftyTwoWeekLow)  ?? raw(summary.fiftyTwoWeekLow),

            // ── Valuation ratios ──────────────────────────────
            pe_trailing  : raw(summary.trailingPE),
            pe_forward   : raw(stats.forwardPE) ?? raw(summary.forwardPE),
            ev_ebitda    : raw(stats.enterpriseToEbitda),
            price_to_book: raw(stats.priceToBook),
            eps_trailing : raw(stats.trailingEps),
            eps_forward  : raw(stats.forwardEps),

            // ── Dividend ──────────────────────────────────────
            dividend_yield    : raw(summary.dividendYield) ?? raw(summary.trailingAnnualDividendYield),
            dividend_rate     : raw(summary.trailingAnnualDividendRate),
            payout_ratio      : raw(summary.payoutRatio),
            ex_dividend_date  : (summary.exDividendDate?.fmt) || null,

            // ── Profitability ─────────────────────────────────
            gross_margin     : raw(fin.grossMargins),
            operating_margin : raw(fin.operatingMargins),
            profit_margin    : raw(fin.profitMargins),
            roe              : raw(fin.returnOnEquity),
            roa              : raw(fin.returnOnAssets),
            revenue_growth   : raw(fin.revenueGrowth),
            earnings_growth  : raw(fin.earningsGrowth),

            // ── Balance sheet ─────────────────────────────────
            total_debt        : totalDebt,
            total_cash        : totalCash,
            net_debt          : netDebt,
            debt_to_equity    : raw(fin.debtToEquity),    // as ratio × 100 in Yahoo
            free_cashflow     : raw(fin.freeCashflow),
            operating_cashflow: raw(fin.operatingCashflow),
            total_debt_fmt    : fmt(fin.totalDebt),
            total_cash_fmt    : fmt(fin.totalCash),
            free_cashflow_fmt : fmt(fin.freeCashflow),

            // ── Risk ──────────────────────────────────────────
            beta: raw(stats.beta),

            // ── Recommendation (if available) ─────────────────
            analyst_recommendation : fin.recommendationKey || null,
            analyst_target_mean    : raw(fin.targetMeanPrice),
            analyst_target_low     : raw(fin.targetLowPrice),
            analyst_target_high    : raw(fin.targetHighPrice),
            analyst_count          : raw(fin.numberOfAnalystOpinions),
          };

          resolve({
            statusCode: 200,
            headers: CORS,
            body: JSON.stringify(metrics),
          });

        } catch (e) {
          resolve({
            statusCode: 500,
            headers: CORS,
            body: JSON.stringify({ error: 'Parse error: ' + e.message }),
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Network error: ' + e.message }) });
    });

    req.setTimeout(9000, () => {
      req.destroy();
      resolve({ statusCode: 504, headers: CORS, body: JSON.stringify({ error: 'Yahoo Finance request timed out' }) });
    });
  });
};
