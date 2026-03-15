import { LLMModel } from '@/utils/timeline';

export type TabType = 'models' | 'papers' | 'tools';

interface TimelineHeaderProps {
    models: LLMModel[];
    filteredModels: LLMModel[];
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    // Filters state
    selectedCompany: string | null;
    onCompanyChange: (c: string | null) => void;
    activeModalities: string[];
    onModalitiesChange: (m: string[]) => void;
    openSourceFilter: 'all' | 'open' | 'proprietary';
    onOpenSourceChange: (f: 'all' | 'open' | 'proprietary') => void;
    yearRange: [number, number];
    onYearRangeChange: (r: [number, number]) => void;
    // Options
    companies: string[];
}

export function TimelineHeader({
    models,
    filteredModels,
    activeTab,
    onTabChange,
    selectedCompany,
    onCompanyChange,
    activeModalities,
    onModalitiesChange,
    openSourceFilter,
    onOpenSourceChange,
    yearRange,
    onYearRangeChange,
    companies
}: TimelineHeaderProps) {
    const isFiltered =
        selectedCompany !== null ||
        activeModalities.length > 0 ||
        openSourceFilter !== 'all' ||
        yearRange[0] !== 2017 ||
        yearRange[1] !== 2026;

    const handleReset = () => {
        onCompanyChange(null);
        onModalitiesChange([]);
        onOpenSourceChange('all');
        const startYear = activeTab === 'papers' ? 2012 : 2017;
        onYearRangeChange([startYear, 2026]);
    };

    const toggleModality = (m: string) => {
        if (activeModalities.includes(m)) {
            onModalitiesChange(activeModalities.filter(mod => mod !== m));
        } else {
            onModalitiesChange([...activeModalities, m]);
        }
    };

    // Derived stats
    const uniqueCompanies = new Set(filteredModels.map(m => m.company)).size;

    const title = activeTab === 'models' ? "Every model. Every milestone. In order."
        : activeTab === 'papers' ? "The fundamental research. Papers that revolutionized AI."
            : "Essential AI tools. Building the modern ecosystem.";

    const description = activeTab === 'models' ? `${models.length} models from 2017 to 2026. Scroll to explore the full arc of modern AI. Click any model for the complete picture.`
        : activeTab === 'papers' ? `Major research papers that transformed machine learning. From the Transformer to scaling laws.`
            : `Tools and software redefining how we code and interact with AI. Featuring Cursor, CodeRabbit, and more.`;

    return (
        <section
            style={{
                paddingBottom: 'var(--s6)',
                borderBottom: '1px solid var(--stroke)',
                width: '100%'
            }}
        >
            <div style={{
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                fontSize: 'var(--text-xs)',
                marginBottom: 'var(--s4)'
            }}>
                MODULE 04 — AI PROGRESS TIMELINE
            </div>

            {/* TABS */}
            <div
                role="tablist"
                aria-label="Dataset selection"
                style={{
                    display: 'inline-flex',
                    gap: '4px',
                    marginBottom: 'var(--s6)',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--r-pill)',
                    padding: '4px',
                }}
            >
                <TabButton active={activeTab === 'models'} onClick={() => onTabChange('models')}>AI Models</TabButton>
                <TabButton active={activeTab === 'papers'} onClick={() => onTabChange('papers')}>Research Papers</TabButton>
                <TabButton active={activeTab === 'tools'} onClick={() => onTabChange('tools')}>AI Tools</TabButton>
            </div>

            <h1 style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--weight-semibold)',
                letterSpacing: 'var(--tracking-tight)',
                lineHeight: 'var(--lead-tight)',
                color: 'var(--ink)',
                marginBottom: 'var(--s2)',
                transition: 'opacity var(--dur-fast) var(--ease-out)',
            }}>
                {title}
            </h1>

            <p style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-light)',
                color: 'var(--secondary)',
                maxWidth: '54ch',
                lineHeight: 'var(--lead-body)',
                marginBottom: 'var(--s5)',
                transition: 'opacity var(--dur-fast) var(--ease-out)',
            }}>
                {description}
            </p>

            {/* Stats Row */}
            <div style={{
                display: 'flex',
                gap: 'var(--s3)',
                flexWrap: 'wrap',
                marginBottom: 'var(--s4)'
            }}>
                <StatChip text={`${filteredModels.length} ${activeTab === 'papers' ? 'papers' : activeTab === 'tools' ? 'tools' : 'models'}`} />
                <StatChip text={`${uniqueCompanies} ${activeTab === 'papers' ? 'institutions' : 'companies'}`} />
                <StatChip text={`${yearRange[0]} — ${yearRange[1]}`} />
                <StatChip text={`${yearRange[1] - yearRange[0]} years of progress`} />
            </div>

            {/* Filters Row */}
            {activeTab === 'models' && (
                <div style={{
                    display: 'flex',
                    gap: 'var(--s4)',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    {/* Filter 1: Company */}
                    <select
                        value={selectedCompany || ''}
                        onChange={(e) => onCompanyChange(e.target.value || null)}
                        style={dropdownStyle}
                        aria-label="Filter by company"
                    >
                        <option value="">All companies</option>
                        {companies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {/* Filter 2: Modality */}
                    <div style={filterGroupStyle}>
                        <TogglePill
                            active={activeModalities.length === 0}
                            onClick={() => onModalitiesChange([])}
                        >
                            All
                        </TogglePill>
                        {['text', 'vision', 'audio', 'video'].map(m => (
                            <TogglePill
                                key={m}
                                active={activeModalities.includes(m)}
                                onClick={() => toggleModality(m)}
                            >
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </TogglePill>
                        ))}
                    </div>

                    {/* Filter 3: Open Source */}
                    <div style={filterGroupStyle}>
                        <TogglePill
                            active={openSourceFilter === 'all'}
                            onClick={() => onOpenSourceChange('all')}
                        >
                            All
                        </TogglePill>
                        <TogglePill
                            active={openSourceFilter === 'open'}
                            onClick={() => onOpenSourceChange('open')}
                        >
                            Open source only
                        </TogglePill>
                        <TogglePill
                            active={openSourceFilter === 'proprietary'}
                            onClick={() => onOpenSourceChange('proprietary')}
                        >
                            Proprietary only
                        </TogglePill>
                    </div>

                    {/* Filter 4: Year Range Slider Placeholder or simple inputs */}
                    <div style={{ ...filterGroupStyle, gap: 'var(--s2)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--secondary)' }}>
                            {yearRange[0]} — {yearRange[1]}
                        </span>
                        <input
                            type="range"
                            min={2017} max={2026} step={1}
                            value={yearRange[0]}
                            onChange={(e) => onYearRangeChange([Number(e.target.value), Math.max(Number(e.target.value), yearRange[1])])}
                            style={{ width: '80px', accentColor: 'var(--ink)' }}
                            aria-label="Start year"
                        />
                        <input
                            type="range"
                            min={2017} max={2026} step={1}
                            value={yearRange[1]}
                            onChange={(e) => onYearRangeChange([Math.min(yearRange[0], Number(e.target.value)), Number(e.target.value)])}
                            style={{ width: '80px', accentColor: 'var(--ink)' }}
                            aria-label="End year"
                        />
                    </div>

                    {/* Reset Filters */}
                    {isFiltered && (
                        <button
                            onClick={handleReset}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                                color: 'var(--muted)',
                                textDecoration: 'underline',
                                textUnderlineOffset: '3px',
                                marginLeft: 'auto'
                            }}
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}

// Subcomponents

function StatChip({ text }: { text: string }) {
    return (
        <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--secondary)',
            background: 'var(--bg-panel)',
            border: '1px solid var(--stroke)',
            borderRadius: 'var(--r-pill)',
            padding: 'var(--s2) var(--s5)',
        }}>
            {text}
        </div>
    );
}

function TabButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
    return (
        <button
            role="tab"
            aria-selected={active}
            onClick={onClick}
            style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                fontWeight: active ? 'var(--weight-medium)' : 'var(--weight-regular)',
                color: active ? 'var(--text-inverse)' : 'var(--secondary)',
                background: active ? 'var(--bg-inverse)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--r-pill)',
                padding: 'var(--s2) var(--s5)',
                cursor: 'pointer',
                transition: 'all var(--dur-fast) var(--ease-out)',
                whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
                if (!active) {
                    e.currentTarget.style.background = 'var(--bg-raised)';
                    e.currentTarget.style.color = 'var(--ink)';
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--secondary)';
                }
            }}
        >
            {children}
        </button>
    );
}

function TogglePill({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                background: active ? 'var(--ink)' : 'var(--bg-panel)',
                color: active ? 'var(--text-inverse)' : 'var(--secondary)',
                border: `1px solid ${active ? 'var(--ink)' : 'var(--stroke)'}`,
                borderRadius: 'var(--r-pill)',
                padding: 'var(--s1) var(--s3)',
                cursor: 'pointer',
                transition: 'all var(--dur-fast) var(--ease-out)',
            }}
        >
            {children}
        </button>
    );
}

const dropdownStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-sm)',
    color: 'var(--ink)',
    background: 'var(--bg-panel)',
    border: '1px solid var(--stroke)',
    borderRadius: 'var(--r-pill)',
    padding: 'var(--s1) var(--s3)',
    cursor: 'pointer',
    outline: 'none',
};

const filterGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    alignItems: 'center'
};
