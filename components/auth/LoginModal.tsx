"use client";

export default function LoginModal({ onClose, onLogin }: {
  onClose: () => void;
  onLogin: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-[420px] rounded-[28px] bg-[#121417] p-6 shadow-xl ring-1 ring-white/5">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            Connect your wallet
          </h2>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-white/10 text-white"
          >
            ×
          </button>
        </div>

        {/* CONTENT */}
        <p className="text-sm text-white/50 mb-6">
          Login to load your balance, deposits and performance.
        </p>

        {/* BUTTON */}
        <button
          onClick={onLogin}
          className="h-[56px] w-full rounded-full bg-[#b6ff00] text-black font-semibold"
        >
          Connect (Demo)
        </button>

      </div>
    </div>
  );
}
