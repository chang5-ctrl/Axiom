import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/brand/Logo";
import { APP } from "@/config/app";
import { FOOTER_SECTIONS } from "@/config/landing";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo subtitle="Multi-tenant ERP" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {APP.name} is a modular, AI-powered ERP platform. Describe your business and receive
              an operating system built around your workflow.
            </p>
            <a
              href={`mailto:${APP.supportEmail}`}
              className="mt-5 inline-block text-sm text-primary transition-colors hover:text-foreground"
            >
              {APP.supportEmail}
            </a>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.label}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {section.label}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.to.includes("#") ? (
                        <a
                          href={link.to}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.to as never}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {APP.name}. All rights reserved.
          </p>
          <p>Isolated workspaces · Role-based access · Full audit trail</p>
        </div>
      </div>
    </footer>
  );
}
