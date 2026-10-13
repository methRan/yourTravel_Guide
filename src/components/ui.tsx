import Photo from "./Photo";
import { useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  MessageCircle,
  Clock3,
  Star,
  Leaf,
  X,
} from "lucide-react";
import { site, whatsappUrl } from "../config/site";
import type { Tour, Guide, Review } from "../types";
import { sampleReviews } from "../data/reviews";
import { mode } from "../lib/backend";
export function ArrowLink({
  to,
  children,
  className = "",
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link className={`arrow-link ${className}`} to={to}>
      {children}
      <ArrowUpRight size={18} />
    </Link>
  );
}
export function ContactButton({
  message = "Hi! I’d love to plan a trip to Sri Lanka.",
  className = "",
  children = "Let’s talk on WhatsApp",
}: {
  message?: string;
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  return (
    <>
      {site.contactsConfigured ? (
        <a
          className={`btn ${className}`}
          href={whatsappUrl(message)}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={18} />
          {children}
        </a>
      ) : (
        <button
          ref={trigger}
          className={`btn ${className}`}
          onClick={() => setOpen(true)}
        >
          <MessageCircle size={18} />
          {children}
        </button>
      )}
      {open && (
        <div className="modal-backdrop" onClick={close}>
          <section
            className="contact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
              if (e.key !== "Tab") return;
              const controls =
                e.currentTarget.querySelectorAll<HTMLElement>(
                  "button, a[href]",
                );
              const first = controls[0];
              const last = controls[controls.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }}
          >
            <button
              autoFocus
              className="icon-button modal-close"
              aria-label="Close contact information"
              onClick={close}
            >
              <X />
            </button>
            <span className="eyebrow">A QUICK HEADS-UP</span>
            <h2 id="contact-title">Our sample contact details</h2>
            <p>
              This website is a demonstration. A business WhatsApp number has
              not been configured, so your message cannot be sent yet.
            </p>
            <Link className="btn" to="/contact" onClick={() => setOpen(false)}>
              Try the enquiry form <ArrowRight size={17} />
            </Link>
          </section>
        </div>
      )}
    </>
  );
}
export function PageIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="page-intro container">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}
export function TourCard({ tour }: { tour: Tour }) {
  return (
    <article className="tour-card">
      <Link className="card-image" to={`/tours/${tour.id}`}>
        <Photo
          src={tour.image}
          alt={`${tour.destinations[0]}, Sri Lanka travel inspiration`}
          loading="lazy"
        />
        <span className="duration">
          <Clock3 size={14} />
          {tour.days} days
        </span>
        <span className="round-arrow">
          <ArrowUpRight size={21} />
        </span>
      </Link>
      <div className="card-body">
        <span className="eyebrow">{tour.audience}</span>
        <Link to={`/tours/${tour.id}`}>
          <h3>{tour.name}</h3>
        </Link>
        <p>{tour.description}</p>
        <div className="card-bottom">
          <span>Private & personalised</span>
          <ArrowLink to={`/tours/${tour.id}`}>Explore tour</ArrowLink>
        </div>
      </div>
    </article>
  );
}
export function GuideCard({ guide }: { guide: Guide }) {
  const reviews = sampleReviews.filter((r) => r.guide_id === guide.id);
  return (
    <article className="guide-card">
      <Link to={`/guides/${guide.id}`} className="guide-image">
        <Photo
          src={guide.image}
          alt={`${guide.name} — sample profile portrait`}
          loading="lazy"
        />
        {guide.id === "sunil" && (
          <span className="duration">Meet our founder</span>
        )}
      </Link>
      <div className="guide-body">
        <span className="eyebrow">{guide.role}</span>
        <h3>
          <Link to={`/guides/${guide.id}`}>{guide.name}</Link>
        </h3>
        <p>
          {guide.years} years of experience · {guide.languages.join(" / ")}
        </p>
        <p className="small">{guide.specialties.join(" · ")}</p>
        {mode === "demo" ? (
          <span className="rating">
            <Star size={14} fill="currentColor" />{" "}
            {(
              reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
            ).toFixed(1)}{" "}
            · {reviews.length} sample{" "}
            {reviews.length === 1 ? "review" : "reviews"}
          </span>
        ) : (
          <span className="small">Traveller reviews on profile</span>
        )}
        <div className="guide-actions">
          <ArrowLink to={`/guides/${guide.id}`}>
            Meet {guide.name.split(" ")[0]}
          </ArrowLink>
          <ContactButton
            className="contact-small"
            message={`Hi! I'd like to enquire about travelling with ${guide.name}.`}
            children="WhatsApp"
          />
        </div>
      </div>
    </article>
  );
}
export function ReviewCard({ review }: { review: Review }) {
  const [selected, setSelected] = useState<string | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  function closePhoto() {
    setSelected(null);
    trigger.current?.focus();
  }
  return (
    <article className="review-card">
      <div className="stars" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: review.rating }, (_, i) => (
          <Star key={i} size={15} fill="currentColor" />
        ))}
      </div>
      <blockquote>“{review.body}”</blockquote>
      <div className="review-person">
        <span className="avatar">{review.customer_name.charAt(0)}</span>
        <div>
          <strong>{review.customer_name}</strong>
          <span>{review.country}</span>
        </div>
        {review.sample && <span className="sample-tag">Sample review</span>}
      </div>
      {review.photos.length > 0 && (
        <div className="review-photos">
          {review.photos.map((p, i) => (
            <button
              key={p}
              className="photo-thumbnail"
              aria-label={`View trip photograph ${i + 1} from ${review.customer_name}`}
              onClick={(e) => {
                trigger.current = e.currentTarget;
                setSelected(p);
              }}
            >
              <Photo
                src={p}
                alt={`Trip photograph ${i + 1} from ${review.customer_name}${review.sample ? " (sample)" : ""}`}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
      {selected && (
        <div className="modal-backdrop" onClick={closePhoto}>
          <section
            className="photo-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Trip photograph from ${review.customer_name}`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") closePhoto();
              if (e.key === "Tab") e.preventDefault();
            }}
          >
            <Photo
              src={selected}
              alt={`Trip photograph from ${review.customer_name}`}
            />
            <button
              autoFocus
              className="icon-button photo-close"
              aria-label="Close photograph"
              onClick={closePhoto}
            >
              <X />
            </button>
          </section>
        </div>
      )}
    </article>
  );
}
export function CTA() {
  return (
    <section className="cta-section">
      <div className="container cta-inner">
        <Leaf size={35} strokeWidth={1} />
        <span className="eyebrow">YOUR STORY STARTS HERE</span>
        <h2>
          Let’s plan your
          <br />
          <em>Sri Lankan adventure.</em>
        </h2>
        <p>
          A few ideas, a little local knowledge, and a journey that feels like
          you.
        </p>
        <ContactButton />
        <span className="small">
          No pressure. Just a friendly conversation.
        </span>
      </div>
    </section>
  );
}
export function ModeNote({ children }: { children?: ReactNode }) {
  return (
    <div className="mode-note">
      <span className="status-dot" />
      <strong>{mode === "demo" ? "Demo mode" : "Booking requests"}</strong>
      <span>
        {children ||
          (mode === "demo"
            ? "Sample content. Submissions stay in this browser and are not sent to the business."
            : "Requests are subject to owner approval. Your booking is not automatically confirmed.")}
      </span>
    </div>
  );
}
