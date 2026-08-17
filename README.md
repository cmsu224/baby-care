# Feeding Board

A read-only, always-on newborn feeding schedule for a phone or tablet kept at the
changing station. It answers one question: **what am I supposed to be doing right now,
and when is the next thing?**

It takes **no input** and stores **no log**. Logging lives in whatever app you already
use. This board deliberately does not know what actually happened, and never implies
that it does.

## Why fixed times rather than a rolling timer

A timer anchored to the last feed lets the day drift: if every feed runs twenty minutes
late, you end the day one feed short. Fixed times hold the feed count.

The **day** is fixed. The **night is deliberately not.** One night feed is an `ONWAKE`
block: he is allowed to sleep through it, and its clock time is a label rather than an
instruction. It carries no alarm, and the board never shows it as due. When it lands late,
the "running late" button slides the rest of the night with it, 30 minutes per tap up to 90.

Because the night can float, the feed count alone no longer proves the day was enough. The
guard is `dailyMinMl` — the daily volume floor. Miss the floor two days running and the
night gap is too long, whatever the schedule says.

One time never moves: `anchor`. The shift clears itself the moment the clock crosses it, so
however the night went, the day restarts on schedule.

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

- `anchor` — the one time that never slides. The running-late shift clears itself here.
- `targets` — `perFeedMl` is a `[min, max]` pair; `dailyMinMl` is the daily floor;
  `maxGapMin` governs the **day** only, and `nightRule` is the label shown for the night.
- `profiles` — named day shapes; each `blocks` entry is `{t, type, alarm, actions}`
- `actions` — ordered list of `{who, do, tone, prep}`. `who` is `Mom` or `Dad`. `prep: true`
  marks setup done `prepMin` before the feed. `tone` is `care`, `self` or `rest`; a toned
  action is supporting work and is left out of the one-line timeline summary, so **each
  block wants exactly one untoned action per person** — that line is the summary.
- `type` is `FULL` (breast, top-up, pump), `BOTTLE` (bottle only), or `ONWAKE` (the float —
  no alarm, never shown as due, and its `t` is a nominal label)
- `alarm: true` sounds the in-page alarm at that time. Never set it on an `ONWAKE` block.
- `days` — maps each date to a profile plus an optional note. Past the last entry, the
  board carries the final profile forward and keeps counting days.

Times in `t` are 24-hour because that is the parse format; every time the board *shows* is
converted to 12-hour. Write times inside `note` and `do` strings in 12-hour to match.

## Setup on the always-on device

1. Open the page in Chrome, then **⋮ → Add to Home Screen**.
2. Tap **Arm alarms** once. Browsers will not play sound without a gesture.
3. **Settings → Apps → Chrome → Battery → Unrestricted**, or Android suspends the tab
   and no alarm fires.
4. **Settings → Display → Screen timeout → 30 minutes**, and leave it on the charger.
5. Set a recurring **Clock app** alarm for every block with `alarm: true` — right now that
   is one, the 5:00 AM feed. Those are the reliable ones; the in-page alarm is a backstop,
   not the plan. Set **nothing** for the `ONWAKE` block: the whole point is that no alarm
   wakes anyone, including him.

## Privacy

This repo is public so that GitHub Pages will serve it. It therefore contains **no
names, no dates of birth, no weights and no medical detail** — only times, volumes and
feed types. Keep it that way.

## Not a medical device

A schedule, nothing more. Your pediatrician overrules every line of it.
