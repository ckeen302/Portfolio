import type { Metadata } from "next";
import Link from "next/link";
import { LostCat } from "@/components/LostCat";
import { site } from "@/content/site";

export const metadata: Metadata = { title: `Page not found · ${site.name}` };

/** Shown for any address that is not the site: the cat, a 404, and the way back. */
export default function NotFound() {
  return (
    <main className="lost">
      <div className="box lost__box">
        <span className="who">{site.first}</span>
        <div className="in">
          <LostCat />
          <p className="lost__code">404</p>
          <h1>Page not found</h1>
          <p className="lost__text">There is nothing at this address.</p>
          <p className="btns">
            <Link className="btn" href="/">
              Back to the site
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
