# Desktop Sidebar Workspace Design

## Goal

Turn the desktop left rail into a fast, durable workspace navigator. The main
conversation remains visible while the secondary panel changes to the selected
workspace area.

## Navigation

The top navigation order is fixed:

1. 会话
2. 搜索
3. 想法
4. 目标
5. 动态
6. 资源库
7. 文档

The settings button is pinned to the bottom-left of the rail and uses the
two-line `equal` icon only. All entries use visible active states, accessible
labels, tooltip names, and 42px-or-larger targets.

## Panel Behavior

- 会话: existing grouped conversation list and history search.
- 搜索: grouped search across chat messages, generated files, and goals, with
  type filters. Selecting a result opens the matching conversation, file, or
  goal.
- 想法: proactive suggestions from 千变. Users can save an idea or turn it into
  a conversation draft.
- 目标: long-running goals with cadence, progress, streak, check-in, and inline
  goal creation. Goal state persists in localStorage.
- 动态: curated news and product updates with category filters, read state, and
  an action that turns the item into a conversation prompt.
- 资源库: generated images, files, code, and artifacts with type filters.
  Selecting an item opens its detail preview.
- 文档: reports, spreadsheets, and documents with type filters. Selecting an
  item opens its detail preview.
- 设置: existing settings content, opened from the bottom rail button.

## Visual Direction

The interface stays dense, quiet, and work-focused. The secondary panel uses
compact cards, restrained separators, and the existing color, radius, typography,
and motion tokens. The memorable detail is a narrow rail whose icons form a
clear daily workflow: communicate, find, discover, commit, observe, retrieve,
and produce.

## Data and Persistence

Static demonstration data lives with the existing desktop fixtures. User
interactions persist under `qianbian-desktop-*` localStorage keys for goals,
saved ideas, and read feed items.

## Responsive and Accessibility

- Desktop keeps the four-zone layout.
- The rail scrolls independently when vertical space is limited.
- Mobile opens the same rail through the existing sidebar drawer.
- Active buttons expose `aria-current`.
- Search inputs have labels; action buttons have names; icons are aria-hidden.
- All primary interactions are keyboard reachable.

## Verification

Playwright checks cover navigation order, settings placement and icon, panel
switching, cross-entity search, goal persistence, feed/read actions, item detail
opening, dark mode, mobile layout, and console errors.
