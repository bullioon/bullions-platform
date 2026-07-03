import type { ManagerStrategy } from "@/types/v2/managerStrategy";

export const managerStrategies: ManagerStrategy[] = [

{
    id:"ghost-alpha",
    name:"Ghost Alpha",
    status:"ACTIVE",
    verified:true,
    capitalFollowing:1800000,
    allocators:842,
    roi:28.4,
    maxDrawdown:4.8,
    profitFactor:2.31,
    createdAt:"Jan 2026"
},

{
    id:"london-macro",
    name:"London Macro",
    status:"DRAFT",
    verified:false,
    capitalFollowing:0,
    allocators:0,
    roi:0,
    maxDrawdown:0,
    profitFactor:0,
    createdAt:"Today"
}

];
