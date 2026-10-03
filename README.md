# LogoWriter GL

A LogoWriter-style Logo environment in a single HTML file. Logo is compiled to JavaScript, drawing goes through WebGL 2 instancing, and any number of turtles (up to 2048) run concurrently.

Open `index.html` in a browser, or serve the folder with GitHub Pages. There's no build step and no dependencies beyond Google Fonts.

## Features

- **LogoWriter layout.** The front side is the turtle canvas plus a command center. The flip side holds procedures. **Run** calls `STARTUP`.
- **Compiler.** Logo is tokenized, parsed with arity-aware prefix/infix rules, and emitted as JS source for the JIT.
- **Concurrent turtles.** Each turtle is a generator with a per-frame step budget. `LAUNCH [ … ]` spawns a turtle that inherits position, heading and pen, and gets a by-value copy of the locals in scope. `POSOF n`, `WHO`, `DIE` and `WAIT n` are also available. `WAIT 0` yields so interacting turtles stay in lockstep.
- **Pure-procedure detection.** Procedures that never move a turtle compile to plain functions with no yields. Fractal inner loops run at full JIT speed.
- **Renderer.** Segments are instanced capsules, antialiased in the fragment shader. They're batched per frame into a persistent 1920×1280 texture, with turtles drawn as an overlay.
- **Speed modes.** Turtle runs 1 step per turtle per frame, Fast runs 120, and Warp runs for 12 ms per frame.
- **Examples.** 32 pages: classics, fractals (Koch, Hilbert, dragon, Lévy, Pythagoras tree, Barnsley fern), complex-plane sets (Mandelbrot, Julia, Burning Ship, Newton), curves, and turtle swarms (pursuit, fireworks, billiards, a 1M-segment stress test).
- **Saving.** Pages are saved to browser storage, with copy, open-file and drag-and-drop support.

## Testing

`node tests/run-examples.mjs` compiles and runs every example headless, with rendering stubbed out. It reports segment count, peak turtle count, time and drawing bounds for each page.

## Dialect notes

- **Scoping.** It's lexical rather than dynamic. A procedure sees its inputs, its `LOCAL`s and globals.
- **Instruction lists.** They must be literal `[ … ]`, and there's no `RUN` of computed lists.
- **Screen.** It's 960 × 640 turtle steps with the origin at the center, and turtles don't wrap at the edges.
- **Colors.** `SETPC` takes a palette number 0–15 or an `[r g b]` / `[r g b a]` list.

The in-app **Info** tab has the full language reference.

## License

MIT, see [LICENSE](LICENSE).
