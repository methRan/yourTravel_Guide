import Photo from "../components/Photo";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  Clock3,
  Users,
  MapPin,
  Share2,
} from "lucide-react";
import { packages } from "../data/packages";
import { guides } from "../data/guides";
import { destinations } from "../data/destinations";
import { sampleReviews } from "../data/reviews";
import {
  TourCard,
  GuideCard,
  ReviewCard,
  PageIntro,
  CTA,
  ContactButton,
} from "../components/ui";
import { errorMessage, getReviews, mode } from "../lib/backend";
import type { Review } from "../types";
export function Tours() {
  return (
    <>
      <PageIntro
        eyebrow="THOUGHTFULLY PLANNED. PERSONALLY GUIDED."
        title="Find your kind of journey."
        text="Three starting points. A thousand possibilities. Every route can be shaped around your interests, your pace, and the moments you want to find."
      />
      <section className="container section compact-top">
        <div className="tour-grid">
          {packages.map((t) => (
            <TourCard key={t.id} tour={t} />
          ))}
        </div>
        <div className="quiet-panel">
          <h3>Have something else in mind?</h3>
          <p>
            These are sample itineraries, not fixed departures. Tell us what you
            love and we’ll help shape a private trip.
          </p>
          <Link to="/contact" className="btn">
            Plan a custom journey <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <CTA />
    </>
  );
}
export function TourDetail() {
  const { id } = useParams();
  const tour = packages.find((t) => t.id === id);
  if (!tour) return <NotFound />;
  return (
    <>
      <section className="detail-hero">
        <Photo src={tour.image} alt={tour.name} />
        <div className="container">
          <Link to="/tours" className="breadcrumb">
            Our tours / {tour.days} days
          </Link>
          <span className="eyebrow">{tour.label}</span>
          <h1>{tour.name}</h1>
          <p>{tour.description}</p>
        </div>
      </section>
      <div className="container detail-layout section">
        <div>
          <div className="facts">
            <span>
              <Clock3 />
              {tour.days} days
            </span>
            <span>
              <Users />
              {tour.group}
            </span>
            <span>
              <MapPin />
              {tour.audience}
            </span>
          </div>
          <h2>A journey to remember.</h2>
          <p>
            Travel privately, take your time, and make room for the unexpected.
            This suggested route is flexible; we’ll confirm details,
            availability, and your personal quote before any reservation.
          </p>
          <div className="tag-list">
            {tour.destinations.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <h2 className="detail-subtitle">Your days on the island.</h2>
          <div className="itinerary">
            {tour.itinerary.map((day, i) => (
              <article key={day}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <span className="eyebrow">DAY {i + 1}</span>
                  <p>{day}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="inclusions">
            <div>
              <h3>We take care of</h3>
              {tour.included.map((x) => (
                <p key={x}>
                  <Check size={16} />
                  {x}
                </p>
              ))}
            </div>
            <div>
              <h3>Plan separately</h3>
              {tour.excluded.map((x) => (
                <p key={x}>{x}</p>
              ))}
            </div>
          </div>
        </div>
        <aside className="booking-panel">
          <span className="eyebrow">YOUR OWN ISLAND STORY</span>
          <h3>Let’s make it yours.</h3>
          <p>Request a quote</p>
          <span className="small">
            Tailored to your dates, group, and preferences. No sample prices are
            charged.
          </span>
          <Link className="btn" to={`/book?tour=${tour.id}`}>
            Book this tour <ArrowUpRight size={17} />
          </Link>
          <Link className="btn btn-outline" to={`/contact?tour=${tour.id}`}>
            Enquire now
          </Link>
          <ContactButton
            className="btn-outline"
            message={`Hi! I'm interested in the ${tour.days}-day ${tour.name} tour. Could you please share more information?`}
          />
          <p className="small">
            A booking request is not a confirmed reservation. Owner approval is
            required.
          </p>
        </aside>
      </div>
      <CTA />
    </>
  );
}
export function Guides() {
  return (
    <>
      <PageIntro
        eyebrow="THE PEOPLE BEHIND YOUR JOURNEY"
        title="Meet your local friends."
        text="A little expertise. A lot of heart. Our guides bring their own stories, passions, and favourite corners of Sri Lanka to every journey."
      />
      <section className="container section compact-top">
        <p className="sample-label content-label">
          Sample team · Replace all names, portraits, experience, and
          biographies before launch.
        </p>
        <div className="guide-grid">
          {guides.map((g) => (
            <GuideCard key={g.id} guide={g} />
          ))}
        </div>
      </section>
      <CTA />
    </>
  );
}
export function GuideDetail() {
  const { id } = useParams();
  const guide = guides.find((g) => g.id === id);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState("");
  const [share, setShare] = useState("");
  useEffect(() => {
    let active = true;
    void getReviews(id)
      .then((r) => {
        if (active) setReviews(r);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [id]);
  if (!guide) return <NotFound />;
  const shown = [
    ...(mode === "demo" ? sampleReviews.filter((r) => r.guide_id === id) : []),
    ...reviews,
  ];
  async function shareProfile() {
    try {
      if (navigator.share)
        await navigator.share({
          title: guide!.name,
          url: window.location.href,
        });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setShare("Profile link copied.");
      }
    } catch {
      setShare("Copy the address from your browser to share this profile.");
    }
  }
  return (
    <>
      <section className="container guide-profile section">
        <Photo
          className="profile-photo"
          src={guide.image}
          alt={`${guide.name}, sample portrait`}
        />
        <div>
          <span className="eyebrow">{guide.role} · SAMPLE PROFILE</span>
          <h1>
            Ayubowan,
            <br />
            I’m <em>{guide.name.split(" ")[0]}.</em>
          </h1>
          <p className="lead">A local perspective. A personal welcome.</p>
          <p>{guide.bio}</p>
          <div className="facts">
            <span>{guide.years} years’ experience</span>
            <span>{guide.languages.join(" · ")}</span>
          </div>
          <div className="tag-list">
            {guide.specialties.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <div className="button-row">
            <Link className="btn" to={`/book?guide=${guide.id}`}>
              Book this guide <ArrowUpRight size={17} />
            </Link>
            <ContactButton
              className="btn-outline"
              message={`Hi! I'd like to check ${guide.name}'s availability for a private trip.`}
            />
          </div>
          <button className="text-button" onClick={() => void shareProfile()}>
            <Share2 size={16} />
            Share profile
          </button>
          <span role="status" className="small">
            {share}
          </span>
        </div>
      </section>
      <section className="container section compact-top">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THROUGH A LOCAL LENS</span>
            <h2>Places I love to share.</h2>
          </div>
          <Link className="arrow-link" to={`/contact?guide=${guide.id}`}>
            Ask about availability <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="photo-gallery">
          {guide.gallery.map((image, i) => (
            <Photo
              src={image}
              key={image}
              alt={`Sri Lanka inspiration ${i + 1}`}
              loading="lazy"
            />
          ))}
        </div>
        <div className="section-heading detail-subtitle">
          <div>
            <span className="eyebrow">TRAVELLER STORIES</span>
            <h2>
              {shown.length
                ? `${(shown.reduce((a, r) => a + r.rating, 0) / shown.length).toFixed(1)} / 5 · ${shown.length} ${mode === "demo" ? "sample & demo " : ""}reviews`
                : "Your story could be the first."}
            </h2>
          </div>
          <Link className="arrow-link" to="/account">
            Share your experience <ArrowUpRight size={18} />
          </Link>
        </div>
        {error && (
          <p className="alert error" role="alert">
            Reviews could not load: {error}
          </p>
        )}
        <div className="review-grid">
          {shown.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
        <p className="small">
          {mode === "demo"
            ? "Illustrative reviews and sample photographs. These are not genuine customer testimonials."
            : "Only owner-approved reviews from completed bookings are displayed."}
        </p>
      </section>
      <CTA />
    </>
  );
}
export function Ideas() {
  return (
    <>
      <PageIntro
        eyebrow="FOLLOW YOUR CURIOSITY"
        title="An island full of possibility."
        text="Ancient wonders. Wild encounters. Long, slow beach days. A little inspiration for the journey that’s taking shape in your imagination."
      />
      <section className="container section compact-top">
        <div className="ideas-grid">
          {destinations.map((d) => (
            <article key={d.id} className="idea-card">
              <Link to={`/ideas/${d.id}`} className="card-image">
                <Photo src={d.image} alt={d.name} loading="lazy" />
                <span className="round-arrow">
                  <ArrowUpRight />
                </span>
              </Link>
              <span className="eyebrow">
                {d.region} · {d.duration}
              </span>
              <h3>
                <Link to={`/ideas/${d.id}`}>{d.name}</Link>
              </h3>
              <p>{d.description}</p>
              <ul className="activity-list">
                {d.activities.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <div className="button-row">
                <Link className="arrow-link" to={`/ideas/${d.id}`}>
                  Explore this destination <ArrowUpRight size={16} />
                </Link>
                <Link
                  className="text-button"
                  to={`/contact?destination=${d.id}`}
                >
                  Ask us about this trip
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <CTA />
    </>
  );
}
export function DestinationDetail() {
  const { id } = useParams();
  const d = destinations.find((d) => d.id === id);
  if (!d) return <NotFound />;
  return (
    <>
      <section className="detail-hero">
        <Photo src={d.image} alt={d.name} />
        <div className="container">
          <Link to="/ideas" className="breadcrumb">
            Island inspiration / {d.region}
          </Link>
          <h1>{d.name}</h1>
          <p>{d.description}</p>
        </div>
      </section>
      <section className="container section destination-detail">
        <div>
          <span className="eyebrow">STAY A LITTLE LONGER · {d.duration}</span>
          <h2>A few moments to find.</h2>
          {d.activities.map((a) => (
            <p className="activity-row" key={a}>
              <Check size={20} />
              {a}
            </p>
          ))}
          <p>
            Our guides can help you choose the right season, find quieter times
            to visit, and connect this destination with the rest of your island
            journey.
          </p>
        </div>
        <div className="quiet-panel">
          <h3>Make room for {d.name}.</h3>
          <p>
            We’ll help you build a journey around the places that speak to you.
          </p>
          <Link className="btn" to={`/contact?destination=${d.id}`}>
            Ask us about this trip <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <CTA />
    </>
  );
}
export function About() {
  return (
    <>
      <PageIntro
        eyebrow="LOCAL ROOTS. OPEN HEARTS."
        title="Our home. Your next story."
        text="We believe the most memorable journeys are the ones that bring people together. That’s where our story begins."
      />
      <section className="container section intro-section compact-top">
        <div className="intro-collage">
          <Photo
            className="intro-large"
            src={guides[0].image}
            alt="Sample founder portrait"
          />
          <Photo
            className="intro-small"
            src={destinations[1].image}
            alt="Sri Lanka hill country"
            loading="lazy"
          />
          <div className="collage-note">
            <span>
              From our family,
              <br />
              with love.
            </span>
          </div>
        </div>
        <div className="intro-copy">
          <span className="eyebrow">A FAMILY-OWNED ISLAND WELCOME</span>
          <h2>
            It started with
            <br />
            <em>a love for home.</em>
          </h2>
          <p>
            Our founder’s story belongs here: a local guide, a lifetime of
            island memories, and a passion for helping visitors feel truly
            welcome.
          </p>
          <p>
            We’re building a small family business around something simple:
            share the places we love, care for the people we meet, and create
            journeys that feel personal.
          </p>
          <p>
            From your first question to your final airport goodbye, our goal is
            to make travelling in Sri Lanka warm, easy, and meaningful.
          </p>
          <span className="sample-label">
            Sample founder story — replace with your family’s real history.
          </span>
        </div>
      </section>
      <section className="why-section">
        <div className="container">
          <span className="eyebrow">THE THINGS WE CARE ABOUT</span>
          <h2>Travel with intention.</h2>
          <div className="why-grid">
            {[
              [
                "People first",
                "Clear communication, thoughtful planning, and a friendly face throughout your trip.",
              ],
              [
                "Our island, respected",
                "Support local communities, respect cultural traditions, and give wildlife the space it deserves.",
              ],
              [
                "Honest from the start",
                "Transparent quotes and flexible plans. Bookings are only confirmed after owner approval.",
              ],
            ].map(([t, p]) => (
              <article key={t}>
                <h3>{t}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OUR SMALL, FRIENDLY TEAM</span>
            <h2>Good people. Great journeys.</h2>
          </div>
        </div>
        <div className="guide-grid">
          {guides.map((g) => (
            <GuideCard guide={g} key={g.id} />
          ))}
        </div>
      </section>
      <CTA />
    </>
  );
}
export function NotFound() {
  return (
    <section className="container section not-found">
      <span className="eyebrow">A LITTLE OFF THE TRAIL</span>
      <h1>This path ends here.</h1>
      <p>
        We couldn’t find that page. There’s plenty more of the island to
        discover.
      </p>
      <Link to="/" className="btn">
        Back to the beginning <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}
