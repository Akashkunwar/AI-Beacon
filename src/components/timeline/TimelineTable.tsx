import { useState, useMemo } from 'react';
import { LLMModel, formatParams, formatContextWindow, formatDate } from '@/utils/timeline';
import { TabType } from '@/components/timeline/TimelineHeader';

interface TimelineTableProps {
    activeTab: TabType;
    models: LLMModel[];
    filteredModelIds: Set<number>;
    selectedModelId: number | null;
    onModelSelect: (id: number) => void;
    onClearFilters?: () => void;
}

type SortOption = 'Release Date ↓' | 'Release Date ↑' | 'Parameters ↓' | 'Company A–Z' | 'Company Z–A';

export function TimelineTable({ activeTab, models, filteredModelIds, selectedModelId, onModelSelect, onClearFilters }: TimelineTableProps) {
    const [sortOption, setSortOption] = useState<SortOption>('Release Date ↓');

    const filteredModels = useMemo(() => {
        return models.filter(m => filteredModelIds.has(m.id));
    }, [models, filteredModelIds]);

    const sortedModels = useMemo(() => {
        const sorted = [...filteredModels];
        switch (sortOption) {
            case 'Release Date ↓':
                sorted.sort((a, b) => b.release_date.localeCompare(a.release_date));
                break;
            case 'Release Date ↑':
                sorted.sort((a, b) => a.release_date.localeCompare(b.release_date));
                break;
            case 'Parameters ↓':
                sorted.sort((a, b) => {
                    // Convert to absolute numbers for sorting. Assumes units are million/billion.
                    const getVal = (m: LLMModel) => {
                        if (m.parameters === null) return 0;
                        if (m.parameter_unit === 'billion') return m.parameters * 1000;
                        return m.parameters;
                    };
                    return getVal(b) - getVal(a);
                });
                break;
            case 'Company A–Z':
                sorted.sort((a, b) => a.company.localeCompare(b.company));
                break;
            case 'Company Z–A':
                sorted.sort((a, b) => b.company.localeCompare(a.company));
                break;
        }
        return sorted;
    }, [filteredModels, sortOption]);

    const cycleSort = () => {
        const cycle: SortOption[] = [
            'Release Date ↓', 'Release Date ↑', 'Parameters ↓', 'Company A–Z', 'Company Z–A'
        ];
        const nextIdx = (cycle.indexOf(sortOption) + 1) % cycle.length;
        setSortOption(cycle[nextIdx]);
    };

    return (
        <section style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', paddingBottom: 'var(--s8)' }}>

            {/* Table Header Row */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 'var(--s4)'
            }}>
                <div>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-md)',
                        color: 'var(--ink)'
                    }}>
                        {activeTab === 'papers' ? 'ALL PAPERS' : activeTab === 'tools' ? 'ALL TOOLS' : 'ALL MODELS'}
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                        marginTop: '2px'
                    }}>
                        {filteredModels.length} {activeTab === 'papers' ? 'papers' : activeTab === 'tools' ? 'tools' : 'models'}
                    </div>
                </div>

                <button
                    onClick={cycleSort}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--secondary)'
                    }}
                >
                    Sort by: <span style={{ color: 'var(--ink)' }}>{sortOption}</span>
                </button>
            </div>

            {/* Table */}
            <div style={{
                width: '100%',
                overflowX: 'auto',
                border: '1px solid var(--table-border)',
                borderRadius: 'var(--r-lg)',
                background: 'var(--bg)'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    minWidth: '800px'
                }}>
                    <thead>
                        <tr style={{
                            background: 'var(--table-header-bg)',
                            borderBottom: '1px solid var(--table-border)'
                        }}>
                            <th style={thStyle}>#</th>
                            {activeTab === 'papers' ? (
                                <>
                                    <th style={thStyle}>Title</th>
                                    <th style={thStyle}>Authors</th>
                                    <th style={thStyle}>Institution</th>
                                    <th style={thStyle}>Topic</th>
                                    <th style={thStyle}>Citations</th>
                                    <th style={thStyle}>Published In</th>
                                </>
                            ) : (
                                <>
                                    <th style={thStyle}>Model</th>
                                    <th style={thStyle}>Company</th>
                                    <th style={thStyle}>Type</th>
                                    <th style={thStyle}>Params</th>
                                    <th style={thStyle}>Context</th>
                                    <th style={thStyle}>Modalities</th>
                                    <th style={thStyle}>Open</th>
                                </>
                            )}
                            <th style={thStyle}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedModels.map((model) => {
                            const isActive = selectedModelId === model.id;
                            return (
                                <tr
                                    key={model.id}
                                    onClick={() => onModelSelect(model.id)}
                                    role="row"
                                    aria-selected={isActive}
                                    className={`timeline-row ${isActive ? 'active' : ''}`}
                                >
                                    <td style={{ ...tdStyle, width: '40px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                                        {model.id}
                                    </td>
                                    {activeTab === 'papers' ? (
                                        <>
                                            <td style={{ ...tdStyle, fontFamily: 'var(--font-sans)', fontWeight: 'var(--weight-medium)', color: 'var(--ink)' }}>
                                                {model.title || model.model_name}
                                            </td>
                                            <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: 'var(--secondary)' }}>
                                                {model.authors && model.authors.length > 2 ? `${model.authors[0]} et al.` : (model.authors?.join(', ') || '—')}
                                            </td>
                                            <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: 'var(--muted)', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {model.institution || '—'}
                                            </td>
                                            <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>
                                                {model.topic || '—'}
                                            </td>
                                            <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: 'var(--secondary)' }}>
                                                {model.citations?.toLocaleString() || '—'}
                                            </td>
                                            <td style={{ ...tdStyle }}>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'calc(var(--text-2xs) - 1px)', color: 'var(--muted)' }}>{model.published_in || '—'}</span>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td style={{ ...tdStyle, fontFamily: 'var(--font-sans)', fontWeight: 'var(--weight-medium)', color: 'var(--ink)' }}>
                                                {model.model_name}
                                            </td>
                                            <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: 'var(--secondary)' }}>
                                                {model.company}
                                            </td>
                                            <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: 'var(--muted)', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {model.model_type}
                                            </td>
                                            <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>
                                                {formatParams(model.parameters, model.parameter_unit)}
                                            </td>
                                            <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: 'var(--secondary)' }}>
                                                {formatContextWindow(model.context_window_tokens, 'short')}
                                            </td>
                                            <td style={{ ...tdStyle }}>
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    {model.modalities.map(m => (
                                                        <span key={m} style={miniPillStyle}>{m}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                                                {model.open_source ? '●' : '○'}
                                            </td>
                                        </>
                                    )}
                                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                                        {formatDate(model.release_date, 'short')}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Table Footer */}
            <div style={{
                paddingTop: 'var(--s4)',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--muted)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 'var(--s3)'
            }}>
                Showing {sortedModels.length} of {models.length} {activeTab === 'papers' ? 'papers' : activeTab === 'tools' ? 'tools' : 'models'}
                {filteredModels.length < models.length && (
                    <button
                        onClick={onClearFilters}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--ink)', textDecoration: 'underline',
                            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)'
                        }}
                    >
                        × Clear all filters
                    </button>
                )}
            </div>

            <style>{`
                .timeline-row {
                    height: 48px;
                    border-bottom: 1px solid var(--table-border);
                    cursor: pointer;
                    transition: background var(--dur-fast) var(--ease-out);
                }
                .timeline-row:hover {
                    background: var(--table-row-hover);
                }
                .timeline-row.active {
                    background: var(--table-row-active);
                }
            `}</style>
        </section>
    );
}

const thStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-wider)',
    padding: 'var(--s2) var(--s4)',
    fontWeight: 'normal'
};

const tdStyle: React.CSSProperties = {
    fontSize: 'var(--text-xs)',
    padding: '0 var(--s4)',
    verticalAlign: 'middle'
};

const miniPillStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'calc(var(--text-2xs) - 1px)',
    background: 'var(--bg-raised)',
    borderRadius: 'var(--r-pill)',
    padding: '1px 6px',
    color: 'var(--secondary)',
};
