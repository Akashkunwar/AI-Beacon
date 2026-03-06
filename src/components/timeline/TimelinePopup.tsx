import { useEffect } from 'react';
import { LLMModel, formatParams, formatContextWindow, formatDate, formatCutoff } from '@/utils/timeline';
import { TabType } from '@/components/timeline/TimelineHeader';

interface TimelinePopupProps {
    activeTab: TabType;
    model: LLMModel | null;
    onClose: () => void;
    onNavigate: (modelName: string) => void;
    totalModelsCount: number;
}

export function TimelinePopup({ activeTab, model, onClose, onNavigate, totalModelsCount }: TimelinePopupProps) {
    // ESC listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (model) {
            window.addEventListener('keydown', handleKeyDown);
            // Ideally also focus trap inside, but keeping it simple for now
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [model, onClose]);

    if (!model) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--z-modal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--popup-overlay)',
            backdropFilter: 'blur(4px)',
            opacity: 1, // To be animated with framer motion or css
        }} onClick={onClose}>

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="popup-model-name"
                onClick={(e) => e.stopPropagation()} // Prevent close
                style={{
                    background: 'var(--popup-bg)',
                    border: '1px solid var(--popup-border)',
                    borderRadius: 'var(--r-xl)',
                    boxShadow: 'var(--shadow-lift)',
                    padding: 'var(--s6)',
                    width: '100%',
                    maxWidth: '560px',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    position: 'relative'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
                        {model.company_logo_url ? (
                            <img src={model.company_logo_url} alt={model.company} style={{ height: '24px', objectFit: 'contain', alignSelf: 'flex-start' }} />
                        ) : null}
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                            letterSpacing: 'var(--tracking-wider)'
                        }}>
                            {model.company_website ? (
                                <a href={model.company_website} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                    {model.company} ↗
                                </a>
                            ) : model.company}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'var(--text-lg)',
                            color: 'var(--muted)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ink)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                <h2 id="popup-model-name" style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--weight-semibold)',
                    letterSpacing: 'var(--tracking-snug)',
                    color: 'var(--ink)',
                    marginTop: 'var(--s2)',
                    marginBottom: 0
                }}>
                    {model.model_name}
                </h2>

                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                    marginTop: 'var(--s1)'
                }}>
                    {activeTab === 'papers' ? (
                        <>{model.authors?.join(', ') || 'Unknown Authors'} &middot; {formatDate(model.release_date, 'mono')}</>
                    ) : (
                        <>v{model.model_version} &middot; {model.model_type} &middot; {formatDate(model.release_date, 'mono')}</>
                    )}
                </div>

                {activeTab !== 'papers' && (
                    <div style={{ display: 'flex', gap: 'var(--s2)', marginTop: 'var(--s3)' }}>
                        {model.modalities.map(m => (
                            <div key={m} style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-2xs)',
                                background: 'var(--bg-raised)',
                                borderRadius: 'var(--r-pill)',
                                padding: '2px 8px',
                                color: 'var(--secondary)'
                            }}>
                                {m}
                            </div>
                        ))}
                    </div>
                )}

                <hr style={dividerStyle} />

                <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-light)',
                    color: 'var(--secondary)',
                    lineHeight: 'var(--lead-body)',
                    margin: 0
                }}>
                    {model.description}
                </p>

                <hr style={dividerStyle} />

                {/* Links */}
                <div style={{ display: 'flex', gap: 'var(--s3)', marginTop: 'var(--s4)' }}>
                    {model.official_model_link && (
                        <a href={model.official_model_link} target="_blank" rel="noopener noreferrer" style={linkStyle}>Official Link ↗</a>
                    )}
                    {model.huggingface_url && (
                        <a href={model.huggingface_url} target="_blank" rel="noopener noreferrer" style={linkStyle}>HuggingFace ↗</a>
                    )}
                    {model.paper_url && (
                        <a href={model.paper_url} target="_blank" rel="noopener noreferrer" style={linkStyle}>{activeTab === 'papers' ? 'Read Paper ↗' : 'Paper ↗'}</a>
                    )}
                    {model.code_url && (
                        <a href={model.code_url} target="_blank" rel="noopener noreferrer" style={linkStyle}>Code Repository ↗</a>
                    )}
                </div>

                <hr style={dividerStyle} />

                {/* Specs Grid */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {activeTab === 'papers' ? (
                        <>
                            <SpecRow label="Institution" value={model.institution || '—'} />
                            <SpecRow label="Topic" value={model.topic || '—'} />
                            <SpecRow label="Citations" value={model.citations ? model.citations.toLocaleString() : '—'} />
                            <SpecRow label="Published In" value={model.published_in || '—'} />
                            <SpecRow label="Publication Date" value={formatDate(model.release_date, 'long')} />
                        </>
                    ) : (
                        <>
                            <SpecRow label="Architecture" value={model.architecture || '—'} />
                            <SpecRow label="Parameters" value={formatParams(model.parameters, model.parameter_unit)} />
                            <SpecRow label="Training Tokens" value={model.training_tokens ? formatContextWindow(model.training_tokens, 'long') : '—'} />
                            <SpecRow label="Context Window" value={formatContextWindow(model.context_window_tokens, 'long')} />
                            <SpecRow label="Open Source" value={model.open_source ? `Yes — ${model.license}` : `No — Proprietary`} />
                            <SpecRow label="API Available" value={model.api_available ? 'Yes' : 'No'} />
                            <SpecRow label="Pricing (per 1M)" value={(model.pricing_per_1m_tokens?.input !== null && model.pricing_per_1m_tokens?.input !== undefined) ?
                                `$${model.pricing_per_1m_tokens.input} In / $${model.pricing_per_1m_tokens.output} Out` : '—'} />
                            {model.training_data_cutoff && (
                                <SpecRow label="Training Cutoff" value={formatCutoff(model.training_data_cutoff)} />
                            )}
                            <SpecRow label="Country" value={model.country} />
                            <SpecRow label="Model Family" value={model.model_family} />
                            <SpecRow label="Release Date" value={formatDate(model.release_date, 'long')} />
                        </>
                    )}
                </div>

                {(model.use_cases?.length > 0 || model.notable_features?.length > 0 || (model.key_contributions?.length ?? 0) > 0) && (
                    <>
                        <hr style={dividerStyle} />
                        <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'papers' ? '1fr' : '1fr 1fr', gap: 'var(--s4)' }}>
                            {activeTab !== 'papers' && model.use_cases?.length > 0 && (
                                <div>
                                    <h4 style={sectionHeaderStyle}>Use Cases</h4>
                                    <ul style={listStyle}>
                                        {model.use_cases.map((uc, i) => <li key={i}>{uc}</li>)}
                                    </ul>
                                </div>
                            )}
                            {activeTab !== 'papers' && model.notable_features?.length > 0 && (
                                <div>
                                    <h4 style={sectionHeaderStyle}>Notable Features</h4>
                                    <ul style={listStyle}>
                                        {model.notable_features.map((feat, i) => <li key={i}>{feat}</li>)}
                                    </ul>
                                </div>
                            )}
                            {activeTab === 'papers' && (model.key_contributions?.length ?? 0) > 0 && (
                                <div>
                                    <h4 style={sectionHeaderStyle}>Key Contributions</h4>
                                    <ul style={listStyle}>
                                        {model.key_contributions?.map((feat, i) => <li key={i}>{feat}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {model.benchmark_scores && Object.keys(model.benchmark_scores).length > 0 && (
                    <>
                        <hr style={dividerStyle} />
                        <h4 style={sectionHeaderStyle}>Benchmarks</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s2)', marginTop: 'var(--s2)' }}>
                            {Object.entries(model.benchmark_scores).map(([key, value]) => (
                                <div key={key} style={{
                                    background: 'var(--bg-raised)',
                                    padding: 'var(--s2) var(--s4)',
                                    borderRadius: 'var(--r-sm)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted)', textTransform: 'uppercase' }}>{key}</span>
                                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>{String(value)}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <hr style={dividerStyle} />

                {/* Flow: Predecessor -> Current -> Successor */}
                {(model.predecessor || model.successor) && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--s2)',
                        flexWrap: 'wrap'
                    }}>
                        {model.predecessor && (
                            <>
                                <button style={flowBtnStyle} onClick={() => onNavigate(model.predecessor!)}>
                                    {model.predecessor}
                                </button>
                                <span style={{ color: 'var(--muted)' }}>&rarr;</span>
                            </>
                        )}
                        <div style={flowActiveStyle}>
                            {model.model_name}
                        </div>
                        {model.successor && (
                            <>
                                <span style={{ color: 'var(--muted)' }}>&rarr;</span>
                                <button style={flowBtnStyle} onClick={() => onNavigate(model.successor!)}>
                                    {model.successor}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div style={{
                    marginTop: 'var(--s6)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                    textAlign: 'center'
                }}>
                    {activeTab === 'papers' ? 'Paper' : 'Model'} #{model.id} of {totalModelsCount} — {model.company}
                </div>

            </div>
        </div>
    );
}

const dividerStyle: React.CSSProperties = {
    border: 'none',
    borderTop: '1px solid var(--stroke)',
    margin: 'var(--s4) 0'
};

function SpecRow({ label, value }: { label: string, value: string }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 'var(--s2) 0',
            borderBottom: '1px solid var(--stroke)'
        }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                {label}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink)', textAlign: 'right' }}>
                {value}
            </span>
        </div>
    );
}

const flowBtnStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    background: 'var(--bg-panel)',
    border: '1px solid var(--stroke)',
    borderRadius: 'var(--r-pill)',
    padding: 'var(--s2) var(--s4)',
    color: 'var(--secondary)',
    cursor: 'pointer'
};

const flowActiveStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    background: 'var(--ink)',
    color: 'var(--text-inverse)',
    border: '1px solid var(--ink)',
    borderRadius: 'var(--r-pill)',
    padding: 'var(--s2) var(--s4)',
};

const linkStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--link)',
    textDecoration: 'none',
    borderBottom: '1px solid transparent',
    transition: 'border-color var(--dur-fast) var(--ease-out)'
};

const sectionHeaderStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--weight-semibold)',
    color: 'var(--ink)',
    margin: '0 0 var(--s2) 0'
};

const listStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-sm)',
    color: 'var(--secondary)',
    lineHeight: 'var(--lead-snug)',
    margin: 0,
    paddingLeft: 'var(--s4)',
};
