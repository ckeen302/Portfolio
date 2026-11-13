import { About } from "@/components/About";
import { CommandPalette } from "@/components/CommandPalette";
import { Contact } from "@/components/Contact";
import { Experience } from "@/components/Experience";
import { Fx } from "@/components/Fx";
import { Hero } from "@/components/Hero";
import { Mascot } from "@/components/Mascot";
import { TopBar } from "@/components/TopBar";
import { Work } from "@/components/Work";
import { site } from "@/content/site";

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    email: `mailto:${site.email}`,
    alumniOf: "University of Delaware",
    sameAs: [site.links.github, site.links.linkedin],
  };

  return (
    <>
      <TopBar />
      <main>
        <Hero />
        <Work />
        <Experience />
        <About />
        <Contact />
      </main>
      <Mascot />
      <CommandPalette />
      <Fx />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
