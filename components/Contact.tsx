import { site } from "@/content/site";
import { CopyButton } from "./Bits";
import { Menu } from "./Menu";
import { PxUp } from "./Px";

export function Contact() {
  return (
    <section className="sec contact" id="contact" aria-labelledby="contact-title">
      <header className="sec__head">
        <h2 id="contact-title">Contact</h2>
        <span>{site.status}</span>
      </header>
      <div className="contact__row" data-reveal>
        <div className="box mail" data-cat="perch">
          <span className="who">Caden</span>
          <div className="in">
            <p className="mail__label">Email</p>
            <a className="mail__addr" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <p className="btns">
              <CopyButton text={site.email} className="btn">
                Copy email
              </CopyButton>
              <a className="btn btn--alt" href={`mailto:${site.email}`}>
                Write to me
              </a>
            </p>
          </div>
        </div>
        <Menu
          label="Links"
          items={[
            { label: "LinkedIn", href: site.links.linkedin, external: true },
            { label: "GitHub", href: site.links.github, external: true },
            { label: "Résumé", href: site.resume, external: true },
          ]}
        />
      </div>
      <footer className="foot">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>{site.location}</span>
        <a href="#top">
          Back to top <PxUp size={8} />
        </a>
      </footer>
    </section>
  );
}
