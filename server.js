import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

// ---- CORS (allow Netlify prod + previews + localhost) ----
const allowedExact = new Set([
  'http://localhost:3000',
  'http://localhost:8888',
  'https://anchit-data-analyst.netlify.app', // production
  // add your custom domain here later if needed:
  // 'https://anchitsharma.in',
]);

function isAllowedOrigin(origin) {
  if (!origin) return true; // server-to-server / health checks
  if (allowedExact.has(origin)) return true;
  // allow any *.netlify.app (covers preview + branch builds)
  try {
    const u = new URL(origin);
    return u.hostname.endsWith('.netlify.app');
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) return cb(null, true);
      cb(new Error(`CORS: Origin not allowed: ${origin}`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

// handle preflight
app.options('*', cors());

// ===== Projects data =====
const projects = [
  {
    id: 1,
    key: ['neet', 'neet ug', 'forecast', 'cutoff'],
    title: 'NEET UG Cutoff & Forecast Analysis',
    link: 'https://tinyurl.com/32p4jztb', // Insights PDF
    about: 'Forecasted 2025 NEET UG cutoffs using 2020–2024 trends.',
    tools: ['Excel (Power Query, Pivots, Forecast Sheet)', 'Basic statistics'],
    steps: [
      'Imported and standardized yearly cutoff datasets (2020–2024).',
      'Built category/state-wise pivot summaries to compare YoY shifts.',
      'Identified trend directions and rank–marks sensitivity by bands.',
      'Generated 2025 forecast ranges using historical trends.',
    ],
    insights: [
      'GEN/EWS remained the most competitive; SC/ST lower due to reservation access.',
      'At 700+ marks, a 10-mark change moves rank by only hundreds; in 600–650, it can shift by thousands (mid-band clustering).',
      'Competitiveness varied year-over-year; early 2020s showed tighter cutoffs.',
    ],
    limitations: [
      'AIQ closing ranks only; no opening ranks or seat counts.',
      'No private colleges/state quota; no difficulty adjustment.',
    ],
  },
  {
    id: 2,
    key: ['madav', 'madhav', 'power bi', 'profit', 'sales dashboard'],
    title: 'Madhav Sales Dashboard (Power BI)',
    link: 'https://tinyurl.com/4up55knj', // Insights PDF
    about: 'Analyzed 2018 sales & profitability with an interactive Power BI dashboard.',
    tools: ['Power BI (DAX, Power Query, interactive dashboards)'],
    steps: [
      'Modeled sales facts with measures for Revenue, Profit, AOV, Margin.',
      'Built state/city, category/sub-category, and payment-mix visuals.',
      'Identified seasonality and negative-profit orders.',
    ],
    insights: [
      'Total Revenue ₹437,771; Total Profit ₹36,963 (Margin 8.44%); AOV ₹875.54.',
      'Peak month: Jan 2018 (Revenue ₹61,632); seasonality present.',
      '≈35% of orders were negative-profit → loss-making sub-categories exist.',
      'Revenue concentrated in a few states/cities; a few VIP customers dominate.',
      'Payment mix skewed to COD; UPI/Card should be incentivized.',
    ],
    limitations: [
      'No CustomerID, demographics, SKUs, COGS/discounts, returns, or channels.',
    ],
  },
  {
    id: 3,
    key: ['vrinda', 'vrinda store', 'excel sales'],
    title: 'Vrinda Store Sales (Excel)',
    link: 'https://tinyurl.com/23sfd7p5', // Insights PDF
    about: 'Studied 2022 store sales across channels, demographics, and geographies.',
    tools: ['Excel (cleaning, pivot tables, charts, dashboards)'],
    steps: [
      'Cleaned & prepared orders, revenue, demographics, and shipping fields.',
      'Built gender, age-group, and category summaries.',
      'Created state & city revenue dashboards and monthly trend views.',
      'Analyzed order statuses (delivered, returned, cancelled, refunded).',
    ],
    insights: [
      'Women drove ~64% of revenue; men ~36%.',
      'Top age segments: 25–34 (~25.2%) and 35–44 (~25.0%).',
      'Top channels: Amazon (~35.5%), Myntra (~23.3%), Flipkart (~21.6%).',
      'Top categories: Sets (~49.6% of revenue), Kurtas (~23.4%).',
      'Top geographies: Maharashtra, Karnataka, UP; cities: Bengaluru, Hyderabad, Delhi.',
      'Fulfilment: ~92% delivered; ~3% returned; ~2.7% cancelled.',
    ],
    limitations: [
      'No cost/commission data → cannot compute profitability.',
      'No multi-year view, promotions, or return reasons.',
    ],
  },
];

// ===== Extras (HackerRank, Certificate) =====
const extras = {
  hackerrank: {
    triggers: ['hackerrank', 'hacker rank', 'sql 3 star', 'sql 3⭐', 'sql three star'],
    text:
      'HackerRank Profile (SQL 3⭐): https://www.hackerrank.com/profile/electricfieldon',
  },
  certificate: {
    triggers: ['certificate', 'tata', 'forage', 'tata forage', 'internship certificate'],
    text:
      'Tata Forage Internship Certificate: https://tinyurl.com/568bn29b',
  },
};

// ===== Helpers =====
const byId = (n) => projects.find((p) => p.id === n);
const matchProject = (q) => {
  const txt = q.toLowerCase();
  const numMatch = txt.match(/project\s*(\d+)/);
  if (numMatch) return byId(Number(numMatch[1]));
  for (const p of projects) {
    if (p.key.some((k) => txt.includes(k))) return p;
  }
  return projects.find((p) =>
    p.title.toLowerCase().split(/\W+/).some((w) => w && txt.includes(w))
  );
};
const matchExtra = (q) => {
  const txt = q.toLowerCase();
  for (const e of Object.values(extras)) {
    if (e.triggers.some((t) => txt.includes(t))) return e;
  }
  return null;
};

// ====== BOT MESSAGE FORMATTERS ======
const formatOverview = () => {
  const list = projects.map((p) => `${p.id}. ${p.title}`).join('\n');
  return `Projects — Overview\n\n${list}\n\nTip: reply with "project 1", "project 2", "project 3", or names like "NEET", "Vrinda", "Madhav".`;
};

const formatDetail = (p) => {
  const tools = p.tools?.length ? `\nTools/Tech: ${p.tools.join(', ')}` : '';
  const steps = p.steps?.length ? `\n\nKey Steps:\n- ${p.steps.join('\n- ')}` : '';
  const insights = p.insights?.length ? `\n\nKey Insights:\n- ${p.insights.join('\n- ')}` : '';
  const limits = p.limitations?.length ? `\n\nLimitations:\n- ${p.limitations.join('\n- ')}` : '';
  const link = p.link ? `\n\nInsights PDF: ${p.link}` : '';
  return `${p.title}\n\nAbout: ${p.about}${tools}${steps}${insights}${limits}${link}`;
};

// ===== Routes =====
app.get('/health', (_, res) => res.json({ ok: true }));

app.post('/chat', async (req, res) => {
  try {
    const key = (req.body?.question || '').toLowerCase().trim();
    if (!key) return res.status(400).json({ error: 'question is required' });

    const overviewTriggers = ['projects', 'project', 'list', 'show projects', 'all projects'];
    if (overviewTriggers.some((t) => key === t || key.includes(t))) {
      return res.json({ answer: formatOverview() });
    }

    const extra = matchExtra(key);
    if (extra) {
      return res.json({ answer: extra.text });
    }

    const proj = matchProject(key);
    if (proj) {
      return res.json({ answer: formatDetail(proj) });
    }

    return res.json({
      answer:
        'I’m the Project Insight Bot. Ask for "projects" to see the list, or say "project 1/2/3", or ask for "HackerRank" or "certificate".',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/', (_req, res) => {
  res
    .type('text/plain')
    .send('Anchit backend is running ✅ Try /health or POST /chat');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend listening on :${PORT}`));
