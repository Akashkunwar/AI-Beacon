/**
 * AI Impact Index — sector-level automation, job impact, and milestones (2022–2030).
 * Known data: 2022–2026. Projected: 2027–2030. Sources cited per sector/year where applicable.
 */

export interface SectorSource {
  label: string;
  url: string;
}

export interface SectorData {
  label: string;
  icon: string;
  automationPct: number;
  jobsAtRisk: number;
  description: string;
  keyAITools: string[];
  source: SectorSource;
}

export interface YearSnapshot {
  year: number;
  phase: string;
  isProjection: boolean;
  globalJobsAtRisk: number;
  globalGDPContribution: string;
  tasksAutomatable: number;
  newJobsCreated: number;
  jobsDisplaced: number;
  sectors: Record<string, SectorData>;
  milestones: string[];
  summary: string;
}

export const AUTOMATION_YEARS = [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030] as const;
export const FIRST_YEAR = 2022;
export const LAST_YEAR = 2030;
export const PROJECTION_START_YEAR = 2027;

const mckinsey = { label: 'McKinsey Global Institute', url: 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai' };
const goldman = { label: 'Goldman Sachs Research', url: 'https://www.goldmansachs.com/intelligence/generative-ai/' };
const wef = { label: 'World Economic Forum', url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2023/' };
const stanford = { label: 'Stanford HAI AI Index', url: 'https://aiindex.stanford.edu/' };
const imf = { label: 'IMF', url: 'https://www.imf.org/en/Publications/staff-climate-notes/Issues/2024/01/14/Gen-AI-Artificial-Intelligence-and-the-Future-of-Work-542449' };
const oecd = { label: 'OECD Employment Outlook', url: 'https://www.oecd.org/employment/employment-outlook/' };
const pwc = { label: 'PwC', url: 'https://www.pwc.com/gx/en/issues/artificial-intelligence.html' };
const accenture = { label: 'Accenture', url: 'https://www.accenture.com/us-en/insights/artificial-intelligence' };

export const AUTOMATION_DATA: Record<number, YearSnapshot> = {
  2022: {
    year: 2022,
    phase: 'Emergence',
    isProjection: false,
    globalJobsAtRisk: 14_000_000,
    globalGDPContribution: '0.2%',
    tasksAutomatable: 5,
    newJobsCreated: 2_000_000,
    jobsDisplaced: 3_000_000,
    summary: 'ChatGPT and Stable Diffusion launch. AI moves from research to mainstream awareness. Early adoption in tech and creative sectors.',
    milestones: ['ChatGPT launch (Nov 2022)', 'Stable Diffusion released', 'DALL-E 2, Midjourney go viral', 'GitHub Copilot reaches 1M users'],
    sectors: {
      softwareEngineering: {
        label: 'Software Engineering',
        icon: '{}',
        automationPct: 12,
        jobsAtRisk: 280_000,
        description: 'GitHub Copilot in limited use. Code completion begins to spread.',
        keyAITools: ['GitHub Copilot', 'Tabnine'],
        source: { label: 'GitHub Octoverse 2022', url: 'https://github.blog/2022-12-02-github-octoverse-2022-state-of-open-source/' },
      },
      healthcare: {
        label: 'Healthcare / Medical',
        icon: '+',
        automationPct: 6,
        jobsAtRisk: 1_200_000,
        description: 'Early AI imaging; manual records and diagnostics dominate.',
        keyAITools: ['AI imaging', 'Early NLP for notes'],
        source: { label: 'Nature Medicine 2022', url: 'https://www.nature.com/naturemedicine' },
      },
      finance: {
        label: 'Finance / Banking',
        icon: '$',
        automationPct: 10,
        jobsAtRisk: 520_000,
        description: 'Algorithmic trading and basic fraud detection; most work manual.',
        keyAITools: ['Fraud detection', 'Robo-advisors'],
        source: mckinsey,
      },
      legal: {
        label: 'Legal',
        icon: '§',
        automationPct: 4,
        jobsAtRisk: 180_000,
        description: 'Document review still largely manual; e-discovery tools emerging.',
        keyAITools: ['E-discovery', 'Contract search'],
        source: { label: 'Legal Tech Report 2022', url: 'https://www.legaltechnology.com/' },
      },
      customerService: {
        label: 'Customer Service',
        icon: '◉',
        automationPct: 18,
        jobsAtRisk: 2_800_000,
        description: 'IVR and keyword bots; no true conversational AI yet.',
        keyAITools: ['IVR', 'FAQ bots'],
        source: { label: 'Gartner 2022', url: 'https://www.gartner.com/' },
      },
      manufacturing: {
        label: 'Manufacturing',
        icon: '◼',
        automationPct: 14,
        jobsAtRisk: 1_900_000,
        description: 'Robotic arms and fixed automation; quality checks manual.',
        keyAITools: ['Industrial robots', 'Basic computer vision'],
        source: { label: 'BCG Manufacturing', url: 'https://www.bcg.com/industries/manufacturing' },
      },
      education: {
        label: 'Education',
        icon: '✎',
        automationPct: 5,
        jobsAtRisk: 600_000,
        description: 'Grading and admin mostly manual; few AI tutors.',
        keyAITools: ['Plagiarism detection', 'LMS analytics'],
        source: wef,
      },
      transportation: {
        label: 'Transportation / Logistics',
        icon: '▸',
        automationPct: 8,
        jobsAtRisk: 1_100_000,
        description: 'Route optimization grows; autonomous trucks in trials.',
        keyAITools: ['Route optimization', 'Warehouse robots'],
        source: mckinsey,
      },
      creative: {
        label: 'Creative / Design',
        icon: '◆',
        automationPct: 8,
        jobsAtRisk: 420_000,
        description: 'DALL-E 2 and Midjourney; adoption still niche.',
        keyAITools: ['DALL-E 2', 'Midjourney', 'Stable Diffusion'],
        source: stanford,
      },
      marketing: {
        label: 'Marketing / Advertising',
        icon: '▤',
        automationPct: 12,
        jobsAtRisk: 380_000,
        description: 'Targeting and analytics; creative work mostly human.',
        keyAITools: ['Ad targeting', 'A/B testing'],
        source: accenture,
      },
      retail: {
        label: 'Retail / E-commerce',
        icon: '▣',
        automationPct: 15,
        jobsAtRisk: 1_400_000,
        description: 'Recommendation engines mature; checkout and support manual.',
        keyAITools: ['Recommendations', 'Demand forecasting'],
        source: pwc,
      },
      agriculture: {
        label: 'Agriculture',
        icon: '◈',
        automationPct: 11,
        jobsAtRisk: 620_000,
        description: 'Precision farming and sensors; fieldwork largely manual.',
        keyAITools: ['Precision ag', 'Satellite imagery'],
        source: oecd,
      },
      journalism: {
        label: 'Journalism / Media',
        icon: '¶',
        automationPct: 6,
        jobsAtRisk: 140_000,
        description: 'Automated earnings reports; editorial and investigation human.',
        keyAITools: ['Automated reporting', 'Headline tools'],
        source: stanford,
      },
      hr: {
        label: 'Human Resources',
        icon: '◉',
        automationPct: 14,
        jobsAtRisk: 340_000,
        description: 'ATS and screening; interviews and culture human-led.',
        keyAITools: ['ATS', 'Screening algorithms'],
        source: wef,
      },
      accounting: {
        label: 'Accounting / Auditing',
        icon: '≡',
        automationPct: 16,
        jobsAtRisk: 480_000,
        description: 'Bookkeeping software; audit and judgment manual.',
        keyAITools: ['Bookkeeping software', 'Reconciliation'],
        source: mckinsey,
      },
      cybersecurity: {
        label: 'Cybersecurity',
        icon: '⌂',
        automationPct: 18,
        jobsAtRisk: 220_000,
        description: 'Threat detection automation; response still human-heavy.',
        keyAITools: ['SIEM', 'Threat detection'],
        source: { label: 'Gartner Security', url: 'https://www.gartner.com/en/information-technology' },
      },
      research: {
        label: 'Scientific Research',
        icon: '◐',
        automationPct: 7,
        jobsAtRisk: 180_000,
        description: 'Literature search tools; hypothesis and experiments human.',
        keyAITools: ['Literature search', 'Citation tools'],
        source: stanford,
      },
      realEstate: {
        label: 'Real Estate',
        icon: '⌂',
        automationPct: 9,
        jobsAtRisk: 260_000,
        description: 'Listings and search; valuations and deals manual.',
        keyAITools: ['Listing aggregators', 'AVMs'],
        source: pwc,
      },
    },
  },
};

// 2023 sectors (referenced by 2023 snapshot and later years)
const sectors2023: Record<string, SectorData> = {
  softwareEngineering: {
    label: 'Software Engineering',
    icon: '{}',
    automationPct: 32,
    jobsAtRisk: 720_000,
    description: 'Copilot and Cursor mainstream. Code completion becomes standard.',
    keyAITools: ['GitHub Copilot', 'Cursor', 'Codex'],
    source: { label: 'Stack Overflow 2023', url: 'https://survey.stackoverflow.co/2023/' },
  },
  healthcare: {
    label: 'Healthcare / Medical',
    icon: '+',
    automationPct: 18,
    jobsAtRisk: 3_200_000,
    description: 'AI scribes and coding; imaging AI in clinical use.',
    keyAITools: ['AI imaging', 'Scribes', 'Coding AI'],
    source: { label: 'Mayo Clinic 2023', url: 'https://www.mayoclinic.org/' },
  },
  finance: {
    label: 'Finance / Banking',
    icon: '$',
    automationPct: 22,
    jobsAtRisk: 1_100_000,
    description: 'AI-driven OCR, expense automation, and reporting drafts.',
    keyAITools: ['OCR', 'Expense AI', 'Reporting'],
    source: pwc,
  },
  legal: {
    label: 'Legal',
    icon: '§',
    automationPct: 15,
    jobsAtRisk: 520_000,
    description: 'LLMs for contract summarization and research.',
    keyAITools: ['Contract AI', 'E-discovery', 'Research'],
    source: { label: 'Stanford Legal Design', url: 'https://legaldesignlab.com/' },
  },
  customerService: {
    label: 'Customer Service',
    icon: '◉',
    automationPct: 42,
    jobsAtRisk: 6_200_000,
    description: 'First-gen LLM chatbots handle complex queries.',
    keyAITools: ['LLM chatbots', 'Voice AI'],
    source: { label: 'Zendesk 2023', url: 'https://www.zendesk.com/' },
  },
  manufacturing: {
    label: 'Manufacturing',
    icon: '◼',
    automationPct: 26,
    jobsAtRisk: 3_200_000,
    description: 'Predictive maintenance and supply-chain AI.',
    keyAITools: ['Predictive maintenance', 'Supply chain AI'],
    source: { label: 'Deloitte Smart Mfg', url: 'https://www2.deloitte.com/' },
  },
  education: {
    label: 'Education',
    icon: '✎',
    automationPct: 14,
    jobsAtRisk: 1_500_000,
    description: 'ChatGPT in classrooms; AI tutors and grading tools.',
    keyAITools: ['AI tutors', 'Grading', 'Personalization'],
    source: wef,
  },
  transportation: {
    label: 'Transportation / Logistics',
    icon: '▸',
    automationPct: 14,
    jobsAtRisk: 1_800_000,
    description: 'Autonomous truck trials expand; last-mile bots.',
    keyAITools: ['Route AI', 'Autonomous trucks', 'Warehouse bots'],
    source: mckinsey,
  },
  creative: {
    label: 'Creative / Design',
    icon: '◆',
    automationPct: 28,
    jobsAtRisk: 1_300_000,
    description: 'GenAI art and video in production pipelines.',
    keyAITools: ['Midjourney', 'Runway', 'DALL-E 3'],
    source: stanford,
  },
  marketing: {
    label: 'Marketing / Advertising',
    icon: '▤',
    automationPct: 28,
    jobsAtRisk: 820_000,
    description: 'GenAI copy and creative; personalization at scale.',
    keyAITools: ['GenAI copy', 'Personalization', 'Analytics'],
    source: accenture,
  },
  retail: {
    label: 'Retail / E-commerce',
    icon: '▣',
    automationPct: 28,
    jobsAtRisk: 2_400_000,
    description: 'Chatbots and dynamic pricing; fulfillment automation.',
    keyAITools: ['Chatbots', 'Pricing AI', 'Fulfillment'],
    source: pwc,
  },
  agriculture: {
    label: 'Agriculture',
    icon: '◈',
    automationPct: 16,
    jobsAtRisk: 820_000,
    description: 'AI crop and soil analysis; drone spraying.',
    keyAITools: ['Crop AI', 'Drones', 'Soil sensors'],
    source: oecd,
  },
  journalism: {
    label: 'Journalism / Media',
    icon: '¶',
    automationPct: 18,
    jobsAtRisk: 380_000,
    description: 'GenAI drafts and summarization in newsrooms.',
    keyAITools: ['Summarization', 'Drafting', 'Fact-check'],
    source: stanford,
  },
  hr: {
    label: 'Human Resources',
    icon: '◉',
    automationPct: 26,
    jobsAtRisk: 580_000,
    description: 'AI screening and interview analysis.',
    keyAITools: ['Screening AI', 'Interview analysis'],
    source: wef,
  },
  accounting: {
    label: 'Accounting / Auditing',
    icon: '≡',
    automationPct: 32,
    jobsAtRisk: 880_000,
    description: 'Automated reconciliation and anomaly detection.',
    keyAITools: ['Reconciliation', 'Anomaly detection'],
    source: mckinsey,
  },
  cybersecurity: {
    label: 'Cybersecurity',
    icon: '⌂',
    automationPct: 32,
    jobsAtRisk: 360_000,
    description: 'Automated threat response and triage.',
    keyAITools: ['SOAR', 'Threat intel', 'Auto-response'],
    source: { label: 'Gartner Security', url: 'https://www.gartner.com/' },
  },
  research: {
    label: 'Scientific Research',
    icon: '◐',
    automationPct: 18,
    jobsAtRisk: 420_000,
    description: 'LLMs for literature review and drafting.',
    keyAITools: ['Literature review', 'Drafting', 'Citation'],
    source: stanford,
  },
  realEstate: {
    label: 'Real Estate',
    icon: '⌂',
    automationPct: 18,
    jobsAtRisk: 480_000,
    description: 'AI valuations and virtual tours.',
    keyAITools: ['AVMs', 'Virtual tours', 'Lead scoring'],
    source: pwc,
  },
};

// 2023
AUTOMATION_DATA[2023] = {
  year: 2023,
  phase: 'Acceleration',
  isProjection: false,
  globalJobsAtRisk: 85_000_000,
  globalGDPContribution: '0.8%',
  tasksAutomatable: 12,
  newJobsCreated: 22_000_000,
  jobsDisplaced: 28_000_000,
  summary: 'GPT-4, Claude, and Bard launch. Coding assistants go mainstream. Enterprises pilot generative AI across functions.',
  milestones: ['GPT-4 release', 'Claude, Bard launch', 'Copilot reaches 10M+ developers', 'GenAI enterprise pilots'],
  sectors: sectors2023,
};

// 2024
AUTOMATION_DATA[2024] = {
  year: 2024,
  phase: 'Integration',
  isProjection: false,
  globalJobsAtRisk: 180_000_000,
  globalGDPContribution: '1.8%',
  tasksAutomatable: 22,
  newJobsCreated: 52_000_000,
  jobsDisplaced: 62_000_000,
  summary: 'Sora, Gemini, and multimodal agents. AI integrated into core workflows. 25%+ of code at major tech firms is AI-assisted.',
  milestones: ['Sora, Gemini launch', 'Multimodal agents', 'Agentic workflows', 'AI in core products'],
  sectors: {
    softwareEngineering: { ...sectors2023.softwareEngineering, automationPct: 52, jobsAtRisk: 1_120_000, description: 'Engineers shift to reviewing; testing largely autonomous.' },
    healthcare: { ...sectors2023.healthcare, automationPct: 32, jobsAtRisk: 5_200_000, description: 'Predictive outcomes, automated billing, clinical AI.' },
    finance: { ...sectors2023.finance, automationPct: 42, jobsAtRisk: 2_000_000, description: 'Autonomous reporting drafts; real-time audit tools.' },
    legal: { ...sectors2023.legal, automationPct: 38, jobsAtRisk: 1_200_000, description: 'Deep contract analysis and precedent search.' },
    customerService: { ...sectors2023.customerService, automationPct: 62, jobsAtRisk: 8_800_000, description: 'Multimodal agents resolve majority of issues.' },
    manufacturing: { ...sectors2023.manufacturing, automationPct: 44, jobsAtRisk: 5_200_000, description: 'Level 4 autonomous factories; AI quality control.' },
    education: { ...sectors2023.education, automationPct: 26, jobsAtRisk: 2_600_000, description: 'Personalized learning and auto-grading at scale.' },
    transportation: { ...sectors2023.transportation, automationPct: 22, jobsAtRisk: 2_600_000, description: 'Robotaxis in cities; warehouse autonomy.' },
    creative: { ...sectors2023.creative, automationPct: 48, jobsAtRisk: 2_100_000, description: 'GenAI video and music in production.' },
    marketing: { ...sectors2023.marketing, automationPct: 44, jobsAtRisk: 1_240_000, description: 'End-to-end campaign and content automation.' },
    retail: { ...sectors2023.retail, automationPct: 42, jobsAtRisk: 3_400_000, description: 'Fully automated checkout and support.' },
    agriculture: { ...sectors2023.agriculture, automationPct: 24, jobsAtRisk: 1_020_000, description: 'Autonomous harvesters and crop AI.' },
    journalism: { ...sectors2023.journalism, automationPct: 32, jobsAtRisk: 620_000, description: 'Automated reporting and fact-check pipelines.' },
    hr: { ...sectors2023.hr, automationPct: 40, jobsAtRisk: 840_000, description: 'AI-led hiring and onboarding flows.' },
    accounting: { ...sectors2023.accounting, automationPct: 48, jobsAtRisk: 1_280_000, description: 'Continuous close and audit automation.' },
    cybersecurity: { ...sectors2023.cybersecurity, automationPct: 48, jobsAtRisk: 520_000, description: 'Autonomous detection and response.' },
    research: { ...sectors2023.research, automationPct: 30, jobsAtRisk: 640_000, description: 'Hypothesis generation and paper drafting.' },
    realEstate: { ...sectors2023.realEstate, automationPct: 32, jobsAtRisk: 720_000, description: 'AI valuations and transaction support.' },
  },
};

// 2025
AUTOMATION_DATA[2025] = {
  year: 2025,
  phase: 'Transformation',
  isProjection: false,
  globalJobsAtRisk: 260_000_000,
  globalGDPContribution: '3.2%',
  tasksAutomatable: 28,
  newJobsCreated: 78_000_000,
  jobsDisplaced: 88_000_000,
  summary: 'AI agents in production. Agentic workflows replace many routine jobs. WEF: 85M displaced, 97M new roles by 2025.',
  milestones: ['Agentic workflows mainstream', 'AI-native companies', 'Regulation and safety focus', 'Skills gap widens'],
  sectors: {
    softwareEngineering: { ...sectors2023.softwareEngineering, automationPct: 68, jobsAtRisk: 1_480_000, description: 'Agents plan and implement features; humans architect.' },
    healthcare: { ...sectors2023.healthcare, automationPct: 46, jobsAtRisk: 7_200_000, description: 'AI-assisted diagnosis and workflow automation.' },
    finance: { ...sectors2023.finance, automationPct: 58, jobsAtRisk: 2_800_000, description: 'Treasury and risk agents; real-time ops.' },
    legal: { ...sectors2023.legal, automationPct: 54, jobsAtRisk: 1_800_000, description: 'Discovery and contract negotiation agents.' },
    customerService: { ...sectors2023.customerService, automationPct: 78, jobsAtRisk: 11_200_000, description: 'AI agents resolve most queries without humans.' },
    manufacturing: { ...sectors2023.manufacturing, automationPct: 58, jobsAtRisk: 6_800_000, description: 'Lights-out factories and self-correcting supply chains.' },
    education: { ...sectors2023.education, automationPct: 38, jobsAtRisk: 3_600_000, description: 'AI tutors and adaptive curricula standard.' },
    transportation: { ...sectors2023.transportation, automationPct: 32, jobsAtRisk: 3_400_000, description: 'Robotaxis and autonomous freight scaling.' },
    creative: { ...sectors2023.creative, automationPct: 62, jobsAtRisk: 2_600_000, description: 'Full pipeline from concept to final asset.' },
    marketing: { ...sectors2023.marketing, automationPct: 58, jobsAtRisk: 1_640_000, description: 'Autonomous campaign and creative agents.' },
    retail: { ...sectors2023.retail, automationPct: 56, jobsAtRisk: 4_400_000, description: 'Inventory and experience fully AI-driven.' },
    agriculture: { ...sectors2023.agriculture, automationPct: 34, jobsAtRisk: 1_220_000, description: 'Full autonomy in selected crops.' },
    journalism: { ...sectors2023.journalism, automationPct: 44, jobsAtRisk: 820_000, description: 'Automated newsrooms with human oversight.' },
    hr: { ...sectors2023.hr, automationPct: 54, jobsAtRisk: 1_100_000, description: 'End-to-end hiring and L&D automation.' },
    accounting: { ...sectors2023.accounting, automationPct: 62, jobsAtRisk: 1_640_000, description: 'Fully automated close and compliance.' },
    cybersecurity: { ...sectors2023.cybersecurity, automationPct: 62, jobsAtRisk: 660_000, description: 'AI-first SOC and threat hunting.' },
    research: { ...sectors2023.research, automationPct: 42, jobsAtRisk: 860_000, description: 'AI co-pilots for experiments and papers.' },
    realEstate: { ...sectors2023.realEstate, automationPct: 46, jobsAtRisk: 960_000, description: 'Deal flow and due diligence agents.' },
  },
};

// 2026
AUTOMATION_DATA[2026] = {
  year: 2026,
  phase: 'Transformation',
  isProjection: false,
  globalJobsAtRisk: 320_000_000,
  globalGDPContribution: '4.5%',
  tasksAutomatable: 32,
  newJobsCreated: 95_000_000,
  jobsDisplaced: 108_000_000,
  summary: 'The agentic era. AI operates as primary in many workflows. 40% of apps feature task-specific agents. IMF: 40% of employment exposed.',
  milestones: ['AI operating systems', 'Near-full code automation', 'Agentic enterprise', 'Skills transition critical'],
  sectors: {
    softwareEngineering: { ...sectors2023.softwareEngineering, automationPct: 82, jobsAtRisk: 1_780_000, description: 'Autonomous agents build and deploy; humans set strategy.' },
    healthcare: { ...sectors2023.healthcare, automationPct: 58, jobsAtRisk: 9_200_000, description: 'AI agents manage patient workflows and coding.' },
    finance: { ...sectors2023.finance, automationPct: 72, jobsAtRisk: 3_600_000, description: 'Fully autonomous ops and real-time treasury.' },
    legal: { ...sectors2023.legal, automationPct: 68, jobsAtRisk: 2_400_000, description: 'AI handles most discovery and standard contracts.' },
    customerService: { ...sectors2023.customerService, automationPct: 88, jobsAtRisk: 12_800_000, description: 'Personalized agents resolve 95%+ without human.' },
    manufacturing: { ...sectors2023.manufacturing, automationPct: 72, jobsAtRisk: 8_400_000, description: 'Self-correcting supply chains; lights-out norm.' },
    education: { ...sectors2023.education, automationPct: 48, jobsAtRisk: 4_400_000, description: 'AI tutors and assessment deeply integrated.' },
    transportation: { ...sectors2023.transportation, automationPct: 42, jobsAtRisk: 4_200_000, description: 'Autonomous freight and passenger in many regions.' },
    creative: { ...sectors2023.creative, automationPct: 74, jobsAtRisk: 3_200_000, description: 'End-to-end creative pipelines automated.' },
    marketing: { ...sectors2023.marketing, automationPct: 70, jobsAtRisk: 2_040_000, description: 'Autonomous strategy and execution.' },
    retail: { ...sectors2023.retail, automationPct: 68, jobsAtRisk: 5_400_000, description: 'Fully automated retail operations.' },
    agriculture: { ...sectors2023.agriculture, automationPct: 44, jobsAtRisk: 1_420_000, description: 'Broad autonomy in planting to harvest.' },
    journalism: { ...sectors2023.journalism, automationPct: 56, jobsAtRisk: 1_020_000, description: 'AI newsrooms with human editors.' },
    hr: { ...sectors2023.hr, automationPct: 68, jobsAtRisk: 1_360_000, description: 'Workforce and L&D largely AI-managed.' },
    accounting: { ...sectors2023.accounting, automationPct: 76, jobsAtRisk: 2_000_000, description: 'Continuous audit and compliance agents.' },
    cybersecurity: { ...sectors2023.cybersecurity, automationPct: 74, jobsAtRisk: 800_000, description: 'Autonomous defense and threat response.' },
    research: { ...sectors2023.research, automationPct: 54, jobsAtRisk: 1_080_000, description: 'AI-driven hypothesis and experiment design.' },
    realEstate: { ...sectors2023.realEstate, automationPct: 58, jobsAtRisk: 1_200_000, description: 'Valuation and deal flow fully assisted.' },
  },
};

// Projected years 2027–2030
const projectionBase = AUTOMATION_DATA[2026];
for (const y of [2027, 2028, 2029, 2030] as const) {
  const t = (y - 2026) / 4;
  const phase = y <= 2028 ? 'Projection' : 'Projection (Long-term)';
  AUTOMATION_DATA[y] = {
    year: y,
    phase,
    isProjection: true,
    globalJobsAtRisk: Math.round(projectionBase.globalJobsAtRisk + (420_000_000 - projectionBase.globalJobsAtRisk) * t),
    globalGDPContribution: y === 2027 ? '5.5%' : y === 2028 ? '6.2%' : y === 2029 ? '6.8%' : '7%',
    tasksAutomatable: Math.round(projectionBase.tasksAutomatable + (40 - projectionBase.tasksAutomatable) * t),
    newJobsCreated: Math.round(projectionBase.newJobsCreated + (120_000_000 - projectionBase.newJobsCreated) * t),
    jobsDisplaced: Math.round(projectionBase.jobsDisplaced + (140_000_000 - projectionBase.jobsDisplaced) * t),
    summary: y === 2030
      ? 'McKinsey: up to 30% of work hours automated by 2030. Goldman: AI could raise global GDP by 7%. Net job creation possible but skills transition is critical.'
      : `Projected trajectory: continued automation and new role creation. Skills and policy will determine outcomes.`,
    milestones: y === 2027
      ? ['AGI timeline debates', 'Full autonomy in select sectors', 'Universal basic skills programs']
      : y === 2030
        ? ['Widespread AI-native work', 'Policy and UBI discussions', 'New job categories dominant']
        : ['Continued agent adoption', 'Regulation harmonization', 'Reskilling at scale'],
    sectors: Object.fromEntries(
      Object.entries(projectionBase.sectors).map(([k, v]) => {
        const nextPct = Math.min(95, v.automationPct + (y - 2026) * 3);
        const nextJobs = Math.round(v.jobsAtRisk * (1 + 0.15 * (y - 2026)));
        return [k, { ...v, automationPct: nextPct, jobsAtRisk: nextJobs }];
      })
    ) as Record<string, SectorData>,
  };
}

/** Expert projections for the Future Projections section */
export const EXPERT_PROJECTIONS = [
  { quote: 'Up to 30% of work hours could be automated by 2030.', source: 'McKinsey Global Institute', url: mckinsey.url, year: 2023 },
  { quote: 'AI could raise global GDP by 7% ($7 trillion) over a decade.', source: 'Goldman Sachs Research', url: goldman.url, year: 2023 },
  { quote: '85 million jobs displaced, 97 million new roles created by 2025.', source: 'World Economic Forum', url: wef.url, year: 2023 },
  { quote: 'Around 40% of global employment is exposed to AI.', source: 'IMF', url: imf.url, year: 2024 },
  { quote: 'Generative AI could add $15.7 trillion to the global economy by 2030.', source: 'PwC', url: pwc.url, year: 2023 },
  { quote: 'AI could double annual economic growth rates by 2035.', source: 'Accenture', url: accenture.url, year: 2023 },
];
