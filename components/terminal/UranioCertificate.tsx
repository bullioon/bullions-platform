type Props = {
  result?: "WIN" | "LOSS";
  payout?: number;
  signalId?: string;
  username?: string;
};

export function UranioCertificate({
  result = "WIN",
  payout = 0,
  signalId = "URANIO",
  username = "Bullions User",
}: Props) {
  const isWin = result === "WIN";
  const amount = Math.abs(payout || 0);
  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div
      id="uranio-certificate"
      style={{
        width: 1080,
        height: 1350,
        background: "#050705",
        color: "white",
        position: "absolute",
        left: "-99999px",
        top: 0,
        overflow: "hidden",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 10%, rgba(182,255,0,.22), transparent 32%), radial-gradient(circle at 10% 85%, rgba(139,92,246,.25), transparent 32%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 44,
          border: `2px solid ${isWin ? "rgba(182,255,0,.45)" : "rgba(248,113,113,.45)"}`,
          borderRadius: 54,
          boxShadow: `0 0 90px ${isWin ? "rgba(182,255,0,.18)" : "rgba(248,113,113,.18)"}`,
        }}
      />

      <div style={{ position: "relative", zIndex: 2, padding: "92px 76px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            padding: "16px 26px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.045)",
            color: "rgba(255,255,255,.56)",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 8,
          }}
        >
          BULLIONS AI NETWORK
        </div>

        <div
          style={{
            margin: "86px auto 0",
            width: 210,
            height: 210,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            border: `2px solid ${isWin ? "rgba(182,255,0,.48)" : "rgba(248,113,113,.48)"}`,
            background: isWin ? "rgba(182,255,0,.10)" : "rgba(248,113,113,.10)",
            fontSize: 116,
            boxShadow: `0 0 90px ${isWin ? "rgba(182,255,0,.22)" : "rgba(248,113,113,.22)"}`,
          }}
        >
          {isWin ? "☢️" : "✕"}
        </div>

        <div
          style={{
            marginTop: 62,
            color: isWin ? "#b6ff00" : "#f87171",
            fontSize: 26,
            fontWeight: 950,
            letterSpacing: 12,
          }}
        >
          URANIO OPERATION
        </div>

        <h1
          style={{
            margin: "22px 0 0",
            fontSize: 82,
            lineHeight: 0.92,
            letterSpacing: -5,
            fontWeight: 950,
          }}
        >
          {isWin ? "OPPORTUNITY CAPTURED" : "OPERATION CONTAINED"}
        </h1>

        <div
          style={{
            marginTop: 76,
            fontSize: 132,
            lineHeight: 1,
            letterSpacing: -8,
            fontWeight: 950,
            color: isWin ? "#b6ff00" : "#f87171",
            textShadow: `0 0 48px ${isWin ? "rgba(182,255,0,.25)" : "rgba(248,113,113,.25)"}`,
          }}
        >
          {isWin ? "+" : "-"}${amount.toLocaleString()}
        </div>

        <div
          style={{
            margin: "72px auto 0",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            maxWidth: 780,
            textAlign: "left",
          }}
        >
          {[
            ["USER", username],
            ["SIGNAL", signalId],
            ["CLASS", "TORION"],
            ["DATE", date],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                borderRadius: 26,
                background: "rgba(255,255,255,.045)",
                border: "1px solid rgba(255,255,255,.08)",
                padding: "24px 26px",
              }}
            >
              <div style={{ color: "rgba(255,255,255,.32)", fontSize: 18, fontWeight: 950, letterSpacing: 5 }}>
                {label}
              </div>
              <div style={{ marginTop: 10, fontSize: 28, fontWeight: 900 }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 76,
            color: "rgba(255,255,255,.36)",
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 4,
          }}
        >
          VERIFIED PERFORMANCE EVENT · BULLIONS6X.COM
        </div>
      </div>
    </div>
  );
}
