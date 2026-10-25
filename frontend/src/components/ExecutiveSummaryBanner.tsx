"use client";

import React, { useEffect, useState } from "react";
import { useSpring } from "framer-motion";
import { TrendingUp, ShieldAlert, ArrowDownRight, Sparkles } from "lucide-react";

interface ExecutiveSummaryBannerProps {
  rowsAnalyzed: number;
  flaggedCount: number;
  annualLeakEstimate: number;
  monthlyRecurringBurn: number;
  reclaimedAnnualCash: number;
  threeYearCompoundedSaved: number;
}

export const ExecutiveSummaryBanner: React.FC<ExecutiveSummaryBannerProps> = ({
  rowsAnalyzed,
  flaggedCount,
  annualLeakEstimate,
  monthlyRecurringBurn,
  reclaimedAnnualCash,
  threeYearCompoundedSaved,
}) => {
  // Animated spring odometer for reclaimed annual cash
  const springReclaimed = useSpring(reclaimedAnnualCash, {
    stiffness: 380,
    damping: 32,
    mass: 0.8,
  });

  const [odometerValue, setOdometerValue] = useState(reclaimedAnnualCash);

  useEffect(() => {
    springReclaimed.set(reclaimedAnnualCash);
  }, [reclaimedAnnualCash, springReclaimed]);

  useEffect(() => {
    return springReclaimed.on("change", (latest) => {
      setOdometerValue(Math.round(latest));
    });
  }, [springReclaimed]);

  // Dynamic calculation for 3-year compounded savings based on reclaimed cash
  // (If reclaimedAnnualCash is 0, show the potential total recoverable 3-year value)
  const activeAnnualFor3Yr = reclaimedAnnualCash > 0 ? reclaimedAnnualCash : annualLeakEstimate;
  const monthlyContrib = activeAnnualFor3Yr / 12.0;
  const rMonthly = 0.07 / 12.0;
  const dynamicThreeYear = Math.round(
    monthlyContrib > 0 ? monthlyContrib * (((1 + rMonthly) ** 36 - 1) / rMonthly) : 0
  );

  return (
    <section className="w-full bg-[#FDFCF9] border-b border-[#DFDBD0] text-[#111315]">
      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#DFDBD0]">
        {/* Cell 1 (5 cols): Editorial Headline */}
        <div className="md:col-span-5 p-6 lg:p-8 flex flex-col justify-between bg-[#FDFCF9]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono tracking-widest uppercase bg-[#FCECE9] text-[#C93B2B] px-2 py-0.5 border border-[#C93B2B]/20 rounded-[2px] font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              AUDIT VERDICT
            </span>
            <span className="text-[10px] font-mono text-[#5A5D64] uppercase tracking-wider">
              IN-CONTEXT PROBABILISTIC SYNTHESIS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl text-[#111315] leading-[1.12] tracking-[-0.02em]">
            We audited <span className="font-mono text-2xl sm:text-3xl font-semibold tracking-normal text-[#111315] tabular-nums">{rowsAnalyzed}</span> raw
            bank rows and isolated <span className="font-mono text-2xl sm:text-3xl font-semibold tracking-normal text-[#C93B2B] tabular-nums">{flaggedCount}</span> silent
            cash leaks costing you <span className="font-mono text-2xl sm:text-3xl font-semibold tracking-normal text-[#C93B2B] tabular-nums">${annualLeakEstimate.toLocaleString()}</span>
            /yr.
          </h2>

          <p className="mt-4 text-xs text-[#5A5D64] font-sans leading-relaxed">
            Every subscription scored via TabPFN-3.5 prior-data distributions. Toggle the tactile kill-switches below to update your runway in real time.
          </p>
        </div>

        {/* Cell 2 (2 cols): Monthly Recurring Burn */}
        <div className="md:col-span-2 p-6 flex flex-col justify-between bg-[#FDFCF9]/60">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#5A5D64] flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-[#C93B2B]" />
              MONTHLY RECURRING BURN
            </div>
            <div className="mt-3 font-mono text-3xl lg:text-4xl font-semibold text-[#111315] tabular-nums tracking-tight">
              ${monthlyRecurringBurn.toFixed(2)}
            </div>
            <span className="text-[11px] font-mono text-[#5A5D64] tracking-tight">
              active recurring subscriptions
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DFDBD0]/70 flex items-center justify-between text-[11px] font-mono text-[#5A5D64]">
            <span>ANNUAL RUN-RATE:</span>
            <span className="text-[#111315] font-semibold tabular-nums">
              ${(monthlyRecurringBurn * 12).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Cell 3 (3 cols): Reclaimed Annual Cash (Animated Odometer) */}
        <div className="md:col-span-3 p-6 flex flex-col justify-between bg-[#E6F4EF]/40 border-l border-[#DFDBD0]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#0D6E52] flex items-center gap-1.5 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              RECLAIMED ANNUAL CASH
            </div>

            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="font-serif text-3xl text-[#0D6E52] italic">$</span>
              <span className="font-mono text-4xl lg:text-5xl font-bold text-[#0D6E52] tabular-nums tracking-tight">
                {odometerValue.toLocaleString()}
              </span>
              <span className="font-mono text-xs text-[#0D6E52] font-semibold uppercase">/yr</span>
            </div>

            <p className="mt-2 text-xs text-[#0D6E52]/90 font-sans">
              {reclaimedAnnualCash > 0 ? (
                <>Tactile kill-switches active. Cash returned directly to your ledger runway.</>
              ) : (
                <>Click any merchant Kill-Switch below to begin reclaiming silent leaks.</>
              )}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#0D6E52]/20 flex items-center justify-between text-[11px] font-mono text-[#0D6E52]">
            <span>MONTHLY RECOVERY:</span>
            <span className="font-semibold tabular-nums">
              +${(reclaimedAnnualCash / 12).toFixed(2)}/mo
            </span>
          </div>
        </div>

        {/* Cell 4 (2 cols): 3-Year Compounded Saved */}
        <div className="md:col-span-2 p-6 flex flex-col justify-between bg-[#FDFCF9]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#5A5D64] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#B45309]" />
              3-YR COMPOUNDED
            </div>

            <div className="mt-3 font-mono text-2xl lg:text-3xl font-semibold text-[#111315] tabular-nums tracking-tight">
              ${dynamicThreeYear.toLocaleString()}
            </div>

            <span className="text-[11px] font-sans text-[#5A5D64] leading-tight block mt-1">
              Reinvested at 7% historic index yield over 36 months.
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DFDBD0]/70 flex items-center justify-between text-[11px] font-mono text-[#5A5D64]">
            <span>PORTFOLIO MULTIPLIER:</span>
            <span className="text-[#0D6E52] font-semibold tabular-nums">+1.11x</span>
          </div>
        </div>
      </div>
    </section>
  );
};
