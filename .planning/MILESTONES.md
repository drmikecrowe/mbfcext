# Project Milestones: Media Bias/Fact Check Extension

[Entries in reverse chronological order - newest first]

---

## v4.1 Dependency Upgrades & Facebook Fix (In Progress)

**Goal:** Fix broken Facebook annotation and upgrade core dependencies

**Phases planned:** 1-2

**Key deliverables:**
- Fix Facebook feed annotation with new `data-ad-rendering-role` detection
- Upgrade Plasmo 0.84.2 → 0.89.x
- Upgrade React 18.2.0 → latest 18.x
- Upgrade TypeScript 5.3.3 → 5.7.x
- Upgrade ESLint v5.x → v8.x
- Verify Node.js 22 LTS + Manifest V3 compliance

**Status:** Planning complete, execution pending

**What's next:** Start with dependency upgrades, then implement FB fix

---

## v4.0 Twitter Removal & Sponsored Collapse (Shipped: 2025)

**Delivered:** Removed Twitter support, added sponsored story collapse feature

**Key accomplishments:**
- Removed Twitter/X support (API changes made it unsustainable)
- Added sponsored story collapse/hide functionality
- Upgraded to Node 18+ compatibility
- MV3 manifest support via Plasmo framework

**What's next:** v4.1 dependency upgrades and Facebook DOM fix
