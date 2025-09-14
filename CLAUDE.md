# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Browser-Based Tower Defense Game

This is a TypeScript/Vite browser game following an iterative development approach with baby-step increments.

## Development Commands

### Project Setup (COMPLETED ✅)
```bash
# Project is already set up with working dependencies
cd vibe-defense-game
yarn install        # Install dependencies (preferred over npm)
```

### Development Server
```bash
yarn dev            # Start development server (http://localhost:5173/)
yarn build          # Build for production
yarn preview        # Preview production build
```

### Testing & Quality (Future)
```bash
yarn test           # Run unit tests (when Vitest is configured)
yarn lint           # ESLint (when configured)  
yarn format         # Prettier (when configured)
```

**Important:** Use `yarn` instead of `npm` for this project to avoid permission issues.

## Project Architecture

### Core Tech Stack
- **Language**: TypeScript
- **Build**: Vite (fast HMR)
- **Rendering**: HTML5 Canvas 2D
- **UI**: Native HTML + Tweakpane for live tuning
- **Audio**: Howler.js
- **Pathfinding**: Waypoint list → BFS → optional A*
- **Data**: JSON config with optional Zod schemas
- **Save**: localStorage

### Recommended File Structure
```
/src
  main.ts              # Boot, game loop, UI wiring
  engine/
    loop.ts            # Fixed timestep game loop
    input.ts           # Mouse/keyboard handling
    rng.ts             # Seeded PRNG
    debugHud.ts        # Stats overlays
  game/
    types.ts           # Shared interfaces
    grid.ts            # Grid math utilities
    path.ts            # BFS/A* pathfinding
    map.ts             # Map data & loaders
    entity.ts          # Base entity types
    enemy.ts           # Enemy classes
    tower.ts           # Tower classes & targeting
    projectile.ts      # Bullets/splash effects
    waves.ts           # Wave definitions
    balance.ts         # Game balance values
    save.ts            # localStorage persistence
  ui/
    hud.ts             # Text overlays, buttons
    pane.ts            # Tweakpane bindings
```

## Development Phase Roadmap

### Phase 0 — Boot & Loop ✅ COMPLETED
1. ✅ Hello Canvas: background & FPS
2. ✅ Fixed loop: separate update(dt) and render()  
3. ✅ Pause/Speed: Start, Pause, x1/x2/x4 buttons
4. ✅ Grid rendering: 32px cells with visual overlay
5. ✅ Vite development setup: TypeScript, HMR, build system

**Status:** Ready for browser testing at `http://localhost:5173/` (run `yarn dev`)

### Phase 1 — Grid & Path ✅ COMPLETED
4. ✅ Grid module: world↔grid math, hover highlight implemented
5. ✅ Road: S-curve path array rendered as darker blue tiles
6. ✅ Interactive system: mouse tracking with visual feedback

**Status:** Complete interactive grid system ready for enemies

### Phase 2 — Enemies & Base 🚧 NEXT
7. Enemy variants: slow tank, fast weakling
8. Base + HP: reaching end damages base, defeat condition

### Phase 3 — First Tower
9. Placement: click grass tile, cost gold, prevent road/overlap
10. Targeting & Projectile: nearest enemy, bullets, damage, kill rewards
11. Balance panel: Tweakpane sliders for live tuning

### Phase 4 — Waves & Second Tower
12. Waves: wave definitions, Start/Pause/Next Wave buttons
13. Enemy 2: triangle fast enemy
14. Tower 2 (Splash): AoE damage, expanding ring visual

### Phase 5+ — UX, Pathfinding, Polish
15. HUD polish, save/load, SFX
16. BFS pathfinding, no-block placement validation
17. Performance optimization, win/lose screens

## Core Game Constants

```typescript
const CELL = 32;                    // Grid cell size in pixels
const canvas = { width: 960, height: 540 };  // Game resolution
const FPS = 60;                     // Fixed timestep target
```

## Critical Implementation Notes

### Game Loop Pattern
- Fixed timestep update at 60 FPS
- Variable render rate with interpolation
- Pause/speed controls affect update rate only

### Canvas Coordinate System
- Grid coordinates: [gx, gy] integers
- World coordinates: { x: gx*CELL + CELL/2, y: gy*CELL + CELL/2 }
- Convert grid centers for smooth entity movement

### Entity Management
- Enemies: array with alive flag, update/draw methods
- Towers: grid-based placement, range circles for debugging
- Projectiles: travel time, hit detection, damage application

### Balance Considerations
- Expose key values via Tweakpane for live tuning
- Maintain wave budget: sum of (hp × speed × count)
- Show DPS meters for tower effectiveness analysis

# CRITICAL DEVELOPMENT PRINCIPLES

## Baby Steps & Testing Protocol

**🚨 MANDATORY: Work in micro-increments and validate each step**

### Development Flow (NEVER DEVIATE):
1. **Identify smallest possible change** (1-3 lines max)
2. **Make the minimal change**  
3. **Test immediately** (run in browser, verify behavior)
4. **MANDATORY: Show results to user and get verification** 
5. **User must confirm:** "I can see [specific feature] working in browser"
6. **Only then** proceed to next micro-increment

**🚨 CRITICAL:** User must test each change at http://localhost:5173/ and confirm it works before proceeding.

### Testing Requirements:
- **Test in browser after EVERY change** - no exceptions
- **Create simple test scenarios** for complex functionality
- **Show visual results** to user before claiming success
- **If something fails**, stop immediately and debug that specific issue

### When to Pause for User Verification:
- After implementing any new major feature
- After fixing any bug or error
- Before making architectural changes
- When visual results are unexpected
- When you're unsure about the next step

## Debugging & Problem Solving

### When You Get Stuck:
- **STOP** trying the same approach repeatedly
- **ASK the user** for guidance or a different approach  
- **Simplify** - reduce to the most basic version that works
- **Test manually** in browser step by step
- **Don't assume** - validate every assumption with visual tests

### Anti-Patterns to Avoid:
- Avoid "workarounds", "heuristics", and other patches
- If you think a heuristic is useful, you are taking the wrong approach
- Consider breaking out of local maxima - backtrack if needed
- Don't be afraid to delete code that doesn't improve the game
- DO NOT keep broken code paths just to "get it done"

---

## Documentation Maintenance

**CRITICAL: Keep these files updated after any significant changes:**

### Required Updates After Each Phase/Milestone:
1. **README.md** - Primary project documentation
   - Update current phase status in header
   - Update tool inventory and capabilities
   - Update testing instructions
   - Update architecture overview

2. **PROJECT_STATUS.md** - Detailed project tracking
   - Update "Last Updated" date
   - Update "Current Phase" status
   - Mark completed phases with ✅
   - Update development velocity metrics
   - Update risk assessment
   - Update next steps and commands

3. **CLAUDE.md** (this file) - Implementation guidance
   - Update current implementation status
   - Update testing procedures
   - Update available tools list
   - Update server commands if changed

### When to Update Documentation:
- ✅ After completing any phase or major milestone
- ✅ After adding new tools or capabilities
- ✅ After successful integration testing
- ✅ After architecture changes
- ✅ When transitioning between phases

### Documentation Standards:
- Use consistent phase numbering (Phase 1, Phase 2, Phase 2.5, etc.)
- Mark completed items with ✅ and current work with 🚧
- Include specific metrics and data where available
- Provide clear testing instructions for new features
- Update risk levels based on current project health

## Context7 Documentation Usage

**ALWAYS use Context7 MCP server proactively when uncertain about:**
- Latest documentation for languages, libraries, frameworks
- Current best practices and API changes
- Modern tooling configurations and patterns
- Any rapidly evolving technology features

This ensures accurate, up-to-date implementation guidance rather than relying on potentially outdated knowledge.