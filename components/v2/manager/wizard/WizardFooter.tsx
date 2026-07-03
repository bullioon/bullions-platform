import { Button } from "@/components/v2/ui/Button";

export function WizardFooter({
  canContinue,
  onContinue,
  label = "Continue →",
}: {
  canContinue: boolean;
  onContinue: () => void;
  label?: string;
}) {
  return (
    <footer className="flex justify-end rounded-[28px] border border-white/10 bg-[#080909] p-5">
      <Button disabled={!canContinue} onClick={onContinue}>
        {label}
      </Button>
    </footer>
  );
}
