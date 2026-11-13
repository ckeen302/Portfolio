/**
 * Everything the site says lives in this file, worded as on the résumé.
 * Edit the text here and every section updates.
 */

export const site = {
  name: "Caden Keen",
  first: "Caden",
  last: "Keen",
  role: "Software Engineer",
  summary: "Computer Science senior at the University of Delaware, graduating May 2027.",
  status: "Open to work",
  location: "Newark, DE",
  coords: "39.6837° N  75.7497° W",
  timezone: "America/New_York",
  email: "cadenkeen@gmail.com",
  resume: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/Caden_Keen_Resume.pdf`,
  url: "https://ckeen302.github.io/Portfolio",
  links: {
    github: "https://github.com/ckeen302",
    linkedin: "https://www.linkedin.com/in/caden-keen-ck3/",
  },
  description:
    "Caden Keen, Software Engineer. Computer Science senior at the University of Delaware. Projects: PokéIQ, a multiplayer Pokémon game platform, ChordCraft, an AI chord progression generator, and Monster Hop, a browser game.",
} as const;

/** The links on the status card. */
export const socials = [
  { id: "github", label: "GitHub", href: site.links.github },
  { id: "linkedin", label: "LinkedIn", href: site.links.linkedin },
  { id: "email", label: "Email", href: `mailto:${site.email}` },
] as const;

/** Lines the dialog box types out, in order. Wrap a phrase in *asterisks* to highlight it. */
export const dialog = [
  "Hi, I'm *Caden Keen*, a Computer Science senior at the *University of Delaware*, graduating *May 2027*. Based in Newark, DE. Looking for full-time software engineering roles after graduation.",
  "Personal projects: *PokéIQ*, a multiplayer Pokémon game platform, *ChordCraft*, an AI chord progression generator, and *Monster Hop*, a browser game.",
  "Experience: *MyBambino.com*, the University of Delaware's *Sage Infrastructure*, and *Domain Driven Solutions*.",
  "Outside of work, I'm a big *Washington Commanders* fan. I love producing music in *FL Studio* and traveling.",
] as const;

export type Project = {
  id: string;
  index: string;
  name: string;
  kind: string;
  stack: string;
  bullets: string[];
  links: { label: string; href: string }[];
  host: string;
};

export const projects: Project[] = [
  {
    id: "pokeiq",
    index: "01",
    name: "PokéIQ",
    kind: "Multiplayer Pokémon Game Platform",
    stack: "Next.js, React, TypeScript, Supabase (PostgreSQL), Vercel, Vitest, Playwright, GitHub Actions",
    bullets: [
      "Built PokéGuessr, a GeoGuessr for Pokémon, from 2,000+ processed game screenshots (Node.js, Sharp).",
      "Built live battles with an Elo ladder, tournaments and an AI opponent (TypeScript, PostgreSQL).",
      "Engineered real-time PvP and matchmaking across 4 modes, backed by 500+ CI tests (Vitest, Playwright).",
    ],
    links: [
      { label: "Live Site", href: "https://pokeiq.vercel.app/" },
      { label: "GitHub", href: "https://github.com/ckeen302/PokeIq" },
    ],
    host: "pokeiq.vercel.app",
  },
  {
    id: "chordcraft",
    index: "02",
    name: "ChordCraft",
    kind: "AI Chord Progression Generator",
    stack: "PyTorch, ONNX Runtime Web, Next.js, TypeScript, FastAPI, SQLite, Hugging Face",
    bullets: [
      "Trained a 14M-parameter PyTorch model on 680K songs to write chord progressions in a chosen mood (90% match vs. 63% before).",
      "Compressed the model 4x with ONNX so it runs free in the browser, with a chat that turns song ideas into playable chords.",
      "Built searchable libraries of 800+ famous synth sounds (FastAPI, SQLite, weekly auto-updates) and 500+ progressions from popular songs.",
    ],
    links: [
      { label: "Live Site", href: "https://chord-craft-live.vercel.app/" },
      { label: "GitHub", href: "https://github.com/ckeen302/ChordCraft" },
    ],
    host: "chord-craft-live.vercel.app",
  },
  {
    id: "monsterhop",
    index: "03",
    name: "Monster Hop",
    kind: "Browser Game",
    stack: "Next.js, React, TypeScript, HTML5 Canvas, Tailwind CSS",
    bullets: [
      "Built an endless vertical platformer on HTML5 Canvas with its own game loop, physics and collision handling.",
      "Designed four platform types, six power-ups, three kinds of enemy and black holes, across zones that get harder the higher you climb.",
      "Added five playable monsters, keyboard and pointer controls with aimed shots, sound effects and a saved best score.",
    ],
    links: [
      { label: "Live Site", href: "https://monster-hop-delta.vercel.app/" },
      { label: "GitHub", href: "https://github.com/ckeen302/MonsterHop" },
    ],
    host: "monster-hop-delta.vercel.app",
  },
];

export const pokeiqShots = [
  { id: "home", label: "Home", src: "/work/pokeiq/home.webp", alt: "PokéIQ home page with its four game modes" },
  { id: "guessr", label: "PokéGuessr", src: "/work/pokeiq/guessr-reveal.webp", alt: "PokéGuessr round result showing the guess and the real location on the world map" },
  { id: "battle", label: "Battle", src: "/work/pokeiq/battle.webp", alt: "A live PokéIQ battle" },
  { id: "lab", label: "Battle Lab", src: "/work/pokeiq/battle-lab.webp", alt: "Battle Lab results over 1,000 simulated battles" },
  { id: "pokedle", label: "Pokédle", src: "/work/pokeiq/pokedle.webp", alt: "The daily Pokédle board" },
] as const;

export type Job = {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
};

export const experience: Job[] = [
  {
    id: "mybambino",
    company: "MyBambino.com",
    role: "Full-Stack Software Engineering Intern",
    period: "June 2026 – September 2026",
    location: "Milford, DE",
    bullets: [
      "Built a Python ETL pipeline on the Shopify Admin API (REST + GraphQL, OAuth) syncing 31K+ orders into a SQLite warehouse, with incremental syncs and automated daily runs.",
      "Developed an analytics dashboard (JavaScript, Chart.js) with 10 views (cohort retention, RFM segmentation, gift-order detection, fulfillment performance) that employees use daily to drive order and marketing decisions.",
      "Automated daily business briefs and customer export lists, replacing a recurring manual reporting process.",
    ],
  },
  {
    id: "sage",
    company: "University of Delaware",
    role: "DevOps Systems Engineer – Sage Infrastructure",
    period: "September 2025 – December 2025",
    location: "Newark, DE",
    bullets: [
      "Containerized Sage, the department’s Discord bot serving 4,000+ users, with Docker and Kubernetes for consistent, repeatable deployments.",
      "Built GitLab CI/CD pipelines running Jest test suites for user verification and automated role allocation, catching regressions before deployment.",
    ],
  },
  {
    id: "dds",
    company: "Domain Driven Solutions",
    role: "Full-Stack Software Engineer Intern",
    period: "January 2025 – June 2025",
    location: "Remote",
    bullets: [
      "Developed full-stack features for a browser-based IDE, building C#/ASP.NET REST APIs with database integration and a server-side-rendered Next.js frontend.",
      "Shipped features in biweekly Agile sprints with a distributed remote team, from Jira ticket through code review to production.",
    ],
  },
];

export const education = [
  {
    school: "University of Delaware",
    degree: "Bachelor of Science in Computer Science",
    when: "Expected May 2027",
    where: "Newark, DE",
    note: "Relevant Coursework: Data Structures, Algorithms, Operating Systems, Computer Networking, Cybersecurity, DevOps",
  },
  {
    school: "Delaware Technical Community College",
    degree: "Associate Degree in Computer Science",
    when: "May 2025",
    where: "Wilmington, DE",
    note: "",
  },
] as const;

export const skills = [
  { label: "Languages", icon: "code", value: "Python, Java, JavaScript, TypeScript (Node.js), C++, C, C#, SQL, HTML/CSS" },
  { label: "Frameworks & Libraries", icon: "blocks", value: "React, Next.js, FastAPI, ASP.NET, Django, Flask, Tailwind CSS, shadcn, Chart.js, Tone.js" },
  { label: "Core Concepts", icon: "tree", value: "Object-Oriented Programming (OOP), Data Structures & Algorithms, System Design, REST API Design, Concurrency, Distributed Systems, Data Modeling, Shell Scripting, Agile/Scrum Development" },
  { label: "AI, ML & Data", icon: "chip", value: "PyTorch, Transformers, ONNX, Hugging Face, TensorFlow, Model Evaluation, Data Pipelines (ETL)" },
  { label: "Databases & Analytics", icon: "database", value: "PostgreSQL, SQLite, Supabase, Power BI, Tableau, Excel" },
  { label: "Cloud & Infrastructure", icon: "cloud", value: "Docker, Kubernetes, CI/CD (GitHub Actions, GitLab), Git, Vercel, launchd" },
  { label: "APIs & Testing", icon: "check", value: "REST & GraphQL APIs, Jest, Vitest, pytest, Playwright" },
  { label: "Tools & Productivity", icon: "wrench", value: "Linux, AI-Assisted Workflows, JetBrains IDEs, VS Code, Jira, Microsoft Office" },
] as const;

export const nav = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;
