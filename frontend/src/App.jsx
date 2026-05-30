import { useState, useEffect, useCallback } from "react"
import Map from "./components/Map"

function App() {
  const [world, setWorld] = useState(null)
  const [selectedHuman, setSelectedHuman] = useState(null)
  const [conversations, setConversations] = useState([])
  const [auto, setAuto] = useState(false)

  const fetchAll = () => {
    fetch("http://localhost:8000/world")
      .then(res => res.json())
      .then(data => {
        setWorld(data)
        if (selectedHuman) {
          const updated = data.humans.find(h => h.id === selectedHuman.id)
          if (updated) setSelectedHuman(updated)
        }
      })
    fetch("http://localhost:8000/conversations")
      .then(res => res.json())
      .then(setConversations)
  }

  useEffect(() => { fetchAll() }, [])

  const skipTick = useCallback(() => {
    fetch("http://localhost:8000/tick", { method: "POST" })
      .then(res => res.json())
      .then(data => {
        setWorld(data)
        if (selectedHuman) {
          const updated = data.humans.find(h => h.id === selectedHuman.id)
          if (updated) setSelectedHuman(updated)
        }
        fetch("http://localhost:8000/conversations")
          .then(res => res.json())
          .then(setConversations)
      })
  }, [selectedHuman])

  useEffect(() => {
    if (!auto) return
    const interval = setInterval(skipTick, 8000)
    return () => clearInterval(interval)
  }, [auto, skipTick])

  if (!world) return <p style={{padding: 20}}>Loading...</p>

  return (
    <div id="root">
      <div className="topbar">
        <h1>🌍 World Sim</h1>
        <div className="topbar-stat">Tick <span>{world.tick}</span></div>
        <div className="topbar-stat">Population <span>{world.alive}/{world.total}</span></div>
        <button onClick={skipTick}>▶ Skip Tick</button>
        <button
          onClick={() => setAuto(!auto)}
          style={{
            marginLeft: "8px",
            background: auto ? "#059669" : "transparent",
            border: auto ? "none" : "1px solid #2d2d44"
          }}
        >
          {auto ? "⏸ Auto ON" : "⟳ Auto OFF"}
        </button>
      </div>

      <div className="main-layout">
        <div className="map-panel">
          <Map humans={world.humans} selectedHuman={selectedHuman} onSelect={setSelectedHuman} />
        </div>

        <div className="right-panel">
          {selectedHuman ? (
            <div className="detail-box">
              <div className="detail-name">{selectedHuman.name}</div>
              <div className="detail-sub">{selectedHuman.job} · {selectedHuman.personality} · age {selectedHuman.age}</div>
              <div className="detail-stats">
                <div className="detail-stat">
                  <div className="detail-stat-label">❤️ Health</div>
                  <div className="detail-stat-value">{selectedHuman.health}</div>
                </div>
                <div className="detail-stat">
                  <div className="detail-stat-label">⚡ Energy</div>
                  <div className="detail-stat-value">{selectedHuman.energy}</div>
                </div>
              </div>
              <div>{selectedHuman.genes.map(g => <span key={g} className="gene-tag">{g}</span>)}</div>
              <div className="thought-box">{selectedHuman.last_thought || "No thought yet..."}</div>
            </div>
          ) : (
            <div className="detail-box" style={{color: "#475569", fontSize: 13}}>
              Click a resident to see details
            </div>
          )}

          <div className="right-panel-section">
            <h3>Residents</h3>
          </div>
          <div className="humans-list">
            {world.humans.map(human => (
              <div
                key={human.id}
                className={`human-row ${selectedHuman?.id === human.id ? "selected" : ""}`}
                onClick={() => setSelectedHuman(human)}
              >
                <div className="human-avatar">{human.name[0]}</div>
                <div className="human-row-info">
                  <div className="human-row-name">{human.name}</div>
                  <div className="human-row-sub">{human.job} · age {human.age}</div>
                </div>
                <div className="human-row-bars">
                  <div className="mini-bar">
                    <div className="mini-bar-fill" style={{width: `${human.health}%`, background: "#10b981"}}/>
                  </div>
                  <div className="mini-bar">
                    <div className="mini-bar-fill" style={{width: `${human.energy}%`, background: "#f59e0b"}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="right-panel-section">
            <h3>Conversations</h3>
          </div>
          <div className="conv-log">
            {conversations.map(c => {
              const from = world.humans.find(h => h.id === c.from_id)
              const to = world.humans.find(h => h.id === c.to_id)
              return (
                <div key={c.id} className="conv-item">
                  <div className="conv-names">
                    <span className="conv-from">{from?.name}</span>
                    <span className="conv-arrow">→</span>
                    <span className="conv-to">{to?.name}</span>
                    <span className="conv-tick">#{c.tick}</span>
                  </div>
                  <div className="conv-message">"{c.message}"</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App