import { projects, site, type Project } from "@/content/site";
import { Pixels, type PixelKind } from "./Pixels";
import { PlayChords } from "./PlayChords";
import { PxOut } from "./Px";

// Each project is shown as a pixel-art version of itself, drawn for this site.
const SCREEN: Record<string, PixelKind> = { chordcraft: "chordapp", pokeiq: "pokeapp", monsterhop: "hopapp" };
// Where the cat sits on a project's screen, for the ones it visits.
const CAT: Record<string, string> = { chordcraft: "bat", pokeiq: "watch" };

function Card({ p }: { p: Project }) {
  return (
    <article className="box proj" id={p.id} data-reveal aria-labelledby={`${p.id}-title`}>
      <div className="in">
        <div className="proj__body">
        <div className="proj__text">
          <p className="tag">Project {p.index}</p>
          <h3 id={`${p.id}-title`}>{p.name}</h3>
          <p className="proj__kind">{p.kind}</p>
          <p className="proj__stack">
            <b>Stack</b>
            {p.stack}
          </p>
          <ul className="list">
            {p.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <p className="btns">
            {p.links.map((l, i) => (
              <a key={l.href} className={i === 0 ? "btn" : "btn btn--alt"} href={l.href} target="_blank" rel="noopener">
                {l.label} <PxOut />
              </a>
            ))}
          </p>
        </div>

        <figure className="screen" data-cat={CAT[p.id]}>
          <a className="screen__glass" href={p.links[0].href} target="_blank" rel="noopener" aria-label={`Open the real ${p.name}`}>
            <Pixels kind={SCREEN[p.id]} />
          </a>
          <figcaption>
            {p.id === "chordcraft" && <PlayChords />}
            <i aria-hidden="true" />
            <span>Pixel version</span>
            <a href={p.links[0].href} target="_blank" rel="noopener">
              Open the real one <PxOut size={10} />
            </a>
          </figcaption>
        </figure>
        </div>
      </div>
    </article>
  );
}

export function Work() {
  return (
    <section className="sec" id="work" aria-labelledby="work-title">
      <header className="sec__head">
        <h2 id="work-title">Work</h2>
        <span>{projects.length} personal projects</span>
      </header>
      {projects.map((p) => (
        <Card key={p.id} p={p} />
      ))}
      <p className="sec__more">
        More on{" "}
        <a href={site.links.github} target="_blank" rel="noopener">
          GitHub <PxOut size={12} />
        </a>
      </p>
    </section>
  );
}
