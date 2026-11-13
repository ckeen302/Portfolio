import { education, skills } from "@/content/site";
import { PxSkill } from "./Px";

export function About() {
  return (
    <section className="sec" id="about" aria-labelledby="about-title">
      <header className="sec__head">
        <h2 id="about-title">About</h2>
        <span>Education &amp; technical skills</span>
      </header>
      <div className="about">
        <div className="about__edu">
          {education.map((e) => (
            <div key={e.school} className="box edu" data-reveal>
              <div className="in">
                <p className="tag">Education</p>
                <h3>{e.school}</h3>
                <p className="edu__deg">{e.degree}</p>
                <p className="mut">
                  {e.when} · {e.where}
                </p>
                {e.note && <p className="edu__note">{e.note}</p>}
              </div>
            </div>
          ))}
        </div>
        <ul className="slots" aria-label="Technical skills">
          {skills.map((s, i) => (
            <li key={s.label} className="slot" data-reveal data-cat={i === 0 ? "peek" : undefined}>
              <div className="slot__top">
                <span className="slot__icon">
                  <PxSkill name={s.icon} />
                </span>
                <h3>{s.label}</h3>
                <small aria-hidden="true">×{s.value.split(", ").length}</small>
              </div>
              <p>{s.value}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
