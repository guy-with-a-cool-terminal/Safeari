import React, { useState, useMemo, useRef } from "react";

interface DataPoint {
    time: string;
    allowed: number;
    blocked: number;
}

interface ActivitySparklineProps {
    chartData: DataPoint[];
    maxValue: number;
}

const ActivitySparkline = ({ chartData, maxValue }: ActivitySparklineProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const W = 1000;
    const H = 160;
    const PAD = { t: 12, b: 8, l: 4, r: 4 };
    const plotW = W - PAD.l - PAD.r;
    const plotH = H - PAD.t - PAD.b;

    const points = useMemo(() => {
        if (!chartData.length) return [];
        return chartData.map((d, i) => {
            const total = d.allowed + d.blocked;
            const norm = Math.max(total / maxValue, 0.03);
            const x = PAD.l + (i / Math.max(chartData.length - 1, 1)) * plotW;
            const y = PAD.t + plotH - norm * plotH;
            return { x, y, ...d, total, i };
        });
    }, [chartData, maxValue]);

    // Build smooth cubic bezier path
    const linePath = useMemo(() => {
        if (points.length < 2) return "";
        let d = `M ${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx = (prev.x + curr.x) / 2;
            d += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
        }
        return d;
    }, [points]);

    // Area fill path
    const areaPath = useMemo(() => {
        if (!linePath) return "";
        const baseline = PAD.t + plotH;
        return `${linePath} L ${points[points.length - 1].x},${baseline} L ${points[0].x},${baseline} Z`;
    }, [linePath, points, plotH]);

    // Segment coloring — build logic for individual line paths
    const segments = useMemo(() => {
        if (points.length < 2) return [];
        return points.slice(0, -1).map((p, i) => {
            const next = points[i + 1];

            // Winner-Takes-All Logic: Highest number wins
            const colorState: 'red' | 'green' = p.blocked > p.allowed ? 'red' : 'green';

            return { p, next, colorState };
        });
    }, [points]);

    const hasAnyBlocked = chartData.some(d => d.blocked > 0);

    if (!chartData.length) return null;

    return (
        <div className="relative w-full">
            {/* Hovered tooltip */}
            {hoveredIndex !== null && points[hoveredIndex] && (
                <div
                    className="absolute z-50 pointer-events-none"
                    style={{
                        left: `${(points[hoveredIndex].x / W) * 100}%`,
                        top: `${(points[hoveredIndex].y / H) * 100}%`,
                        transform: "translate(-50%, -110%)",
                    }}
                >
                    <div className="bg-popover border border-border text-popover-foreground rounded-lg shadow-xl px-3 py-2 text-xs whitespace-nowrap">
                        <div className="font-bold text-muted-foreground uppercase tracking-widest text-[9px] mb-1">
                            {points[hoveredIndex].time}
                        </div>
                        <div className="flex gap-3">
                            <span className="text-emerald-500 font-semibold">
                                {points[hoveredIndex].allowed.toLocaleString()} safe
                            </span>
                            {points[hoveredIndex].blocked > 0 && (
                                <span className="text-rose-500 font-semibold">
                                    {points[hoveredIndex].blocked.toLocaleString()} blocked
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Arrow */}
                    <div className="flex justify-center">
                        <div className="w-2 h-2 bg-popover border-r border-b border-border rotate-45 -mt-1" />
                    </div>
                </div>
            )}

            <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="w-full h-44 overflow-visible"
            >
                <defs>
                    {/* Dynamic area gradient (Horizontal "Mood") */}
                    <linearGradient id="sl-area-dynamic" x1="0" y1="0" x2="1" y2="0">
                        {chartData.map((d, i) => {
                            let color = "#10b981"; // Safe dominant
                            if (d.blocked > d.allowed) color = "#f43f5e"; // Blocked dominant

                            return (
                                <stop
                                    key={i}
                                    offset={`${(i / Math.max(chartData.length - 1, 1)) * 100}%`}
                                    stopColor={color}
                                />
                            );
                        })}
                    </linearGradient>

                    {/* Glow filter for safe */}
                    <filter id="sl-glow-safe" x="-20%" y="-50%" width="140%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Glow filter for blocked */}
                    <filter id="sl-glow-blocked" x="-20%" y="-50%" width="140%" height="200%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>


                    {/* Clip to keep area inside plot */}
                    <clipPath id="sl-clip">
                        <rect x={PAD.l} y={PAD.t} width={plotW} height={plotH} />
                    </clipPath>
                </defs>

                {/* Baseline */}
                <line
                    x1={PAD.l} y1={PAD.t + plotH}
                    x2={W - PAD.r} y2={PAD.t + plotH}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                />

                {/* Area fill with horizontal "mood" and vertical fade */}
                <path
                    d={areaPath}
                    fill="url(#sl-area-dynamic)"
                    fillOpacity="0.12"
                    clipPath="url(#sl-clip)"
                    className="transition-all duration-700"
                    style={{ maskImage: "linear-gradient(to bottom, white 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, white 0%, transparent 100%)" }}
                />

                {/* Line segments with per-segment color */}
                {segments.map(({ p, next, colorState }, i) => {
                    const color = colorState === 'red' ? "#f43f5e" : "#10b981";
                    const filter = colorState === 'red' ? "url(#sl-glow-blocked)" : "url(#sl-glow-safe)";
                    const cpx = (p.x + next.x) / 2;
                    return (
                        <path
                            key={i}
                            d={`M ${p.x},${p.y} C ${cpx},${p.y} ${cpx},${next.y} ${next.x},${next.y}`}
                            fill="none"
                            stroke={color}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            filter={filter}
                            className="transition-all duration-300"
                        />
                    );
                })}

                {/* Hover interaction strips — invisible wide hit areas */}
                {points.map((p, i) => {
                    const slotW = plotW / points.length;
                    return (
                        <rect
                            key={i}
                            x={p.x - slotW / 2}
                            y={PAD.t}
                            width={slotW}
                            height={plotH}
                            fill="transparent"
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className="cursor-crosshair"
                        />
                    );
                })}

                {/* Hover vertical indicator */}
                {hoveredIndex !== null && points[hoveredIndex] && (
                    <>
                        <line
                            x1={points[hoveredIndex].x}
                            y1={PAD.t}
                            x2={points[hoveredIndex].x}
                            y2={PAD.t + plotH}
                            stroke="rgba(255,255,255,0.12)"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                        />
                        <circle
                            cx={points[hoveredIndex].x}
                            cy={points[hoveredIndex].y}
                            r="4"
                            fill={points[hoveredIndex].blocked > points[hoveredIndex].allowed ? "#f43f5e" : "#10b981"}
                            stroke="white"
                            strokeWidth="1.5"
                            filter={points[hoveredIndex].blocked > points[hoveredIndex].allowed ? "url(#sl-glow-blocked)" : "url(#sl-glow-safe)"}
                        />
                    </>
                )}
            </svg>

            {/* Time axis */}
            <div className="flex justify-between px-1 -mt-1">
                {["12 AM", "6 AM", "12 PM", "6 PM", "Now"].map((t) => (
                    <span key={t} className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40">
                        {t}
                    </span>
                ))}
            </div>

            {/* Legend */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/30">
                <div className="flex gap-6">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                            Safe Browsing
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                            Threats Blocked
                        </span>
                    </div>
                </div>
                {hasAnyBlocked && (
                    <span className="text-[10px] font-semibold text-rose-500/70 uppercase tracking-wider">
                        {chartData.reduce((sum, d) => sum + d.blocked, 0)} threats blocked
                    </span>
                )}
            </div>
        </div>
    );
};

export default ActivitySparkline;
