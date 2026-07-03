"use client";

import { useState } from "react";

import {
  createDraft,
  publishDraft,
  updateDraftIdentity,
  updateDraftInvestment,
  updateDraftMarkets,
} from "@/core/v2/manager";

import { WizardHeader } from "./WizardHeader";
import { WizardFooter } from "./WizardFooter";
import { StepIdentity } from "./StepIdentity";
import { StepMarkets } from "./StepMarkets";
import { StepInvestment } from "./StepInvestment";
import { savePublishedDraft, saveStrategy } from "@/core/v2/manager/strategyStore";
import { strategyFromDraft } from "@/core/v2/domain/strategyFromDraft";

export function CreateStrategyWizard() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(createDraft());

  const canContinue =
    step === 1
      ? draft.identity.name.trim().length >= 3 &&
        draft.identity.subtitle.trim().length >= 3
      : step === 2
        ? draft.markets.selected.length > 0 && draft.markets.primary.length > 0
        : true;

  function toggleMarket(market: string) {
    const exists = draft.markets.selected.includes(market);

    const selected = exists
      ? draft.markets.selected.filter((m) => m !== market)
      : [...draft.markets.selected, market];

    const primary = selected.includes(draft.markets.primary)
      ? draft.markets.primary
      : selected[0] ?? "";

    setDraft(updateDraftMarkets(draft, { selected, primary }));
  }

  async function handleContinue() {
    if (!canContinue) return;

    if (step < 4) {
      setStep((s) => Math.min(s + 1, 4));
      return;
    }

    try {
      const published = publishDraft(draft);
      const strategy = strategyFromDraft(published);
      await saveStrategy(strategy);
      window.location.href = "/manager/strategies";
    } catch (error: any) {
      alert(error?.message || "Could not publish strategy.");
    }
  }

  return (
    <section className="space-y-5">
      <WizardHeader step={step} />

      {step === 1 && (
        <StepIdentity
          name={draft.identity.name}
          subtitle={draft.identity.subtitle}
          description={draft.identity.description}
          onNameChange={(value) =>
            setDraft(updateDraftIdentity(draft, { name: value }))
          }
          onSubtitleChange={(value) =>
            setDraft(updateDraftIdentity(draft, { subtitle: value }))
          }
          onDescriptionChange={(value) =>
            setDraft(updateDraftIdentity(draft, { description: value }))
          }
        />
      )}

      {step === 2 && (
        <StepMarkets
          selected={draft.markets.selected}
          primary={draft.markets.primary}
          onToggle={toggleMarket}
          onPrimary={(market) =>
            setDraft(updateDraftMarkets(draft, { primary: market }))
          }
        />
      )}

      {step === 3 && (
        <StepInvestment
          investment={draft.investment}
          onChange={(investment) =>
            setDraft(updateDraftInvestment(draft, investment))
          }
        />
      )}

      {step === 4 && (
        <section className="rounded-[32px] border border-white/10 bg-[#080909] p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8b4ff]">
            Review
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white">
            {draft.identity.name}
          </h2>

          <p className="mt-2 text-lg text-white/45">
            {draft.identity.subtitle}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/35">Markets</p>
              <p className="mt-2 font-black text-white">
                {draft.markets.selected.join(" · ")}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/35">Primary</p>
              <p className="mt-2 font-black text-white">
                {draft.markets.primary}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/35">Risk</p>
              <p className="mt-2 font-black text-white">
                {draft.investment.riskProfile}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/35">Capacity</p>
              <p className="mt-2 font-black text-[#b6ff00]">
                ${draft.investment.capacity.toLocaleString()}
              </p>
            </div>
          </div>
        </section>
      )}

      <WizardFooter
        canContinue={canContinue}
        label={step === 4 ? "Publish Strategy →" : "Continue →"}
        onContinue={handleContinue}
      />
    </section>
  );
}
