import { useMemo, useState } from 'react'
import './styles.css'

const START={capital:14,infrastructure:10,operations:11,change:9}
const LABEL={capital:'Capital',infrastructure:'Infrastructure',operations:'Operational readiness',change:'Change capacity'}
const ITEMS=[
{id:'connectivity',title:'Resilient connectivity + power',lens:'INFRASTRUCTURE',critical:true,desc:'Coverage, redundancy, power and accessible pathways at the point of care.'},
{id:'privacy',title:'Acoustic + visual privacy',lens:'ENVIRONMENT',desc:'Speech privacy, camera sightlines and conditions for confidential escalation.'},
{id:'interface',title:'Adaptable bedside interface',lens:'TECHNOLOGY',desc:'Replaceable displays, cameras, microphones, mounts and connections.'},
{id:'coverage',title:'Clinical coverage + escalation',lens:'OPERATIONS',critical:true,desc:'Service hours, response roles and accountable clinical escalation.'},
{id:'ownership',title:'Service ownership + support',lens:'GOVERNANCE',critical:true,desc:'Lifecycle funding, maintenance, downtime response and product ownership.'},
{id:'training',title:'Staff training + adoption',lens:'PEOPLE',desc:'Role preparation, practice, adoption support and feedback.'},
{id:'integration',title:'Enterprise integration',lens:'INFORMATION',desc:'Identity, scheduling, clinical context, documentation and security.'},
{id:'consent',title:'Patient + family activation',lens:'EXPERIENCE',desc:'Consent, control, accessibility and clear participation cues.'},
]
const COST={
connectivity:{commit:{capital:3,infrastructure:4},enable:{capital:2,infrastructure:2},adapt:{capital:1,infrastructure:1}},
privacy:{commit:{capital:2,infrastructure:1,operations:1},enable:{capital:1,infrastructure:1,operations:1},adapt:{operations:2,change:1}},
interface:{commit:{capital:3,infrastructure:2},enable:{capital:1,infrastructure:2},adapt:{capital:2,change:1}},
coverage:{commit:{operations:4,change:2},enable:{operations:3,change:1},adapt:{operations:2,change:2}},
ownership:{commit:{operations:3,change:2},enable:{operations:2,change:1},adapt:{operations:1,change:2}},
training:{commit:{operations:3,change:3},enable:{operations:2,change:2},adapt:{operations:1,change:2}},
integration:{commit:{capital:2,infrastructure:2,operations:2},enable:{capital:1,infrastructure:2,operations:1},adapt:{capital:1,operations:2,change:1}},
consent:{commit:{operations:2,change:2},enable:{operations:1,change:2},adapt:{operations:1,change:1}},
}
const STRATEGIES=[
{id:'commit',label:'COMMIT',text:'Make this a durable, funded foundation.',opening:3},
{id:'enable',label:'ENABLE',text:'Create capacity and a clear expansion path.',opening:2},
{id:'adapt',label:'ADAPT',text:'Use a lighter, changeable approach.',opening:1},
]
const FUTURE={
connectivity:{commit:'HOLDS',enable:'BENDS',adapt:'BREAKS'},privacy:{commit:'HOLDS',enable:'HOLDS',adapt:'BENDS'},
interface:{commit:'BREAKS',enable:'HOLDS',adapt:'HOLDS'},coverage:{commit:'HOLDS',enable:'BENDS',adapt:'BREAKS'},
ownership:{commit:'HOLDS',enable:'BENDS',adapt:'BREAKS'},training:{commit:'BENDS',enable:'HOLDS',adapt:'BENDS'},
integration:{commit:'BENDS',enable:'HOLDS',adapt:'BENDS'},consent:{commit:'BENDS',enable:'HOLDS',adapt:'BENDS'},
}
const RECOVERY={HOLDS:{},BENDS:{operations:1,change:1},BREAKS:{capital:1,infrastructure:1,operations:2,change:2}}
const add=(decisions)=>Object.entries(decisions).reduce((a,[id,s])=>{Object.entries(COST[id][s]).forEach(([k,v])=>a[k]+=v);return a},{capital:0,infrastructure:0,operations:0,change:0})
const affordable=(spent)=>Object.keys(START).every(k=>spent[k]<=START[k])
const burden=(r)=>{const t=Object.values(r).reduce((a,b)=>a+b,0);return t===0?'NONE':t<=3?'LIGHT':t<=8?'MODERATE':'HEAVY'}

function evaluate(priorities,decisions){
 const chosen=new Set(priorities), score=id=>chosen.has(id)?STRATEGIES.find(s=>s.id===decisions[id])?.opening||0:0
 const domains={technology:['connectivity','interface','integration'],operations:['coverage','ownership','training'],experience:['privacy','consent'],adaptability:['connectivity','interface','ownership','integration']}
 const domainScore=ids=>ids.reduce((n,id)=>n+score(id),0)
 const profile={technology:domainScore(domains.technology),operations:domainScore(domains.operations),experience:domainScore(domains.experience),adaptability:domainScore(domains.adaptability)}
 const ranked=Object.entries(profile).sort((a,b)=>b[1]-a[1])
 const archetypes={technology:['TECHNOLOGY-FORWARD HOSPITAL','Connected foundation, operational constraint','Strong digital infrastructure and integration create reach, while clinical coverage, adoption or ownership may limit dependable service.'],operations:['OPERATIONS-FORWARD HOSPITAL','Service model ready, infrastructure constrained','Clinical roles, support and adoption are prioritized, while the physical and digital environment may limit where the service can operate.'],experience:['EXPERIENCE-FORWARD HOSPITAL','Human experience protected, delivery capacity constrained','Privacy, participation and trust are protected, while infrastructure or operating capacity may restrict scale.'],adaptability:['ADAPTABLE-FOUNDATION HOSPITAL','Change-ready platform, targeted service gaps','The hospital preserves flexible foundations and future options, while selected experience or workforce conditions remain to be completed.']}
 const type=ranked[0][0], [archetype,strategyHeadline,strategyNarrative]=archetypes[type]
 const critical=['connectivity','coverage','ownership'].map(score)
 const supporting=['privacy','interface','integration','training','consent'].filter(id=>score(id)>=2).length
 let opening=critical.some(v=>v===0)||critical.filter(v=>v<=1).length>=2?'NOT READY':critical.some(v=>v<2)||supporting<2?'LIMITED':'READY'
 const omissionClass=item=>{
  if(item.critical)return {label:'CRITICAL GAP',verdict:'BREAKS',recovery:{operations:2,change:2},reason:`${item.title} was not prioritized. This prevents reliable service delivery until the missing foundation is established.`}
  if(item.id==='interface'&&score('connectivity')>=2&&score('integration')>=2)return {label:'ACCEPTABLE DEFERRAL',verdict:'HOLDS',recovery:{},reason:'The final bedside interface was deferred, but power, connectivity and integration preserve a viable future installation path.'}
  if(['training','consent','privacy'].includes(item.id))return {label:'SERVICE CONSTRAINT',verdict:'BENDS',recovery:{operations:1,change:1},reason:`${item.title} was not prioritized. The pathway can operate, but participation, trust or consistency will be constrained.`}
  return {label:'FUTURE EXPOSURE',verdict:'BENDS',recovery:{capital:1,infrastructure:1},reason:`${item.title} was not prioritized. Opening-day service may proceed, but the hospital carries greater exposure as demand and technology change.`}
 }
 const results=ITEMS.map(item=>{
  if(!chosen.has(item.id)){const o=omissionClass(item);return {...item,strategy:o.label,verdict:o.verdict,reason:o.reason,recovery:o.recovery}}
  let verdict=FUTURE[item.id][decisions[item.id]]
  let reason=verdict==='HOLDS'?'This investment remains useful under the changed condition.':verdict==='BENDS'?'The investment remains useful but requires targeted adaptation.':'The original approach cannot sustain the changed condition without material intervention.'
  if(item.id!=='connectivity'&&score('connectivity')===0){verdict='BREAKS';reason='The missing connectivity foundation prevents this investment from functioning as part of a connected service.'}
  return {...item,strategy:decisions[item.id].toUpperCase(),verdict,reason,recovery:{...RECOVERY[verdict]}}
 })
 const counts=results.reduce((a,r)=>(a[r.verdict.toLowerCase()]++,a),{holds:0,bends:0,breaks:0})
 const recovery=results.reduce((a,r)=>(Object.entries(r.recovery).forEach(([k,v])=>a[k]+=v),a),{capital:0,infrastructure:0,operations:0,change:0})
 const levels=Object.fromEntries(Object.entries(recovery).map(([k,v])=>[k,v===0?'NONE':v<=2?'LOW':v<=5?'MODERATE':'HIGH']))
 const omitted=results.filter(r=>!chosen.has(r.id))
 const strengths=ranked.slice(0,2).map(([k])=>({technology:'Digital reach + integration',operations:'Clinical service + ownership',experience:'Privacy + participation',adaptability:'Future flexibility'})[k])
 const limitations=omitted.filter(r=>r.strategy!=='ACCEPTABLE DEFERRAL').map(r=>r.title).slice(0,2)
 const service=opening==='READY'?'Patient rooms can reliably connect patients and bedside teams with remote clinical expertise.':opening==='LIMITED'?'Remote clinical expertise can operate, but service scope, reliability or participation is constrained.':'The hospital cannot reliably deliver remote clinical expertise because critical conditions remain unresolved.'
 return{opening,service,omitted,results,counts,recovery,levels,burden:burden(recovery),archetype,strategyHeadline,strategyNarrative,strengths,limitations,profile}
}

export default function App(){
 const[phase,setPhase]=useState('intro'),[priorities,setPriorities]=useState([]),[decisions,setDecisions]=useState({}),[index,setIndex]=useState(0),[warning,setWarning]=useState('')
 const selected=priorities.map(id=>ITEMS.find(i=>i.id===id)),item=selected[index],spent=useMemo(()=>add(decisions),[decisions]),remaining=Object.fromEntries(Object.keys(START).map(k=>[k,START[k]-spent[k]])),report=priorities.length===5&&Object.keys(decisions).length===5?evaluate(priorities,decisions):null
 const toggle=id=>{setWarning('');setPriorities(p=>{const next=p.includes(id)?p.filter(x=>x!==id):p.length<5?[...p,id]:p;setDecisions(d=>Object.fromEntries(Object.entries(d).filter(([key])=>next.includes(key))));setIndex(0);return next})}
 const choose=s=>{const next={...decisions,[item.id]:s.id};if(!affordable(add(next))){setWarning('This approach exceeds at least one available resource. Revise this choice or go back to change an earlier allocation.');return}setWarning('');setDecisions(next)}
 const next=()=>{if(!decisions[item.id]){setWarning('Choose how the project should treat this priority.');return}index<4?setIndex(index+1):setPhase('opening')}
 const reset=()=>{setPhase('intro');setPriorities([]);setDecisions({});setIndex(0);setWarning('')}
 return <div className="app"><header><div><b>AIMedX</b><span> Future-Ready Hospital Challenge</span></div><small>Build 05.2 | Distinct hospital strategies</small></header>
 {['fund','opening','future','results','final'].includes(phase)&&<div className="resource-bar">{Object.keys(START).map(k=><div key={k}><span>{LABEL[k]}</span><strong className={remaining[k]===0?'empty':''}>{remaining[k]}</strong><small>of {START[k]} remaining</small></div>)}</div>}
 <main>
 {phase==='intro'&&<section className="hero panel"><p className="eyebrow">ONE PATHWAY · YOUR STRATEGY</p><h1>What would you enable?</h1><p className="lead">The pathway is Distributed Clinical Expertise. The game will not tell you what matters most. Build your theory of what this future requires, fund it, and see what your hospital can actually deliver.</p><div className="promise"><b>PATHWAY</b><span>Patients can reach the right clinical expertise from the patient room.</span></div><button onClick={()=>setPhase('prioritize')}>Define your strategy</button></section>}
 {phase==='prioritize'&&<section className="panel"><p className="eyebrow">STRATEGIC PRIORITIZATION</p><h2>Choose five conditions to enable.</h2><p className="lead small">There is no recommended set. Select what you believe the pathway needs. The three conditions you leave out become explicit strategic deferrals.</p><div className="selection-count"><b>{priorities.length}</b><span>of 5 selected</span></div><div className="priority-grid">{ITEMS.map(i=><button key={i.id} className={`priority-card ${priorities.includes(i.id)?'selected':''}`} onClick={()=>toggle(i.id)}><small>{i.lens}</small><b>{i.title}</b><span>{i.desc}</span><i>{priorities.includes(i.id)?'SELECTED':'SELECT'}</i></button>)}</div><div className="actions"><button className="secondary" onClick={()=>setPhase('intro')}>Back</button><button disabled={priorities.length!==5} onClick={()=>{setIndex(0);setPhase('fund')}}>Fund selected priorities</button></div></section>}
 {phase==='fund'&&item&&<section className="panel"><div className="progress"><span>Priority {index+1} of 5</span><div><i style={{width:`${(index+1)*20}%`}}/></div></div><p className="eyebrow">{item.lens}</p><h2>{item.title}</h2><p className="lead small">{item.desc}</p><div className="options">{STRATEGIES.map(s=><button key={s.id} className={`option ${decisions[item.id]===s.id?'selected':''}`} onClick={()=>choose(s)}><b>{s.label}</b><span>{s.text}</span><small>{Object.entries(COST[item.id][s.id]).map(([k,v])=>`${LABEL[k]} −${v}`).join(' · ')}</small></button>)}</div>{warning&&<p className="warning">{warning}</p>}<div className="actions"><button className="secondary" onClick={()=>index?setIndex(index-1):setPhase('prioritize')}>Back</button><button onClick={next}>Continue</button></div></section>}
 {phase==='opening'&&report&&<section className="panel report"><p className="eyebrow">OPENING-DAY PERFORMANCE · {report.archetype}</p><div className={`status ${report.opening.toLowerCase().replace(' ','-')}`}>{report.opening}</div><h2>{report.strategyHeadline}</h2><p className="lead small">{report.strategyNarrative}</p><div className="report-grid"><article><small>Strategic strengths</small><b>{report.strengths.join(' · ')}</b></article><article><small>Operational consequence</small><b>{report.opening==='READY'?'The intended service can launch reliably.':report.opening==='LIMITED'?'Service scope or hours require explicit limits.':'The pathway lacks critical operating conditions.'}</b></article><article><small>Primary limitations</small><b>{report.limitations.length?report.limitations.join(' · '):'No material opening-day limitation'}</b></article></div><div className="actions"><button className="secondary" onClick={()=>setPhase('prioritize')}>Revise strategy</button><button onClick={()=>setPhase('future')}>Advance to 2040</button></div></section>}
 {phase==='future'&&report&&<section className="panel"><p className="eyebrow">2040 CONDITION CHANGE</p><h2>The care model changed. The technology changed. The building did not.</h2><p className="lead small">Demand expands, interfaces evolve and distributed clinical participation becomes routine. The same future reaches every hospital, but each strategy responds differently.</p><div className="actions"><button className="secondary" onClick={()=>setPhase('opening')}>Back</button><button onClick={()=>setPhase('results')}>Stress-test the strategy</button></div></section>}
 {phase==='results'&&report&&<section className="panel"><p className="eyebrow">PERFORMANCE UNDER CHANGE</p><div className="count-row"><div className="holds"><b>{report.counts.holds}</b><span>HOLDS</span></div><div className="bends"><b>{report.counts.bends}</b><span>BENDS</span></div><div className="breaks"><b>{report.counts.breaks}</b><span>BREAKS</span></div></div><div className="result-list">{report.results.map(r=><article key={r.id}><div><span className={`pill ${r.verdict.toLowerCase()}`}>{r.verdict}</span><h3>{r.title}</h3><em>{r.strategy}</em></div><p>{r.reason}</p>{r.verdict!=='HOLDS'&&<div className="recovery"><b>Recovery burden</b><small>{Object.entries(r.recovery).filter(([,v])=>v).map(([k,v])=>`${LABEL[k]} +${v}`).join(' · ')}</small></div>}</article>)}</div><div className="actions"><button className="secondary" onClick={()=>setPhase('future')}>Back</button><button onClick={()=>setPhase('final')}>View hospital report</button></div></section>}
 {phase==='final'&&report&&<section className="panel final"><p className="eyebrow">HOSPITAL PERFORMANCE REPORT</p><h2>{report.archetype}</h2><p className="lead small">{report.strategyHeadline}. {report.strategyNarrative}</p><div className="report-grid"><article><small>Opening day</small><b>{report.opening}</b><span>{report.service}</span></article><article><small>2040 performance</small><b>{report.counts.holds} Holds · {report.counts.bends} Bends · {report.counts.breaks} Breaks</b><span>Deferred priorities remain visible as unresolved dependencies.</span></article><article><small>Adaptation burden profile</small><b>{report.burden}</b><span>{Object.entries(report.levels).map(([k,v])=>`${LABEL[k]}: ${v}`).join(' · ')}</span></article></div><h3>Your strategy</h3><div className="state-list">{ITEMS.map(i=><div key={i.id}><span>{i.title}</span><b>{priorities.includes(i.id)?decisions[i.id].toUpperCase():'NOT PRIORITIZED'}</b></div>)}</div><div className="actions"><button className="secondary" onClick={()=>setPhase('results')}>Review results</button><button onClick={reset}>Build another strategy</button></div></section>}
 </main><footer>One pathway. Different theories. Visible consequences.</footer></div>
}
