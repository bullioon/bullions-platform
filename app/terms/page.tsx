export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050607] px-5 py-10 text-white">
      <section className="mx-auto max-w-[920px] rounded-[32px] bg-[#111214] p-8 ring-1 ring-white/5">
        <p className="text-sm text-[#b6ff00]">Bullions Legal</p>
        <h1 className="mt-3 text-4xl font-semibold">Terms of Service</h1>

        <div className="mt-8 space-y-6 text-sm leading-7 text-white/60">
          <p>Effective Date: May 2026</p>

          <p>
            Bullions provides AI-assisted copy trading infrastructure, trader ranking,
            risk visibility tools and capital allocation controls.
          </p>

          <p>
            Bullions does not guarantee profits, fixed returns or capital appreciation.
            Trading and copy trading involve risk.
          </p>

          <p>
            Users are responsible for their own decisions, wallet security and use of
            the platform.
          </p>

          <p>
            Bullions may limit withdrawals, pause engine activity, modify allocation
            rules, apply survival protections or suspend abusive accounts for platform
            stability and risk management.
          </p>

          <p>
            By using Bullions, you agree to these Terms.
          </p>
        </div>
      </section>
    </main>
  );
}
