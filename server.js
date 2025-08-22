import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

// ---- CORS (allow your Netlify site + local dev) ----
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:8888',
  'https://anchit-data-analyst.netlify.app', // your live site
]);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // server-to-server / health checks
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error('CORS: Origin not allowed'));
    },
  })
);

// ===== Projects data (the bot ONLY talks about these 3) =====
const projects = [
  {
    id: 1,
    key: ['neet', 'neet ug', 'forecast', 'cutoff'],
    title: 'NEET UG Cutoff & Forecast Analysis',
    link: 'https://tinyurl.com/5n8fhy6n',
    about:
      'Analyzed 2020–2024 NEET UG cutoff trends and produced a 2025 forecast range to explain competitiveness across categories.',
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
    key: ['madav', 'power bi', 'profit', 'sales dashboard'],
    title: 'Madav Sales Dashboard (Power BI)',
    link: 'https://tinyurl.com/524mu2ep',
    about:
      'Full-year (2018) sales & profitability analysis in Power BI. Dataset: 1,500 rows, 500 unique orders.',
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
    link: 'https://tinyurl.com/77atzdw6',
    about:
      'Sales analysis for Vrinda Store (2022) across Amazon, Myntra, Flipkart, Ajio, Nalli, etc.',
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

// ===== Helpers =====
const byId = (n) => projects.find((p) => p.id === n);
const matchProject = (q) => {
  const txt = q.toLowerCase();
  // by number
  const numMatch = txt.match(/project\s*(\d+)/);
  if (numMatch) return byId(Number(numMatch[1]));
  // by keywords
  for (const p of projects) {
    if (p.key.some((k) => txt.includes(k))) return p;
  }
  // fuzzy: use title tokens
  return projects.find((p) =>
    p.title.toLowerCase().split(/\W+/).some((w) => w && txt.includes(w))
  );
};

const formatOverview = () => {
  const list = projects
    .map(
      (p) =>
        `${p.id}. ${p.title}\n   What: ${p.about}\n   Link: ${p.link}`
    )
    .join('\n\n');
  return `Projects — Overview\n\n${list}\n\nTip: reply with "project 1", "project 2", "project 3", or a name like "NEET", "Vrinda", "Madav".`;
};

const formatDetail = (p) => {
  const tools = p.tools?.length ? `\nTools/Tech: ${p.tools.join(', ')}` : '';
  const steps = p.steps?.length ? `\n\nKey Steps:\n- ${p.steps.join('\n- ')}` : '';
  const insights = p.insights?.length ? `\n\nKey Insights:\n- ${p.insights.join('\n- ')}` : '';
  const limits = p.limitations?.length ? `\n\nLimitations:\n- ${p.limitations.join('\n- ')}` : '';
  const link = p.link ? `\n\nLink: ${p.link}` : '';
  return `${p.title}\n\nAbout: ${p.about}${tools}${steps}${insights}${limits}${link}`;
};

// ===== Routes =====
app.get('/health', (_, res) => res.json({ ok: true }));

// Projects-only chat
app.post('/chat', async (req, res) => {
  try {
    const key = (req.body?.question || '').toLowerCase().trim();
    if (!key) return res.status(400).json({ error: 'question is required' });

    // overview triggers
    const overviewTriggers = ['projects', 'project', 'list', 'show projects', 'all projects'];
    if (overviewTriggers.some((t) => key === t || key.includes(t))) {
      return res.json({ answer: formatOverview() });
    }

    const proj = matchProject(key);
    if (proj) {
      return res.json({ answer: formatDetail(proj) });
    }

    // fallback: always nudge back to projects
    return res.json({
      answer:
        "I’m the Project Insight Bot. Ask for 'projects' to see the list, or say 'project 1', 'project 2', 'project 3', or a name like 'NEET', 'Vrinda', 'Madav'.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Root route
app.get('/', (_req, res) => {
  res
    .type('text/plain')
    .send('Anchit backend is running ✅ Try /health or POST /chat');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend listening on :${PORT}`));
