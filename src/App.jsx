import { useMemo, useState } from 'react'

const ambitions = [
  ['Distributed Care', 'Extend clinical expertise beyond physical location.'],
  ['Workforce Relief', 'Reduce avoidable administrative and manual burden.'],
  ['Adaptive Environments', 'Allow settings to respond as care changes.'],
  ['Operational Coordination', 'Anticipate demand and coordinate resources.'],
  ['Care Continuity', 'Connect hospital, home and community.'],
  ['Patient Agency', 'Increase meaningful participation in care.'],
]

const capabilities = [
  ['Distributed Clinical Expertise', 'Bring expertise to patients rather than always moving patients to expertise.', 'Room · Unit · System'],
  ['Ambient Clinical Intelligence', 'Allow documentation and contextual awareness to recede into the background.', 'Room · Unit · System'],
  ['Autonomous Logistics', 'Reduce manual movement of supplies, medications, equipment and waste.', 'Unit · Facility'],
  ['Predictive Operations', 'Anticipate capacity, staffing, equipment and resource demand.', 'Facility · System'],
  ['Adaptive Patient Environments', 'Allow rooms to respond as acuity, workflow and patient needs change.', 'Room · Unit · Facility'],
  ['Care Beyond the Hospital', 'Extend monitoring, recovery and clinical connection into homes and communities.', 'System · Continuum'],
]

const steps = ['Invitation', 'Project', 'Future', 'Capabilities', 'Review']

export default function App() {
  const [step, setStep] = useState(0)
  const [ambition, setAmbition] = useState('')
  const [selected, setSelected] = useState([])
  const progress = (step / (steps.length - 1)) * 100
  const toggleCapability = (name) => {
    setSelected(current => current.includes(name)
      ? current.filter(item => item !== name)
      : current.length < 3 ? [...current, name] : current)
  }
  const nextEnabled = useMemo(() => {
    if (step === 2) return Boolean(ambition)
    if (step === 3) return selected.length === 3
    return true
  }, [step, ambition, selected])

  return (
    <div className="app">
      <header>
        <div className="brand"><span className="diamond"/><div><strong>AIMedX</strong><small>Future-Ready Hospital Challenge</small></div></div>
        <div className="progress-area"><span>{steps[step]}</span><div className="progress"><i style={{width: `${progress}%`}}/></div></div>
      </header>

      <main>
        {step === 0 && <section className="hero">
          <div className="eyebrow">Single-player healthcare design simulation</div>
          <h1>Build for 2030.<br/>Leave room for 2050.</h1>
          <div className="rule"/>
          <p>Technology creates requirements that affect space, infrastructure, workflow, staffing and governance. Your project cannot address everything.</p>
          <button onClick={() => setStep(1)}>BEGIN THE CHALLENGE</button>
        </section>}

        {step === 1 && <section>
          <div className="section-head"><div><div className="eyebrow">01 | The project</div><h2>Your project envelope</h2></div><p>A new patient tower opens in 2030, connects to legacy facilities and must remain useful through 2050.</p></div>
          <div className="two-col">
            <article className="panel"><h3>Project conditions</h3><p><b>Opening:</b> 2030</p><p><b>Planning horizon:</b> 2050</p><p><b>Context:</b> New tower + legacy infrastructure</p><p><b>Pressure:</b> Workforce constraints and rapid technology change</p></article>
            <article className="panel"><h3>Hard limits</h3><div className="resources">{[['Capital',12],['Infrastructure',8],['Operational readiness',8],['Change capacity',6]].map(([label,value]) => <div className="resource" key={label}><b>{label}</b><strong>{value}</strong><div className="meter"><i/></div></div>)}</div></article>
          </div>
          <div className="warning"><b>You cannot maximize every outcome.</b> Every commitment uses capacity. Every deferral carries risk.</div>
        </section>}

        {step === 2 && <section>
          <div className="section-head"><div><div className="eyebrow">02 | The future</div><h2>Choose one primary ambition</h2></div><p>This becomes the strategic north star against which the portfolio will be assessed.</p></div>
          <div className="card-grid">{ambitions.map(([name, text]) => <button className={`card ${ambition === name ? 'selected' : ''}`} onClick={() => setAmbition(name)} key={name}><span>PRIMARY AMBITION</span><h3>{name}</h3><p>{text}</p></button>)}</div>
        </section>}

        {step === 3 && <section>
          <div className="section-head"><div><div className="eyebrow">03 | The portfolio</div><h2>Choose exactly three capabilities</h2></div><strong>{selected.length} / 3 SELECTED</strong></div>
          <div className="card-grid">{capabilities.map(([name,text,scales]) => <button className={`card ${selected.includes(name) ? 'selected' : ''}`} onClick={() => toggleCapability(name)} key={name}><span>{scales}</span><h3>{name}</h3><p>{text}</p></button>)}</div>
        </section>}

        {step === 4 && <section>
          <div className="section-head"><div><div className="eyebrow">Build 01 complete</div><h2>Your starting strategy</h2></div><p>The next build will take Distributed Clinical Expertise through multiple requirement and design decisions.</p></div>
          <div className="summary"><div><span>PRIMARY AMBITION</span><h3>{ambition}</h3></div>{selected.map(item => <div key={item}><span>SELECTED CAPABILITY</span><h3>{item}</h3></div>)}</div>
          <div className="principle">Technology does not simply add equipment. It creates requirements that reshape operations, infrastructure and design.</div>
        </section>}
      </main>

      <nav>
        {step > 0 && <button className="secondary" onClick={() => setStep(step - 1)}>BACK</button>}
        {step > 0 && step < 4 && <button disabled={!nextEnabled} onClick={() => setStep(step + 1)}>CONTINUE</button>}
        {step === 4 && <button onClick={() => {setStep(0);setAmbition('');setSelected([])}}>START OVER</button>}
      </nav>
      <footer><span>© 2026 Stantec. Prototype for design exploration.</span><span>Technology → Requirements → Decisions → Consequences</span></footer>
    </div>
  )
}
