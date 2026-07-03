import { MyStrategies } from "@/components/v2/manager/strategies/MyStrategies";

export default function ManagerStrategiesPage() {
  return (
    <main className="min-h-screen bg-[#050606] px-5 py-8 text-white">
      <div className="mx-auto max-w-[1200px]">
        <MyStrategies />
      </div>
    </main>
  );
}
