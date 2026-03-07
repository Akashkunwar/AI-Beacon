import { motion } from 'framer-motion';

/**
 * ScaleVisual Component
 * A rich, technical animated SVG constellation representing the density and scale of AI.
 */
export function ScaleVisual() {
    return (
        <div 
            style={{ 
                width: '100%', 
                height: '100%', 
                minHeight: '450px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
            aria-hidden="true"
        >
            <motion.svg
                viewBox="0 0 500 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: 'auto', maxWidth: '500px' }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
                whileHover={{ scale: 1.02 }}
            >
                {/* Background Grid - Very Subtle dots */}
                <pattern id="scale-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.5" fill="var(--stroke)" fillOpacity="0.3" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#scale-grid)" />

                {/* Background Particles (Stars) - Increased density */}
                {[...Array(60)].map((_, i) => (
                    <motion.circle
                        key={`star-${i}`}
                        cx={Math.random() * 500}
                        cy={Math.random() * 500}
                        r={Math.random() * 1.2}
                        fill="var(--stroke-dark)"
                        initial={{ opacity: 0.1 }}
                        animate={{ 
                            opacity: [0.1, 0.5, 0.1],
                            scale: [1, 1.4, 1]
                        }}
                        transition={{ 
                            duration: 2 + Math.random() * 4, 
                            repeat: Infinity, 
                            delay: Math.random() * 5 
                        }}
                    />
                ))}

                {/* Central Spine (Timeline Axis) */}
                <motion.line
                    x1="250" y1="40" x2="250" y2="460"
                    stroke="var(--stroke-dark)"
                    strokeWidth="1"
                    strokeDasharray="4 8"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />

                {/* Connection Arcs and Data Packets - Increased density */}
                <g opacity="0.8">
                    {[
                        "M 250 100 Q 420 180 250 260",
                        "M 250 260 Q 80 340 250 420",
                        "M 250 140 Q 60 220 250 300",
                        "M 250 200 Q 440 280 250 360",
                        "M 100 100 Q 250 50 400 100",
                        "M 100 400 Q 250 450 400 400"
                    ].map((d, i) => (
                        <g key={`path-${i}`}>
                            <motion.path
                                d={d}
                                stroke="var(--stroke-dark)"
                                strokeWidth="1"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.6 }}
                                transition={{ duration: 2.5, delay: i * 0.3 }}
                            />
                            <motion.circle
                                r="1.5"
                                fill="var(--muted)"
                                initial={{ opacity: 0 }}
                                animate={{ 
                                    opacity: [0, 1, 0],
                                    offsetDistance: ["0%", "100%"]
                                }}
                                style={{ offsetPath: `path("${d}")` }}
                                transition={{ 
                                    duration: 3 + i * 0.5, 
                                    repeat: Infinity, 
                                    ease: "linear",
                                    delay: 1 + i * 0.2 
                                }}
                            />
                        </g>
                    ))}
                </g>

                {/* Central Core Hub */}
                <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1.5 }}
                >
                    <motion.rect
                        x="235" y="235" width="30" height="30"
                        rx="4"
                        stroke="var(--ink)"
                        strokeWidth="1"
                        fill="var(--bg)"
                        animate={{ rotate: 45 }}
                    />
                    <g transform="translate(242, 242)">
                        {[0, 1, 2].map(row => 
                            [0, 1, 2].map(col => (
                                <motion.circle
                                    key={`${row}-${col}`}
                                    cx={col * 8}
                                    cy={row * 8}
                                    r="1.5"
                                    fill="var(--ink)"
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{ 
                                        duration: 2, 
                                        repeat: Infinity, 
                                        delay: (row + col) * 0.2 
                                    }}
                                />
                            ))
                        )}
                    </g>
                    <text x="272" y="240" fill="var(--ink)" fontSize="10" fontWeight="500" fontFamily="var(--font-mono)" opacity="0.8">CORE</text>
                </motion.g>

                {/* Milestones & Breakthroughs - Higher density */}
                {[
                    { x: 250, y: 70, label: 'ATTENTION', shape: 'circle' },
                    { x: 250, y: 150, label: 'GPT-2', shape: 'diamond' },
                    { x: 390, y: 210, label: 'RESEARCH HD', shape: 'square' },
                    { x: 110, y: 310, label: 'LANDMARK', shape: 'diamond' },
                    { x: 250, y: 370, label: 'RLHF', shape: 'circle' },
                    { x: 250, y: 440, label: 'FUTURE', shape: 'pulse' },
                    { x: 150, y: 120, label: 'KV CACHE', shape: 'small' },
                    { x: 350, y: 100, label: 'MoE', shape: 'small' },
                    { x: 420, y: 320, label: 'ROPE', shape: 'small' },
                    { x: 80, y: 180, label: 'MQA', shape: 'small' },
                    { x: 180, y: 450, label: 'AGENTIC', shape: 'small' },
                    { x: 320, y: 40, label: 'TOKEN', shape: 'small' },
                    { x: 50, y: 380, label: 'SCALE', shape: 'small' }
                ].map((node, i) => (
                    <motion.g 
                        key={`node-${i}`}
                        initial={{ opacity: 0, y: node.y + 10 }}
                        animate={{ opacity: 1, y: node.y }}
                        transition={{ delay: 1.2 + i * 0.1, duration: 0.6 }}
                    >
                        {node.shape === 'circle' && <circle cx={node.x} cy="0" r="4" fill="var(--ink)" />}
                        {node.shape === 'diamond' && <rect x={node.x - 3} y="-3" width="6" height="6" fill="var(--ink)" transform="rotate(45)" />}
                        {node.shape === 'square' && <rect x={node.x - 3} y="-3" width="6" height="6" stroke="var(--ink)" strokeWidth="1" fill="var(--bg)" />}
                        {node.shape === 'small' && <circle cx={node.x} cy="0" r="1.5" fill="var(--muted)" />}
                        {node.shape === 'pulse' && (
                            <motion.circle 
                                cx={node.x} cy="0" r="4" 
                                fill="none" stroke="var(--ink)" 
                                animate={{ r: [4, 8, 4], opacity: [1, 0, 1] }} 
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                        
                        {node.x !== 250 && (
                            <motion.line 
                                x1={node.x > 250 ? node.x - 5 : node.x + 5} y1="0" 
                                x2="250" y2="0" 
                                stroke="var(--stroke-dark)" 
                                strokeWidth="0.6" 
                                strokeDasharray="1 2"
                                opacity="0.6"
                            />
                        )}

                        <text
                            x={node.x + (node.x > 250 ? 8 : -8)}
                            y="3"
                            fill="var(--secondary)"
                            fontSize="9"
                            fontWeight="500"
                            fontFamily="var(--font-mono)"
                            textAnchor={node.x > 250 ? 'start' : 'end'}
                            style={{ letterSpacing: '0.02em', opacity: 0.8 }}
                        >
                            {node.label}
                        </text>
                    </motion.g>
                ))}

                <g opacity="0.7">
                    <text x="30" y="40" fill="var(--muted)" fontSize="10" fontWeight="500" fontFamily="var(--font-mono)">[SYSTEM: OPTIMIZED]</text>
                    <text x="30" y="55" fill="var(--muted)" fontSize="10" fontWeight="500" fontFamily="var(--font-mono)">[NODE: 1.2k]</text>
                    <text x="380" y="460" fill="var(--muted)" fontSize="10" fontWeight="500" fontFamily="var(--font-mono)">[LATENT: HD]</text>
                    <text x="380" y="475" fill="var(--muted)" fontSize="10" fontWeight="500" fontFamily="var(--font-mono)">[VER: 2026.03]</text>
                </g>
            </motion.svg>

            {/* Subtle Gradient Overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at center, transparent 35%, var(--bg) 95%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
}
