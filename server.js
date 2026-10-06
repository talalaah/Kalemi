require("dotenv").config();
const express=require("express"),path=require("path");
const app=express(),PORT=process.env.PORT||3000,TOKEN=process.env.SPORTMONKS_TOKEN;
app.use(express.json()); app.use(express.static(path.join(__dirname,"public")));
const API="https://api.sportmonks.com/v3/football";
async function sm(endpoint,params={}){
 const u=new URL(`${API}/${endpoint}`);
 for(const [k,v] of Object.entries(params)) if(v!==undefined&&v!==null&&v!=="") u.searchParams.set(k,v);
 const r=await fetch(u,{headers:{Authorization:TOKEN||"",Accept:"application/json"}});
 const t=await r.text(); let b; try{b=JSON.parse(t)}catch{b={raw:t}}
 if(!r.ok){const e=new Error(b?.message||b?.error?.message||`Sportmonks HTTP ${r.status}`);e.status=r.status;throw e}
 return b;
}
const date=(n=0)=>{const d=new Date();d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
app.get("/api/matches/today",async(_,res)=>{try{const d=date();const j=await sm(`fixtures/date/${d}`,{include:"participants;scores;state;league;events"});res.json({date:d,data:j.data||[]})}catch(e){res.status(e.status||500).json({error:e.message})}});
app.get("/api/matches/tomorrow",async(_,res)=>{try{const d=date(1);const j=await sm(`fixtures/date/${d}`,{include:"participants;scores;state;league"});res.json({date:d,data:j.data||[]})}catch(e){res.status(e.status||500).json({error:e.message})}});
app.get("/api/live",async(_,res)=>{try{const j=await sm("livescores",{include:"participants;events;scores;state;league"});res.json({data:j.data||[]})}catch(e){res.status(e.status||500).json({error:e.message})}});
app.get("/api/matches/:id",async(req,res)=>{try{const j=await sm(`fixtures/${encodeURIComponent(req.params.id)}`,{include:"participants;scores;events;lineups;statistics;state;league;odds;inplayOdds"});res.json(j)}catch(e){res.status(e.status||500).json({error:e.message})}});
app.get("/api/health",(_,res)=>res.json({ok:true,tokenConfigured:Boolean(TOKEN)}));
app.listen(PORT,()=>console.log(`http://localhost:${PORT}`));
