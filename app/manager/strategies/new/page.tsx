import { CreateStrategyWizard } from "@/components/v2/manager/wizard/CreateStrategyWizard";

export default function NewStrategyPage() {
  return (
    <main className="min-h-screen bg-[#050606] px-5 py-8 text-white">
      <div className="mx-auto max-w-[900px]">
        <CreateStrategyWizard />
      </div>
    </main>
  );
}
