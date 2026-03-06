import { useState, useMemo } from 'react';
import { Nav } from '@/components/shared/Nav';
import { SEO } from '@/components/common/SEO';
import { TimelineHeader } from '@/components/timeline/TimelineHeader';
import { TimelineCanvas } from '@/components/timeline/TimelineCanvas';
import { TimelineTable } from '@/components/timeline/TimelineTable';
import { TimelinePopup } from '@/components/timeline/TimelinePopup';

import { TabType } from '@/components/timeline/TimelineHeader';
import timelineDataRaw from '@/data/LLM_Timeline_Dataset.json';
import papersDataRaw from '@/data/Research_Papers_Dataset.json';
import toolsDataRaw from '@/data/AI_Tools_Dataset.json';
import { LLMModel } from '@/utils/timeline';

// Ensure data matches our interface, and sort chronologically to assign natural serial number IDs
const processData = (rawData: any) => {
    const raw = (rawData.models || []).sort((a: any, b: any) => a.release_date.localeCompare(b.release_date));
    return raw.map((m: any, index: number) => ({
        ...m,
        id: index + 1,
        parameters: m.parameters !== undefined ? m.parameters : null,
        parameter_unit: m.parameter_unit || null,
        context_window_tokens: m.context_window_tokens || null,
        training_data_cutoff: m.training_data_cutoff || null,
        predecessor: m.predecessor || null,
        successor: m.successor || null,
    }));
};

const processPapersData = (rawData: any) => {
    const raw = (rawData.papers || []).sort((a: any, b: any) => a.publication_date.localeCompare(b.publication_date));
    return raw.map((p: any, index: number) => ({
        id: index + 1,
        company: p.institution || '',
        company_website: '',
        company_logo_url: '',
        model_family: 'Paper',
        model_name: p.title || '',
        model_version: '1.0',
        model_type: 'Research Paper',
        architecture: p.topic || '',
        modalities: ['text'],
        parameters: null,
        parameter_unit: null,
        training_tokens: null,
        open_source: true,
        license: '',
        api_available: false,
        context_window_tokens: null,
        training_data_cutoff: null,
        release_date: p.publication_date || '',
        country: '',
        description: p.description || '',
        use_cases: [],
        notable_features: [],
        benchmark_scores: {},
        pricing_per_1m_tokens: { input: null, output: null },
        official_model_link: null,
        huggingface_url: null,
        paper_url: p.paper_url || null,
        predecessor: null,
        successor: null,
        // Research Paper Ext
        title: p.title,
        authors: p.authors || [],
        institution: p.institution,
        published_in: p.published_in,
        topic: p.topic,
        key_contributions: p.key_contributions || [],
        citations: p.citations,
        code_url: p.code_url || null,
    }));
};

const processToolsData = (rawData: any) => {
    const raw = (rawData.tools || []).sort((a: any, b: any) => a.release_date.localeCompare(b.release_date));
    return raw.map((t: any, index: number) => ({
        id: index + 1,
        company: t.company || '',
        company_website: '',
        company_logo_url: '',
        model_family: 'AI Tool',
        model_name: t.name || '',
        model_version: '1.0',
        model_type: t.category || '',
        architecture: '',
        modalities: ['text', 'code'],
        parameters: null,
        parameter_unit: null,
        training_tokens: null,
        open_source: t.open_source !== undefined ? t.open_source : false,
        license: t.license || '',
        api_available: false,
        context_window_tokens: null,
        training_data_cutoff: null,
        release_date: t.release_date || '',
        country: '',
        description: t.description || '',
        use_cases: [],
        notable_features: t.key_features || [],
        benchmark_scores: {},
        pricing_per_1m_tokens: { input: null, output: null },
        official_model_link: t.url || null,
        huggingface_url: null,
        paper_url: null,
        predecessor: null,
        successor: null,
    }));
};

const timelineData: LLMModel[] = processData(timelineDataRaw);
const papersData: LLMModel[] = processPapersData(papersDataRaw);
const toolsData: LLMModel[] = processToolsData(toolsDataRaw);

export function Timeline() {
    const timelineStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        'name': 'LLM History & AI Models Dataset',
        'description': 'A comprehensive timeline of Large Language Models, AI research papers, and industrial AI tools from 2017 to present.',
        'keywords': ['LLM', 'AI Models', 'Transformer', 'Research Papers', 'AI Timeline'],
        'creator': {
            '@type': 'Organization',
            'name': 'AI Beacon Project',
        },
    };

    const [activeTab, setActiveTab] = useState<TabType>('models');

    // Top-level models processing
    const allModels = useMemo(() => {
        if (activeTab === 'models') return timelineData;
        if (activeTab === 'papers') return papersData;
        if (activeTab === 'tools') return toolsData;
        return timelineData;
    }, [activeTab]);

    const companies = useMemo(() => {
        const set = new Set(allModels.map(m => m.company));
        return Array.from(set).sort();
    }, [allModels]);

    // Filters state
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [activeModalities, setActiveModalities] = useState<string[]>([]);
    const [openSourceFilter, setOpenSourceFilter] = useState<'all' | 'open' | 'proprietary'>('all');
    const [yearRange, setYearRange] = useState<[number, number]>([2017, 2026]);

    // Cross-component Interaction State
    const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setSelectedModelId(null);
        setSelectedCompany(null);
        setActiveModalities([]);
        setOpenSourceFilter('all');
        const startYear = tab === 'papers' ? 2012 : 2017;
        setYearRange([startYear, 2026]);
    };

    const handleClearFilters = () => {
        setSelectedCompany(null);
        setActiveModalities([]);
        setOpenSourceFilter('all');
        const startYear = activeTab === 'papers' ? 2012 : 2017;
        setYearRange([startYear, 2026]);
    };

    // Apply Filters
    const filteredModelIds = useMemo(() => {
        const ids = new Set<number>();
        for (const model of allModels) {
            // Apply filters ONLY if we are in the 'models' tab since the UI only exposes them there.
            if (activeTab === 'models') {
                // Company
                if (selectedCompany && model.company !== selectedCompany) continue;

                // Modality
                if (activeModalities.length > 0) {
                    const hasAll = activeModalities.every(mod => model.modalities.includes(mod));
                    if (!hasAll) continue;
                }

                // Open Source
                if (openSourceFilter === 'open' && !model.open_source) continue;
                if (openSourceFilter === 'proprietary' && model.open_source) continue;

                // Year Range
                const releaseYear = parseInt(model.release_date.substring(0, 4));
                if (releaseYear < yearRange[0] || releaseYear > yearRange[1]) continue;
            }

            ids.add(model.id);
        }
        return ids;
    }, [activeTab, allModels, selectedCompany, activeModalities, openSourceFilter, yearRange]);

    const filteredModels = useMemo(() => {
        return allModels.filter(m => filteredModelIds.has(m.id));
    }, [allModels, filteredModelIds]);

    const selectedModel = useMemo(() => {
        return allModels.find(m => m.id === selectedModelId) || null;
    }, [allModels, selectedModelId]);

    const handleNavigate = (modelName: string) => {
        const nextModel = allModels.find(m => m.model_name === modelName);
        if (nextModel) {
            setSelectedModelId(nextModel.id);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
            <SEO
                title="AI Timeline"
                description="Interactive history of AI models, research papers, and tools. From the Transformer paper to GPT-4o."
                structuredData={timelineStructuredData}
            />
            <Nav activeRoute="/timeline" />

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="depth-container" style={{ paddingTop: 'var(--s6)' }}>
                    <TimelineHeader
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        models={allModels}
                        filteredModels={filteredModels}
                        selectedCompany={selectedCompany}
                        onCompanyChange={setSelectedCompany}
                        activeModalities={activeModalities}
                        onModalitiesChange={setActiveModalities}
                        openSourceFilter={openSourceFilter}
                        onOpenSourceChange={setOpenSourceFilter}
                        yearRange={yearRange}
                        onYearRangeChange={setYearRange}
                        companies={companies}
                    />
                </div>

                <TimelineCanvas
                    activeTab={activeTab}
                    models={allModels}
                    filteredModelIds={filteredModelIds}
                    selectedModelId={selectedModelId}
                    onModelSelect={setSelectedModelId}
                />

                <div className="depth-container">
                    <TimelineTable
                        activeTab={activeTab}
                        models={allModels}
                        filteredModelIds={filteredModelIds}
                        selectedModelId={selectedModelId}
                        onModelSelect={setSelectedModelId}
                        onClearFilters={handleClearFilters}
                    />
                </div>
            </main>

            <TimelinePopup
                activeTab={activeTab}
                model={selectedModel}
                totalModelsCount={allModels.length}
                onClose={() => setSelectedModelId(null)}
                onNavigate={handleNavigate}
            />
        </div>
    );
}
