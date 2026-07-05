# Basketball 1v1 Prototype

Version: `0.2.0`

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

The timing green zone shrinks when the shot is farther from the rim, when the defender is closer, and while the player waits with the shot held.

## GitHub Pages

This is a static PWA. Push the folder to a GitHub repository and enable Pages from the repository settings. Use the repository root as the publish source.
