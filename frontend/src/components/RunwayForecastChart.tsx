"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ForecastPoint } from "@/types/audit";
import { TrendingUp, ShieldAlert, Sparkles, Calendar } from "lucide-react";

interface RunwayForecastChartProps {
  forecastData: ForecastPoint[];
  reclaimedMonthlySavings: number;
  initialBalance?: number;
}

export const RunwayForecastChart: React.FC<RunwayForecastChartProps> = ({
  forecastData,
  reclaimedMonthlySavings,
  initialBalance,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Chart Dimensions
  const svgWidth = 620;
  const svgHeight = 220;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;
  const innerWidth = svgWidth - padLeft - padRight;
  const innerHeight = svgHeight - padTop - padBottom;

  // Process data points and attach dynamic reclaimed path
  const points = useMemo(() => {
    if (!forecastData || forecastData.length === 0) return [];

    // Synthesize starting Day 0 anchor point
    const firstP50 = forecastData[0]?.p50 || 10000;
    const startBalance = initialBalance !== undefined ? initialBalance : firstP50;

    const day0 = {
      week: 0,
      day_offset: 0,
      date: "Day 0",
      p10: startBalance * 0.98,
      p50: startBalance,
      p90: startBalance * 1.02,
      reclaimed_p50: startBalance,
      cumulative_saved: 0,
    };

    const futurePoints = forecastData.map((pt) => {
      const addedFromSavings = reclaimedMonthlySavings * (pt.day_offset / 30.0);
      return {
        ...pt,
        reclaimed_p50: pt.p50 + addedFromSavings,
      };
    });

    return [day0, ...futurePoints];
  }, [forecastData, reclaimedMonthlySavings, initialBalance]);

  // Calculate dynamic min/max Y for scale
  const { minY, maxY, yTicks } = useMemo(() => {
    if (!points.length) return { minY: 0, maxY: 20000, yTicks: [] };

    let min = Infinity;
    let max = -Infinity;

    points.forEach((pt) => {
      if (pt.p10 < min) min = pt.p10;
      if (pt.p90 > max) max = pt.p90;
      if (pt.reclaimed_p50 > max) max = pt.reclaimed_p50;
    });

    // Tightened Y-axis for immediate visual punch
    const span = Math.max(800, max - min);
    const paddedMin = Math.floor((min - span * 0.03) / 100) * 100;
    const paddedMax = Math.ceil((max + span * 0.03) / 100) * 100;

    // 4 evenly spaced horizontal ticks
    const step = (paddedMax - paddedMin) / 3;
    const ticks = [
      paddedMin,
      Math.round(paddedMin + step),
      Math.round(paddedMin + step * 2),
      paddedMax,
    ];

    return { minY: paddedMin, maxY: paddedMax, yTicks: ticks };
  }, [points]);

  // Coordinate mappers
  const getX = (index: number) => {
    if (points.length <= 1) return padLeft;
    return padLeft + (index / (points.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    if (maxY === minY) return padTop + innerHeight / 2;
    const ratio = (val - minY) / (maxY - minY);
    return padTop + innerHeight - ratio * innerHeight;
  };

  // Build SVG Paths
  const { fanPath, baselinePath, reclaimedPath, wedgePath } = useMemo(() => {
    if (!points.length) return { fanPath: "", baselinePath: "", reclaimedPath: "", wedgePath: "" };

    // 1. Shaded Uncertainty Fan Path (p10 to p90)
    let fan = `M ${getX(0)} ${getY(points[0].p10)}`;
    for (let i = 1; i < points.length; i++) {
      fan += ` L ${getX(i)} ${getY(points[i].p10)}`;
    }
    for (let i = points.length - 1; i >= 0; i--) {
      fan += ` L ${getX(i)} ${getY(points[i].p90)}`;
    }
    fan += " Z";

    // 2. Baseline Bleed Path (p50 dashed vermilion)
    let base = `M ${getX(0)} ${getY(points[0].p50)}`;
    for (let i = 1; i < points.length; i++) {
      base += ` L ${getX(i)} ${getY(points[i].p50)}`;
    }

    // 3. Reclaimed Runway Path (solid emerald)
    let rec = `M ${getX(0)} ${getY(points[0].reclaimed_p50)}`;
    for (let i = 1; i < points.length; i++) {
      rec += ` L ${getX(i)} ${getY(points[i].reclaimed_p50)}`;
    }

    // 4. Emerald Recovery Wedge (polygon between reclaimed and baseline)
    let wedge = `M ${getX(0)} ${getY(points[0].reclaimed_p50)}`;
    for (let i = 1; i < points.length; i++) {
      wedge += ` L ${getX(i)} ${getY(points[i].reclaimed_p50)}`;
    }
    for (let i = points.length - 1; i >= 0; i--) {
      wedge += ` L ${getX(i)} ${getY(points[i].p50)}`;
    }
    wedge += " Z";

    return { fanPath: fan, baselinePath: base, reclaimedPath: rec, wedgePath: wedge };
  }, [points, minY, maxY]);

  // Current active hover point
  const activePt = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="w-full bg-[#FDFCF9] flex flex-col justify-between border-b border-[#DFDBD0] select-none">
      {/* Header Bar */}
      <div className="px-5 py-3 border-b border-[#DFDBD0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0D6E52]" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#111315]">
            90-DAY CASH RUNWAY SIMULATOR
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-[#C93B2B]">
            <span className="w-3 h-0.5 border-t border-dashed border-[#C93B2B]" />
            <span>BASELINE BLEED</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#0D6E52] font-semibold">
            <span className="w-3 h-0.5 bg-[#0D6E52]" />
            <span>RECLAIMED PATH</span>
          </div>
          {reclaimedMonthlySavings > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-[#0D6E52] bg-[#E6F4EF] px-1.5 py-0.5 rounded-[2px] border border-[#0D6E52]/20 font-bold">
              <span>+${(reclaimedMonthlySavings * 3).toLocaleString()}/90D WEDGE</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[#5A5D64]">
            <span className="w-2.5 h-2.5 bg-[#111315]/10 rounded-[1px]" />
            <span>p10&ndash;p90 BAND</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full px-2 pt-2 pb-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible font-mono"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Defs */}
          <defs>
            <linearGradient id="reclaimedGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0D6E52" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0D6E52" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Tick Labels */}
          {yTicks.map((tickVal, idx) => {
            const yPos = getY(tickVal);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={yPos}
                  x2={padLeft + innerWidth}
                  y2={yPos}
                  stroke="#DFDBD0"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                />
                <text
                  x={padLeft - 8}
                  y={yPos + 3.5}
                  textAnchor="end"
                  className="text-[9px] fill-[#5A5D64] tabular-nums"
                >
                  ${(tickVal / 1000).toFixed(1)}k
                </text>
              </g>
            );
          })}

          {/* X-Axis Tick Marks */}
          {[0, 30, 60, 90].map((dayOffset) => {
            // Find closest point
            const ptIdx = points.findIndex((p) => p.day_offset >= dayOffset);
            const xPos = ptIdx !== -1 ? getX(ptIdx) : padLeft;
            return (
              <g key={dayOffset}>
                <line
                  x1={xPos}
                  y1={padTop + innerHeight}
                  x2={xPos}
                  y2={padTop + innerHeight + 4}
                  stroke="#5A5D64"
                  strokeWidth="1"
                />
                <text
                  x={xPos}
                  y={padTop + innerHeight + 16}
                  textAnchor="middle"
                  className="text-[9px] fill-[#5A5D64] font-mono tabular-nums tracking-wider"
                >
                  {dayOffset === 0 ? "TODAY" : `+${dayOffset}D`}
                </text>
              </g>
            );
          })}

          {/* 1. Shaded Uncertainty Fan Area (TabPFN p10-p90) */}
          {fanPath && (
            <path
              d={fanPath}
              fill="rgba(17, 19, 21, 0.04)"
              stroke="rgba(17, 19, 21, 0.10)"
              strokeWidth="1"
            />
          )}

          {/* 1b. Emerald Recovery Wedge Area (Between Reclaimed & Baseline) */}
          {wedgePath && reclaimedMonthlySavings > 0 && (
            <motion.path
              d={wedgePath}
              fill="rgba(13, 110, 82, 0.12)"
              stroke="rgba(13, 110, 82, 0.25)"
              strokeWidth="0.75"
              strokeDasharray="2 2"
              animate={{ d: wedgePath }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}

          {/* 2. Baseline Bleed Trajectory (Dashed Vermilion) */}
          {baselinePath && (
            <path
              d={baselinePath}
              fill="none"
              stroke="#C93B2B"
              strokeWidth="1.75"
              strokeDasharray="4 4"
            />
          )}

          {/* 3. Reclaimed Runway Trajectory (Smooth Solid Emerald Motion Path) */}
          {reclaimedPath && (
            <motion.path
              d={reclaimedPath}
              fill="none"
              stroke="#0D6E52"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ d: reclaimedPath }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}

          {/* Floating Reclaimed Wedge Badge at Day 90 */}
          {reclaimedMonthlySavings > 0 && points.length > 1 && (
            <g
              transform={`translate(${getX(points.length - 1) - 6}, ${Math.max(
                padTop + 14,
                getY(points[points.length - 1].reclaimed_p50) - 12
              )})`}
            >
              <rect
                x="-115"
                y="-10"
                width="120"
                height="20"
                rx="3"
                fill="#0D6E52"
                stroke="#09523d"
                strokeWidth="1"
              />
              <text
                x="-55"
                y="3.5"
                textAnchor="middle"
                className="text-[9px] font-mono font-bold fill-[#FDFCF9] tracking-wider"
              >
                +${Math.round(points[points.length - 1].reclaimed_p50 - points[points.length - 1].p50).toLocaleString()} RECLAIMED
              </text>
            </g>
          )}

          {/* Interactive Mouse Hover Crosshair */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={padTop}
                x2={getX(hoveredIndex)}
                y2={padTop + innerHeight}
                stroke="#111315"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Baseline Point */}
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(points[hoveredIndex].p50)}
                r="3.5"
                fill="#C93B2B"
                stroke="#FDFCF9"
                strokeWidth="1.5"
              />
              {/* Reclaimed Point */}
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(points[hoveredIndex].reclaimed_p50)}
                r="4.5"
                fill="#0D6E52"
                stroke="#FDFCF9"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Transparent Hover Hitbox Columns */}
          {points.map((_, idx) => {
            const x = getX(idx);
            const colWidth = innerWidth / (points.length - 1);
            return (
              <rect
                key={idx}
                x={x - colWidth / 2}
                y={padTop}
                width={colWidth}
                height={innerHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredIndex(idx)}
              />
            );
          })}
        </svg>
      </div>

      {/* Dynamic Hover Metrics Pill Strip */}
      <div className="px-5 py-2.5 bg-[#EFECE4]/50 border-t border-[#DFDBD0] text-[11px] font-mono grid grid-cols-3 gap-2">
        <div>
          <div className="text-[9px] uppercase text-[#5A5D64] tracking-wider flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" />
            TIMELINE HORIZON
          </div>
          <div className="mt-0.5 font-bold text-[#111315] tabular-nums">
            {activePt ? (activePt.day_offset === 0 ? "Day 0 (Current)" : `Day +${activePt.day_offset} (${activePt.date})`) : "Day 90"}
          </div>
        </div>

        <div>
          <div className="text-[9px] uppercase text-[#C93B2B] tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-2.5 h-2.5" />
            BASELINE BLEED
          </div>
          <div className="mt-0.5 font-bold text-[#C93B2B] tabular-nums">
            ${activePt ? activePt.p50.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
          </div>
        </div>

        <div>
          <div className="text-[9px] uppercase text-[#0D6E52] tracking-wider flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" />
            RECLAIMED BALANCE
          </div>
          <div className="mt-0.5 font-bold text-[#0D6E52] tabular-nums flex items-baseline gap-1">
            <span>${activePt ? activePt.reclaimed_p50.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</span>
            {activePt && activePt.reclaimed_p50 > activePt.p50 && (
              <span className="text-[9px] font-semibold text-[#0D6E52]">
                (+${(activePt.reclaimed_p50 - activePt.p50).toFixed(0)})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
