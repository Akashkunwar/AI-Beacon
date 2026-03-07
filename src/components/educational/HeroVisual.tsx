import { motion } from 'framer-motion';

/**
 * HeroVisual Component
 * A premium, minimalist animated SVG constellation representing the AI universe.
 * Strictly monochrome, following the Project Beacon design system.
 */
export function HeroVisual() {
    return (
        <div 
            style={{ 
                width: '100%', 
                height: '100%', 
                minHeight: '220px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
            aria-hidden="true"
        >
            <motion.svg
                viewBox="0 110 500 280"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: 'auto', maxWidth: '650px' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
            >
                {/* Background Grid - Very Subtle */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--stroke)" strokeWidth="0.5" strokeOpacity="0.5" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" opacity="0.4" />

                {/* Central Spine (Timeline Axis) */}
                <motion.line
                    x1="50" y1="250" x2="450" y2="250"
                    stroke="var(--stroke-dark)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Connection Arcs - Horizontal Ribbon Flow */}
                <g opacity="0.6">
                    <motion.path
                        d="M 150 250 Q 200 120 250 250"
                        stroke="var(--stroke-dark)"
                        strokeWidth="1"
                        strokeDasharray="2 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 0.5 }}
                    />
                    <motion.path
                        d="M 250 250 Q 300 380 350 250"
                        stroke="var(--stroke-dark)"
                        strokeWidth="1"
                        strokeDasharray="2 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 0.8 }}
                    />
                    <motion.path
                        d="M 100 250 Q 175 350 250 250"
                        stroke="var(--stroke)"
                        strokeWidth="0.8"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, delay: 1.2 }}
                    />
                    <motion.path
                        d="M 320 250 Q 360 150 400 250"
                        stroke="var(--stroke)"
                        strokeWidth="0.8"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, delay: 1.5 }}
                    />
                </g>

                {/* Central Processor Node (Transformer) */}
                <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                >
                    <motion.circle
                        cx="250" cy="250" r="12"
                        fill="var(--bg)"
                        stroke="var(--ink)"
                        strokeWidth="2"
                        animate={{
                            r: [12, 14, 12],
                            strokeWidth: [2, 1.5, 2]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <text x="250" y="205" textAnchor="middle" fill="var(--ink)" fontSize="10" fontWeight="500" fontFamily="var(--font-mono)" opacity="0.9">TRANSFORMER</text>
                    
                    {/* Orbiting Ring & Dot Group - Robust translate+rotate pattern */}
                    <g transform="translate(250, 250)">
                        <motion.g
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <circle
                                cx="0" cy="0" r="30"
                                stroke="var(--stroke-dark)"
                                strokeWidth="0.5"
                                strokeDasharray="2 2"
                            />
                            <circle
                                cx="30" cy="0" r="3"
                                fill="var(--ink)"
                            />
                        </motion.g>
                    </g>
                </motion.g>

                {/* Milestone Nodes */}
                {[
                    { x: 100, y: 250, label: '2017' },
                    { x: 180, y: 250, label: '2020' },
                    { x: 320, y: 250, label: '2023' },
                    { x: 400, y: 250, label: '2026' }
                ].map((node, i) => (
                    <motion.g 
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + i * 0.2, duration: 0.5 }}
                    >
                        <circle cx={node.x} cy={node.y} r="4" fill="var(--ink)" />
                        <motion.circle
                            cx={node.x} cy={node.y} r="8"
                            stroke="var(--ink)"
                            strokeWidth="0.5"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                        />
                        <text
                            x={node.x}
                            y={node.y + 22}
                            textAnchor="middle"
                            fill="var(--secondary)"
                            fontSize="11"
                            fontWeight="500"
                            fontFamily="var(--font-mono)"
                            style={{ letterSpacing: '0.05em' }}
                        >
                            {node.label}
                        </text>
                    </motion.g>
                ))}

                {/* Auxiliary Technical Nodes */}
                {[
                    { x: 150, y: 180, label: 'LATENT' },
                    { x: 350, y: 320, label: 'WEIGHTS' },
                    { x: 120, y: 380, label: 'GEN' },
                    { x: 380, y: 120, label: 'DATA' }
                ].map((node, i) => (
                    <motion.g
                        key={`aux-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 + i * 0.3 }}
                    >
                        <circle cx={node.x} cy={node.y} r="2.5" fill="var(--muted)" />
                        <text
                            x={node.x + 8}
                            y={node.y + 3}
                            fill="var(--muted)"
                            fontSize="9"
                            fontFamily="var(--font-mono)"
                            opacity="0.9"
                        >
                            {node.label}
                        </text>
                    </motion.g>
                ))}

                {/* Floating Elements (Research/Tools) */}
                <motion.circle
                    cx="150" cy="350" r="5"
                    fill="var(--bg)"
                    stroke="var(--stroke-dark)"
                    strokeWidth="1"
                    animate={{
                        x: [0, -10, 0],
                        opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Floating Rect - Robust rotation around center */}
                <g transform="translate(354, 154)">
                    <motion.rect
                        x="-4" y="-4" width="8" height="8"
                        fill="var(--bg)"
                        stroke="var(--stroke-dark)"
                        strokeWidth="1"
                        animate={{
                            rotate: [0, 90, 180, 270, 360],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />
                </g>
            </motion.svg>

            {/* Subtle Gradient Overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at center, transparent 30%, var(--bg) 80%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
}
