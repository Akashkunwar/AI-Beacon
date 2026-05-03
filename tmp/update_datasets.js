import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const toolsPath = '/Users/kunwar/Documents/Code/AiViz/src/data/AI_Tools_Dataset.json';
const modelsPath = '/Users/kunwar/Documents/Code/AiViz/src/data/LLM_Timeline_Dataset.json';
const papersPath = '/Users/kunwar/Documents/Code/AiViz/src/data/Research_Papers_Dataset.json';

// Helper to update and sort
function updateDataset(path, key, newEntries, dateKey) {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    
    // Add new entries, avoiding duplicates by name
    newEntries.forEach(entry => {
        const exists = data[key].some(e => (e.name || e.model_name || e.title) === (entry.name || entry.model_name || entry.title));
        if (!exists) {
            data[key].push(entry);
        }
    });

    // Sort by date
    data[key].sort((a, b) => new Date(a[dateKey]) - new Date(b[dateKey]));

    // Re-assign IDs
    data[key].forEach((entry, index) => {
        entry.id = index + 1;
    });

    // Update metadata
    data.metadata.last_updated = new Date().toISOString().split('T')[0];
    if (data.metadata.total_tools !== undefined) data.metadata.total_tools = data[key].length;
    if (data.metadata.total_models !== undefined) data.metadata.total_models = data[key].length;
    if (data.metadata.total_papers !== undefined) data.metadata.total_papers = data[key].length;

    fs.writeFileSync(path, JSON.stringify(data, null, 4));
    console.log(`Updated ${path}: Total ${key} = ${data[key].length}`);
}

// 1. New Tools
const newTools = [
    {
        "name": "Claude Code",
        "company": "Anthropic",
        "release_date": "2026-03-24",
        "open_source": false,
        "license": "Proprietary",
        "category": "AI Code Assistant",
        "description": "An agentic coding terminal tool that interacts directly with your codebase, capable of handling multi-step agentic workflows and large-scale refactors autonomously.",
        "key_features": ["Terminal agentic workflow", "Deep codebase context", "Effort controls"],
        "url": "https://anthropic.com/claude-code"
    },
    {
        "name": "JetBrains Agent Client Protocol",
        "company": "JetBrains",
        "release_date": "2026-03-26",
        "open_source": false,
        "license": "Proprietary",
        "category": "AI Development Ecosystem",
        "description": "Introduced with CLion 2026.1, a unified protocol enabling developers to seamlessly swap out different AI agents (like GitHub Copilot, Cursor, etc.) within their preferred JetBrains IDE.",
        "key_features": ["Agent Client Protocol", "Open ecosystem", "Seamless multi-model usage"],
        "url": "https://jetbrains.com"
    },
    {
        "name": "OpenCode",
        "company": "OpenCode Project",
        "release_date": "2026-03-28",
        "open_source": true,
        "license": "Apache 2.0",
        "category": "Autonomous AI Software Engineer",
        "description": "An open-source AI coding agent designed to handle complex development tasks across large codebases, providing a robust, extensible alternative to proprietary systems.",
        "key_features": ["Open-source SWE agent", "Extensible tool system", "Multi-model support"],
        "url": "https://opencode.ai"
    },
    {
        "name": "Augment Code",
        "company": "Augment",
        "release_date": "2025-09-01",
        "open_source": false,
        "license": "Proprietary",
        "category": "AI Code Assistant",
        "description": "An enterprise-grade AI coding assistant that focuses on deep codebase understanding and high-performance, context-aware suggestions.",
        "key_features": ["Codebase-wide context", "High-performance inference", "Enterprise security"],
        "url": "https://augmentcode.com"
    }
];

// 2. New Models
const newModels = [
    {
        "company": "OpenAI",
        "company_website": "https://openai.com",
        "company_logo_url": "https://logo.clearbit.com/openai.com",
        "model_family": "GPT",
        "model_name": "GPT-5.4 Pro",
        "model_version": "5.4-pro",
        "model_type": "Foundation LLM",
        "architecture": "MoE",
        "modalities": ["text", "image", "audio", "video"],
        "parameters": null,
        "parameter_unit": null,
        "training_tokens": null,
        "open_source": false,
        "license": "Proprietary",
        "api_available": true,
        "context_window_tokens": 1000000,
        "training_data_cutoff": "2026-01",
        "release_date": "2026-03-25",
        "country": "USA",
        "description": "The top-tier version of the GPT-5.4 series, offering the highest level of reasoning, multimodal synthesis, and agentic autonomy.",
        "use_cases": ["frontier research", "complex agentic autonomy", "multimodal synthesis"],
        "notable_features": ["1M context window", "Advanced reasoning", "Native computer use"],
        "benchmark_scores": {},
        "pricing_per_1m_tokens": {"input": null, "output": null},
        "official_model_link": "https://openai.com",
        "huggingface_url": null,
        "paper_url": null,
        "predecessor": "GPT-5.4",
        "successor": null
    },
    {
        "company": "Alibaba",
        "company_website": "https://alibabacloud.com",
        "company_logo_url": "https://logo.clearbit.com/alibaba.com",
        "model_family": "Qwen",
        "model_name": "Qwen 3.5 Max",
        "model_version": "3.5-max",
        "model_type": "Foundation LLM",
        "architecture": "Transformer",
        "modalities": ["text", "coding"],
        "parameters": 397,
        "parameter_unit": "billion",
        "training_tokens": null,
        "open_source": true,
        "license": "Apache 2.0",
        "api_available": true,
        "context_window_tokens": 256000,
        "training_data_cutoff": "2026-02",
        "release_date": "2026-03-24",
        "country": "China",
        "description": "The largest and most capable model in the Qwen 3.5 series, outperforming many proprietary models in reasoning, math, and code.",
        "use_cases": ["advanced reasoning", "math", "code"],
        "notable_features": ["Open weights", "SOTA in math and code"],
        "benchmark_scores": {},
        "pricing_per_1m_tokens": {"input": null, "output": null},
        "official_model_link": "https://qwenlm.github.io/",
        "huggingface_url": null,
        "paper_url": null,
        "predecessor": "Qwen 2.5",
        "successor": null
    },
    {
        "company": "Mistral AI",
        "company_website": "https://mistral.ai",
        "company_logo_url": "https://logo.clearbit.com/mistral.ai",
        "model_family": "Mistral",
        "model_name": "Mistral Large 4",
        "model_version": "4",
        "model_type": "LLM (MoE)",
        "architecture": "Mixture-of-Experts",
        "modalities": ["text", "vision"],
        "parameters": null,
        "parameter_unit": null,
        "training_tokens": null,
        "open_source": false,
        "license": "Proprietary",
        "api_available": true,
        "context_window_tokens": 128000,
        "training_data_cutoff": "2026-01",
        "release_date": "2026-03-26",
        "country": "France",
        "description": "The next-generation flagship model from Mistral AI, featuring improved reasoning, multimodal capabilities, and advanced instruction following.",
        "use_cases": ["enterprise support", "multimodal analysis", "coding"],
        "notable_features": ["Advanced MoE", "Native vision support", "SOTA reasoning"],
        "benchmark_scores": {},
        "pricing_per_1m_tokens": {"input": null, "output": null},
        "official_model_link": "https://mistral.ai",
        "huggingface_url": null,
        "paper_url": null,
        "predecessor": "Mistral Large 3",
        "successor": null
    }
];

// 3. New Papers
const newPapers = [
    {
        "title": "DeepAnalyze: Autonomous Data Science via Agentic LLMs",
        "authors": ["Research Collaboration"],
        "institution": "Various Labs",
        "publication_date": "2026-03-15",
        "published_in": "arXiv",
        "topic": "Autonomous Agents",
        "description": "Explores a comprehensive framework for LLM-driven autonomous data science, introducing agents capable of end-to-end data pipeline operations on par with junior engineers in the MLE-bench.",
        "key_contributions": ["End-to-end pipeline automation", "Self-correcting data imputation steps", "State-of-the-art on MLE-bench"],
        "paper_url": "https://arxiv.org",
        "code_url": null,
        "citations": 0
    },
    {
        "title": "Kosmos: An AI Scientist for Autonomous Discovery",
        "authors": ["AI Research Initiative"],
        "institution": "Open Research Labs",
        "publication_date": "2026-03-21",
        "published_in": "arXiv",
        "topic": "AI Scientist",
        "description": "Presents an AI agent capable of coordinating literature searches, hypothesis generation, and data analysis to generate traceable, novel scientific discoveries.",
        "key_contributions": ["Hypothesis generation framework", "Literature mapping API", "Traceable agentic steps"],
        "paper_url": "https://arxiv.org",
        "code_url": null,
        "citations": 0
    },
    {
        "title": "The Triadic Cognitive Architecture",
        "authors": ["Agentic AI Lab"],
        "institution": "Independent",
        "publication_date": "2026-03-26",
        "published_in": "arXiv",
        "topic": "Cognitive Architectures",
        "description": "Focuses on building robust autonomous actions through spatio-temporal and epistemic friction, providing a novel framework for controlling and aligning advanced agents.",
        "key_contributions": ["Spatio-temporal alignment models", "Epistemic friction introduction", "Robust real-world autonomy"],
        "paper_url": "https://arxiv.org",
        "code_url": null,
        "citations": 0
    }
];

// Add historical missing Llama and Claude models if not present
const historicalModels = [
    {
        "company": "Meta",
        "company_website": "https://meta.com",
        "company_logo_url": "https://logo.clearbit.com/meta.com",
        "model_family": "Llama",
        "model_name": "Llama 3.1",
        "model_version": "3.1",
        "model_type": "Foundation LLM",
        "architecture": "Transformer",
        "modalities": ["text"],
        "parameters": 405,
        "parameter_unit": "billion",
        "training_tokens": 15000,
        "open_source": true,
        "license": "Llama 3.1 License",
        "api_available": true,
        "context_window_tokens": 128000,
        "training_data_cutoff": "2023-12",
        "release_date": "2024-07-23",
        "country": "USA",
        "description": "The first open-weight model to rival GPT-4o in reasoning and benchmarks, featuring a massive 405B parameter version.",
        "use_cases": ["local development", "open research", "high-end reasoning"],
        "notable_features": ["405B parameters", "Advanced reasoning", "Extensive context window"],
        "benchmark_scores": {},
        "pricing_per_1m_tokens": null,
        "official_model_link": "https://llama.meta.com",
        "huggingface_url": "https://huggingface.co/meta-llama/Llama-3.1-405B",
        "paper_url": null,
        "predecessor": "Llama 3",
        "successor": "Llama 3.2"
    },
    {
        "company": "Meta",
        "company_website": "https://meta.com",
        "company_logo_url": "https://logo.clearbit.com/meta.com",
        "model_family": "Llama",
        "model_name": "Llama 3.2",
        "model_version": "3.2",
        "model_type": "Multimodal LLM",
        "architecture": "Transformer",
        "modalities": ["text", "vision"],
        "parameters": 90,
        "parameter_unit": "billion",
        "training_tokens": null,
        "open_source": true,
        "license": "Llama 3.2 License",
        "api_available": true,
        "context_window_tokens": 128000,
        "training_data_cutoff": "2023-12",
        "release_date": "2024-09-25",
        "country": "USA",
        "description": "Introduced native vision capabilities and edge-optimized small models to the Llama family.",
        "use_cases": ["on-device AI", "vision understanding", "multimodal reasoning"],
        "notable_features": ["Vision support", "Edge-optimized models"],
        "benchmark_scores": {},
        "pricing_per_1m_tokens": null,
        "official_model_link": "https://llama.meta.com",
        "huggingface_url": "https://huggingface.co/meta-llama/Llama-3.2-90B-Vision",
        "paper_url": null,
        "predecessor": "Llama 3.1",
        "successor": null
    },
    {
        "company": "Anthropic",
        "company_website": "https://anthropic.com",
        "company_logo_url": "https://logo.clearbit.com/anthropic.com",
        "model_family": "Claude",
        "model_name": "Claude 3.5 Sonnet",
        "model_version": "3.5",
        "model_type": "Foundation LLM",
        "architecture": "Transformer",
        "modalities": ["text", "vision"],
        "parameters": null,
        "parameter_unit": null,
        "training_tokens": null,
        "open_source": false,
        "license": "Proprietary",
        "api_available": true,
        "context_window_tokens": 200000,
        "training_data_cutoff": "2024-04",
        "release_date": "2024-06-20",
        "country": "USA",
        "description": "A breakthrough model that outperformed GPT-4o on several coding and reasoning benchmarks, setting a new industry standard for intelligence and speed.",
        "use_cases": ["coding", "complex reasoning", "visual analysis"],
        "notable_features": ["Industry-leading coding", "High speed", "Visual reasoning"],
        "benchmark_scores": {},
        "pricing_per_1m_tokens": null,
        "official_model_link": "https://anthropic.com/claude",
        "huggingface_url": null,
        "paper_url": null,
        "predecessor": "Claude 3 Opus",
        "successor": "Claude 3.5 Sonnet v2"
    }
];

// Run updates
updateDataset(toolsPath, 'tools', newTools, 'release_date');
updateDataset(modelsPath, 'models', [...newModels, ...historicalModels], 'release_date');
updateDataset(papersPath, 'papers', newPapers, 'publication_date');
