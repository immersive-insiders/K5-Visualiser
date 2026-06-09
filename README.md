# Graphs that need a third dimension

An interactive K₅ visualizer built with Vite, React, and TypeScript. A slider
morphs the complete graph on 5 vertices between a crossing-free 3D embedding and
the flat 2D pentagon drawing where the crossings become unavoidable. Drag to
rotate; in 3D the edges show over/under depth, so you can see they never truly
cross.


## What this is about

Take 5 dots and draw a line between *every* pair of them. That is K₅, the
complete graph on five vertices. Try it on paper and you'll find something
stubborn: no matter how you arrange the dots, at least one pair of lines is
forced to cross. K₅ is **non-planar** it simply cannot be drawn flat without
crossings. (Its partner in crime is K₃,₃, the "three utilities" puzzle.)

The fix is a dimension. In 3D you can lift some edges up and push others down, so
lines that *appeared* to collide actually pass at different depths - like one
bridge crossing over a road. In fact, **every** graph can be drawn crossing-free
in 3D; flat paper just doesn't have enough room.

This project turns that idea into something you can grab and play with instead of
read about.


## How it helps you see it

A textbook shows K₅ as a single static drawing with crossings you're told are
unavoidable. That asks you to take the 2D-vs-3D distinction on faith. This tool
makes it tangible:

- **A 2D → 3D slider.** Slide left and the dots squish into a flat pentagon where
  the crossings are real and unavoidable. Slide right and they float apart into a
  tetrahedron-plus-center arrangement with no crossings at all. You watch the
  crossings appear and disappear, rather than being told they do.
- **Over/under depth cueing.** In 3D, edges are drawn with a knot-diagram style
  gap wherever one passes in front of another, so an *apparent* crossing on your
  flat screen reads clearly as "one strand goes behind the other" - not a real
  intersection.
- **Drag to rotate.** Spinning the figure is what truly proves the lines never
  touch: a fixed projection can hide a crossing, but rotation reveals the gap in
  space.
- **Plain-language explanation.** The accompanying text explains the idea in
  everyday terms (dots holding hands, paper that's too squished, bridges over
  roads) so it lands for a curious five-year-old or a first-year CS student
  alike.


## Tech stack

- **Vite** - build tool and dev server
- **React** + **TypeScript** - UI
- **HTML Canvas 2D** - the graph rendering and rotation (hand-rolled 3D
  projection, no heavy 3D library)


## Getting started

Requires **Node.js 18+**.

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check and build to dist/
npm run preview  # preview the production build
```


## How the rendering works (in brief)

The five vertices are placed at two sets of coordinates: a flat pentagon (the
classic crossing drawing) and a tetrahedron-plus-center layout (crossing-free in
3D). The slider linearly interpolates between them. Each frame, the points are
rotated and projected to 2D, edges are sorted back-to-front by depth, and each
edge is stroked with a background-colored "halo" before its visible line - so
nearer edges punch clean gaps through farther ones, producing the over/under
look. There is no external 3D engine; it's plain canvas math.
