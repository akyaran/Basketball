# Basketball 1v1 Prototype

Version: `0.8.2`

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
- Settings: tune defense effect, distance effect, meter speed, character size, movement speed, camera zoom, and game time before starting
- HOME: return to the title screen during play
- Reset Defaults: restore the tuning sliders to their default values
- After a player make or miss, possession switches to CPU offense and the player defends.
- Generated court, hoop, player, and CPU sprites are used in-game, with fallback canvas drawing while assets load.
- The court image is generated from the same game coordinates used for 2P/3P scoring, so the visible 3P line matches the scoring boundary.
- Player and CPU sprites use the same base artwork, with the player recolored to yellow and the ball drawn only while possessed.
- Defenders face the ball or ball handler, while the offensive player faces the hoop.
- CPU offense uses crossovers, hesitations, bursts, drives, and close-range finishes.
- The camera auto-zooms to keep every active character visible while always including at least the attacking half court, without shrinking the court below the screen-filling play view.
- Near the rim, push the stick toward the hoop and press SHOT with enough space to trigger a layup or dunk.
- Settings can switch between 1on1, 2on2, and 3on3. PASS cycles the ball handler through teammates and both teams move off ball.
- Dunks trigger stronger screen shake, rim bursts, and a ring shock effect.
- Characters collide and push apart instead of passing through each other.
- Defenders contest much less when they are behind the ball handler relative to the hoop.
- The controlled player is marked on the floor, and 2on2 uses a full court with CPU attacking the left hoop.
- Front-facing defenders hold position more strongly in collisions, making it harder to simply push through to the rim.
- Help defenders rotate toward the ball when the primary defender is beaten.
- Defenders keep more cushion on the ball, and off-ball defenders shade space in a looser zone stance.
- Help defense reacts earlier, off-ball defenders sit between the ball, hoop, and mark, and CPU offense spaces wider before passing.
- Team defense now assigns on-ball, help, and gap roles each frame, while CPU offense uses wider spacing, swing passes, and safer pass-lane reads.
- CPU offense now estimates shot value before shooting, avoids low-value deep attempts, adds subtle random movement, and CPU defense shades into a stronger zone.
- CPU defense is now a full zone with one rim protector parked under the hoop, two shell defenders, and subtle positional jitter.
- In zone, the two shell defenders split high and low, and the nearest side always steps up to check the ball.
- A 24-second shot clock now forces turnovers, off-ball offense roams wider, and CPU offense favors drives/cut-ins over passing.
- The zone checker now leaves the shell aggressively and closes straight to the ball handler.
- Settings can choose match length, the game clock declares a winner, CPU offense drives deeper, and ball checkers fight through screens better.
- The camera now follows the play and shows roughly half-court-plus instead of the full court at once.

The timing green zone shrinks aggressively when the shot is farther from the rim, when the defender is close at shot start, when the defender closes out during the hold, and while the player waits with the shot held.

At near body-contact range the contest almost removes the make window, and shots beyond half court are tuned to be extremely difficult.

In timing mode, releasing inside the green zone is treated as a made shot unless the attempt is fully smothered or an extreme half-court attempt.

Touch controls suppress text selection and long-press browser actions so the shot and dash buttons behave like game controls.

## GitHub Pages

This is a static PWA. Push the folder to a GitHub repository and enable Pages from the repository settings. Use the repository root as the publish source.
