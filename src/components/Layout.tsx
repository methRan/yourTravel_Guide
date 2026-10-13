import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Leaf,
  Menu,
  X,
  UserRound,
  Instagram,
} from "lucide-react";
import { site } from "../config/site";
import { ContactButton } from "./ui";
import { useAuth } from "../lib/auth";
import { mode } from "../lib/backend";
export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
    const page = pathname.split("/")[1];
    document.title = `${page ? `${page.charAt(0).toUpperCase() + page.slice(1)} · ` : ""}${site.name} · Sri Lanka, your way`;
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", document.title);
  }, [pathname]);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="header">
        <div className="container nav-inner">
          <Link to="/" className="brand">
            <span className="brand-icon">
              <Leaf size={30} strokeWidth={1.4} />
            </span>
            <span>
              {site.name}
              <small>SRI LANKA, YOUR WAY</small>
            </span>
          </Link>
          <button
            className="mobile-toggle icon-button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav
            className={open ? "nav-links open" : "nav-links"}
            aria-label="Main navigation"
          >
            {[
              ["/", "Home"],
              ["/about", "Our Story"],
              ["/tours", "Our Tours"],
              ["/guides", "Our Guides"],
              ["/ideas", "Tour Ideas"],
            ].map(([p, l]) => (
              <NavLink key={p} to={p} end={p === "/"}>
                {l}
              </NavLink>
            ))}
            <NavLink to="/contact" className="nav-contact">
              Let’s plan a trip <ArrowUpRight size={17} />
            </NavLink>
            <Link
              to={user ? "/account" : "/login"}
              className="account-link"
              aria-label={user ? "Your account" : "Log in"}
            >
              <UserRound size={20} />
            </Link>
          </nav>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Link to="/" className="brand">
              <Leaf size={30} />
              <span>
                {site.name}
                <small>SRI LANKA, YOUR WAY</small>
              </span>
            </Link>
            <p>
              A little island. A world of stories.
              <br />
              Discover it with the people who call it home.
            </p>
            <span className="small">
              Family-owned · Locally guided · Thoughtfully planned
            </span>
          </div>
          <div>
            <h4>Find your way</h4>
            <Link to="/tours">Our tours</Link>
            <Link to="/guides">Meet your guide</Link>
            <Link to="/ideas">Island inspiration</Link>
          </div>
          <div>
            <h4>A warm welcome</h4>
            <Link to="/about">Our story</Link>
            <Link to="/contact">Get in touch</Link>
            <Link to="/account">Your bookings</Link>
          </div>
          <div>
            <h4>Let’s stay connected</h4>
            <ContactButton
              className="footer-whatsapp"
              children="Say hello on WhatsApp"
            />
            {site.contactsConfigured ? (
              <a href={`mailto:${site.email}`}>{site.email}</a>
            ) : (
              <span className="small">Sample contacts · not configured</span>
            )}
            {site.socials.instagram && (
              <a href={site.socials.instagram} target="_blank" rel="noreferrer">
                <Instagram size={16} />
                Instagram
              </a>
            )}
            <span className="small">Based in beautiful Sri Lanka</span>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.name}. Made for meaningful
            journeys.
          </span>
          <span>
            {mode === "demo"
              ? "Demo website · Profiles, reviews, and AI-generated imagery are samples."
              : "AI-generated sample imagery · Replace profiles and contacts before public launch."}
          </span>
        </div>
      </footer>
      <div className="floating-contact">
        <ContactButton
          className="floating-whatsapp"
          children={<span className="floating-label">Let’s chat</span>}
        />
      </div>
    </>
  );
}
