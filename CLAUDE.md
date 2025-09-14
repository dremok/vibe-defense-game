# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Browser-Based Tower Defense Game

This is a TypeScript/Vite browser game following an iterative development approach with baby-step increments.

## 🚨 CRITICAL WORKFLOW REQUIREMENTS

### Before Starting ANY Work:
1. **ALWAYS read PROJECT_STATUS.md first** - Check current phase, completed tasks, and project health
2. **Before starting new phase** - Review PROJECT_STATUS.md to understand what's been completed
3. **After completing major milestones** - Update PROJECT_STATUS.md immediately

This ensures continuity between sessions and prevents duplicate work.

---

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

### Testing & Quality
```bash
yarn test           # Run unit tests (Vitest - 11 tests passing)
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

### Phase 2 — Enemies & Base ✅ COMPLETED
7. ✅ Enemy class: pathfinding, spawning system, base damage
8. ✅ Base + HP: 20 health, real-time HUD, defeat when enemies escape
9. ✅ Speed consistency: all systems affected by speed multiplier

**Status:** Fully functional tower defense core gameplay loop

### Phase 3 — First Tower ✅ COMPLETED
9. ✅ Tower class: stats, grid positioning, visual representation  
10. ✅ Placement: click grass tile, cost gold, prevent road/overlap
11. ✅ Targeting & Projectile: nearest enemy, bullets, damage, kill rewards
12. ✅ Gold economy: starting gold, tower costs, enemy kill rewards

**Status:** Complete tower defense game with full combat loop and economy

### Phase 4 — Waves & Second Enemy ✅ COMPLETED
13. ✅ Wave system: 6 waves with defined enemy patterns and progression
14. ✅ Wave controls: "Start Wave" button with manual progression
15. ✅ Fast enemy type: red triangles with different stats (5 HP, 140 speed)
16. ✅ Wave splash screens: professional start/complete notifications
17. ✅ Game state management: ready/playing/waveStart/waveComplete states
18. ✅ Unit testing: comprehensive wave system test suite (11 tests)

**Status:** Polished tower defense with wave progression and enemy variety

### Phase 5 — Second Tower & Polish
19. Tower 2 (Splash): AoE damage, expanding ring visual
20. Tower upgrades: multiple levels with improved stats
21. HUD polish: better UI, save/load, SFX integration
22. Performance optimization: entity pooling, offscreen culling

### Phase 6+ — Advanced Features
23. BFS pathfinding: allow complex road networks
24. No-block placement validation: prevent path blocking
25. Multiple maps: JSON map loader system
26. Achievement system: unlock progression

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

### 🚨 CRITICAL: Speed Multiplier Consistency
**ALL time-based systems MUST respect the speedMult variable:**
- Enemy spawning ✅ (spawnTimer affected by speedMult)
- Enemy movement ✅ (enemy speed affected by speedMult)  
- Projectile movement ✅ (projectile speed affected by speedMult)
- **Tower shooting rate** ✅ (shoot interval divided by speedMult)
- **Any future timers** MUST be affected by speedMult

**When adding ANY time-based feature, always ensure it scales with speed controls for consistent game feel.**

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

### 🚨 MANDATORY SESSION WORKFLOW:
**At start of EVERY session:** Read PROJECT_STATUS.md to understand current state
**Before starting new phase:** Review PROJECT_STATUS.md for completed work
**After major changes:** Update PROJECT_STATUS.md immediately

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