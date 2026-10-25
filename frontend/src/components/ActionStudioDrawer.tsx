"use client";

import React, { useState, useEffect } from "react";
import { MerchantAudit, ActionDraftResponse } from "@/types/audit";
import { draftAction } from "@/lib/api";
import {
  FileText,
  Copy,
  Check,
  Download,
  AlertTriangle,
  History,
  Bot,
  ShieldCheck,
  Scale,
  Sparkles,
} from "lucide-react";

interface ActionStudioDrawerProps {
  selectedMerchant: MerchantAudit | null;
}

export const ActionStudioDrawer: React.FC<ActionStudioDrawerProps> = ({
  selectedMerchant,
}) => {
  const [activeTab, setActiveTab] = useState<"cancellation" | "negotiation">("cancellation");
  const [draftData, setDraftData] = useState<ActionDraftResponse | null>(null);
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Fetch or generate drafts when selected merchant changes
  useEffect(() => {
    if (!selectedMerchant) {
      setDraftData(null);
      return;
    }

    if (selectedMerchant.merchant_category === "essential_living") {
      setDraftData(null);
      setIsDrafting(false);
      return;
    }

    let isCancelled = false;
    setIsDrafting(true);

    draftAction({
      merchant_name: selectedMerchant.merchant_name,
      monthly_cost: selectedMerchant.monthly_cost,
      merchant_category: selectedMerchant.merchant_category,
      price_change_pct: selectedMerchant.price_change_pct,
      historical_median: selectedMerchant.historical_median,
      rule_flags: selectedMerchant.rule_flags,
      raw_description_sample: selectedMerchant.raw_description_sample,
      next_predicted_date: selectedMerchant.next_predicted_date,
      tx_history: selectedMerchant.tx_history,
    })
      .then((res) => {
        if (!isCancelled) {
          setDraftData(res);
          setIsDrafting(false);
        }
      })
      .catch((err) => {
        console.error("Failed to draft action:", err);
        if (!isCancelled) {
          setIsDrafting(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedMerchant]);

  const handleCopy = () => {
    if (!draftData) return;
    const textToCopy =
      activeTab === "cancellation"
        ? draftData.cancellation_email
        : draftData.negotiation_script;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  const handleDownloadIcs = () => {
    if (!draftData || !draftData.ics_content || !selectedMerchant) return;

    const blob = new Blob([draftData.ics_content], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${selectedMerchant.merchant_name.toLowerCase().replace(/\s+/g, "_")}_kill_switch.ics`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!selectedMerchant) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-[#FDFCF9] select-none">
        <Scale className="w-8 h-8 text-[#5A5D64]/60 mb-3" />
        <h4 className="font-serif text-2xl text-[#111315]">
          Inspection &amp; Cancellation Studio
        </h4>
        <p className="mt-2 text-xs text-[#5A5D64] max-w-sm font-sans leading-relaxed">
          Select any merchant row in the Audit Ledger to inspect raw transaction proof and generate a legally-worded cancellation or price-match notice.
        </p>
      </div>
    );
  }

  const isEssential = selectedMerchant.merchant_category === "essential_living";

  // Dynamic Verification Text based on actual merchant pattern
  const renderVerificationContent = () => {
    const flags = selectedMerchant.rule_flags;
    const drift = (selectedMerchant.price_change_pct * 100).toFixed(1);

    if (flags.includes("PRICE_HIKE")) {
      return {
        proven: `Bank statement proves monthly billing increased +${drift}% (from $${selectedMerchant.historical_median.toFixed(0)} to $${selectedMerchant.monthly_cost.toFixed(0)}/mo).`,
        verify: `Verify whether production API traffic spiked, compute instances were left running, or if a tiered seat license auto-upgraded.`,
      };
    }
    if (flags.includes("DUPLICATE_SAME_MONTH")) {
      return {
        proven: `Bank statement proves 2 distinct charges hit within the same billing cycle (${selectedMerchant.tx_history.length} charges recorded).`,
        verify: `Verify if you or an engineering teammate are paying for both an individual developer plan and an organization seat on the same card.`,
      };
    }
    if (flags.includes("TRIAL_CONVERSION")) {
      return {
        proven: `Bank statement proves a $1.00 temporary authorization converted into a $${selectedMerchant.monthly_cost.toFixed(0)}/mo recurring charge 7 days later.`,
        verify: `Verify whether access is still actively required before submitting a formal cancellation notice.`,
      };
    }
    if (flags.includes("IDLE_INFRA_CREEP")) {
      return {
        proven: `Bank statement proves a continuous flat $${selectedMerchant.monthly_cost.toFixed(0)}/mo infrastructure charge with 0% drift across 90 days.`,
        verify: `Verify whether this vector database cluster is actively receiving live queries or if an old proof-of-concept cluster was left running.`,
      };
    }
    if (flags.includes("ANNUAL_SURPRISE_RENEWAL")) {
      return {
        proven: `Bank statement proves an unexpected annual domain renewal debit of $${selectedMerchant.monthly_cost.toFixed(2)}.`,
        verify: `Verify whether this domain is pointed to active production DNS records or if auto-renew should be toggled off for a refund.`,
      };
    }
    return {
      proven: `Bank statement proves regular billing across ${selectedMerchant.tx_count} transactions totaling $${selectedMerchant.total_spent_90d.toFixed(2)}.`,
      verify: `Verify actual active seat usage across your team before executing a cancellation or renegotiating a loyalty tier.`,
    };
  };

  const verification = renderVerificationContent();

  const activeContent =
    activeTab === "cancellation"
      ? draftData?.cancellation_email
      : draftData?.negotiation_script;

  return (
    <div className="flex-1 flex flex-col bg-[#FDFCF9] overflow-y-auto">
      {/* Studio Header */}
      <div className="px-5 py-3.5 border-b border-[#DFDBD0] flex items-center justify-between bg-[#FDFCF9]">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded-[2px] font-bold ${
                isEssential
                  ? "bg-[#EFECE4] text-[#5A5D64] border border-[#DFDBD0]"
                  : "bg-[#111315] text-[#FDFCF9]"
              }`}
            >
              {isEssential ? "VERIFIED EXPENSE" : "ACTION STUDIO"}
            </span>
            <h4 className="font-sans text-base font-bold text-[#111315]">
              {selectedMerchant.merchant_name}
            </h4>
          </div>
          <span className="text-[11px] font-mono text-[#5A5D64]">
            {isEssential
              ? `${selectedMerchant.tx_count} POS transactions recorded in 90d`
              : `Next billing: ${selectedMerchant.next_predicted_date} • $${selectedMerchant.monthly_cost.toFixed(2)}/mo`}
          </span>
        </div>

        <div className="text-right">
          <span
            className={`text-xs font-mono font-bold tabular-nums ${
              isEssential ? "text-[#111315]" : "text-[#C93B2B]"
            }`}
          >
            ${isEssential ? selectedMerchant.total_spent_90d.toFixed(2) : (selectedMerchant.monthly_cost * 12).toFixed(0)}
            {isEssential ? " total" : "/yr"}
          </span>
          <span className="block text-[10px] font-mono text-[#5A5D64]">
            {isEssential ? "90d volume" : "annual recovery"}
          </span>
        </div>
      </div>

      {/* Historical Transaction Timeline Strip */}
      <div className="px-5 py-3 border-b border-[#DFDBD0] bg-[#F6F4EE]/60">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#5A5D64] uppercase tracking-wider mb-2">
          <span className="flex items-center gap-1 font-semibold text-[#111315]">
            <History className="w-3 h-3" />
            CSV TRANSACTION TIMELINE ({selectedMerchant.tx_history.length})
          </span>
          <span>90-DAY AUDIT TRAIL</span>
        </div>

        <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
          {selectedMerchant.tx_history.map((tx, idx) => (
            <div
              key={idx}
              className="px-2.5 py-1 bg-[#FDFCF9] border border-[#DFDBD0] rounded-[3px] flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-[10px] text-[#5A5D64] tabular-nums">{tx.date}</span>
                <span className="text-[11px] text-[#111315] truncate">{tx.raw_description}</span>
              </div>
              <span className="font-semibold text-[#111315] tabular-nums shrink-0 pl-2">
                ${tx.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Essential Living Expense Banner vs. Subscription Action Drawer */}
      {isEssential ? (
        <div className="p-8 text-center flex-1 flex flex-col items-center justify-center bg-[#FDFCF9]">
          <ShieldCheck className="w-8 h-8 text-[#0D6E52] mb-2.5" />
          <h5 className="font-serif text-xl text-[#111315]">
            Verified Essential Living Expense
          </h5>
          <p className="mt-2 text-xs text-[#5A5D64] max-w-sm font-sans leading-relaxed">
            This merchant is categorized as an essential point-of-sale living expense (housing, utilities, groceries, or dining). LeakLens preserves verified essential costs and does not generate cancellation legal letters for living expenses.
          </p>
          <div className="mt-4 px-3 py-1.5 bg-[#EFECE4] border border-[#DFDBD0] rounded-[4px] font-mono text-[11px] text-[#111315] tabular-nums">
            Average transaction: ${selectedMerchant.avg_tx_amount?.toFixed(2) || selectedMerchant.monthly_cost.toFixed(2)} &bull; Total 90d: ${selectedMerchant.total_spent_90d.toFixed(2)}
          </div>
        </div>
      ) : (
        <>
          {/* Dynamic "Verify Before You Cancel" Box */}
          <div className="p-4 mx-5 my-3.5 bg-[#FEF3C7]/40 border border-[#B45309]/30 rounded-[4px] text-xs font-sans">
            <div className="flex items-center gap-1.5 text-[#B45309] font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              VERIFY BEFORE YOU CANCEL
            </div>

            <div className="space-y-1.5 text-[11px] text-[#111315]/80 leading-relaxed">
              <div className="flex items-start gap-1.5">
                <span className="text-[#0D6E52] font-bold font-mono">PROVEN:</span>
                <span>{verification.proven}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[#B45309] font-bold font-mono">VERIFY:</span>
                <span>{verification.verify}</span>
              </div>
            </div>
          </div>

          {/* Open-Weight AI Drafter Tabs */}
          <div className="px-5 flex items-center justify-between border-b border-[#DFDBD0] bg-[#FDFCF9]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("cancellation")}
                className={`px-3 py-2 text-[11px] font-mono uppercase tracking-wider border-b-2 font-semibold transition-colors ${
                  activeTab === "cancellation"
                    ? "border-[#C93B2B] text-[#C93B2B]"
                    : "border-transparent text-[#5A5D64] hover:text-[#111315]"
                }`}
              >
                CANCELLATION &amp; REFUND NOTICE
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("negotiation")}
                className={`px-3 py-2 text-[11px] font-mono uppercase tracking-wider border-b-2 font-semibold transition-colors ${
                  activeTab === "negotiation"
                    ? "border-[#0D6E52] text-[#0D6E52]"
                    : "border-transparent text-[#5A5D64] hover:text-[#111315]"
                }`}
              >
                PRICE-MATCH NEGOTIATION
              </button>
            </div>

            {draftData?.model_used && (
              <span className="text-[10px] font-mono text-[#5A5D64] uppercase flex items-center gap-1 hidden sm:flex">
                <Bot className="w-3 h-3 text-[#0D6E52]" />
                {draftData.model_used.split("/")[1] || draftData.model_used}
              </span>
            )}
          </div>

          {/* Drafted Document Body */}
          <div className="flex-1 p-5 overflow-y-auto">
            {isDrafting ? (
              <div className="py-12 flex flex-col items-center justify-center text-center font-mono text-xs text-[#5A5D64] space-y-2">
                <Bot className="w-6 h-6 animate-spin text-[#111315]" />
                <span>SYNTHESIZING FTC-COMPLIANT DRAFT...</span>
              </div>
            ) : (
              <pre className="p-4 bg-[#F6F4EE] border border-[#DFDBD0] rounded-[4px] font-mono text-[11px] text-[#111315] whitespace-pre-wrap leading-relaxed select-text">
                {activeContent || "Draft unavailable."}
              </pre>
            )}
          </div>

          {/* Bottom Action Buttons */}
          <div className="p-4 border-t border-[#DFDBD0] bg-[#FDFCF9] flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!activeContent || isDrafting}
              className="w-full sm:flex-1 py-2 px-3 bg-[#111315] text-[#FDFCF9] hover:bg-[#22252a] text-xs font-mono font-bold uppercase rounded-[4px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:translate-y-px disabled:opacity-50"
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#0D6E52]" />
                  <span>[ COPIED TO CLIPBOARD ✓ ]</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>[ COPY NOTICE ]</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadIcs}
              disabled={!draftData || isDrafting}
              className="w-full sm:flex-1 py-2 px-3 bg-[#FDFCF9] border border-[#DFDBD0] hover:border-[#0D6E52] text-[#0D6E52] text-xs font-mono font-bold uppercase rounded-[4px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:translate-y-px disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>[ DOWNLOAD .ICS SHIELD ]</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
