<script setup lang="ts">
interface Raindrop {
  x: number
  y: number
  vx: number
  vy: number
  len: number
  targetY: number
  alphaDark: number
  alphaLight: number
}

interface SplashDot {
  dx: number
  peakY: number
  radius: number
}

interface Ripple {
  x: number
  y: number
  age: number
  duration: number
  maxR: number
  baseAlphaDark: number
  baseAlphaLight: number
  splashes: SplashDot[]
}

interface Fish {
  x: number
  y: number
  angle: number
  targetAngle: number | null
  speed: number
  length: number
  isKoi: boolean
  tailPhase: number
  driftPhase: number
  driftFreq: number
  boostTime: number
}

interface LilyPad {
  baseX: number
  baseY: number
  rx: number
  notchAngle: number
  bobPhase: number
  hasLotus: boolean
  frog?: FrogState
  frogFacing?: 1 | -1
}

interface FrogState {
  nextActionIn: number
  hopElapsed: number
  isHopping: boolean
  breathPhase: number
}

const MAX_DT = 0.05
const RIPPLE_ASPECT = 0.32
const PAD_ASPECT = 0.46
const PAD_NOTCH_HALF = 0.21
const SPLASH_DURATION = 0.22
const MAX_RIPPLES = 64
const FISH_WRAP_MARGIN = 80
const FISH_NUDGE_RADIUS = 140
const FISH_BOOST_DURATION = 1.2
const FROG_HOP_DURATION = 0.35
const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, video, iframe'

const { isDark } = useTheme()
const { isRainEnabled, initRain } = useRainEffect()

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let rafId: number | null = null
let lastTime = 0
let elapsed = 0
let width = 0
let height = 0
let dpr = 1
let prefersReducedMotion = false
let reducedMotionQuery: MediaQueryList | null = null

const drops: Raindrop[] = []
const ripples: Ripple[] = []
const fishes: Fish[] = []
const lilyPads: LilyPad[] = []

const rand = (min: number, max: number) => min + Math.random() * (max - min)

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val))

const angleDiff = (from: number, to: number) => {
  let diff = (to - from + Math.PI) % (Math.PI * 2)
  if (diff < 0) diff += Math.PI * 2
  return diff - Math.PI
}

const targetDropCount = (w: number) => (w >= 768 ? 34 : 16)
const targetFishCount = (w: number) => (w >= 768 ? 8 : 4)

const pickDropTargetY = (h: number) => {
  const lowerStart = h * 0.45
  const minY = Math.min(lowerStart, Math.max(0, h - 16))
  const maxY = Math.max(minY, h - 16)
  return rand(minY, maxY)
}

const createDrop = (w: number, h: number, initial: boolean): Raindrop => {
  const targetY = pickDropTargetY(h)
  return {
    x: rand(-40, w + 180),
    y: initial ? rand(-h * 0.4, targetY) : rand(-140, -16),
    vx: rand(-130, -90),
    vy: rand(560, 820),
    len: rand(14, 26),
    targetY,
    alphaDark: rand(0.12, 0.2),
    alphaLight: rand(0.18, 0.28)
  }
}

const recycleDrop = (drop: Raindrop) => {
  drop.x = rand(-40, width + 180)
  drop.y = rand(-140, -16)
  drop.vx = rand(-130, -90)
  drop.vy = rand(560, 820)
  drop.len = rand(14, 26)
  drop.targetY = pickDropTargetY(height)
  drop.alphaDark = rand(0.12, 0.2)
  drop.alphaLight = rand(0.18, 0.28)
}

const spawnRipple = (
  x: number,
  y: number,
  options?: { gentle?: boolean; faint?: boolean; noSplash?: boolean }
) => {
  if (ripples.length >= MAX_RIPPLES) {
    ripples.shift()
  }

  const splashes: SplashDot[] = []
  if (!options?.noSplash) {
    const splashCount = Math.random() < 0.5 ? 2 : 3
    for (let i = 0; i < splashCount; i++) {
      splashes.push({
        dx: rand(-10, 10),
        peakY: rand(4, 9),
        radius: rand(0.75, 1.15)
      })
    }
  }

  const faint = options?.faint ?? false
  const gentle = options?.gentle ?? false

  ripples.push({
    x,
    y,
    age: 0,
    duration: rand(1.15, 1.75),
    maxR: faint ? rand(30, 44) : gentle ? rand(32, 54) : rand(26, 54),
    baseAlphaDark: faint ? 0.13 : gentle ? rand(0.22, 0.29) : rand(0.17, 0.25),
    baseAlphaLight: faint ? 0.22 : gentle ? rand(0.32, 0.42) : rand(0.24, 0.34),
    splashes
  })
}

const createFish = (index: number, w: number, h: number): Fish => ({
  x: rand(40, Math.max(40, w - 40)),
  y: rand(h * 0.25, Math.max(h * 0.25, h * 0.9)),
  angle: rand(0, Math.PI * 2),
  targetAngle: null,
  speed: rand(22, 38),
  length: rand(22, 34),
  isKoi: index % 3 === 0,
  tailPhase: rand(0, Math.PI * 2),
  driftPhase: rand(0, Math.PI * 2),
  driftFreq: rand(0.22, 0.42),
  boostTime: 0
})

const syncDropPool = () => {
  const desired = targetDropCount(width)
  while (drops.length < desired) {
    drops.push(createDrop(width, height, true))
  }
  if (drops.length > desired) {
    drops.length = desired
  }
}

const syncFishPool = () => {
  const desired = targetFishCount(width)
  while (fishes.length < desired) {
    fishes.push(createFish(fishes.length, width, height))
  }
  if (fishes.length > desired) {
    fishes.length = desired
  }
}

const buildLilyPads = () => {
  lilyPads.length = 0
  const isDesktop = width >= 768

  const specs: Array<{ xr: number; yr: number; rx: number; notch: number; lotus: boolean; frog: boolean; frogFacing?: 1 | -1 }> = isDesktop
    ? [
        { xr: 0.055, yr: 0.27, rx: 38, notch: 0.4, lotus: true, frog: false },
        { xr: 0.115, yr: 0.34, rx: 26, notch: 2.1, lotus: false, frog: false },
        { xr: 0.048, yr: 0.61, rx: 42, notch: -0.5, lotus: false, frog: true, frogFacing: -1 },
        { xr: 0.095, yr: 0.69, rx: 27, notch: 1.7, lotus: true, frog: false },
        { xr: 0.24, yr: 0.94, rx: 31, notch: 1.1, lotus: false, frog: false },
        { xr: 0.945, yr: 0.38, rx: 36, notch: 2.9, lotus: false, frog: true, frogFacing: 1 },
        { xr: 0.89, yr: 0.45, rx: 25, notch: 0.7, lotus: true, frog: false },
        { xr: 0.915, yr: 0.865, rx: 44, notch: 2.65, lotus: false, frog: true, frogFacing: 1 },
        { xr: 0.835, yr: 0.925, rx: 30, notch: 0.85, lotus: true, frog: false }
      ]
    : [
        { xr: 0.09, yr: 0.36, rx: 28, notch: 0.5, lotus: true, frog: false },
        { xr: 0.11, yr: 0.66, rx: 33, notch: -0.4, lotus: false, frog: true, frogFacing: -1 },
        { xr: 0.91, yr: 0.24, rx: 25, notch: 2.8, lotus: false, frog: false },
        { xr: 0.87, yr: 0.87, rx: 36, notch: 2.65, lotus: false, frog: true, frogFacing: 1 },
        { xr: 0.72, yr: 0.935, rx: 24, notch: 1.0, lotus: true, frog: false }
      ]

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i]
    const marginX = spec.rx + 12
    const marginY = spec.rx * PAD_ASPECT + 14
    lilyPads.push({
      baseX: clamp(width * spec.xr, marginX, Math.max(marginX, width - marginX)),
      baseY: clamp(height * spec.yr, marginY, Math.max(marginY, height - marginY)),
      rx: spec.rx,
      notchAngle: spec.notch,
      bobPhase: i * 1.35 + 0.4,
      hasLotus: spec.lotus,
      frog: spec.frog
        ? { nextActionIn: rand(4, 11), hopElapsed: 0, isHopping: false, breathPhase: i * 1.9 }
        : undefined,
      frogFacing: spec.frogFacing ?? 1
    })
  }
}

const getPadPosition = (pad: LilyPad) => ({
  x: pad.baseX + Math.cos(elapsed * 0.45 + pad.bobPhase) * 2.2,
  y: pad.baseY + Math.sin(elapsed * 0.6 + pad.bobPhase) * 2.5
})

const nudgeNearbyFish = (px: number, py: number) => {
  for (let i = 0; i < fishes.length; i++) {
    const fish = fishes[i]
    const dx = fish.x - px
    const dy = fish.y - py
    if (dx * dx + dy * dy <= FISH_NUDGE_RADIUS * FISH_NUDGE_RADIUS) {
      const away = Math.atan2(dy / PAD_ASPECT, dx)
      fish.targetAngle = away + rand(-0.45, 0.45)
      fish.boostTime = FISH_BOOST_DURATION
    }
  }
}

const updateAndDrawFish = (c: CanvasRenderingContext2D, dt: number, dark: boolean) => {
  const koiFill = dark ? 'rgba(215, 25, 58, 0.16)' : 'rgba(185, 28, 52, 0.26)'
  const neutralFill = dark ? 'rgba(242, 239, 233, 0.11)' : 'rgba(38, 46, 52, 0.20)'

  for (let i = 0; i < fishes.length; i++) {
    const fish = fishes[i]

    if (fish.boostTime > 0) {
      fish.boostTime = Math.max(0, fish.boostTime - dt)
      if (fish.targetAngle !== null) {
        const diff = angleDiff(fish.angle, fish.targetAngle)
        fish.angle += diff * Math.min(1, dt * 4.5)
        if (Math.abs(diff) < 0.05) {
          fish.targetAngle = null
        }
      }
    } else {
      fish.targetAngle = null
      fish.angle += Math.sin(elapsed * fish.driftFreq + fish.driftPhase) * 0.24 * dt
    }

    const boostRatio = fish.boostTime / FISH_BOOST_DURATION
    const currentSpeed = fish.speed * (1 + 0.85 * boostRatio)

    fish.x += Math.cos(fish.angle) * currentSpeed * dt
    fish.y += Math.sin(fish.angle) * currentSpeed * PAD_ASPECT * dt
    fish.tailPhase += dt * (4.6 + currentSpeed * 0.09)

    if (fish.x < -FISH_WRAP_MARGIN) fish.x = width + FISH_WRAP_MARGIN
    else if (fish.x > width + FISH_WRAP_MARGIN) fish.x = -FISH_WRAP_MARGIN

    if (fish.y < -FISH_WRAP_MARGIN) fish.y = height + FISH_WRAP_MARGIN
    else if (fish.y > height + FISH_WRAP_MARGIN) fish.y = -FISH_WRAP_MARGIN

    const len = fish.length
    const halfW = len * 0.22
    const wag = Math.sin(fish.tailPhase)
    const finFlutter = Math.sin(fish.tailPhase * 0.65) * 0.18
    const tailOffset = wag * len * 0.09

    c.save()
    c.translate(fish.x, fish.y)
    c.scale(1, PAD_ASPECT)
    c.rotate(fish.angle)
    c.fillStyle = fish.isKoi ? koiFill : neutralFill

    c.beginPath()
    c.moveTo(len * 0.48, 0)
    c.quadraticCurveTo(len * 0.22, -halfW, -len * 0.42, tailOffset * 0.45)
    c.quadraticCurveTo(len * 0.22, halfW, len * 0.48, 0)
    c.closePath()
    c.fill()

    c.beginPath()
    c.moveTo(-len * 0.36, tailOffset * 0.35)
    c.quadraticCurveTo(-len * 0.56, -len * 0.16 + tailOffset, -len * 0.72, -len * 0.13 + tailOffset * 1.25)
    c.lineTo(-len * 0.56, tailOffset * 0.85)
    c.lineTo(-len * 0.72, len * 0.13 + tailOffset * 1.25)
    c.quadraticCurveTo(-len * 0.56, len * 0.16 + tailOffset, -len * 0.36, tailOffset * 0.35)
    c.closePath()
    c.fill()

    c.beginPath()
    c.ellipse(len * 0.08, -halfW * 0.95, len * 0.14, len * 0.055, -0.55 + finFlutter, 0, Math.PI * 2)
    c.fill()

    c.beginPath()
    c.ellipse(len * 0.08, halfW * 0.95, len * 0.14, len * 0.055, 0.55 - finFlutter, 0, Math.PI * 2)
    c.fill()

    c.restore()
  }
}

const updateAndDrawRipples = (c: CanvasRenderingContext2D, dt: number, dark: boolean, rgb: string) => {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const ripple = ripples[i]
    ripple.age += dt

    if (ripple.age >= ripple.duration) {
      ripples.splice(i, 1)
      continue
    }

    const t = ripple.age / ripple.duration
    const eased = 1 - Math.pow(1 - t, 3)
    const rx = 2 + (ripple.maxR - 2) * eased
    const ry = rx * RIPPLE_ASPECT
    const baseAlpha = dark ? ripple.baseAlphaDark : ripple.baseAlphaLight
    const alpha = baseAlpha * (1 - t)

    if (alpha > 0.004) {
      c.lineWidth = 1
      c.strokeStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`
      c.beginPath()
      c.ellipse(ripple.x, ripple.y, rx, ry, 0, 0, Math.PI * 2)
      c.stroke()

      const innerRx = rx * 0.58
      if (innerRx > 2.2) {
        c.strokeStyle = `rgba(${rgb}, ${(alpha * 0.48).toFixed(3)})`
        c.beginPath()
        c.ellipse(ripple.x, ripple.y, innerRx, innerRx * RIPPLE_ASPECT, 0, 0, Math.PI * 2)
        c.stroke()
      }
    }
  }
}

const drawLotusFlower = (c: CanvasRenderingContext2D, x: number, y: number, scale: number, dark: boolean) => {
  const petalFill = dark ? 'rgba(242, 214, 218, 0.24)' : 'rgba(196, 68, 92, 0.38)'
  const innerPetalFill = dark ? 'rgba(248, 226, 230, 0.28)' : 'rgba(218, 98, 120, 0.44)'
  const centerFill = dark ? 'rgba(238, 206, 136, 0.34)' : 'rgba(202, 140, 38, 0.55)'

  const outerAngles = [-1.05, -0.5, 0, 0.5, 1.05]
  c.save()
  c.translate(x, y - scale * 0.14)

  c.fillStyle = petalFill
  for (let i = 0; i < outerAngles.length; i++) {
    const a = outerAngles[i]
    c.save()
    c.rotate(a * 0.72)
    c.beginPath()
    c.ellipse(0, -scale * 0.22, scale * 0.11, scale * 0.24, 0, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }

  c.fillStyle = innerPetalFill
  const innerAngles = [-0.42, 0, 0.42]
  for (let i = 0; i < innerAngles.length; i++) {
    const a = innerAngles[i]
    c.save()
    c.rotate(a * 0.6)
    c.beginPath()
    c.ellipse(0, -scale * 0.17, scale * 0.085, scale * 0.18, 0, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }

  c.fillStyle = centerFill
  c.beginPath()
  c.ellipse(0, -scale * 0.04, scale * 0.09, scale * 0.05, 0, 0, Math.PI * 2)
  c.fill()

  c.restore()
}

const drawFrog = (
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  frog: FrogState,
  facing: 1 | -1,
  dt: number,
  dark: boolean
) => {
  let hopOffsetY = 0
  if (frog.isHopping) {
    frog.hopElapsed += dt
    if (frog.hopElapsed >= FROG_HOP_DURATION) {
      frog.isHopping = false
      frog.hopElapsed = 0
      frog.nextActionIn = rand(7, 12)
      spawnRipple(x, y, { faint: true, noSplash: true })
    } else {
      const u = frog.hopElapsed / FROG_HOP_DURATION
      hopOffsetY = -Math.sin(u * Math.PI) * 4
    }
  } else {
    frog.nextActionIn -= dt
    if (frog.nextActionIn <= 0) {
      frog.isHopping = true
      frog.hopElapsed = 0
    }
  }

  const breath = 1 + Math.sin(elapsed * 2.1 + frog.breathPhase) * 0.035
  const fill = dark ? 'rgba(116, 156, 110, 0.34)' : 'rgba(48, 88, 52, 0.48)'

  c.save()
  c.translate(x - 3 * facing, y - 2 + hopOffsetY)
  c.scale(facing, 1)
  c.fillStyle = fill

  c.beginPath()
  c.ellipse(4.2, 2.2, 3.6, 2.1, -0.35, 0, Math.PI * 2)
  c.fill()

  c.beginPath()
  c.ellipse(2.6, 3.2, 3.3, 1.9, 0.25, 0, Math.PI * 2)
  c.fill()

  c.beginPath()
  c.ellipse(0, 0, 6.2 * breath, 4.1 * breath, -0.1, 0, Math.PI * 2)
  c.fill()

  c.beginPath()
  c.arc(-4.2, -3.1, 1.6, 0, Math.PI * 2)
  c.arc(-1.8, -3.5, 1.5, 0, Math.PI * 2)
  c.fill()

  c.restore()
}

const drawLilyPadsAndFrog = (c: CanvasRenderingContext2D, dt: number, dark: boolean) => {
  const padFill = dark ? 'rgba(92, 128, 98, 0.20)' : 'rgba(58, 102, 66, 0.30)'
  const padStroke = dark ? 'rgba(124, 164, 130, 0.22)' : 'rgba(42, 80, 48, 0.38)'
  const veinStroke = dark ? 'rgba(138, 178, 144, 0.14)' : 'rgba(40, 74, 46, 0.26)'

  for (let i = 0; i < lilyPads.length; i++) {
    const pad = lilyPads[i]
    const { x, y } = getPadPosition(pad)

    c.save()
    c.translate(x, y)
    c.scale(1, PAD_ASPECT)

    const startA = pad.notchAngle + PAD_NOTCH_HALF
    const endA = pad.notchAngle + Math.PI * 2 - PAD_NOTCH_HALF

    c.fillStyle = padFill
    c.strokeStyle = padStroke
    c.lineWidth = 1.2
    c.beginPath()
    c.moveTo(0, 0)
    c.arc(0, 0, pad.rx, startA, endA)
    c.closePath()
    c.fill()
    c.stroke()

    c.strokeStyle = veinStroke
    c.lineWidth = 0.9
    const veinCount = 4
    for (let v = 1; v <= veinCount; v++) {
      const va = startA + ((endA - startA) * v) / (veinCount + 1)
      c.beginPath()
      c.moveTo(0, 0)
      c.lineTo(Math.cos(va) * pad.rx * 0.78, Math.sin(va) * pad.rx * 0.78)
      c.stroke()
    }

    c.restore()

    if (pad.hasLotus) {
      drawLotusFlower(c, x + pad.rx * 0.08, y - pad.rx * 0.04, pad.rx * 0.56, dark)
    }

    if (pad.frog) {
      drawFrog(c, x, y, pad.frog, pad.frogFacing ?? 1, dt, dark)
    }
  }
}

const updateAndDrawRainAndSplashes = (
  c: CanvasRenderingContext2D,
  dt: number,
  dark: boolean,
  rgb: string
) => {
  c.lineWidth = 1
  c.lineCap = 'round'

  for (let i = 0; i < drops.length; i++) {
    const drop = drops[i]
    drop.x += drop.vx * dt
    drop.y += drop.vy * dt

    if (drop.y >= drop.targetY) {
      if (drop.x >= -12 && drop.x <= width + 12) {
        spawnRipple(drop.x, drop.targetY)
      }
      recycleDrop(drop)
      continue
    }

    if (drop.y + drop.len < 0 || drop.x < -30 || drop.x > width + 30) {
      continue
    }

    const speed = Math.hypot(drop.vx, drop.vy)
    const tx = drop.x - (drop.vx / speed) * drop.len
    const ty = drop.y - (drop.vy / speed) * drop.len
    const alpha = dark ? drop.alphaDark : drop.alphaLight

    c.strokeStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`
    c.beginPath()
    c.moveTo(tx, ty)
    c.lineTo(drop.x, drop.y)
    c.stroke()
  }

  for (let i = 0; i < ripples.length; i++) {
    const ripple = ripples[i]
    if (ripple.age >= SPLASH_DURATION || ripple.splashes.length === 0) continue

    const u = ripple.age / SPLASH_DURATION
    const baseAlpha = dark ? ripple.baseAlphaDark : ripple.baseAlphaLight
    const splashAlpha = baseAlpha * (1 - u) * 0.9
    if (splashAlpha <= 0.005) continue

    c.fillStyle = `rgba(${rgb}, ${splashAlpha.toFixed(3)})`
    for (let j = 0; j < ripple.splashes.length; j++) {
      const dot = ripple.splashes[j]
      const sx = ripple.x + dot.dx * u
      const sy = ripple.y - Math.sin(u * Math.PI) * dot.peakY
      c.beginPath()
      c.arc(sx, sy, dot.radius, 0, Math.PI * 2)
      c.fill()
    }
  }
}

const clearCanvas = () => {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)
}

const resizeCanvas = () => {
  const container = containerRef.value
  const canvas = canvasRef.value
  if (!container || !canvas) return

  const nextWidth = container.clientWidth || window.innerWidth
  const nextHeight = container.clientHeight || window.innerHeight
  const widthChanged = nextWidth !== width

  // Lock height to 100lvh on mobile so address-bar collapse/expand never shifts the canvas
  if (!widthChanged && nextWidth < 1024 && height > 0) {
    return
  }

  width = nextWidth
  height = nextHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)

  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)

  ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  syncDropPool()
  syncFishPool()
  if (widthChanged || lilyPads.length === 0) {
    buildLilyPads()
  }
}

const shouldRun = () =>
  isRainEnabled.value && !prefersReducedMotion && !document.hidden

const stopLoop = (clear = false) => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  lastTime = 0
  if (clear) {
    ripples.length = 0
    clearCanvas()
  }
}

const tick = (now: number) => {
  if (!shouldRun() || !ctx) {
    rafId = null
    return
  }

  const dt = lastTime === 0 ? 0.016 : Math.min((now - lastTime) / 1000, MAX_DT)
  lastTime = now
  elapsed += dt

  const dark = isDark.value
  const rgb = dark ? '242, 239, 233' : '24, 22, 20'

  ctx.clearRect(0, 0, width, height)

  updateAndDrawFish(ctx, dt, dark)
  updateAndDrawRipples(ctx, dt, dark, rgb)
  drawLilyPadsAndFrog(ctx, dt, dark)
  updateAndDrawRainAndSplashes(ctx, dt, dark, rgb)

  rafId = requestAnimationFrame(tick)
}

const syncAnimation = () => {
  if (shouldRun()) {
    if (rafId === null) {
      lastTime = 0
      rafId = requestAnimationFrame(tick)
    }
  } else {
    stopLoop(!isRainEnabled.value || prefersReducedMotion)
  }
}

const handleVisibilityChange = () => {
  syncAnimation()
}

const handleReducedMotionChange = (event: MediaQueryListEvent) => {
  prefersReducedMotion = event.matches
  syncAnimation()
}

const handlePointerDown = (event: PointerEvent) => {
  if (!shouldRun()) return
  if (event.target instanceof Element && event.target.closest(INTERACTIVE_SELECTOR)) {
    return
  }
  spawnRipple(event.clientX, event.clientY, { gentle: true })
  nudgeNearbyFish(event.clientX, event.clientY)
}

watch(isRainEnabled, () => {
  if (!import.meta.client) return
  syncAnimation()
})

onMounted(() => {
  initRain()
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion = reducedMotionQuery.matches

  resizeCanvas()

  window.addEventListener('resize', resizeCanvas, { passive: true })
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('pointerdown', handlePointerDown, { passive: true })
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange)

  syncAnimation()
})

onUnmounted(() => {
  stopLoop(true)
  window.removeEventListener('resize', resizeCanvas)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('pointerdown', handlePointerDown)
  reducedMotionQuery?.removeEventListener('change', handleReducedMotionChange)
})
</script>

<template>
  <div
    ref="containerRef"
    aria-hidden="true"
    class="fixed top-0 left-0 w-full h-[100lvh] z-0 pointer-events-none overflow-hidden [transform:translate3d(0,0,0)] transition-opacity duration-300"
    :class="isRainEnabled ? 'opacity-100' : 'opacity-0'"
  >
    <canvas ref="canvasRef" class="block w-full h-full" />
  </div>
</template>
