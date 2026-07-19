"use client";

const events = [
  "🟢 Ax Prime +0.21%",
  "🟢 Bullions AI upgraded",
  "🟢 New allocation $500",
  "🟢 SIX: Market Stable",
  "🟢 Torion Desk +0.42%",
  "🟢 New investor joined",
];

export function LiveActivity(){

return(

<section className="rounded-[30px] border border-white/10 bg-[#0b0d0b] p-7">

<p className="text-[10px] font-black uppercase tracking-[.3em] text-[#b6ff00]">
Live Activity
</p>

<div className="mt-6 space-y-4">

{events.map((e)=>(

<div
key={e}
className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-4 text-sm text-white/70"
>

{e}

</div>

))}

</div>

</section>

)

}
