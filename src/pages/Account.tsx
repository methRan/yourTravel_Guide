import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArrowUpRight, LogOut, Camera, RefreshCw } from "lucide-react";
import { useAuth } from "../lib/auth";
import {
  getBookings,
  getReviews,
  setBookingStatus,
  moderateReview,
  addReview,
  errorMessage,
  mode,
  supabase,
} from "../lib/backend";
import { guides } from "../data/guides";
import { ModeNote, PageIntro, ReviewCard } from "../components/ui";
import type { Booking, Review } from "../types";
export default function Account({ admin = false }: { admin?: boolean }) {
  const { user, loading, owner, logout } = useAuth();
  const [params] = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [enquiries, setEnquiries] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const permitted = !!user && (!admin || mode === "demo" || owner);
  const reload = useCallback(async () => {
    if (!user || !permitted) return;
    setBusy(true);
    setError("");
    try {
      setBookings(await getBookings(user, admin));
      if (admin) {
        setReviews(await getReviews(undefined, true));
        if (supabase) {
          const { data, error } = await supabase
            .from("enquiries")
            .select("*")
            .order("created_at", { ascending: false });
          if (error) throw error;
          setEnquiries(data);
        }
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }, [user, permitted, admin]);
  useEffect(() => {
    void reload();
  }, [reload]);
  if (loading)
    return <div className="container section">Loading your account…</div>;
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: admin ? "/owner" : "/account" }}
      />
    );
  if (!permitted)
    return (
      <section className="container section">
        <h1>Owner access only.</h1>
        <p>This account does not have permission to manage bookings.</p>
        <Link to="/account" className="btn">
          Back to your account
        </Link>
      </section>
    );
  const customer = user;
  async function status(id: string, value: Booking["status"]) {
    setBusy(true);
    setError("");
    try {
      await setBookingStatus(id, value);
      await reload();
      setMessage(`Booking marked ${value}.`);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function moderate(id: string, value: "Approved" | "Rejected") {
    setBusy(true);
    setError("");
    try {
      await moderateReview(id, value);
      await reload();
      setMessage(`Review ${value.toLowerCase()}.`);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function submitReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    if (!reviewBooking) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await addReview(
        {
          guide_id: String(d.get("guide_id")),
          booking_id: reviewBooking.id,
          user_id: customer.id,
          customer_name: customer.name || customer.email.split("@")[0],
          country: String(d.get("country")),
          rating: Number(d.get("rating")),
          body: String(d.get("body")),
        },
        d
          .getAll("photos")
          .filter((f) => f instanceof File && f.size > 0) as File[],
      );
      setReviewBooking(null);
      setMessage(
        mode === "demo"
          ? "Demo review saved locally for moderation. No review was sent to the business."
          : "Thank you. Your review will appear after owner approval.",
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro
        eyebrow={admin ? "OWNER WORKSPACE" : "YOUR ISLAND JOURNEYS"}
        title={
          admin
            ? "A little care behind every trip."
            : `Welcome, ${user.name || "traveller"}.`
        }
        text={
          admin
            ? "Review requests, update booking statuses, and moderate traveller stories."
            : "Your requests and travel stories, all in one place. Refresh to see the latest owner updates."
        }
      />
      <section className="container section compact-top">
        <ModeNote />
        {admin && mode === "demo" && (
          <p className="alert">
            Demo owner tools are a local simulation, accessible to any demo
            account. They do not control a real business.
          </p>
        )}
        <div className="account-toolbar">
          <div className="button-row">
            <Link className="btn" to={admin ? "/account" : "/book"}>
              {admin ? "Customer view" : "Plan another journey"}
              <ArrowUpRight size={16} />
            </Link>
            {!admin && (owner || mode === "demo") && (
              <Link className="btn btn-outline" to="/owner">
                {mode === "demo" ? "Try demo owner tools" : "Owner workspace"}
              </Link>
            )}
            <button
              className="btn btn-outline"
              disabled={busy}
              onClick={() => void reload()}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
          <button
            className="text-button"
            onClick={() =>
              void logout().catch((e) => setError(errorMessage(e)))
            }
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
        {params.has("submitted") && !admin && (
          <p className="alert success" role="status">
            {mode === "demo"
              ? "Demo request saved locally. No booking request was delivered to the business."
              : "Request received. It is pending owner review, not confirmed."}
          </p>
        )}
        {error && (
          <p className="alert error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="alert success" role="status">
            {message}
          </p>
        )}
        {busy && <p role="status">Updating your workspace…</p>}
        <h2>{admin ? "Booking requests" : "Your booking requests"}</h2>
        {!busy && !bookings.length && (
          <div className="quiet-panel">
            <h3>Your adventure is still ahead.</h3>
            <p>No booking requests yet. Find a route that speaks to you.</p>
            <Link to="/tours" className="arrow-link">
              Explore our tours <ArrowUpRight size={17} />
            </Link>
          </div>
        )}
        <div className="booking-list">
          {bookings.map((b) => (
            <article key={b.id} className="booking-item">
              <div className="booking-item-heading">
                <div>
                  <span className="eyebrow">
                    {mode === "demo" ? "LOCAL DEMO REQUEST" : "BOOKING REQUEST"}{" "}
                    · {b.id.slice(0, 8)}
                  </span>
                  <h3>{b.selection}</h3>
                </div>
                <span className={`status-badge ${b.status.toLowerCase()}`}>
                  {b.status}
                </span>
              </div>
              <div className="booking-details">
                <span>
                  {b.start_date} → {b.end_date}
                </span>
                <span>{b.group_size} travellers</span>
                <span>Pickup: {b.pickup}</span>
              </div>
              {admin && (
                <p>
                  {b.customer_name} · {b.email} · {b.phone}
                </p>
              )}
              {b.requirements && <p>{b.requirements}</p>}
              <p className="small">
                {b.status === "Pending"
                  ? "Awaiting owner review. No reservation is confirmed."
                  : b.status === "Accepted"
                    ? "Owner accepted this request. Agree on final arrangements directly with the business."
                    : b.status === "Declined"
                      ? "This request could not be accepted. Contact us to discuss alternatives."
                      : "Journey completed. You can now share your experience."}
              </p>
              {admin && (
                <div className="button-row">
                  {b.status === "Pending" && (
                    <>
                      <button
                        className="btn"
                        disabled={busy}
                        onClick={() => void status(b.id, "Accepted")}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-outline"
                        disabled={busy}
                        onClick={() => void status(b.id, "Declined")}
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {b.status === "Accepted" && (
                    <button
                      className="btn btn-outline"
                      disabled={busy}
                      onClick={() => void status(b.id, "Completed")}
                    >
                      Mark completed
                    </button>
                  )}
                </div>
              )}
              {!admin && b.status === "Completed" && (
                <button
                  className="btn btn-outline"
                  onClick={() => setReviewBooking(b)}
                >
                  <Camera size={17} />
                  Share your experience
                </button>
              )}
            </article>
          ))}
        </div>
        {reviewBooking && (
          <div className="form-panel review-form">
            <h3>Your story from the road.</h3>
            <p>
              For completed booking: {reviewBooking.selection}. One review per
              booking; all reviews need owner approval.
            </p>
            <form onSubmit={(e) => void submitReview(e)} className="form-grid">
              <label>
                Your guide
                <select
                  name="guide_id"
                  required
                  defaultValue={reviewBooking.guide_id || ""}
                >
                  <option value="">Select your guide</option>
                  {guides
                    .filter(
                      (g) =>
                        !reviewBooking.guide_id ||
                        g.id === reviewBooking.guide_id,
                    )
                    .map((g) => (
                      <option value={g.id} key={g.id}>
                        {g.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Rating
                <select name="rating" defaultValue="5" required>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "star" : "stars"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full-width">
                Country
                <input name="country" required maxLength={100} />
              </label>
              <label className="full-width">
                Your experience
                <textarea
                  name="body"
                  required
                  minLength={20}
                  maxLength={3000}
                  rows={5}
                />
              </label>
              <label className="full-width">
                Trip photographs <span>(optional)</span>
                <input
                  name="photos"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                />
                <span className="small">
                  Up to 5 JPG, PNG, or WebP photos, 5 MB each. Images are
                  re-encoded to remove metadata. Only upload photographs you
                  have permission to share.
                </span>
              </label>
              <label className="checkbox full-width">
                <input type="checkbox" required />I agree to publish my review,
                name, country, and photographs after moderation.
              </label>
              <div className="button-row full-width">
                <button className="btn" disabled={busy}>
                  Submit for moderation
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setReviewBooking(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        {admin && (
          <>
            <h2 className="detail-subtitle">Review moderation</h2>
            {!reviews.length && <p>No submitted reviews yet.</p>}
            <div className="review-grid">
              {reviews.map((r) => (
                <div key={r.id}>
                  <ReviewCard review={r} />
                  <div className="moderation-actions">
                    <span className="status-badge">{r.status}</span>
                    {r.status === "Pending" && (
                      <>
                        <button
                          className="btn"
                          disabled={busy}
                          onClick={() => void moderate(r.id, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-outline"
                          disabled={busy}
                          onClick={() => void moderate(r.id, "Rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {supabase && (
              <>
                <h2 className="detail-subtitle">Enquiries</h2>
                {!enquiries.length && <p>No enquiries yet.</p>}
                {enquiries.map((q) => (
                  <article className="booking-item" key={q.id}>
                    <h3>{q.name}</h3>
                    <p>
                      {q.email} · {q.country} · {q.phone}
                    </p>
                    <p>
                      {q.travel_date} · {q.travellers} travellers ·{" "}
                      {q.package_id || "Custom trip"}
                    </p>
                    <p>{q.message}</p>
                  </article>
                ))}
              </>
            )}
          </>
        )}
      </section>
    </>
  );
}
