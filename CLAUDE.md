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
yarn test           # Run unit tests (Vitest - 21 tests passing)
yarn lint           # ESLint (when configured)  
yarn format         # Prettier (when configured)
```

### Verification Tools Available
```bash
# UI/Visual Verification (Playwright MCP)
# - Take screenshots of http://localhost:5173/
# - Navigate and interact with game elements  
# - Capture before/after states for comparison
# - Verify visual layout and styling changes

# Game Logic Verification (Unit Tests)
yarn test           # Run all unit tests (21 passing)
# - Wave system tests
# - Enemy behavior tests  
# - Tower mechanics tests
# - Balance and timing tests

# Development Server
yarn dev            # Start at http://localhost:5173/ for live testing
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
  main.ts              # Boot, game loop, UI wiring (315 lines after Phase 4.5 refactoring)
  utils.ts             # Grid utilities (world↔grid conversion)
  game/                # ✅ IMPLEMENTED: Modular game architecture
    types.ts           # ✅ Shared interfaces and types
    map.ts             # ✅ Path data and waypoints
    enemy.ts           # ✅ Enemy class with movement and rendering
    tower.ts           # ✅ Tower class with targeting and combat
    projectile.ts      # ✅ Projectile class with physics
    waves.ts           # ✅ Wave management with WaveManager class
  engine/              # Future: Advanced engine features
    loop.ts            # Fixed timestep game loop
    input.ts           # Mouse/keyboard handling
    rng.ts             # Seeded PRNG
    debugHud.ts        # Stats overlays
  ui/                  # Future: UI system extraction
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

### Phase 4.5 — Architecture Refactoring ✅ COMPLETED
19. ✅ Extract Enemy class to `game/enemy.ts` with cleaner callbacks
20. ✅ Extract Tower class to `game/tower.ts` with proper separation
21. ✅ Extract Projectile class to `game/projectile.ts`
22. ✅ Extract wave system to `game/waves.ts` with WaveManager class
23. ✅ Extract shared types to `game/types.ts`
24. ✅ Extract map data to `game/map.ts`
25. ✅ Refactor main.ts to focus on game loop and UI (537→315 lines)

**Status:** Clean modular architecture ready for Phase 5 feature expansion

### Phase 4.6 — UI Polish & Speed Balance ✅ COMPLETED
26. ✅ Enhanced UI design: centered HUD, larger fonts, modern styling
27. ✅ Play/Pause toggle button for improved UX
28. ✅ Speed balance fix: collision detection compensation
29. ✅ Comprehensive balance testing (21 unit tests total)

**Status:** Polished, balanced tower defense with modern UI and fair gameplay

### Phase 5 — Second Tower & Polish
30. Tower 2 (Splash): AoE damage, expanding ring visual
31. Tower upgrades: multiple levels with improved stats
32. Save/load system: localStorage persistence
33. Sound effects: Howler.js integration
34. Performance optimization: entity pooling, offscreen culling

### Phase 6+ — Advanced Features
35. BFS pathfinding: allow complex road networks
36. No-block placement validation: prevent path blocking
37. Multiple maps: JSON map loader system
38. Achievement system: unlock progression

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
3. **MANDATORY: Verify your work FIRST using available tools:**
   - **UI Changes**: Use Playwright MCP to take screenshots and verify visual results
   - **Game Logic**: Run unit tests with `yarn test` to verify functionality
   - **Other Changes**: Find appropriate verification method (console logs, file inspection, etc.)
4. **Iterate until satisfied** - Fix issues and re-verify until results match expectations
5. **THEN ask user to verify** - Only after YOU have confirmed it works correctly
6. **User confirms final result** before proceeding to next micro-increment

**🚨 CRITICAL: YOU must verify your own work before asking the user to check it**

### Verification Requirements by Change Type:

#### UI/Visual Changes (MANDATORY Playwright verification):
```bash
# Navigate to game: http://localhost:5173/
# Take before screenshot
# Make changes  
# Take after screenshot
# Compare and iterate until correct
# THEN ask user to verify
```

#### Game Logic Changes (MANDATORY unit test verification):
```bash
yarn test  # Must pass all existing tests
# Add new tests for new functionality
# Verify test coverage for critical paths
# THEN ask user to verify
```

#### Other Changes (Find appropriate verification):
- File structure: Use `ls` or `find` to verify files exist
- Configuration: Test build/dev commands work
- Dependencies: Verify imports/exports function
- Performance: Measure and compare benchmarks

### When to Ask User for Final Verification:
- After YOU have verified the change works correctly
- After all automated tests pass
- After visual verification shows expected results
- Before moving to the next major feature

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