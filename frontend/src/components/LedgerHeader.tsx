"use client";

import React, { useRef } from "react";
import { Upload, Cpu, Activity, Database, Layers } from "lucide-react";

interface LedgerHeaderProps {
  currentPersona: string;
  onSelectPersona: (personaId: string) => void;
  onUploadCsv: (file: File) => void;
  onOpenXRay?: () => void;
  executionMode: string;
  inferenceMs: number;
  rowsAnalyzed: number;
  isLoading: boolean;
}

const PERSONA_BUTTONS = [
  { id: "persona_dev", code: "01", label: "INDIE DEV SAAS" },
  { id: "persona_student", code: "02", label: "STUDENT TRIAL CREEP" },
  { id: "persona_freelancer", code: "03", label: "FREELANCER CASHFLOW" },
];

export const LedgerHeader: React.FC<LedgerHeaderProps> = ({
  currentPersona,
  onSelectPersona,
  onUploadCsv,
  onOpenXRay,
  executionMode,
  inferenceMs,
  rowsAnalyzed,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCsv(e.target.files[0]);
    }
  };

  return (
    <header className="w-full bg-[#FDFCF9] border-b border-[#DFDBD0] select-none">
      <div className="w-full px-4 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Editorial Brand Mark & Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D6E52] animate-pulse inline-block" />
            <h1 className="font-mono text-sm tracking-tight font-bold text-[#111315]">
              LEAKLENS <span className="text-[#5A5D64] font-normal">// 03</span>
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-[#DFDBD0] text-[11px] font-mono tracking-wider text-[#5A5D64] uppercase tabular-nums">
            <span className="flex items-center gap-1 bg-[#EFECE4] px-2 py-0.5 rounded-[3px] border border-[#DFDBD0]/70">
              <Cpu className="w-3 h-3 text-[#111315]" />
              <span className="text-[#111315] font-semibold">{executionMode || "LOCAL OPEN-WEIGHTS (TabPFN-3.5)"}</span>
            </span>

            <span className="flex items-center gap-1 bg-[#EFECE4] px-2 py-0.5 rounded-[3px] border border-[#DFDBD0]/70">
              <Activity className="w-3 h-3 text-[#0D6E52]" />
              <span>LATENCY:</span>
              <span className="text-[#111315] font-semibold font-mono">{inferenceMs.toFixed(1)}ms</span>
            </span>

            <span className="flex items-center gap-1 bg-[#EFECE4] px-2 py-0.5 rounded-[3px] border border-[#DFDBD0]/70">
              <Database className="w-3 h-3 text-[#5A5D64]" />
              <span>ROWS:</span>
              <span className="text-[#111315] font-semibold font-mono">{rowsAnalyzed}</span>
            </span>
          </div>
        </div>

        {/* Center/Right: Hardware Selector Keys + CSV Drop Trigger */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex items-center p-0.5 bg-[#EFECE4] border border-[#DFDBD0] rounded-[4px] gap-0.5">
            {PERSONA_BUTTONS.map((persona) => {
              const isActive = currentPersona === persona.id;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => onSelectPersona(persona.id)}
                  disabled={isLoading}
                  className={`px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase transition-all duration-150 rounded-[3px] flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#111315] text-[#FDFCF9] shadow-inner font-semibold"
                      : "text-[#5A5D64] hover:text-[#111315] hover:bg-[#FDFCF9]/60 disabled:opacity-50"
                  }`}
                >
                  <span className={`text-[9px] ${isActive ? "text-[#0D6E52]" : "text-[#5A5D64]"}`}>
                    {persona.code}
                  </span>
                  <span>{persona.label}</span>
                </button>
              );
            })}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Hardware Drop Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={`px-3 py-1.5 text-[11px] font-mono tracking-wider uppercase bg-[#FDFCF9] border border-[#DFDBD0] hover:border-[#111315] text-[#111315] rounded-[4px] flex items-center gap-1.5 transition-colors duration-150 active:translate-y-px ${
              isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <Upload className="w-3 h-3 text-[#5A5D64]" />
            <span>[ + DROP CSV ]</span>
          </button>

          {/* Hybrid AI X-Ray Hardware Button */}
          {onOpenXRay && (
            <button
              type="button"
              onClick={onOpenXRay}
              className="px-2.5 py-1.5 text-[11px] font-mono font-bold tracking-wider uppercase bg-[#111315] text-[#FDFCF9] hover:bg-[#2A2D32] border border-[#111315] rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer active:translate-y-px shadow-xs"
            >
              <Layers className="w-3 h-3 text-[#0D6E52]" />
              <span>[ HYBRID AI X-RAY ]</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
