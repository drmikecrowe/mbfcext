# Project Milestones: Media Bias/Fact Check Extension

[Entries in reverse chronological order - newest first]

---

## v4.1 Dependency Upgrades & Facebook Fix (Shipped: 2026-02-22)

**Delivered:** Fixed broken Facebook annotation, upgraded core dependencies, added News Search feature

**Key accomplishments:**
- Fixed Facebook feed annotation with new `data-ad-rendering-role` detection (replaced broken `aria-posinset` approach)
- Upgraded Plasmo 0.84.2 → 0.90.5
- Upgraded React 18.2.0 → 18.3.1
- Upgraded TypeScript 5.3.3 → 5.9.3
- Upgraded ESLint v5.x → v8.56.0
- Added configurable News Search button for Facebook posts
- Verified Node.js 24 + Manifest V3 compliance

**Stats:** 10 commits, 9 files, +7,561/-5,956 lines, 2 days

**Archive:** `.planning/milestones/v4.1-ROADMAP.md`

---

## v4.0 Twitter Removal & Sponsored Collapse (Shipped: 2025)

**Delivered:** Removed Twitter support, added sponsored story collapse feature

**Key accomplishments:**
- Removed Twitter/X support (API changes made it unsustainable)
- Added sponsored story collapse/hide functionality
- Upgraded to Node 18+ compatibility
- MV3 manifest support via Plasmo framework

**What's next:** v4.1 dependency upgrades and Facebook DOM fix
