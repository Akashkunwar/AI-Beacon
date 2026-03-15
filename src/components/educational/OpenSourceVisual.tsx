import { motion } from 'framer-motion';

/**
 * OpenSourceVisual Component
 * A technical, animated SVG representing the open source and community-driven nature of AiViz.
 */
export function OpenSourceVisual() {
    return (
        <div 
            style={{ 
                width: '100%', 
                height: '100%', 
                minHeight: '280px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
            aria-hidden="true"
        >
            <style>{`
                @keyframes os-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .os-animate-spin-slow {
                    animation: os-spin 15s linear infinite;
                }
                .os-animate-spin-reverse {
                    animation: os-spin 25s linear infinite reverse;
                }
            `}</style>

            <motion.svg
                viewBox="0 0 400 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: 'auto', maxWidth: '400px' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.2, 0, 0, 1] }}
            >
                {/* Background Grid - Very Subtle dots */}
                <pattern id="os-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.5" fill="var(--stroke)" fillOpacity="0.4" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#os-grid)" />

                {/* Main Open Source Central Symbol (Stylized O/S Ring) */}
                <g transform="translate(200, 150)">
                    {/* Inner dash ring */}
                    <motion.circle
                        cx="0" cy="0" r="45"
                        stroke="var(--stroke-dark)"
                        strokeWidth="0.8"
                        strokeDasharray="4 6"
                        className="os-animate-spin-slow"
                    />

                    {/* Outer solid ring with partial opening (OSI-like but beacon style) */}
                    <motion.path
                        d="M 0 -65 A 65 65 0 1 1 -20 -62"
                        stroke="var(--ink)"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, rotate: -90 }}
                        animate={{ pathLength: 0.8, rotate: 270 }}
                        transition={{ 
                            pathLength: { duration: 1.5, ease: "easeInOut" },
                            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                        }}
                    />

                    {/* Core "Beacon" point */}
                    <motion.circle
                        cx="0" cy="0" r="6"
                        fill="var(--ink)"
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    {/* Ring Pulse */}
                    <motion.circle
                        cx="0" cy="0" r="6"
                        stroke="var(--ink)"
                        strokeWidth="0.5"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    />
                </g>

                {/* Community Nodes - Floating around the center */}
                {[
                    { r: 90, angle: 30, size: 3, label: 'CONTRIB' },
                    { r: 105, angle: 150, size: 2.5, label: 'DATA' },
                    { r: 85, angle: 260, size: 4, label: 'REPO' },
                    { r: 110, angle: 320, size: 2, label: 'LIB' },
                ].map((node, i) => {
                    const x = 200 + node.r * Math.cos((node.angle * Math.PI) / 180);
                    const y = 150 + node.r * Math.sin((node.angle * Math.PI) / 180);
                    return (
                        <motion.g 
                            key={`node-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 + i * 0.2 }}
                        >
                            {/* Connection to center */}
                            <motion.line
                                x1="200" y1="150"
                                x2={x} y2={y}
                                stroke="var(--stroke)"
                                strokeWidth="0.5"
                                strokeDasharray="2 3"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, delay: 1 + i * 0.2 }}
                            />

                            {/* Node dot */}
                            <motion.circle
                                cx={x} cy={y} r={node.size}
                                fill="var(--bg)"
                                stroke="var(--ink)"
                                strokeWidth="1"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                            />

                            {/* Node Label */}
                            <text
                                x={x + (x > 200 ? 8 : -8)}
                                y={y + 3}
                                textAnchor={x > 200 ? 'start' : 'end'}
                                fill="var(--muted)"
                                fontSize="8"
                                fontWeight="500"
                                fontFamily="var(--font-mono)"
                                opacity="0.8"
                            >
                                {node.label}
                            </text>
                        </motion.g>
                    );
                })}

                {/* Floating Bits (Particles) */}
                {[...Array(12)].map((_, i) => (
                    <motion.circle
                        key={`bit-${i}`}
                        cx={Math.random() * 400}
                        cy={Math.random() * 300}
                        r="1"
                        fill="var(--stroke-dark)"
                        initial={{ opacity: 0.1 }}
                        animate={{ 
                            opacity: [0.1, 0.4, 0.1],
                            y: [0, -15, 0]
                        }}
                        transition={{ 
                            duration: 4 + Math.random() * 4, 
                            repeat: Infinity, 
                            delay: Math.random() * 5 
                        }}
                    />
                ))}

                {/* Floating Hexagons or Squares for variety */}
                <g className="os-animate-spin-reverse" transform-origin="320 60">
                    <rect
                        x="316" y="56" width="8" height="8"
                        stroke="var(--stroke-dark)"
                        strokeWidth="0.5"
                        fill="var(--bg)"
                        opacity="0.4"
                    />
                </g>
                <g className="os-animate-spin-slow" transform-origin="80 240">
                    <rect
                        x="76" y="236" width="8" height="8"
                        stroke="var(--stroke-dark)"
                        strokeWidth="0.5"
                        fill="var(--bg)"
                        opacity="0.4"
                        transform="rotate(45)"
                    />
                </g>
            </motion.svg>

            {/* Subtle Gradient Overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at center, transparent 30%, var(--bg-panel) 90%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
}
