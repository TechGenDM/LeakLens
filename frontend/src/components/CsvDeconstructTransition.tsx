"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ShieldCheck } from "lucide-react";

interface CsvDeconstructTransitionProps {
  isVisible: boolean;
  rawSampleLines?: string[];
  sourceName?: string;
}

const DEFAULT_RAW_SAMPLES = [
  "2026-10-03 | POS DEB STRIPE*RENDER-SRV             | $29.00  [+52.6% DRIFT]",
  "2026-09-30 | ACH WEB PINECONE*IO-VEC               | $70.00  [IDLE VECTOR DB]",
  "2026-09-12 | GITHUB*COPILOT-PRO SUBSCRIPTION       | $10.00  [DUPLICATE SWIPE]",
  "2026-10-17 | COURSERA*PLUS MONTHLY SUBSCR          | $59.00  [CONVERTED TRIAL]",
  "2026-10-08 | FIGMA*ORG-SEAT LICENSE INV-9921       | $45.00  [SEAT AUTO-UPGRADE]",
  "2026-10-01 | ACH ELECTRONIC DEBIT APARTMENT RENT   | $1950.00 [ESSENTIAL RENT]",
  "2026-09-28 | AMZN WEB SERVICES AWS.AMAZON.CO       | $43.80  [CLOUD HOSTING]",
  "2026-09-15 | OPENAI *API-USAGE RECURRING           | $94.80  [USAGE CREEP]",
];

export const CsvDeconstructTransition: React.FC<CsvDeconstructTransitionProps> = ({
  isVisible,
  rawSampleLines = DEFAULT_RAW_SAMPLES,
  sourceName = "CSV_FEED",
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          className="absolute inset-0 z-40 bg-[#111315]/95 backdrop-blur-[2px] flex flex-col justify-between p-6 select-none overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#DFDBD0]/20 pb-3 text-[11px] font-mono text-[#FDFCF9]">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#C93B2B]" />
              <span className="text-[#C93B2B] font-bold tracking-wider uppercase">
                RAW-TO-REFINED SCAN
              </span>
              <span className="text-[#DFDBD0]/40">//</span>
              <span className="text-[#DFDBD0]/80 uppercase">{sourceName}</span>
            </div>

            <div className="flex items-center gap-2 text-[#0D6E52]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D6E52] animate-ping" />
              <span className="text-[10px] tracking-widest font-semibold uppercase">
                TABPFN-3.5 IN-CONTEXT INGESTION
              </span>
            </div>
          </div>

          {/* Sweeping Vermilion Scanline */}
          <motion.div
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{
              duration: 0.55,
              ease: "linear",
            }}
            className="absolute left-0 right-0 h-[2px] bg-[#C93B2B] shadow-[0_0_12px_#C93B2B] pointer-events-none z-50"
          />

          {/* Raw Monospace Stream */}
          <div className="my-auto font-mono text-xs text-[#DFDBD0] space-y-1.5 max-w-3xl">
            {rawSampleLines.slice(0, 8).map((line, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.035, duration: 0.12 }}
                className="flex items-center gap-3 py-0.5 border-b border-[#DFDBD0]/5 font-mono text-[11px]"
              >
                <span className="text-[#5A5D64] text-[10px] tabular-nums">
                  [{String(idx + 1).padStart(2, "0")}]
                </span>
                <span className="text-[#FDFCF9]/90 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  {line}
                </span>
                <span className="text-[#C93B2B] font-semibold text-[10px] ml-auto uppercase tracking-wider">
                  IDENTIFIED
                </span>
              </motion.div>
            ))}
          </div>

          {/* Footer Bar */}
          <div className="border-t border-[#DFDBD0]/20 pt-3 flex items-center justify-between text-[10px] font-mono text-[#5A5D64]">
            <div className="flex items-center gap-1.5 text-[#FDFCF9]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0D6E52]" />
              <span>TOKENIZING MESSY STRINGS &rarr; CANONICAL RECURRING GROUPS</span>
            </div>
            <span className="text-[#C93B2B] font-bold tabular-nums animate-pulse">
              550MS SCANLINE ACTIVE
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
