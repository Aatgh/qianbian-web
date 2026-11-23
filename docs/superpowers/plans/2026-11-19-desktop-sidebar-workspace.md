# Desktop Sidebar Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the desktop sidebar with seven ordered workspace tools and a bottom-left two-line settings button.

**Architecture:** Keep the existing four-zone desktop layout. Use the 72px rail to switch a persistent 280px secondary panel while the main conversation remains intact. Add focused fixture data and render functions to the existing desktop application, then add panel-specific CSS and Playwright coverage.

**Tech Stack:** Vanilla HTML, CSS, JavaScript, Lucide icons, Playwright CLI/lib, localStorage.

## Global Constraints

- The top navigation order is exactly: 会话, 搜索, 想法, 目标, 动态, 资源库, 文档.
- Settings is pinned bottom-left and uses the two-line `equal` icon.
- Existing light/dark theme support must remain intact.
- Main conversation and composer must not be replaced when a workspace panel is selected.
- No external network dependency is required for the demo data.

---

### Task 1: Add failing navigation and panel workflow test

**Files:**
- Create: `output/playwright/sidebar-workspace-check.js`

**Interfaces:**
- Consumes: `desktop.html`, `desktop-app.js`, local Chrome executable.
- Produces: executable Playwright regression check for panel order, panel switching, search, goals, feed, library, documents, and settings.

- [ ] **Step 1: Write the failing test**

Create the Playwright script with assertions for the required navigation labels,
settings placement, panel headings, search result groups, goal persistence,
feed read state, and item-detail opening.

- [ ] **Step 2: Run test to verify it fails**

Run: `node output/playwright/sidebar-workspace-check.js`

Expected: FAIL because the required navigation entries and panels do not exist.

### Task 2: Replace rail navigation and add panel shells

**Files:**
- Modify: `desktop.html`
- Modify: `desktop-app.js`
- Modify: `desktop-refresh.css`

**Interfaces:**
- Consumes: existing `data-side-panel` click delegation and `renderSidePanel()`.
- Produces: seven panel IDs and one bottom settings button.

- [ ] **Step 1: Add ordered navigation buttons**
- [ ] **Step 2: Add panel section shells and content hosts**
- [ ] **Step 3: Pin settings to the bottom with `equal` icon**
- [ ] **Step 4: Adjust rail layout for top navigation plus bottom utility**

### Task 3: Implement workspace fixtures, search, and state

**Files:**
- Modify: `desktop-app.js`

**Interfaces:**
- Consumes: existing `state`, `SESSIONS`, `FILE_DETAILS`, `showToast()`, `openDetail()`.
- Produces: `IDEAS`, `GOALS`, `FEED_ITEMS`, `LIBRARY_ITEMS`, `DOCUMENT_ITEMS`, persistence helpers, and grouped search.

- [ ] **Step 1: Add fixture data for ideas, goals, feed, library, and documents**
- [ ] **Step 2: Add localStorage-backed saved/read/goal state**
- [ ] **Step 3: Implement grouped cross-entity search**
- [ ] **Step 4: Implement result routing**

### Task 4: Render and wire panel interactions

**Files:**
- Modify: `desktop-app.js`

**Interfaces:**
- Consumes: Task 3 data and state.
- Produces: `renderIdeasPanel()`, `renderGoalsPanel()`, `renderFeedPanel()`, `renderLibraryPanel()`, `renderDocumentsPanel()`, and click handlers.

- [ ] **Step 1: Render ideas with save and prompt actions**
- [ ] **Step 2: Render goals with check-in, progress, and add form**
- [ ] **Step 3: Render feed with filter, read, and prompt actions**
- [ ] **Step 4: Render library and documents with filters and detail actions**
- [ ] **Step 5: Update panel announcements and focus behavior**

### Task 5: Add workspace panel styling

**Files:**
- Create: `desktop-workspace.css`
- Modify: `desktop.html`

**Interfaces:**
- Consumes: panel markup classes produced by Task 4.
- Produces: stable card, filter, progress, meta, empty-state, and scrollbar styling in light and dark themes.

- [ ] **Step 1: Add compact panel header and filter styles**
- [ ] **Step 2: Add card, goal progress, feed, and library styles**
- [ ] **Step 3: Add responsive and reduced-height behavior**
- [ ] **Step 4: Verify dark theme token use**

### Task 6: Extend detail previews and finish verification

**Files:**
- Modify: `desktop-app.js`
- Modify: `desktop.html`
- Modify: `desktop-refresh.css`

**Interfaces:**
- Consumes: existing file detail dialog and Playwright runner.
- Produces: resource/document previews and final regression evidence.

- [ ] **Step 1: Add preview metadata for generated resources and documents**
- [ ] **Step 2: Bump asset query versions**
- [ ] **Step 3: Run the workspace regression test and fix failures**
- [ ] **Step 4: Run theme regression test**
- [ ] **Step 5: Capture desktop and mobile screenshots**
- [ ] **Step 6: Scan the page for overflow and console errors**
