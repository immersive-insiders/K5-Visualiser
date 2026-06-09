import { useState } from 'react'
import K5Canvas from './K5Canvas'

export default function App() {
  // 0 = flat 2D, 100 = full 3D
  const [depth, setDepth] = useState(0)
  const label = depth < 4 ? '2D' : depth > 96 ? '3D' : `${depth}%`

  return (
    <main className="page">
      <h1>Five dots that don&rsquo;t like to sit flat</h1>

      <section className="card" enable-xr>
        <div className="slider-row" enable-xr>
          <label htmlFor="depth">2D &rarr; 3D</label>
          <input
            id="depth"
            type="range"
            min={0}
            max={100}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
          />
          <span className="readout">{label}</span>
        </div>
        <K5Canvas depth={depth} />
        <p className="caption">
          drag to spin it &middot; slide right to lift the lines apart &middot; slide left to squish them flat
        </p>
      </section>

      <article className="prose">
        <p>
          Imagine you have <strong>5 dots</strong>. You want to draw a line from every dot to every
          other dot, so each dot can hold hands with all of its friends.
        </p>

        <h2>Flat paper gets tangled</h2>
        <p>
          If you try this on a flat piece of paper, something tricky happens. Some of the lines
          always have to cross over each other, like little roads bumping together. No matter how
          hard you try, you can&rsquo;t keep them all apart. The paper is just too squished!
        </p>

        <h2>Floating up fixes it</h2>
        <p>
          But here is the cool part. If you let the dots float up into the air, you can lift some
          lines up high and push others down low. Now they can go over and under each other, like
          one bridge crossing over a road. Nothing has to bump anymore!
        </p>

        <h2>Try the slider</h2>
        <p>
          Slide to the <strong>left</strong> and the dots squish flat, so the lines have to cross.
          Slide to the <strong>right</strong> and the dots float up, and every line gets its own
          space. You can also drag the picture to spin it around &mdash; when it is floating, watch
          how the lines pass over and under but never really touch.
        </p>

        <p className="funfact">
          Fun fact: no matter how many dots you have, you can always untangle them if you let them
          float. Flat paper just doesn&rsquo;t have enough room!
        </p>
      </article>

      <footer className="foot">Built with Vite, React, and TypeScript.</footer>
    </main>
  )
}
