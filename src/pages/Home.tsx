import Photo from "../components/Photo";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  HeartHandshake,
  MapPin,
  Leaf,
  MoveDown,
} from "lucide-react";
import { site } from "../config/site";
import { packages } from "../data/packages";
import { guides } from "../data/guides";
import { destinations } from "../data/destinations";
import { sampleReviews } from "../data/reviews";
import {
  ArrowLink,
  TourCard,
  GuideCard,
  ReviewCard,
  CTA,
} from "../components/ui";
export default function Home() {
  return (
    <>
      <section className="hero">
        <Photo
          className="hero-bg"
          src={site.heroImage}
          alt="Sigiriya rock rising above Sri Lanka’s lush green landscape"
          fetchPriority="high"
        />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <span className="hero-eyebrow">
            <span />
            SMALL ISLAND. EXTRAORDINARY STORIES.
          </span>
          <h1>
            Discover Sri Lanka,
            <br />
            <em>your way.</em>
          </h1>
          <p>
            Wander beyond the ordinary. Thoughtful private journeys,
            <br className="desktop-break" /> led by locals who know the island
            by heart.
          </p>
          <div className="hero-buttons">
            <Link className="btn btn-sand" to="/tours">
              Explore our tours <ArrowUpRight size={19} />
            </Link>
            <Link className="btn btn-glass" to="/guides">
              Find your guide <ArrowUpRight size={19} />
            </Link>
          </div>
          <div className="hero-bottom">
            <span>
              <MapPin size={15} /> SIGIRIYA, SRI LANKA
            </span>
            <a href="#welcome">
              A little more to discover <MoveDown size={17} />
            </a>
            <span className="hero-index">
              01 <span>/ 06</span>
            </span>
          </div>
        </div>
        <div className="hero-caption">YOUR JOURNEY. OUR HOME.</div>
      </section>
      <div className="trust-strip">
        <div className="container">
          <span>
            <HeartHandshake size={19} />
            Family-owned, locally loved
          </span>
          <i />
          <span>
            <Compass size={19} />
            Private & personalised journeys
          </span>
          <i />
          <span>
            <Leaf size={19} />
            Travel thoughtfully, explore deeply
          </span>
        </div>
      </div>
      <section className="section container intro-section" id="welcome">
        <div className="intro-copy">
          <span className="eyebrow">AYUBOWAN. WELCOME TO OUR ISLAND.</span>
          <h2>
            Not just a place to visit.
            <br />
            <em>A place to feel.</em>
          </h2>
          <p>
            Morning mist over tea-covered hills. The smell of a home-cooked
            curry. A smile from someone you’ve just met.
          </p>
          <p>
            We’re a family of local guides sharing the Sri Lanka we know and
            love. With us, you won’t just see the island. You’ll find your own
            connection to it — one meaningful moment at a time.
          </p>
          <ArrowLink to="/about">A little about us</ArrowLink>
          <div className="signature">
            From our family to you <span>♡</span>
          </div>
        </div>
        <div className="intro-collage">
          <Photo
            className="intro-large"
            src={destinations[1].image}
            alt="Green hills and railway scenery in Sri Lanka"
            loading="lazy"
          />
          <Photo
            className="intro-small"
            src={destinations[2].image}
            alt="A quiet palm-lined tropical coastline"
            loading="lazy"
          />
          <div className="collage-note">
            <Leaf size={24} />
            <span>
              Rooted in Sri Lanka.
              <br />
              Made for you.
            </span>
          </div>
          <span className="vertical-caption">A DIFFERENT KIND OF JOURNEY</span>
        </div>
      </section>
      <section className="section tours-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A FEW WAYS TO WANDER</span>
              <h2>
                Your island adventure
                <br />
                <em>starts here.</em>
              </h2>
            </div>
            <div>
              <p>
                Handpicked routes. Room for the unexpected.
                <br />
                Every journey is a starting point, never a script.
              </p>
              <ArrowLink to="/tours">Discover all tours</ArrowLink>
            </div>
          </div>
          <div className="tour-grid">
            {packages.map((t) => (
              <TourCard key={t.id} tour={t} />
            ))}
          </div>
          <p className="section-footnote">
            All journeys are private and customisable.{" "}
            <Link to="/contact">
              Let’s make one yours <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </section>
      <section className="section container destination-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ONE ISLAND. ENDLESS POSSIBILITIES.</span>
            <h2>
              Where will your
              <br />
              <em>curiosity take you?</em>
            </h2>
          </div>
          <ArrowLink to="/ideas">Explore the island</ArrowLink>
        </div>
        <div className="destination-mosaic">
          {destinations.slice(0, 4).map((d, i) => (
            <Link
              to={`/ideas/${d.id}`}
              key={d.id}
              className={`destination-tile tile-${i}`}
            >
              <Photo src={d.image} alt={d.name} loading="lazy" />
              <div>
                <span className="eyebrow">{d.region}</span>
                <h3>{d.name}</h3>
              </div>
              <span className="tile-arrow">
                <ArrowUpRight />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="why-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                IT’S THE PEOPLE THAT MAKE THE PLACE
              </span>
              <h2>
                A journey with us
                <br />
                <em>feels different.</em>
              </h2>
            </div>
            <p>
              Less ticking boxes.
              <br />
              More collecting moments.
            </p>
          </div>
          <div className="why-grid">
            {[
              {
                icon: HeartHandshake,
                title: "Local hearts, local knowledge",
                text: "The hidden paths, the best little eateries, the stories behind the sights. We share our home, not just an itinerary.",
              },
              {
                icon: Compass,
                title: "Your pace. Your kind of trip.",
                text: "Early riser or slow wanderer? Culture lover or beach dreamer? We build your journey around you.",
              },
              {
                icon: Leaf,
                title: "Small team, genuine care",
                text: "One friendly point of contact from your first hello to your last goodbye. Personal, thoughtful, and always here.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <article key={title}>
                <div className="why-icon">
                  <Icon size={29} strokeWidth={1.3} />
                  <span>0{i + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              GOOD JOURNEYS BEGIN WITH GOOD PEOPLE
            </span>
            <h2>
              A local friend.
              <br />
              <em>Not just a guide.</em>
            </h2>
          </div>
          <div>
            <p>Meet the people who turn a trip into a story.</p>
            <ArrowLink to="/guides">Meet our guides</ArrowLink>
          </div>
        </div>
        <div className="guide-grid home-guides">
          {guides.slice(0, 3).map((g) => (
            <GuideCard key={g.id} guide={g} />
          ))}
        </div>
        <p className="section-footnote">
          Meet our sample team. Names, biographies, and portraits are
          placeholders.
        </p>
      </section>
      <section className="reviews-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MOMENTS THAT STAY WITH YOU</span>
              <h2>
                A few stories
                <br />
                <em>from the road.</em>
              </h2>
            </div>
            <span className="sample-label">Illustrative sample reviews</span>
          </div>
          <div className="review-grid">
            {sampleReviews.slice(0, 2).map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  );
}
