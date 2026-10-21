import { useMemo, useState } from 'react'
import './styles.css'

const START = { capital: 12, infrastructure: 8, operations: 8, change: 6 }
const RESOURCE_LABELS = { capital: 'Capital', infrastructure: 'Infrastructure', operations: 'Operational readiness', change: 'Change capacity' }

const REQUIREMENTS = [
  { id:'connectivity', title:'Room connectivity + power', lens:'LONG-LIFE INFRASTRUCTURE', critical:true, description:'Reliable connectivity, power, redundancy and maintainable pathways at the point of care.' },
  { id:'privacy', title:'Acoustic + visual privacy', lens:'ARCHITECTURE + EXPERIENCE', critical:false, description:'Speech privacy, sightline control, consent cues and confidential escalation.' },
  { id:'interface', title:'Bedside interface', lens:'FAST-CHANGING TECHNOLOGY', critical:false, description:'Displays, cameras, microphones and interaction models that can change without rebuilding the room.' },
  { id:'coverage', title:'Clinical coverage + escalation', lens:'WORKFORCE + OPERATIONS', critical:true, description:'A defined response model, service hours, escalation path and accountable clinical coverage.' },
  { id:'ownership', title:'Support + service ownership', lens:'GOVERNANCE + LIFECYCLE', critical:true, description:'Product ownership, maintenance, downtime response, training and lifecycle funding.' },
]

const OPTIONS = {
  connectivity: [
    { id:'commit', label:'COMMIT', summary:'Build resilient wired and wireless coverage, redundant power and accessible pathways.', cost:{capital:3,infrastructure:4}, opening:3, future:'HOLDS', recovery:{} },
    { id:'enable', label:'ENABLE', summary:'Provide core capacity and accessible expansion pathways.', cost:{capital:2,infrastructure:2}, opening:2, future:'BENDS', recovery:{infrastructure:1,change:1}, recoveryAction:'Expand capacity and validate redundancy before wider use.' },
    { id:'adapt', label:'ADAPT', summary:'Rely on current coverage with localized upgrades.', cost:{capital:1,infrastructure:1}, opening:1, future:'BREAKS', recovery:{capital:2,infrastructure:3,change:1}, recoveryAction:'Retrofit pathways, power and coverage while rooms remain in service.' },
    { id:'defer', label:'DEFER', summary:'Make no enabling investment this cycle.', cost:{}, opening:0, future:'BREAKS', recovery:{capital:3,infrastructure:4,operations:1,change:1}, recoveryAction:'Create a new enterprise connectivity foundation and retrofit patient-care areas.' },
  ],
  privacy: [
    { id:'commit', label:'COMMIT', summary:'Design tested acoustic, visual and consent conditions into the room.', cost:{capital:2,infrastructure:1,operations:1}, opening:3, future:'HOLDS', recovery:{} },
    { id:'enable', label:'ENABLE', summary:'Establish room standards and reserve adaptable privacy provisions.', cost:{capital:1,infrastructure:1,operations:1}, opening:2, future:'HOLDS', recovery:{} },
    { id:'adapt', label:'ADAPT', summary:'Use operational protocols and movable privacy measures.', cost:{operations:2,change:1}, opening:1, future:'BENDS', recovery:{capital:1,operations:1,change:1}, recoveryAction:'Add targeted acoustic treatment and standardize consent workflows.' },
    { id:'defer', label:'DEFER', summary:'Address privacy after technology selection.', cost:{}, opening:0, future:'BREAKS', recovery:{capital:2,infrastructure:1,operations:2,change:1}, recoveryAction:'Reconfigure rooms and establish privacy and consent standards.' },
  ],
  interface: [
    { id:'commit', label:'COMMIT', summary:'Install fixed proprietary bedside hardware.', cost:{capital:3,infrastructure:2}, opening:3, future:'BREAKS', recovery:{capital:3,infrastructure:2,change:2}, recoveryAction:'Remove fixed hardware and install standards-based replaceable connection points.' },
    { id:'enable', label:'ENABLE', summary:'Provide mounting, power and connection capacity without fixing the final device.', cost:{capital:1,infrastructure:2}, opening:2, future:'HOLDS', recovery:{} },
    { id:'adapt', label:'ADAPT', summary:'Use replaceable devices on standardized mounts and connections.', cost:{capital:2,change:1}, opening:3, future:'HOLDS', recovery:{} },
    { id:'defer', label:'DEFER', summary:'Leave the interface unresolved.', cost:{}, opening:0, future:'BENDS', recovery:{capital:2,infrastructure:1,change:1}, recoveryAction:'Select an interface and add compatible mounting, power and connection provisions.' },
  ],
  coverage: [
    { id:'commit', label:'COMMIT', summary:'Fund a defined staffed service with escalation and after-hours response.', cost:{operations:4,change:2}, opening:3, future:'HOLDS', recovery:{} },
    { id:'enable', label:'ENABLE', summary:'Create the coverage model, roles and phased service capacity.', cost:{operations:3,change:1}, opening:2, future:'BENDS', recovery:{operations:2,change:1}, recoveryAction:'Expand service hours, staffing and escalation capacity.' },
    { id:'adapt', label:'ADAPT', summary:'Add responsibility to existing teams and schedules.', cost:{operations:2,change:2}, opening:1, future:'BREAKS', recovery:{operations:4,change:2}, recoveryAction:'Establish dedicated coverage, escalation and workforce support.' },
    { id:'defer', label:'DEFER', summary:'Assume coverage will be resolved operationally later.', cost:{}, opening:0, future:'BREAKS', recovery:{operations:5,change:3}, recoveryAction:'Design and staff a complete clinical response and escalation model.' },
  ],
  ownership: [
    { id:'commit', label:'COMMIT', summary:'Establish accountable service ownership, support and lifecycle funding.', cost:{operations:3,change:2}, opening:3, future:'HOLDS', recovery:{} },
    { id:'enable', label:'ENABLE', summary:'Assign provisional ownership and define the support pathway.', cost:{operations:2,change:1}, opening:2, future:'BENDS', recovery:{operations:1,change:1}, recoveryAction:'Formalize service ownership, lifecycle funding and support measures.' },
    { id:'adapt', label:'ADAPT', summary:'Distribute support across current departmental roles.', cost:{operations:1,change:2}, opening:1, future:'BREAKS', recovery:{operations:3,change:2}, recoveryAction:'Create accountable product ownership and a coordinated support model.' },
    { id:'defer', label:'DEFER', summary:'Leave ownership and support unresolved.', cost:{}, opening:0, future:'BREAKS', recovery:{operations:4,change:3}, recoveryAction:'Assign an owner, support model, training plan and lifecycle budget.' },
  ],
}

const sumCost = (decisions) => Object.values(decisions).reduce((total, option) => {
  Object.entries(option.cost || {}).forEach(([key,value]) => { total[key] += value })
  return total
}, { capital:0, infrastructure:0, operations:0, change:0 })

const withinBudget = (spent) => Object.keys(START).every((key) => spent[key] <= START[key])
const burdenName = (recovery) => {
  const total = Object.values(recovery).reduce((a,b)=>a+b,0)
  const categories = Object.values(recovery).filter(Boolean).length
  if (total === 0) return 'NONE'
  if (total === 1) return 'LIGHT'
  if (total >= 4 || categories >= 3) return 'HEAVY'
  return 'MODERATE'
}

function evaluate(decisions) {
  const selected = Object.fromEntries(REQUIREMENTS.map(r => [r.id, decisions[r.id]]))
  const criticalScores = ['connectivity','coverage','ownership'].map(id => selected[id]?.opening ?? 0)
  let openingStatus = 'READY'
  if (criticalScores.some(v => v === 0) || criticalScores.filter(v => v <= 1).length >= 2) openingStatus = 'NOT READY'
  else if (criticalScores.some(v => v < 3) || (selected.privacy?.opening ?? 0) < 2 || (selected.interface?.opening ?? 0) < 2) openingStatus = 'LIMITED'

  const results = REQUIREMENTS.map(req => {
    const choice = selected[req.id]
    let verdict = choice.future
    let reason = choice.summary
    let recovery = { ...(choice.recovery || {}) }
    let recoveryAction = choice.recoveryAction || ''

    if (req.id !== 'connectivity' && (selected.connectivity?.opening ?? 0) === 0) {
      verdict = 'BREAKS'
      recovery = { ...recovery, infrastructure: Math.max(recovery.infrastructure || 0, 2), change: Math.max(recovery.change || 0, 1) }
      recoveryAction = `Restore the connectivity foundation first. ${recoveryAction}`.trim()
      reason = 'Deferred connectivity prevents this requirement from functioning as part of a connected service.'
    }
    if (req.id === 'interface' && selected.interface?.id === 'commit') {
      verdict = 'BREAKS'
      reason = 'The fixed interface operates initially but cannot absorb the 2040 technology shift without material replacement.'
    }
    return { ...req, choice, verdict, reason, recovery, recoveryAction }
  })

  const counts = results.reduce((a,r)=>{ a[r.verdict.toLowerCase()] += 1; return a },{holds:0,bends:0,breaks:0})
  const recovery = results.reduce((a,r)=>{ Object.entries(r.recovery).forEach(([k,v])=>{a[k]+=v}); return a },{capital:0,infrastructure:0,operations:0,change:0})
  const criticalFailures = results.filter(r => r.critical && r.verdict === 'BREAKS').map(r=>r.title)

  let headline, explanation
  if (counts.breaks >= 4) {
    headline = 'The intended service pathway was not preserved.'
    explanation = 'Individual provisions were made, but unresolved dependencies prevent the capability from operating or adapting as a connected system.'
  } else if (counts.breaks >= 2) {
    headline = 'Part of the service pathway was preserved, but critical dependencies remain unresolved.'
    explanation = 'Restoring the intended capability will require material additional investment or operating-model change.'
  } else if (counts.breaks === 1) {
    headline = 'The capability remains partially viable, but one critical weakness limits reliable performance.'
    explanation = 'Recovery depends on resolving the identified requirement and its downstream effects.'
  } else if (counts.bends >= 2) {
    headline = 'The capability remains viable, but changed conditions create a targeted adaptation burden.'
    explanation = 'The foundation remains useful while selected operational or technology layers must evolve.'
  } else {
    headline = 'The portfolio preserved both the service pathway and the ability to adapt.'
    explanation = 'Its foundations, operating provisions and changeable layers continue to work together under changed conditions.'
  }

  const limiting = REQUIREMENTS.find(r => (selected[r.id]?.opening ?? 0) < 2)
  const strongest = [...REQUIREMENTS].sort((a,b)=>(selected[b.id]?.opening??0)-(selected[a.id]?.opening??0))[0]
  const serviceText = openingStatus === 'READY'
    ? 'Patient rooms can reliably connect patients and bedside teams with remote clinical expertise.'
    : openingStatus === 'LIMITED'
      ? 'Remote clinical expertise can operate, but availability, reliability, privacy or service coverage is constrained.'
      : 'The hospital cannot reliably deliver remote clinical expertise because a critical prerequisite remains unresolved.'

  return { openingStatus, serviceText, limiting:limiting?.title || 'No material opening-day constraint', strongest:strongest?.title, results, counts, recovery, burden:burdenName(recovery), criticalFailures, headline, explanation }
}

function App() {
  const [phase,setPhase] = useState('intro')
  const [index,setIndex] = useState(0)
  const [decisions,setDecisions] = useState({})
  const [warning,setWarning] = useState('')
  const spent = useMemo(()=>sumCost(decisions),[decisions])
  const remaining = Object.fromEntries(Object.keys(START).map(k=>[k,START[k]-spent[k]]))
  const report = useMemo(()=>Object.keys(decisions).length===REQUIREMENTS.length ? evaluate(decisions) : null,[decisions])
  const req = REQUIREMENTS[index]

  const choose = (option) => {
    const next = { ...decisions, [req.id]:option }
    if (!withinBudget(sumCost(next))) { setWarning('This choice exceeds at least one available resource. Select another strategy or go back and revise an earlier decision.'); return }
    setWarning(''); setDecisions(next)
  }
  const next = () => {
    if (!decisions[req.id]) { setWarning('Choose one strategy before continuing.'); return }
    if (index < REQUIREMENTS.length-1) { setIndex(index+1); setWarning('') } else setPhase('opening')
  }
  const back = () => { if(index>0){setIndex(index-1);setWarning('')} else setPhase('intro') }
  const reset = () => { setPhase('intro'); setIndex(0); setDecisions({}); setWarning('') }

  return <div className="app">
    <header><div><b>AIMedX</b><span> Future-Ready Hospital Challenge</span></div><small>Build 04 | Readiness + adaptation burden</small></header>
    {phase !== 'intro' && <div className="resource-bar">{Object.keys(START).map(k=><div key={k}><span>{RESOURCE_LABELS[k]}</span><strong className={remaining[k]===0?'empty':''}>{remaining[k]}</strong><small>of {START[k]} remaining</small></div>)}</div>}

    <main>
      {phase==='intro' && <section className="hero panel"><p className="eyebrow">DISTRIBUTED CLINICAL EXPERTISE</p><h1>Design the system around the technology.</h1><p className="lead">Patients can reach the right clinical expertise from the patient room. Decide where permanence belongs, see what the hospital can deliver on opening day, then test the portfolio against a changed future.</p><div className="promise"><b>Service promise</b><span>Connect patients and bedside teams with the right clinical expertise from the patient room.</span></div><button onClick={()=>setPhase('decisions')}>Enter the project</button></section>}

      {phase==='decisions' && <section className="panel"><div className="progress"><span>Requirement {index+1} of {REQUIREMENTS.length}</span><div><i style={{width:`${((index+1)/REQUIREMENTS.length)*100}%`}}/></div></div><p className="eyebrow">{req.lens}</p><h2>{req.title}</h2><p className="lead small">{req.description}</p><div className="options">{OPTIONS[req.id].map(o=><button key={o.id} className={`option ${decisions[req.id]?.id===o.id?'selected':''}`} onClick={()=>choose(o)}><b>{o.label}</b><span>{o.summary}</span><small>{Object.keys(o.cost).length ? Object.entries(o.cost).map(([k,v])=>`${RESOURCE_LABELS[k]} −${v}`).join(' · ') : 'No immediate resource use'}</small></button>)}</div>{warning&&<p className="warning">{warning}</p>}<div className="actions"><button className="secondary" onClick={back}>Back</button><button onClick={next}>Continue</button></div></section>}

      {phase==='opening' && report && <section className="panel report"><p className="eyebrow">OPENING-DAY PERFORMANCE</p><div className={`status ${report.openingStatus.toLowerCase().replace(' ','-')}`}>{report.openingStatus}</div><h2>{report.serviceText}</h2><div className="report-grid"><article><small>Strongest enabler</small><b>{report.strongest}</b></article><article><small>Primary limiting dependency</small><b>{report.limiting}</b></article><article><small>Operational consequence</small><b>{report.openingStatus==='READY'?'The intended service can launch reliably.':report.openingStatus==='LIMITED'?'Service scope or hours require explicit limits.':'Technology cannot substitute for the unresolved prerequisite.'}</b></article></div><div className="actions"><button className="secondary" onClick={()=>{setPhase('decisions');setIndex(REQUIREMENTS.length-1)}}>Revise portfolio</button><button onClick={()=>setPhase('future')}>Advance to 2040</button></div></section>}

      {phase==='future' && report && <section className="panel"><p className="eyebrow">2040 CONDITION CHANGE</p><h2>The care model changed. The technology changed. The building did not.</h2><p className="lead small">Demand expands, remote participation becomes routine, interfaces evolve and the hospital must support a broader range of clinical expertise without interrupting care.</p><div className="actions"><button className="secondary" onClick={()=>setPhase('opening')}>Back</button><button onClick={()=>setPhase('results')}>Stress-test the portfolio</button></div></section>}

      {phase==='results' && report && <section className="panel"><p className="eyebrow">PERFORMANCE UNDER CHANGE</p><div className="count-row"><div className="holds"><b>{report.counts.holds}</b><span>HOLDS</span></div><div className="bends"><b>{report.counts.bends}</b><span>BENDS</span></div><div className="breaks"><b>{report.counts.breaks}</b><span>BREAKS</span></div></div><div className="result-list">{report.results.map(r=><article key={r.id}><div><span className={`pill ${r.verdict.toLowerCase()}`}>{r.verdict}</span><h3>{r.title}</h3></div><p>{r.reason}</p>{r.verdict!=='HOLDS'&&<div className="recovery"><b>Recovery requirement</b><span>{r.recoveryAction}</span><small>{Object.entries(r.recovery).filter(([,v])=>v).map(([k,v])=>`${RESOURCE_LABELS[k]} +${v}`).join(' · ')}</small></div>}</article>)}</div><div className="actions"><button className="secondary" onClick={()=>setPhase('future')}>Back</button><button onClick={()=>setPhase('final')}>View hospital report</button></div></section>}

      {phase==='final' && report && <section className="panel final"><p className="eyebrow">HOSPITAL PERFORMANCE REPORT</p><h2>{report.headline}</h2><p className="lead small">{report.explanation}</p><div className="report-grid"><article><small>Opening day</small><b>{report.openingStatus}</b><span>{report.serviceText}</span></article><article><small>2040 performance</small><b>{report.counts.holds} Holds · {report.counts.bends} Bends · {report.counts.breaks} Breaks</b><span>{report.criticalFailures.length?`Critical failures: ${report.criticalFailures.join(', ')}`:'No critical requirement breaks.'}</span></article><article><small>Adaptation burden</small><b>{report.burden}</b><span>{Object.entries(report.recovery).map(([k,v])=>`${RESOURCE_LABELS[k]} +${v}`).join(' · ')}</span></article></div><h3>State carried forward</h3><div className="state-list">{REQUIREMENTS.map(r=><div key={r.id}><span>{r.title}</span><b>{decisions[r.id].label}</b></div>)}</div><div className="actions"><button className="secondary" onClick={()=>setPhase('results')}>Review results</button><button onClick={reset}>Run another portfolio</button></div></section>}
    </main>
    <footer>One future. A sequence of design decisions. A visible connection between investment and care delivery.</footer>
  </div>
}

export default App
