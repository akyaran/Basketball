# Basketball 1v1 Prototype

Version: `0.5.2`

iPad landscape first basketball prototype for testing shot feel before expanding to 5v5.

## Play

Open `index.html`, or serve the folder with any static server.

```powershell
python -m http.server 4173
```

Then open:

```text
http://localhost:4173/
```

## Prototype Controls

- Left pad: move
- Dash button: quick burst
- SHOT in TIMING mode: hold, release when the needle hits the green zone
- SHOT in AIM mode: hold, pull to aim and set power, release
- SLOW ON/OFF: toggles shot slow motion for A/B testing
- Settings: tune defense effect, distance effect, and meter speed before starting
- HOME: return to the title screen during play
- Reset Defaults: restore the tuning sliders to their default values
- After a player make or miss, possession switches to CPU offense and the player defends.
- Generated court, hoop, player, and CPU sprites are used in-game, with fallback canvas drawing while assets load.
- The court image is generated from the same game coordinates used for 2P/3P scoring, so the visible 3P line matches the scoring boundary.
- Player and CPU sprites use the same base artwork, with the player recolored to yellow and the ball drawn only while possessed.

The timing green zone shrinks aggressively when the shot is farther from the rim, when the defender is close at shot start, when the defender closes out during the hold, and while the player waits with the shot held.

At near body-contact range the contest almost removes the make window, and shots beyond half court are tuned to be extremely difficult.

In timing mode, releasing inside the green zone is treated as a made shot unless the attempt is fully smothered or an extreme half-court attempt.

Touch controls suppress text selection and long-press browser actions so the shot and dash buttons behave like game controls.

## GitHub Pages

This is a static PWA. Push the folder to a GitHub repository and enable Pages from the repository settings. Use the repository root as the publish source.
