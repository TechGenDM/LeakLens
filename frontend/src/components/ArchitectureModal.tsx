"use client";

import React, { useEffect } from "react";
import { X, Layers, Cpu, ShieldCheck, Database, Zap, FileCode, CheckCircle2 } from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowsAnalyzed: number;
  inferenceMs: number;
  executionMode: string;
  currentPersona: string;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
  rowsAnalyzed,
  inferenceMs,
  executionMode,
  currentPersona,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#111315]/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal Dialog Container */}
      <div
        className="w-full max-w-4xl bg-[#FDFCF9] border border-[#DFDBD0] shadow-2xl rounded-[4px] overflow-hidden flex flex-col max-h-[90vh] font-sans text-[#111315]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-[#DFDBD0] bg-[#FDFCF9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D6E52] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif italic text-2xl tracking-tight text-[#111315]">
                  Architecture & Open-Weights X-Ray
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] bg-[#EFECE4] text-[#111315] border border-[#DFDBD0]">
                  SYSTEM SPEC // v3.5
                </span>
              </div>
              <p className="text-xs font-mono text-[#5A5D64] mt-0.5">
                Three-Layer Neuro-Symbolic Audit Architecture for Tabular Statement Intelligence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#5A5D64] hover:text-[#111315] hover:bg-[#EFECE4] rounded-[3px] border border-transparent hover:border-[#DFDBD0] transition-colors cursor-pointer"
            title="Close X-Ray (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Session Telemetry Bar */}
        <div className="px-6 py-2.5 bg-[#EFECE4]/60 border-b border-[#DFDBD0] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-[10px] text-[#5A5D64] block">EXECUTION MODE</span>
            <span className="font-bold text-[#0D6E52] flex items-center gap-1">
              <Cpu className="w-3 h-3 shrink-0" />
              {executionMode || "Local Open-Weights (CPU)"}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#5A5D64] block">INFERENCE LATENCY</span>
            <span className="font-bold text-[#111315] tabular-nums flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#B45309] shrink-0" />
              {inferenceMs.toFixed(1)} ms
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#5A5D64] block">DATASET AUDITED</span>
            <span className="font-bold text-[#111315] tabular-nums flex items-center gap-1">
              <Database className="w-3 h-3 text-[#5A5D64] shrink-0" />
              {rowsAnalyzed} rows ({currentPersona.replace("persona_", "").toUpperCase()})
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#5A5D64] block">FOUNDATION BACKBONE</span>
            <span className="font-bold text-[#111315] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#0D6E52] shrink-0" />
              Prior Labs TabPFN-3.5
            </span>
          </div>
        </div>

        {/* Scrollable Architectural Content */}
        <div className="p-6 overflow-y-auto space-y-6 divide-y divide-[#DFDBD0]">
          {/* Layer 1: Deterministic Pandas Rules */}
          <div className="space-y-3 pt-0">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-[2px] bg-[#111315] text-[#FDFCF9] font-mono text-xs flex items-center justify-center font-bold">
                01
              </span>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-[#111315]">
                Layer 1: Deterministic Symbolic Engine (Pandas & Rules)
              </h3>
            </div>
            <p className="text-xs text-[#5A5D64] leading-relaxed">
              Before passing rows into the neural foundation model, LeakLens partitions every transaction string through a high-precision deterministic pipeline. Essential living expenses (Rent, Utilities, Food, Groceries, Transit) are strictly quarantined from subscription leak rules.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#F6F4EE] border border-[#DFDBD0] rounded-[3px]">
                <div className="font-bold text-[#111315] flex items-center gap-1.5 mb-1">
                  <FileCode className="w-3.5 h-3.5 text-[#0D6E52]" />
                  Cadence Regularity Metric
                </div>
                <p className="text-[#5A5D64] text-[11px] leading-normal">
                  Measures normalized standard deviation of inter-charge intervals (&Delta;t). A score of 1.0 indicates exact 30-day recurring rhythm, filtering noise from occasional dining or shopping.
                </p>
              </div>

              <div className="p-3 bg-[#F6F4EE] border border-[#DFDBD0] rounded-[3px]">
                <div className="font-bold text-[#111315] flex items-center gap-1.5 mb-1">
                  <FileCode className="w-3.5 h-3.5 text-[#C93B2B]" />
                  Price Drift & Negative-Option Detection
                </div>
                <p className="text-[#5A5D64] text-[11px] leading-normal">
                  Calculates percentage hike over historical median charge (e.g. +52.6% on Render or +200% on Figma seats). Detects $0–$2 authorization charges followed 7–14 days later by full subscription debits.
                </p>
              </div>
            </div>
          </div>

          {/* Layer 2: TabPFN-3.5 Foundation Model */}
          <div className="space-y-3 pt-6">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-[2px] bg-[#0D6E52] text-[#FDFCF9] font-mono text-xs flex items-center justify-center font-bold">
                02
              </span>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-[#111315]">
                Layer 2: TabPFN-3.5 Foundation Model (Open-Weights In-Context Learning)
              </h3>
            </div>
            <p className="text-xs text-[#5A5D64] leading-relaxed">
              LeakLens employs <strong>TabPFN</strong>—the groundbreaking Prior-Data Fitted Network transformer trained offline on millions of synthetic tabular datasets. Without gradient descent fine-tuning, it performs instant Bayesian inference in a single forward pass.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#F6F4EE] border border-[#DFDBD0] rounded-[3px]">
                <div className="font-bold text-[#111315] flex items-center gap-1.5 mb-1">
                  <Cpu className="w-3.5 h-3.5 text-[#0D6E52]" />
                  TabPFNClassifier (7-Feature Vector)
                </div>
                <p className="text-[#5A5D64] text-[11px] leading-normal mb-2">
                  Fits on 350 in-context seed rows to evaluate probability of silent cash leak from:
                </p>
                <div className="text-[10px] text-[#111315] bg-[#EFECE4] p-1.5 rounded-[2px] space-y-0.5">
                  <div>1. amount_zscore</div>
                  <div>2. cadence_regularity [0.0 - 1.0]</div>
                  <div>3. price_drift_pct</div>
                  <div>4. is_micro_charge (&lt;$15)</div>
                  <div>5. charge_count_90d</div>
                  <div>6. days_since_first_seen</div>
                  <div>7. is_trial_conversion_pattern</div>
                </div>
              </div>

              <div className="p-3 bg-[#F6F4EE] border border-[#DFDBD0] rounded-[3px]">
                <div className="font-bold text-[#111315] flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-[#B45309]" />
                  TabPFNRegressor (Runway Quantile Fan)
                </div>
                <p className="text-[#5A5D64] text-[11px] leading-normal mb-2">
                  Forecasts rolling cash runway 90 days forward, predicting exact quantile intervals (p10, p50, p90) to measure risk under baseline burn versus reclaimed kill-switch savings.
                </p>
                <div className="text-[10px] text-[#0D6E52] bg-[#E6F4EF] p-1.5 rounded-[2px] font-semibold">
                  Dynamic Real-Time Reclaimed Runway: recalculates SVG vector coordinates in &lt;1ms as kill-switches are toggled.
                </div>
              </div>
            </div>
          </div>

          {/* Layer 3: Autonomous Action Drafter */}
          <div className="space-y-3 pt-6">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-[2px] bg-[#C93B2B] text-[#FDFCF9] font-mono text-xs flex items-center justify-center font-bold">
                03
              </span>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-[#111315]">
                Layer 3: Autonomous Action & Legal Shield Drafter
              </h3>
            </div>
            <p className="text-xs text-[#5A5D64] leading-relaxed">
              Detection is useless without enforcement. LeakLens equips users with legally grounded tools to eliminate recurring drain without waiting on manual support hold queues.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#F6F4EE] border border-[#DFDBD0] rounded-[3px]">
                <div className="font-bold text-[#111315] flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C93B2B]" />
                  FTC 16 CFR Part 425 & ROSCA Notice
                </div>
                <p className="text-[#5A5D64] text-[11px] leading-normal">
                  Cites the Restore Online Shoppers&apos; Confidence Act and the FTC Negative-Option Rule. Demands immediate cessation of billing authorizations, refund of unauthorized price drift, and written confirmation within 2 business days.
                </p>
              </div>

              <div className="p-3 bg-[#F6F4EE] border border-[#DFDBD0] rounded-[3px]">
                <div className="font-bold text-[#111315] flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-[#0D6E52]" />
                  RFC-5545 Kill-Switch Calendar Shield
                </div>
                <p className="text-[#5A5D64] text-[11px] leading-normal">
                  Generates downloadable .ics calendar files with alarms set 72 hours prior to the next predicted renewal date, ensuring forgotten subscriptions are cancelled before billing locks in.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#DFDBD0] bg-[#FDFCF9] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#5A5D64]">
            HACKTOBERFEST 2026 // OPEN SOURCE SUBMISSION
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-bold tracking-wider uppercase bg-[#111315] text-[#FDFCF9] rounded-[3px] hover:bg-[#2A2D32] transition-colors cursor-pointer"
          >
            [ ESC / CLOSE X-RAY ]
          </button>
        </div>
      </div>
    </div>
  );
};
