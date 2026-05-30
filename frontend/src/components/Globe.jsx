import { useEffect, useRef } from "react"

const COLORS = [
  {bg:'#E6F1FB',fg:'#0C447C'},{bg:'#E1F5EE',fg:'#085041'},
  {bg:'#FAEEDA',fg:'#633806'},{bg:'#FAECE7',fg:'#712B13'},
  {bg:'#EEEDFE',fg:'#3C3489'},{bg:'#FBEAF0',fg:'#72243E'},
  {bg:'#EAF3DE',fg:'#27500A'},{bg:'#FCEBEB',fg:'#791F1F'},
]

const W=500, H=500, R=220
let rotY=0, rotX=0.25, dragging=false, lastX=0, lastY=0

function latLonToXYZ(lat, lon) {
  const phi = (90-lat) * Math.PI/180
  const th = lon * Math.PI/180
  return { x: Math.sin(phi)*Math.cos(th), y: Math.cos(phi), z: Math.sin(phi)*Math.sin(th) }
}

function project(x3, y3, z3) {
  const cy=Math.cos(rotY), sy=Math.sin(rotY)
  const cx2=Math.cos(rotX), sx2=Math.sin(rotX)
  let nx=x3*cy-z3*sy, nz=x3*sy+z3*cy
  let ny=y3*cx2-nz*sx2; nz=y3*sx2+nz*cx2
  return { x:nx, y:ny, z:nz }
}

function Globe({ humans, selectedHuman, onSelect }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const projCache = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    const people = humans.map(h => ({
      name: h.name,
      role: h.job,
      lat: h.y * 1.8 - 90,
      lon: h.x * 3.6 - 180,
      emoji: h.name[0],
      colorIdx: h.id % 8,
      data: h
    }))

    function drawGlobe() {
      ctx.clearRect(0,0,W,H)
      ctx.save()
      ctx.beginPath(); ctx.arc(W/2,H/2,R,0,Math.PI*2); ctx.clip()
      const og = ctx.createRadialGradient(W/2-R*.2,H/2-R*.2,R*.05,W/2,H/2,R)
      og.addColorStop(0,'#1a6fa8'); og.addColorStop(.5,'#0d5a8c'); og.addColorStop(1,'#041f38')
      ctx.fillStyle=og; ctx.fillRect(0,0,W,H)
      ctx.restore()
      const atmo = ctx.createRadialGradient(W/2,H/2,R*.92,W/2,H/2,R*1.1)
      atmo.addColorStop(0,'rgba(100,170,255,0.28)'); atmo.addColorStop(1,'rgba(20,60,180,0)')
      ctx.beginPath(); ctx.arc(W/2,H/2,R*1.1,0,Math.PI*2); ctx.fillStyle=atmo; ctx.fill()
    }

    function drawPeople() {
      const projected = people.map((p,i) => {
        const s = latLonToXYZ(p.lat, p.lon)
        const pr = project(s.x, s.y, s.z)
        return { ...p, idx:i, px: W/2+pr.x*R, py: H/2-pr.y*R, z: pr.z }
      })
      projected.sort((a,b) => a.z-b.z)
      projected.forEach(p => {
        if(p.z < 0.05) return
        const c = COLORS[p.colorIdx]
        const isActive = selectedHuman?.id === p.data.id
        const r = isActive ? 16 : 12
        ctx.save()
        ctx.beginPath(); ctx.arc(p.px,p.py,r,0,Math.PI*2)
        ctx.fillStyle=c.bg; ctx.fill()
        ctx.strokeStyle=c.fg; ctx.lineWidth=isActive?2:1.2; ctx.stroke()
        ctx.fillStyle=c.fg; ctx.font=`500 ${isActive?10:9}px sans-serif`
        ctx.textAlign='center'; ctx.textBaseline='middle'
        ctx.fillText(p.emoji, p.px, p.py)
        ctx.restore()
      })
      projCache.current = projected
    }

    function draw() {
      drawGlobe()
      drawPeople()
      rotY += 0.003
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    const onMouseDown = e => { dragging=true; lastX=e.clientX; lastY=e.clientY }
    const onMouseUp = e => {
      if(dragging) {
        const dx=Math.abs(e.clientX-lastX), dy=Math.abs(e.clientY-lastY)
        if(dx<4 && dy<4) {
          const rect=canvas.getBoundingClientRect()
          const mx=e.clientX-rect.left, my=e.clientY-rect.top
          let hit=null
          projCache.current.forEach(p => {
            if(p.z<0.05) return
            if(Math.hypot(p.px-mx,p.py-my)<18) hit=p.data
          })
          if(hit) onSelect(hit)
        }
      }
      dragging=false
    }
    const onMouseMove = e => {
      if(!dragging) return
      rotY += (e.clientX-lastX)*0.007
      rotX += (e.clientY-lastY)*0.004
      rotX = Math.max(-1.2, Math.min(1.2, rotX))
      lastX=e.clientX; lastY=e.clientY
    }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [humans, selectedHuman])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ borderRadius: "50%", cursor: "grab" }}
    />
  )
}

export default Globe