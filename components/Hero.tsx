import { dialog, experience, projects, site, socials } from "@/content/site";
import { Dialog } from "./Dialog";
import { Menu } from "./Menu";
import { PxGitHub, PxLinkedIn, PxMail, PxPin } from "./Px";
import { Scene } from "./Scene";

// Each icon and the height that puts it on whole pixels.
const ICON = { github: [PxGitHub, 55], linkedin: [PxLinkedIn, 54], email: [PxMail, 42] } as const;

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__row hero__row--a">
        <div className="box status">
          <div className="in">
            <div className="status__top">
              <span className="tag">Status</span>
              <span className="status__class">Class of 2027</span>
            </div>
            <h1>{site.name}</h1>
            <p className="role">{site.role}</p>
            <ul className="facts">
              <li>Computer Science senior</li>
              <li>University of Delaware</li>
              <li>Graduating May 2027</li>
            </ul>
            <ul className="socials" aria-label="Links">
              {socials.map((s) => {
                const [Icon, size] = ICON[s.id];
                const outside = s.href.startsWith("http");
                return (
                  <li key={s.id}>
                    <a href={s.href} aria-label={s.label} title={s.label} target={outside ? "_blank" : undefined} rel={outside ? "noopener" : undefined}>
                      <Icon size={size} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="box room">
          <div className="in">
            <Scene />
            <p className="plate">
              <PxPin size={16} />
              {site.location}
            </p>
            <p className="plate plate--hint">Click the lamp</p>
          </div>
        </div>
      </div>

      <div className="hero__row hero__row--b">
        <Dialog who="Caden" lines={dialog} />
        <Menu
          label="Sections"
          items={[
            { label: "Work", href: "#work", count: projects.length },
            { label: "Experience", href: "#experience", count: experience.length },
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
          ]}
        />
      </div>
    </section>
  );
}
