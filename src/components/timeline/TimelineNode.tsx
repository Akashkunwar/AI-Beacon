import { useState } from 'react';
import { PlacedModel, formatParams, formatDate } from '@/utils/timeline';
import { TabType } from '@/components/timeline/TimelineHeader';

interface TimelineNodeProps {
    activeTab: TabType;
    model: PlacedModel;
    isActive: boolean;
    isFilteredOut: boolean;
    onClick: () => void;
}

export function TimelineNode({ activeTab, model, isActive, isFilteredOut, onClick }: TimelineNodeProps) {
    const isAbove = model.laneDirection === 'above';
    const transformDir = isAbove ? -1 : 1;
    const [isHovered, setIsHovered] = useState(false);

    // Milestones indicator
    const MILESTONES = ["Transformer", "GPT-3", "ChatGPT", "GPT-4", "LLaMA"];
    const isMilestone = MILESTONES.includes(model.model_name);

    const showHover = isHovered && !isActive && !isFilteredOut;

    // Determine tooltip placement: if it's pushed far towards the top/bottom edge (>180px offset),
    // invert the tooltip rendering direction so it renders towards the safety of the spine
    const renderTooltipAbove = isAbove ? model.laneOffset <= 180 : model.laneOffset > 180;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
            aria-label={`${model.model_name} by ${model.company}, released ${model.release_date}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'absolute',
                top: isAbove ? `calc(50% - ${model.laneOffset}px)` : `calc(50% + ${model.laneOffset}px)`,
                left: 0,
                transform: `translateX(-50%) ${isAbove ? 'translateY(-100%)' : 'translateY(0)'} ${showHover ? `translateY(${transformDir * 2}px)` : ''}`,
                width: '120px',
                background: isActive ? 'var(--timeline-node-active-bg)' : (showHover ? 'var(--bg-raised)' : 'var(--timeline-node-bg)'),
                border: `1px solid ${isActive ? 'var(--ink)' : (showHover ? 'var(--ink)' : 'var(--timeline-node-border)')}`,
                borderRadius: 'var(--r-md)',
                padding: 'var(--s2) var(--s3)',
                boxShadow: isActive ? 'var(--shadow-lift)' : (showHover ? 'var(--shadow-lift)' : 'var(--shadow-soft)'),
                cursor: isFilteredOut ? 'default' : 'pointer',
                opacity: isFilteredOut ? 0.2 : 1,
                pointerEvents: isFilteredOut ? 'none' : 'auto',
                transition: 'all var(--dur-base) var(--ease-out)',
                zIndex: (isActive || showHover) ? 999 : 100 - Math.floor(model.laneOffset / 10),
            }}
            data-model-type={model.model_type}
        >
            {/* Hover Tooltip */}
            {showHover && (
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: renderTooltipAbove ? '100%' : 'auto',
                    top: renderTooltipAbove ? 'auto' : '100%',
                    marginBottom: renderTooltipAbove ? 'var(--s3)' : 0,
                    marginTop: !renderTooltipAbove ? 'var(--s3)' : 0,
                    background: 'var(--ink)',
                    color: 'var(--text-inverse)',
                    padding: 'var(--s2) var(--s3)',
                    borderRadius: 'var(--r-md)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-sans)',
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: 'var(--shadow-lift)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontWeight: 'var(--weight-semibold)' }}>
                        {formatDate(model.release_date, 'long')}
                    </div>

                    {activeTab === 'papers' ? (
                        <>
                            {model.authors && model.authors.length > 0 && (
                                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'var(--text-2xs)' }}>
                                    {model.authors.length > 2 ? `${model.authors[0]} et al.` : model.authors.join(', ')}
                                </div>
                            )}
                            <div style={{ color: 'var(--success)', fontSize: 'var(--text-2xs)', marginTop: '2px' }}>
                                {model.published_in || 'Research Paper'}
                            </div>
                        </>
                    ) : (
                        <>
                            {model.modalities && model.modalities.length > 0 && (
                                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'var(--text-2xs)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {model.modalities.join(' • ')}
                                </div>
                            )}

                            <div style={{
                                color: model.open_source ? 'var(--success)' : 'var(--warning)',
                                fontSize: 'var(--text-2xs)',
                                marginTop: '2px'
                            }}>
                                {model.open_source ? 'Open Source' : 'Closed Source'}
                            </div>
                        </>
                    )}

                    {/* Triangle pointer */}
                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        border: '6px solid transparent',
                        ...(renderTooltipAbove ? {
                            bottom: '-12px',
                            borderTopColor: 'var(--ink)',
                        } : {
                            top: '-12px',
                            borderBottomColor: 'var(--ink)',
                        })
                    }} />
                </div>
            )}
            {/* Connector Line to Spine */}
            <div style={{
                position: 'absolute',
                width: '1px',
                background: 'var(--timeline-connector)',
                left: '50%',
                // transform is applied via spread below
                // Line runs from the edge facing the spine, to the spine
                ...(isAbove ? {
                    bottom: '-1px', // Start at bottom border
                    height: `${model.laneOffset}px`,
                    transformOrigin: 'top center',
                    transform: 'translateX(-50%) translateY(100%)'
                } : {
                    top: '-1px', // Start at top border
                    height: `${model.laneOffset}px`,
                    transformOrigin: 'bottom center',
                    transform: 'translateX(-50%) translateY(-100%)'
                })
            }} />

            {/* Milestone Diamond */}
            {isMilestone && (
                <div
                    title="Inflection point"
                    style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '8px',
                        color: 'var(--timeline-milestone)'
                    }}
                >
                    ◆
                </div>
            )}

            {/* Placeholder for future logos */}
            <div className="company-logo-slot" style={{ display: 'none', height: '16px' }} />

            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                color: isActive ? 'var(--text-inverse)' : 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wider)',
                opacity: isActive ? 0.8 : 1
            }}>
                {model.company}
            </div>

            <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-semibold)',
                color: isActive ? 'var(--text-inverse)' : 'var(--ink)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>
                {model.model_name}
            </div>

            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                color: isActive ? 'var(--text-inverse)' : 'var(--muted)',
                opacity: isActive ? 0.8 : 1
            }}>
                {activeTab === 'papers'
                    ? (model.citations ? `${model.citations.toLocaleString()} citations` : '—')
                    : formatParams(model.parameters, model.parameter_unit)}
            </div>
        </div>
    );
}
