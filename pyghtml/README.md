# PygHTML

PygHTML runs **real pygame** in the browser.

No Pyodide. No "pygame-like" JS rewrite. It's CPython + pygame-ce compiled to WebAssembly (SDL2 included), bundled so you can load it from a plain HTML page.

This is early-stage software. The aim is ruthless practicality: get games running, keep the API stable, don't bury people in tooling.

## Quick Start

1. Start a local server in this folder:

```bash
python -m http.server 8000
```

2. Open:

`http://localhost:8000/examples/basic.html`

Browsers usually block module workers / WASM loads from `file://`, so you need a server, even for local testing.

## How You Write A Game

You write an HTML file with:
- a `<canvas>` (optional but recommended; PygHTML will use it)
- a `<script type="text/pyghtml">` block containing Python
- a `<script type="module">` that imports `PygHTML` from `pyghtml.js` and runs it

Example: `examples/basic.html`.

### About Game Loops

In a browser, the cleanest pattern is:

```py
import asyncio

async def main():
    while True:
        ...
        await asyncio.sleep(0)

asyncio.run(main())
```

That single `await asyncio.sleep(0)` is what keeps the page responsive and lets the runtime pump events properly.

If you're bringing over an existing desktop pygame project, this is the first change you'll almost always make.

## Loading A `.py` File

See:
- `examples/load_py.html`
- `examples/bounce.py`

## Using PygHTML On Your Own Website

PygHTML is designed to be self-hosted:
- copy this `pyghtml/` folder to your site (it includes the runtime under `engine/vendor/archives/0.9/`)
- import `PygHTML` from `pyghtml.js`
- optionally load your game via `pyUrl` (same-origin or CORS-enabled)

Minimal usage (module script):

```html
<canvas id="game"></canvas>
<script type="module">
  import { PygHTML } from "/pyghtml/pyghtml.js"; /* if hosted at /pyghtml/ */
  PygHTML.autorun({ canvas: "#game", pyUrl: "/games/my_game.py" });
</script>
```

## What's Actually Pinned

PygHTML currently uses a vendored runtime bundle sourced from `pygame-web/archives`:
- `engine/vendor/archives/0.9`

That bundle includes:
- a CPython 3.12 WebAssembly build
- a pygame wheel (`pygame_static`) built against it

## License

MIT. See `LICENSE`.
