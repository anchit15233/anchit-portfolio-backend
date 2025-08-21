import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const app = express();
app.use(express.json());

// ---- CORS (allow your Netlify site + local dev) ----
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:8888',
  'https://YOUR-NETLIFY-SITE.netlify.app' // TODO: replace with your actual Netlify URL
]);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser requests and health checks
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error('CORS: Origin not allowed'));
    }
  })
);

// ===== Resume data (context for GPT) =====
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
      title: 'Pivot Table Project',
      desc: 'Pivot tables to compare categorical/numerical variables (x–y).',
      link: 'https://tinyurl.com/4bdhbr6r',
      date: 'Jul 2025'
    },
    {
      title: 'DBMS (SQL) — Student & Inventory',
      desc: 'Relational design; DDL/DML; constraints in MySQL.',
      link: 'https://tinyurl.com/2s34wdns',
      date: 'Jul 2025'
    },
    {
      title: 'Inventory Management (SQL)',
      desc: 'Suppliers/products/stock schema and queries.',
      link: 'https://tinyurl.com/yr9nz89d',
      date: 'Jul 2025'
    },
    {
      title: 'Vrinda Store Sales (Excel)',
      desc: 'Demographic & platform analysis with slicers + pivot charts.',
      link: 'https://tinyurl.com/77atzdw6',
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

// Prefilled answers
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
        .slice(0, 8)
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

// Health check
app.get('/health', (_, res) => res.json({ ok: true }));

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const q = (req.body?.question || '').trim();
    if (!q) return res.status(400).json({ error: 'question is required' });

    // Prefilled: quick matches
    const key = q.toLowerCase();
    const keys = ['about', 'about anchit', 'projects', 'papers', 'publications', 'experience', 'skills'];
    for (const k of keys) {
      if (key.includes(k)) return res.json({ answer: prefilled(k) });
    }

    // GPT fallback (strict domain)
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const system =
      'You are a concise recruiter assistant for Anchit Sharma. Only answer questions related to Anchit’s background, skills, projects, publications, exams, and experience. If asked anything unrelated, reply: "I can only answer about Anchit’s work." Use the provided structured resume data as ground truth. If a link exists, include it.';

    const response = await client.responses.create({
      model: 'gpt-5',
      input: [
        { role: 'system', content: [{ type: 'text', text: system }] },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Context:
${JSON.stringify(resume, null, 2)}

Question: ${q}`
            }
          ]
        }
      ],
      max_output_tokens: 600
    });

    const answer = response.output_text || '(no answer)';
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'server error' });
  }
});
// Root route so Render shows our backend message instead of its info page
app.get('/', (_req, res) => {
  res.type('text/plain').send('Anchit backend is running ✅ Try /health or POST /chat');
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on :${PORT}`));
