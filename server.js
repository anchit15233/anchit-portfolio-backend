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
  'https://anchit-data-analyst.netlify.app' // <- your real Netlify URL
]);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server requests & health checks
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error('CORS: Origin not allowed'));
    }
  })
);

// ===== Resume data (context) =====
const resume = {
  name: 'Anchit Sharma',
  location: 'Delhi, India',
  email: 'electricfieldon@gmail.com',
  linkedin: 'https://www.linkedin.com/in/anchit-sharma-26916a342',
  tagline: 'Entry-level Data Analyst | B.Sc. Chemistry (IGNOU) | Excel · SQL · Power BI',
  summary:
    'Entry-level Data Analyst with a strong academic foundation in Chemistry (IIT JAM AIR 2260, NEET UG). Skilled in Excel, SQL (MySQL), and Power BI with hands-on experience in data cleaning, forecasting, dashboards and BI. Seeking entry-level roles in data analytics, BI, edtech, or research.',
  skills: {
    tools: [
      'Excel (Pivots, Charts, Forecasting)',
      'SQL (MySQL)',
      'Power BI',
      'HTML/CSS/JS',
      'GenAI & Web Deployments'
    ],
    analysis: ['Data Cleaning', 'EDA', 'Visualization', 'Forecasting', 'BI & Reporting']
  },
  projects: [
    {
      title: 'Excel Data Preparation & Automation',
      desc:
        'Automated dataset generation with Excel (RANDBETWEEN/CHOOSE), arithmetic ops, and summaries.',
      link: 'https://tinyurl.com/3t26vn78',
      date: 'Aug 2025'
    },
    {
      title: 'NEET UG Cutoff & Forecast Analysis',
      desc: 'Analyzed 2020–2024 cutoffs; dashboards + forecast for 2025 trends (Excel).',
      link: 'https://tinyurl.com/5n8fhy6n',
      date: 'Jul 2025'
    },
    {
      title: 'Medicine Order Website',
      desc: 'HTML/CSS/JS + WhatsApp order flow with image preview.',
      link: 'https://tinyurl.com/2vzj7f5k',
      date: 'Jul 2025 – Present'
    },
    {
      title: 'Excel Data Analysis & Reporting',
      desc:
        'VLOOKUP, ROUND, conditional formatting, multi-sheet cleaning, pivots and charts.',
      link: 'https://tinyurl.com/hbesf3u7',
      date: 'Jul 2025'
    },
    {
      title: 'DBMS (SQL) — Student & Inventory',
      desc: 'Relational design; DDL/DML; constraints in MySQL.',
      link: 'https://tinyurl.com/2s34wdns',
      date: 'Jul 2025'
    },
    {
      title: 'Madav Sales Dashboard (Power BI)',
      desc: 'Interactive BI dashboard; Power Query cleaning.',
      link: 'https://tinyurl.com/524mu2ep',
      date: 'Aug 2025'
    }
  ],
  publications: [
    {
      title: 'Pedagogical Pathway to Quantum Mechanics',
      link: 'https://doi.org/10.5281/zenodo.16420453'
    },
    {
      title: 'Resolving Indeterminate Forms in First-Order Reaction Kinetics',
      link: 'https://doi.org/10.5281/zenodo.16416837'
    }
  ],
  experience: [
    'Data Analyst Intern (Virtual) — Tata Forage (Aug 2025, present): viz & analysis projects',
    'Subject Matter Expert (Chemistry): step-by-step problem solving for global learners',
    'CoachingSelect (Jun–Jul 2023): outreach, Google Sheets tracking, digital marketing support'
  ],
  exams: [
    'IIT JAM (Chemistry) — AIR 2260',
    'NEET UG — Qualified',
    'JMI B.Sc. Entrance — Qualified'
  ]
};

// ===== Prefilled answers =====
function prefilled(key) {
  switch (key.toLowerCase()) {
    case 'about':
    case 'about anchit':
      return `${resume.name} — ${resume.tagline}
${resume.summary}

LinkedIn: ${resume.linkedin} | Email: ${resume.email}`;
    case 'skills': {
      const t = resume.skills.tools.map(s => `• ${s}`).join('\n');
      const a = resume.skills.analysis.map(s => `• ${s}`).join('\n');
      return `Skills

Tools & Tech:
${t}

Analysis:
${a}`;
    }
    case 'projects': {
      const list = resume.projects
        .map(
          (p, i) =>
            `${i + 1}. ${p.title} — ${p.desc} (${p.date})
   Link: ${p.link}`
        )
        .join('\n\n');
      return `Projects

${list}`;
    }
    case 'papers':
    case 'publications': {
      const list = resume.publications
        .map((p, i) => `${i + 1}. ${p.title}
   Link: ${p.link}`)
        .join('\n\n');
      return `Research Publications

${list}`;
    }
    case 'experience': {
      return `Experience

• ${resume.experience.join('\n• ')}`;
    }
    default:
      return null;
  }
}

// ===== Routes =====
app.get('/health', (_, res) => res.json({ ok: true }));

// Prefilled-only chat (no GPT calls)
app.post('/chat', async (req, res) => {
  try {
    const key = (req.body?.question || '').toLowerCase().trim();
    if (!key) return res.status(400).json({ error: 'question is required' });

    const keys = ['about','about anchit','projects','papers','publications','experience','skills'];
    for (const k of keys) {
      if (key === k || key.includes(k)) {
        return res.json({ answer: prefilled(k) });
      }
    }

    // Fallback for anything else
    return res.json({
      answer: "Please use the buttons: About, Skills, Projects, Experience, Publications."
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Root route
app.get('/', (_req, res) => {
  res.type('text/plain').send('Anchit backend is running ✅ Try /health or POST /chat');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on :${PORT}`));
