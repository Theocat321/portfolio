# Lunar Expedition Portfolio — Design Spec

## Overview

A 3D portfolio experience set on a stylised lunar surface. Users view a slowly orbiting moon with embedded expedition beacons, each representing a project. Clicking a beacon zooms the camera in and reveals a project panel. The experience is minimal, cinematic, and focused on clarity.

**Goal**: Present projects in a way that immediately stands out, feels premium, and remains intuitive.

**Non-goals**: Not a game. No free-roam navigation. No complex mechanics.

---

## Target Users

- Founders, operators, technical buyers, designers, and engineers reviewing work.
- Intent: quickly understand what's been built, explore key projects, decide if worth talking to.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Vite | Build tooling, dev server, HMR |
| React + TypeScript | UI framework |
| @react-three/fiber | React renderer for Three.js |
| @react-three/drei | Camera controls, shaders, Html, Stars |
| Zustand | Minimal state management |
| Framer Motion | HTML overlay animations |
| Leva | Dev-only debug tuning panel |

---

## Architecture

### Component Tree

```
App
├── Canvas (R3F)
│   ├── SceneSetup      — lights, fog, environment
│   ├── CameraRig       — auto-orbit + zoom transitions
│   ├── Moon            — sphere + textures + rotation
│   ├── Beacons         — maps project data → Beacon instances
│   │   └── Beacon      — glow, pulse, hover, click
│   └── Starfield       — background particles
├── HUD (HTML overlay)
│   ├── Header          — name, tagline
│   ├── NavHint         — "click a beacon to explore"
│   └── ProjectPanel    — slide-in on beacon select
```

### State (Zustand)

```ts
interface Store {
  activeProject: string | null
  hoveredBeacon: string | null
  isTransitioning: boolean
  setActiveProject: (id: string | null) => void
  setHoveredBeacon: (id: string | null) => void
  setTransitioning: (v: boolean) => void
}
```

State flow: click beacon → `setActiveProject(id)` → CameraRig animates to beacon → ProjectPanel fades in. Close → `setActiveProject(null)` → camera returns → orbit resumes.

---

## File Structure

```
portfolio/
├── public/
│   └── textures/
│       ├── moon-diffuse.jpg    # 2K compressed
│       └── moon-normal.jpg     # 2K compressed
├── src/
│   ├── App.tsx                 # Root — Canvas + HUD
│   ├── main.tsx                # Entry point
│   ├── scene/
│   │   ├── Moon.tsx            # Sphere + textures + rotation
│   │   ├── Beacon.tsx          # Single beacon (glow, pulse, events)
│   │   ├── Beacons.tsx         # Maps project data → Beacon instances
│   │   ├── CameraRig.tsx       # Orbit + zoom transitions
│   │   ├── SceneSetup.tsx      # Lights, fog, environment
│   │   └── Starfield.tsx       # Background particles
│   ├── ui/
│   │   ├── Header.tsx          # Name + tagline
│   │   ├── NavHint.tsx         # "Click a beacon…"
│   │   └── ProjectPanel.tsx    # Slide-in project detail
│   ├── store/
│   │   └── useStore.ts         # Zustand state
│   ├── data/
│   │   └── projects.ts         # Project content array
│   └── styles.css              # Global + UI styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Scene Design

### Moon

- Sphere geometry with diffuse texture and normal/bump map (2K, compressed JPEG).
- Slow continuous rotation on Y-axis (~0.002 rad/frame).
- Lighting: 1 strong directional light (top-right), minimal ambient fill. Deep shadows.

### Starfield

- Background particle system (drei `<Stars>`), ~200 particles on desktop, ~50 on mobile.
- Static positions, subtle twinkle via opacity variation.

### Color Palette

- Background: near-black `#050505`
- Moon: grey tones, high contrast
- Accent (beacons): cool blue/cyan `#4cc9f0`

---

## Beacon System

### Data Structure

```ts
interface Project {
  id: string
  title: string
  description: string     // max ~12 words
  link: string
  tag?: string            // e.g. "AI", "Infra"
  thumbnail?: string      // path to image
  position: [number, number]           // [lat, lng] in degrees — converted to Cartesian at runtime
}
```

### Placement

- 5–7 beacons distributed across the visible hemisphere.
- Slight clustering allowed. Must avoid: overlap, uniform spacing, hidden/backside-only placement.
- Positions stored as `[lat, lng]` (degrees) in `projects.ts`. A helper function converts to Cartesian `[x, y, z]` on the sphere surface at runtime. The `position` field in the Project interface should be `[number, number]` (lat/lng), not raw Cartesian.

### Beacon States

| State | Visual |
|-------|--------|
| Idle | Soft pulsing glow (opacity 0.7→1.0, scale 1→1.05), staggered timing per beacon |
| Hover | Glow intensifies (2x radius), scale to 1.3x, label fades in above beacon, cursor: pointer |
| Active | Full brightness, largest glow radius, camera zooms in, panel appears |
| Inactive | When one beacon is active, others dim to 30% opacity |

### Implementation

- Each beacon: small sphere or point with custom shader material for glow effect.
- Raycasting via R3F's `onPointerOver` / `onPointerOut` / `onClick` events.
- Pulse animation via `useFrame` sine wave on emissive intensity + scale.

---

## Camera System

### Default Orbit

- Circular orbit around moon center, radius ~4 units.
- Speed: ~0.05 rad/s (full rotation in ~2 minutes).
- Elevation: 15° above equator.
- Mouse parallax: mouse position offsets camera look-at by ±0.3 units.
- No user-controlled orbit — automatic only.

### Zoom Transition

- On beacon click: interpolate camera position to ~1.5 units from beacon surface, looking at the beacon. Duration ~1.2s.
- Easing: cubic ease-in-out.
- Orbit pauses during transition and while panel is open.
- On close: reverse transition back to orbit position, resume rotation.
- Implementation: `useFrame` with lerp between stored orbit position and target position.

---

## UI Overlay (HTML)

### Header

- Top-left corner. Name (14px, semi-bold, 85% white) + tagline below (11px, 40% white).
- Always visible.

### NavHint

- Bottom-center. "CLICK A BEACON TO EXPLORE" (10px, 25% white, 1px letter-spacing).
- Fades out when a beacon is active, returns when panel closes.

### ProjectPanel

- Right side (desktop), bottom sheet (mobile).
- Glass-morphic: `rgba(255,255,255,0.04)` background, `1px solid rgba(255,255,255,0.08)` border, `backdrop-filter: blur(8px)`, 12px border-radius.
- Contents: thumbnail (placeholder image area), tag (9px, cyan 60% opacity), title (14px, bold, white), description (11px, 50% white), CTA button ("View Project →" in cyan accent).
- Animation: Framer Motion fade + slide from right (desktop) or bottom (mobile).
- Close: click backdrop, press Escape, or click close button.

---

## Interaction Map

| Input | Action |
|-------|--------|
| Mouse move | Parallax offset on camera look-at (orbit state only) |
| Hover beacon | Raycast hit → highlight beacon, show label, cursor: pointer |
| Click beacon | Set activeProject → camera zooms → panel appears |
| Click backdrop | If panel open: close panel → camera returns |
| Press Escape | Close panel → camera returns to orbit |
| Click "View Project" | Open project link in new tab |

---

## Mobile Adaptations

- Parallax: disabled on touch devices.
- Starfield: reduced particle count (200 → 50).
- Beacon glow: simplified (no bloom post-processing).
- Panel: bottom sheet instead of side panel.
- Interaction: tap beacon = click (no hover state on touch).
- Touch detection: check `window.matchMedia('(pointer: coarse)')`.

---

## Performance Requirements

- First render: < 2.5s.
- Maintain 60 FPS on modern devices.
- Textures: 2K JPEG, compressed. Loaded via `useTexture` (drei) with suspense.
- No bloom/post-processing on mobile.
- Tree-shake Three.js imports.

---

## Accessibility

- Keyboard: Tab cycles through beacons, Enter selects, Escape closes panel.
- Focus indicators on beacons when using keyboard nav.
- Clear visual affordances for clickable elements (cursor change, glow increase).

---

## Build Phases

### Phase 1 — Foundation & MVP

- Scaffold Vite + React + TypeScript project
- Install R3F, Drei, Zustand, Framer Motion
- Moon sphere with diffuse + normal map textures
- SceneSetup (directional light, ambient, fog)
- CameraRig with auto-orbit
- Single beacon with click → zoom transition
- Basic ProjectPanel (text only, no thumbnail yet)

**Deliverable**: clickable moon with one working beacon.

### Phase 2 — Full Experience

- All 5–7 beacons with proper sphere-surface placement
- Beacon hover states (glow, scale, label)
- Mouse parallax on camera
- Starfield background
- ProjectPanel with thumbnail + tag
- Escape / backdrop click to close
- Zustand store fully wired

**Deliverable**: complete interactive experience.

### Phase 3 — Polish & Performance

- Lighting refinement (shadow tuning, rim light)
- Framer Motion animations on panel + HUD
- Mobile adaptations (bottom sheet, reduced effects)
- Texture compression + lazy loading
- Performance profiling (target 60fps)
- Leva debug panel (dev only)
- Keyboard accessibility (tab through beacons)

**Deliverable**: production-ready, performant, accessible.

---

## Verification

1. `npm run dev` — scene loads, moon visible < 2s
2. Beacons visible and pulsing on moon surface
3. Hover beacon → glow intensifies, label appears
4. Click beacon → camera zooms smoothly, panel slides in
5. Panel shows title, description, tag, thumbnail, CTA
6. CTA opens link in new tab
7. Escape / backdrop click → panel closes, camera returns
8. Resize to mobile viewport → bottom sheet panel, reduced effects
9. Tab through beacons with keyboard → focus visible, Enter selects
10. Chrome DevTools Performance tab → steady 60fps during orbit
