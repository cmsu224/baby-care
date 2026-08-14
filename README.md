# Feeding Board

A read-only, always-on newborn feeding schedule for a phone or tablet kept at the
changing station. It answers one question: **what am I supposed to be doing right now,
and when is the next thing?**

It takes **no input** and stores **no log**. Logging lives in whatever app you already
use. This board deliberately does not know what actually happened, and never implies
that it does.

## Why fixed times rather than a rolling timer

A timer anchored to the last feed lets the day drift: if every feed runs twenty minutes
late, you end the day one feed short. For a baby who needs to gain, fixed times hold the
feed count. A "running late" button shifts the rest of the day by 30 minutes when
reality demands it.

## Contents

| File | Purpose |
|---|---|
| `index.html` | The board. Self-contained, no external assets. |
| `config.json` | Schedule, targets and per-day notes. **Edit this**, push, done. |
| `sw.js` | Service worker. Cache-first shell so it works offline. |
| `manifest.json`, `icon.svg` | Home-screen install. |

## Editing the schedule

Edit `config.json`, **increment `version`**, commit and push. Any open board picks the
change up within about a minute — no reload needed.

- `profiles` — named day shapes; each `blocks` entry is `{t, type, who, pump, alarm, note}`
- `type` is `FULL` (breast, top-up, pump) or `BOTTLE` (bottle only)
- `alarm: true` sounds the in-page alarm at that time
- `days` — maps each date to a profile plus an optional note. Past the last entry, the
  board carries the final profile forward and keeps counting days.

## Setup on the always-on device

1. Open the page in Chrome, then **⋮ → Add to Home Screen**.
2. Tap **Arm alarms** once. Browsers will not play sound without a gesture.
3. **Settings → Apps → Chrome → Battery → Unrestricted**, or Android suspends the tab
   and no alarm fires.
4. **Settings → Display → Screen timeout → 30 minutes**, and leave it on the charger.
5. Set the same overnight times as recurring alarms in the **Clock app**. Those are the
   reliable ones; the in-page alarm is a backstop, not the plan.

## Privacy

This repo is public so that GitHub Pages will serve it. It therefore contains **no
names, no dates of birth, no weights and no medical detail** — only times, volumes and
feed types. Keep it that way.

## Not a medical device

A schedule, nothing more. Your pediatrician overrules every line of it.
