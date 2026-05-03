import json
import os

print("Starting to update datasets...")

# Helper to read JSON
def read_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

# Helper to write JSON
def write_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

# -------- LLM Timeline Dataset --------
llm_path = 'src/data/LLM_Timeline_Dataset.json'
llm_data = read_json(llm_path)
llms = llm_data['models']

# New elements
new_llms = [
    {
        "company": "Anthropic",
        "company_website": "https://anthropic.com",
        "company_logo_url": "https://logo.clearbit.com/anthropic.com",
        "model_family": "Claude",
        "model_name": "Claude Mythos",
        "model_version": "Mythos",
        "model_type": "LLM",
        "architecture": "Transformer",
        "modalities": ["text", "vision", "computer use"],
        "parameters": None,
        "parameter_unit": None,
        "training_tokens": None,
        "open_source": False,
        "license": "Proprietary",
        "api_available": False,
        "context_window_tokens": 200000,
        "training_data_cutoff": "2026-02",
        "release_date": "2026-04-07",
        "country": "USA",
        "description": "Anthropic's most capable model to date. It has not been released to the public and is gated through Project Glasswing for cybersecurity use cases.",
        "use_cases": ["cybersecurity", "agentic autonomy", "research"],
        "notable_features": ["Project Glasswing gating", "Unprecedented cybersecurity capabilities", "Agentic orchestration"],
        "benchmark_scores": {},
        "pricing_per_1m_tokens": {"input": None, "output": None},
        "official_model_link": "https://anthropic.com/news",
        "huggingface_url": None,
        "paper_url": None,
        "predecessor": "Claude 3.5 Opus",
        "successor": None
    },
    {
        "company": "Meta",
        "company_website": "https://meta.com",
        "company_logo_url": "https://logo.clearbit.com/meta.com",
        "model_family": "Muse",
        "model_name": "Muse Spark",
        "model_version": "Spark",
        "model_type": "Multimodal Reasoning Model",
        "architecture": "Natively Multimodal Transformer",
        "modalities": ["text", "vision", "tool use"],
        "parameters": None,
        "parameter_unit": None,
        "training_tokens": None,
        "open_source": False,
        "license": "Proprietary",
        "api_available": True,
        "context_window_tokens": 128000,
        "training_data_cutoff": "2026-01",
        "release_date": "2026-04-08",
        "country": "USA",
        "description": "A natively multimodal reasoning model developed by Meta Superintelligence Labs with visual chain-of-thought processing and multi-agent orchestration.",
        "use_cases": ["reasoning", "multi-agent orchestration", "vision"],
        "notable_features": ["Natively multimodal", "Visual chain-of-thought", "Tool use"],
        "benchmark_scores": {},
        "pricing_per_1m_tokens": {"input": None, "output": None},
        "official_model_link": "https://meta.ai",
        "huggingface_url": None,
        "paper_url": None,
        "predecessor": "Llama 3.1",
        "successor": None
    },
    {
        "company": "Zhipu AI",
        "company_website": "https://zhipuai.cn",
        "company_logo_url": "https://logo.clearbit.com/zhipuai.cn",
        "model_family": "GLM",
        "model_name": "GLM-5.1",
        "model_version": "5.1",
        "model_type": "LLM (MoE)",
        "architecture": "Mixture of Experts (MoE)",
        "modalities": ["text", "coding"],
        "parameters": 744,
        "parameter_unit": "billion",
        "training_tokens": None,
        "open_source": True,
        "license": "MIT",
        "api_available": True,
        "context_window_tokens": 128000,
        "training_data_cutoff": "2026-01",
        "release_date": "2026-04-07",
        "country": "China",
        "description": "A 744-billion-parameter Mixture-of-Experts (MoE) model released under an MIT license, rivaling other leading frontier models in coding benchmarks.",
        "use_cases": ["coding", "general reasoning", "open-source development"],
        "notable_features": ["744B MoE architecture", "MIT Open Source", "SOTA coding performance"],
        "benchmark_scores": {},
        "pricing_per_1m_tokens": {"input": None, "output": None},
        "official_model_link": "https://zhipuai.cn",
        "huggingface_url": None,
        "paper_url": None,
        "predecessor": "GLM-4",
        "successor": None
    },
    {
        "company": "Google",
        "company_website": "https://google.com",
        "company_logo_url": "https://logo.clearbit.com/google.com",
        "model_family": "Gemma",
        "model_name": "Gemma 4",
        "model_version": "4.0",
        "model_type": "LLM",
        "architecture": "Transformer",
        "modalities": ["text"],
        "parameters": 27,
        "parameter_unit": "billion",
        "training_tokens": None,
        "open_source": True,
        "license": "Gemma License",
        "api_available": True,
        "context_window_tokens": 32000,
        "training_data_cutoff": "2026-01",
        "release_date": "2026-04-04",
        "country": "USA",
        "description": "Google's latest open-weight model family, aiming to provide powerful, accessible developer tools with best-in-class efficiency.",
        "use_cases": ["open-weights development", "edge computing", "research"],
        "notable_features": ["Highly efficient open-weights", "Developer focused"],
        "benchmark_scores": {},
        "pricing_per_1m_tokens": {"input": None, "output": None},
        "official_model_link": "https://ai.google.dev/gemma",
        "huggingface_url": None,
        "paper_url": None,
        "predecessor": "Gemma 3",
        "successor": None
    },
    {
        "company": "Alibaba",
        "company_website": "https://alibabacloud.com",
        "company_logo_url": "https://logo.clearbit.com/alibaba.com",
        "model_family": "Qwen",
        "model_name": "Qwen 3.6-Plus",
        "model_version": "3.6-plus",
        "model_type": "Foundation LLM",
        "architecture": "Transformer",
        "modalities": ["text", "coding"],
        "parameters": None,
        "parameter_unit": None,
        "training_tokens": None,
        "open_source": False,
        "license": "Proprietary",
        "api_available": True,
        "context_window_tokens": 1000000,
        "training_data_cutoff": "2026-02",
        "release_date": "2026-04-03",
        "country": "China",
        "description": "An upgraded version of the Qwen 3 series focused on extremely powerful agentic coding capabilities heavily utilizing a 1-million token context window.",
        "use_cases": ["agentic coding", "long-context analysis", "enterprise AI"],
        "notable_features": ["1M token context window", "Advanced agentic coding loop"],
        "benchmark_scores": {},
        "pricing_per_1m_tokens": {"input": None, "output": None},
        "official_model_link": "https://qwenlm.github.io/",
        "huggingface_url": None,
        "paper_url": None,
        "predecessor": "Qwen 3.5 Max",
        "successor": None
    },
    {
        "company": "OpenAI",
        "company_website": "https://openai.com",
        "company_logo_url": "https://logo.clearbit.com/openai.com",
        "model_family": "GPT",
        "model_name": "GPT-4 Turbo",
        "model_version": "gpt-4-1106-preview",
        "model_type": "LLM",
        "architecture": "Transformer (MoE)",
        "modalities": ["text", "vision"],
        "parameters": None,
        "parameter_unit": None,
        "training_tokens": None,
        "open_source": False,
        "license": "Proprietary",
        "api_available": True,
        "context_window_tokens": 128000,
        "training_data_cutoff": "2023-04",
        "release_date": "2023-11-06",
        "country": "USA",
        "description": "Released at OpenAI DevDay, GPT-4 Turbo offered a 128k context window, updated knowledge cutoff, and significantly lower pricing than the original GPT-4, solidifying it as the top-tier production API.",
        "use_cases": ["general reasoning", "coding", "software engineering"],
        "notable_features": ["128k Context limit", "JSON mode", "Lower pricing"],
        "benchmark_scores": {},
        "pricing_per_1m_tokens": {"input": 10, "output": 30},
        "official_model_link": "https://openai.com/index/new-models-and-developer-products-announced-at-devday",
        "huggingface_url": None,
        "paper_url": None,
        "predecessor": "GPT-4",
        "successor": "GPT-4o"
    },
    {
        "company": "xAI",
        "company_website": "https://x.ai",
        "company_logo_url": "https://logo.clearbit.com/x.ai",
        "model_family": "Grok",
        "model_name": "Grok-2",
        "model_version": "2.0",
        "model_type": "LLM",
        "architecture": "Transformer",
        "modalities": ["text", "vision"],
        "parameters": None,
        "parameter_unit": None,
        "training_tokens": None,
        "open_source": False,
        "license": "Proprietary",
        "api_available": True,
        "context_window_tokens": 131000,
        "training_data_cutoff": "2024-07",
        "release_date": "2024-08-13",
        "country": "USA",
        "description": "xAI's frontier model that matches or exceeds GPT-4o and Claude 3.5 Sonnet on major benhcmarks. Uniquely features real-time knowledge via the X platform.",
        "use_cases": ["chat", "coding", "real-time news"],
        "notable_features": ["Real-time data access", "FLUX.1 image generation", "State-of-the-art coding"],
        "benchmark_scores": {},
        "pricing_per_1m_tokens": {"input": None, "output": None},
        "official_model_link": "https://x.ai/blog/grok-2",
        "huggingface_url": None,
        "paper_url": None,
        "predecessor": "Grok-1.5",
        "successor": None
    }
]

# -------- AI Tools Dataset --------
tools_path = 'src/data/AI_Tools_Dataset.json'
tools_data = read_json(tools_path)
tools = tools_data['tools']

new_tools = [
    {
        "name": "Cursor 3",
        "company": "Anysphere",
        "release_date": "2026-04-02",
        "open_source": False,
        "license": "Proprietary",
        "category": "AI Code Editor",
        "description": "A major update to Cursor introducing a full agentic coding interface natively integrated into the IDE, enabling autonomous task completion workflows.",
        "key_features": ["Autonomous coding agent", "Deep codebase reasoning", "Agentic task execution"],
        "url": "https://cursor.com"
    },
    {
        "name": "Microsoft Agent Governance Toolkit",
        "company": "Microsoft",
        "release_date": "2026-04-05",
        "open_source": True,
        "license": "MIT",
        "category": "Compliance Tool",
        "description": "An open source compliance automation layer for enterprise AI products, mapping to the EU AI Act, HIPAA, and SOC2. Integrates with major LLM agent frameworks.",
        "key_features": ["EU AI Act compliance", "LangChain & Azure integration", "Compliance automation"],
        "url": "https://github.com/microsoft"
    },
    {
        "name": "Hugging Face Hub",
        "company": "Hugging Face",
        "release_date": "2019-10-01",
        "open_source": True,
        "license": "Apache 2.0",
        "category": "AI Model Repository",
        "description": "The central repository for open-source machine learning models, datasets, and applications, fundamentally accelerating the collaborative AI revolution.",
        "key_features": ["Model hosting", "Dataset repository", "Spaces / Gradio apps"],
        "url": "https://huggingface.co"
    },
    {
        "name": "Dify",
        "company": "Langgenius",
        "release_date": "2023-05-09",
        "open_source": True,
        "license": "Apache 2.0",
        "category": "LLM App Platform",
        "description": "An open-source LLM application development platform that simplifies creating workflows, agents, and RAG pipelines via a visual interface and robust APIs.",
        "key_features": ["Visual workflow builder", "BaaS for LLM apps", "Multi-model support"],
        "url": "https://dify.ai"
    }
]

# -------- Research Papers Dataset --------
papers_path = 'src/data/Research_Papers_Dataset.json'
papers_data = read_json(papers_path)
papers = papers_data['papers']

new_papers = [
    {
        "title": "AI Agent Traps: Vulnerabilities in Autonomous AI Navigation",
        "authors": ["Google DeepMind Research Team"],
        "institution": "Google DeepMind",
        "publication_date": "2026-04-06",
        "published_in": "Google DeepMind Security Report",
        "topic": "AI Security",
        "description": "Identified a class of vulnerabilities termed 'AI Agent Traps' where malicious web content exploits the gap between human-visible rendering and machine-parsed DOM to deceive autonomous agents.",
        "key_contributions": ["Identification of 6 trap vectors", "Content injection attacks", "Semantic manipulation against LLMs"],
        "paper_url": "https://deepmind.google/security",
        "code_url": None,
        "citations": 0
    },
    {
        "title": "Dynamic Reflections: Probing Video Representations with Text Alignment",
        "authors": ["DeepMind Vision-Language Team"],
        "institution": "Google DeepMind",
        "publication_date": "2026-04-13",
        "published_in": "arXiv",
        "topic": "Video Representation",
        "description": "A comprehensive study on how modern video foundation models represent and compress dynamic data through alignment with continuous text streams.",
        "key_contributions": ["Novel text-alignment probing technique", "Video compression heuristics", "Temporal consistency improvements"],
        "paper_url": "https://arxiv.org/abs/2604.XXXXX",
        "code_url": None,
        "citations": 0
    },
    {
        "title": "Industrial Policy for the Intelligence Age",
        "authors": ["OpenAI Policy team"],
        "institution": "OpenAI",
        "publication_date": "2026-04-06",
        "published_in": "OpenAI Policy Brief",
        "topic": "AI Policy & Economics",
        "description": "A major roadmap outlining recommendations for managing the transition to superintelligence, featuring concepts like a Public Wealth Fund and shorter workweeks to manage economic impacts.",
        "key_contributions": ["Roadmap to Superintelligence", "Public Wealth Fund proposal", "Economic mitigation strategies"],
        "paper_url": "https://openai.com/research/industrial-policy-for-the-intelligence-age",
        "code_url": None,
        "citations": 0
    }
]

def append_and_sort(current_list, new_list, date_key):
    # append
    current_list.extend(new_list)
    # sort
    current_list.sort(key=lambda x: x.get(date_key, "1970-01-01"))
    # reassign id sequentially
    for i, item in enumerate(current_list):
        item["id"] = i + 1
    return current_list

# Apply
llms = append_and_sort(llms, new_llms, 'release_date')
llm_data['models'] = llms
llm_data['metadata']['total_models'] = len(llms)
llm_data['metadata']['last_updated'] = "2026-04-14"

tools = append_and_sort(tools, new_tools, 'release_date')
tools_data['tools'] = tools
tools_data['metadata']['total_tools'] = len(tools)
tools_data['metadata']['last_updated'] = "2026-04-14"

papers = append_and_sort(papers, new_papers, 'publication_date')
papers_data['papers'] = papers
papers_data['metadata']['total_papers'] = len(papers)
papers_data['metadata']['last_updated'] = "2026-04-14"

# Write
write_json(llm_path, llm_data)
write_json(tools_path, tools_data)
write_json(papers_path, papers_data)

print(f"Update complete! LLMs: {len(llms)}, Tools: {len(tools)}, Papers: {len(papers)}")
