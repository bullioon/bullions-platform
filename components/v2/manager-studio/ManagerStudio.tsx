"use client";

import { useState } from "react";

import { HeroPreview } from "./HeroPreview";
import { IdentityEditor } from "./IdentityEditor";
import { StudioProvider } from "./StudioContext";

import { managerCapabilities } from "@/core/v2/manager-os/capabilities";

export function ManagerStudio() {

  const [active,setActive]=useState("identity");

  const activePlugin = managerCapabilities.find(
    p=>p.id===active
  );

  return (

<StudioProvider>

<div className="min-h-screen bg-[#050606] text-white">

<div className="mx-auto grid max-w-[1800px] grid-cols-[280px_1fr] gap-10 px-10 py-10">

<aside className="sticky top-10 h-fit">

<p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#b6ff00]">
Bullions OS
</p>

<h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">
Manager Studio
</h1>

<p className="mt-3 text-white/45">
Build your investment identity.
</p>

<div className="mt-10 space-y-2">

{managerCapabilities.map(plugin=>(

<button

key={plugin.id}

onClick={()=>setActive(plugin.id)}

className={`w-full rounded-2xl px-5 py-4 text-left transition

${active===plugin.id

?"bg-[#b6ff00] text-black"

:"text-white/45 hover:bg-white/[0.04] hover:text-white"

}

`}

>

<div className="font-black">

{plugin.title}

</div>

<div className="mt-1 text-xs opacity-70">

{plugin.description}

</div>

</button>

))}

</div>

</aside>

<main className="space-y-8">

<HeroPreview/>

<section className="rounded-[34px] border border-white/10 bg-[#080909] p-10">

<p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">

{activePlugin?.title}

</p>

<h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">

{activePlugin?.title}

</h2>

<div className="mt-8">

{

active==="identity"

? <IdentityEditor/>

: (

<div className="rounded-3xl border border-dashed border-white/10 p-12 text-white/35">

{activePlugin?.title} capability coming soon.

</div>

)

}

</div>

</section>

</main>

</div>

</div>

</StudioProvider>

  );

}
