# Desktop Skill Publishing Design

## Goal

Add a "我的发布" area to the desktop skill market and let users publish a
skill from a dedicated desktop wizard.

## Navigation

- The desktop skill market shows two tabs: 技能市场 and 我的发布.
- 我的发布 shows the current user's published skills with status and update
  time.
- A primary "发布技能" button opens the desktop publishing flow inside the
  same dialog.

## Publishing Flow

The desktop flow is a single integrated workspace rather than a mobile-style
stepper:

- The left column contains basic information and the skill source.
- The right column is a live preview of the published skill card.
- Upload mode supports dragging a skill package into a drop zone.
- Online code and AI draft remain available as integrated source modes.
- One primary action validates and publishes the completed form.

Validation mirrors the mobile flow:

- Name and summary are required.
- Upload mode requires a selected package.
- Online mode requires code.
- AI mode requires a generated draft.

## Completion

- Publishing adds the skill to 我的发布 with an "已发布" status.
- The list persists in localStorage.
- The wizard closes and returns to 我的发布 with a success toast.

## Visual Direction

The desktop publisher uses a two-column form and live preview layout. It should
feel like a desktop workspace tool rather than a phone sheet, while keeping the
existing visual tokens and compact information density.

## Verification

- Desktop Playwright coverage for tab switching, validation, all publishing
  modes, confirmation, persistence, responsive overflow, and console errors.
- Existing mobile publishing and desktop workspace checks remain green.
