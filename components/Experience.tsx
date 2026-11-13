import { experience } from "@/content/site";
import { Pixels, type PixelKind } from "./Pixels";

// Which company logo (redrawn in pixels) goes with each job.
const ICON: Record<string, PixelKind> = { mybambino: "bambino", sage: "ud", dds: "dds" };

export function Experience() {
  return (
    <section className="sec" id="experience" aria-labelledby="exp-title">
      <header className="sec__head">
        <h2 id="exp-title">Experience</h2>
        <span>{experience.length} roles</span>
      </header>
      <ol className="jobs">
        {experience.map((job, i) => (
          <li key={job.id} id={job.id} className="box job" data-reveal data-cat={job.id === "mybambino" ? "badge" : undefined}>
            <div className="in">
              <div className="job__meta">
                <span className="tag">0{i + 1}</span>
                <p>{job.period}</p>
                <p className="mut">{job.location}</p>
                {ICON[job.id] && <Pixels kind={ICON[job.id]} className="job__px" />}
              </div>
              <div>
                <h3>{job.role}</h3>
                <p className="job__co">{job.company}</p>
                <ul className="list">
                  {job.bullets.map((b, n) => (
                    <li key={n}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
