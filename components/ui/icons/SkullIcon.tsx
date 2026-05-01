export function SkullIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className="drop-shadow-[0_0_10px_rgba(163,255,18,.85)]"
    >
      <path
        d="M32 7C19.5 7 12 15.6 12 27c0 7.2 3.2 13.5 8.2 17.2V52c0 2.2 1.8 4 4 4h4v-7h7.6v7h4c2.2 0 4-1.8 4-4v-7.8C48.8 40.5 52 34.2 52 27 52 15.6 44.5 7 32 7Z"
        stroke="#a3ff12"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M23 29c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5-5-2.2-5-5Z" fill="#a3ff12" />
      <path d="M36 29c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5-5-2.2-5-5Z" fill="#a3ff12" />
      <path d="M30 40h4" stroke="#a3ff12" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
