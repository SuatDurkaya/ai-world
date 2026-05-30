import { useEffect, useRef } from "react"

const PADDING = 50

function Map({ humans, selectedHuman, onSelect }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // arka plan gradient
    const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W/1.5)
    bg.addColorStop(0, "#0f0f1f")
    bg.addColorStop(1, "#07070f")
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.03)"
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const x = PADDING + (i / 10) * (W - PADDING * 2)
      const y = PADDING + (i / 10) * (H - PADDING * 2)
      ctx.beginPath(); ctx.moveTo(x, PADDING); ctx.lineTo(x, H - PADDING); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(PADDING, y); ctx.lineTo(W - PADDING, y); ctx.stroke()
    }

    // konuşma çizgileri — son konuşanlar arası ince çizgi
    // (ileride eklenecek)

    // sakinler
    humans.forEach(human => {
      if (!human.alive) return
      const x = PADDING + (human.x / 100) * (W - PADDING * 2)
      const y = PADDING + (human.y / 100) * (H - PADDING * 2)
      const isSelected = selectedHuman?.id === human.id

      // halo
      if (isSelected) {
        const halo = ctx.createRadialGradient(x, y, 0, x, y, 28)
        halo.addColorStop(0, "rgba(167,139,250,0.3)")
        halo.addColorStop(1, "rgba(167,139,250,0)")
        ctx.beginPath()
        ctx.arc(x, y, 28, 0, Math.PI * 2)
        ctx.fillStyle = halo
        ctx.fill()
      }

      // gölge
      ctx.shadowColor = isSelected ? "#a78bfa" : "#7c3aed"
      ctx.shadowBlur = isSelected ? 16 : 8

      // nokta
      ctx.beginPath()
      ctx.arc(x, y, isSelected ? 11 : 7, 0, Math.PI * 2)
      ctx.fillStyle = isSelected ? "#a78bfa" : "#7c3aed"
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.strokeStyle = isSelected ? "#fff" : "rgba(255,255,255,0.25)"
      ctx.lineWidth = isSelected ? 2 : 1
      ctx.stroke()

      // isim etiketi
      const label = human.name
      const fontSize = isSelected ? 13 : 11
      ctx.font = `${isSelected ? "600" : "400"} ${fontSize}px system-ui`
      const tw = ctx.measureText(label).width

      // etiket arka planı
      ctx.fillStyle = isSelected ? "rgba(167,139,250,0.15)" : "rgba(0,0,0,0.45)"
      roundRect(ctx, x - tw/2 - 5, y - 30, tw + 10, 18, 4)
      ctx.fill()

      ctx.fillStyle = isSelected ? "#e2e8f0" : "rgba(255,255,255,0.55)"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(label, x, y - 21)
    })

  }, [humans, selectedHuman])

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={580}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "10px",
        border: "1px solid #1e1e30",
        cursor: "crosshair",
        display: "block"
      }}
      onClick={(e) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const px = (e.clientX - rect.left) * scaleX
        const py = (e.clientY - rect.top) * scaleY
        const mx = (px - PADDING) / (canvas.width - PADDING * 2) * 100
        const my = (py - PADDING) / (canvas.height - PADDING * 2) * 100

        let closest = null
        let minDist = 8
        humans.forEach(h => {
          if (!h.alive) return
          const dist = Math.sqrt((h.x - mx) ** 2 + (h.y - my) ** 2)
          if (dist < minDist) { minDist = dist; closest = h }
        })
        if (closest) onSelect(closest)
      }}
    />
  )
}

export default Map