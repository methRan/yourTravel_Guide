import { useState, type FormEvent } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import { useAuth } from "../lib/auth";
import { addBooking, errorMessage, mode } from "../lib/backend";
import { packages } from "../data/packages";
import { guides } from "../data/guides";
import { ModeNote, PageIntro } from "../components/ui";
export default function BookingPage() {
  const { user, loading } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (loading)
    return <div className="container section">Loading your account…</div>;
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: loc.pathname + loc.search }}
        replace
      />
    );
  const customer = user;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const d = new FormData(e.currentTarget);
    const start = String(d.get("start_date"));
    const end = String(d.get("end_date"));
    if (end < start) {
      setError("Your departure must be on or after your arrival.");
      return;
    }
    const [kind, id] = String(d.get("selection")).split(":");
    const selected =
      kind === "tour"
        ? packages.find((t) => t.id === id)
        : guides.find((g) => g.id === id);
    if (!selected) {
      setError("Please choose a tour or guide.");
      return;
    }
    setBusy(true);
    try {
      await addBooking({
        user_id: customer.id,
        customer_name: String(d.get("customer_name")),
        email: String(d.get("email")),
        phone: String(d.get("phone")),
        selection: selected.name,
        tour_id: kind === "tour" ? id : null,
        guide_id: kind === "guide" ? id : null,
        start_date: start,
        end_date: end,
        group_size: Number(d.get("group_size")),
        pickup: String(d.get("pickup")),
        requirements: String(d.get("requirements")),
      });
      nav("/account?submitted=1");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro
        eyebrow="YOUR JOURNEY, TAKING SHAPE"
        title="Let’s make a plan."
        text="Share a few details. We’ll review your request and agree on the itinerary, price, and availability before confirming your reservation."
      />
      <section className="container section booking-layout compact-top">
        <div className="form-panel">
          <ModeNote />
          <form className="form-grid" onSubmit={(e) => void submit(e)}>
            <label>
              Full name
              <input
                name="customer_name"
                defaultValue={user.name}
                required
                maxLength={100}
              />
            </label>
            <label>
              Email address
              <input
                name="email"
                type="email"
                defaultValue={user.email}
                required
                maxLength={254}
              />
            </label>
            <label className="full-width">
              WhatsApp / contact number
              <input
                name="phone"
                type="tel"
                placeholder="+44 7700 900123"
                required
                pattern="\+[0-9 ()-]{7,20}"
                title="Include an international country code starting with +"
                maxLength={25}
              />
            </label>
            <label className="full-width">
              Your tour or guide
              <select
                name="selection"
                required
                defaultValue={
                  params.has("guide")
                    ? `guide:${params.get("guide")}`
                    : params.has("tour")
                      ? `tour:${params.get("tour")}`
                      : ""
                }
              >
                <option value="">Choose a journey or a guide</option>
                <optgroup label="Private tours">
                  {packages.map((t) => (
                    <option key={t.id} value={`tour:${t.id}`}>
                      {t.name} · {t.days} days
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Local guides">
                  {guides.map((g) => (
                    <option key={g.id} value={`guide:${g.id}`}>
                      {g.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            <label>
              Arrival date
              <input
                name="start_date"
                type="date"
                required
                min={new Date().toLocaleDateString("en-CA")}
              />
            </label>
            <label>
              Departure date
              <input
                name="end_date"
                type="date"
                required
                min={new Date().toLocaleDateString("en-CA")}
              />
            </label>
            <label>
              Number of travellers
              <input
                name="group_size"
                type="number"
                defaultValue="2"
                min="1"
                max="30"
                required
              />
            </label>
            <label>
              Pickup location
              <input
                name="pickup"
                placeholder="Airport or your hotel"
                required
                maxLength={200}
              />
            </label>
            <label className="full-width">
              Special requirements <span>(optional)</span>
              <textarea
                name="requirements"
                rows={4}
                maxLength={3000}
                placeholder="Accessibility needs, interests, dietary preferences…"
              />
            </label>
            <label className="checkbox full-width">
              <input type="checkbox" required />I understand this is a request,
              subject to owner approval. No payment is taken.
            </label>
            {error && (
              <p className="alert error full-width" role="alert">
                {error}
              </p>
            )}
            <button className="btn full-width" disabled={busy}>
              {busy
                ? "Submitting…"
                : mode === "demo"
                  ? "Save demo booking request"
                  : "Submit booking request"}
              <ArrowUpRight size={17} />
            </button>
          </form>
        </div>
        <aside className="booking-explainer">
          <span className="eyebrow">WHAT HAPPENS NEXT?</span>
          <h2>
            A simple start
            <br />
            <em>to a great journey.</em>
          </h2>
          {[
            "Your request is saved as Pending.",
            "The owner reviews your dates and preferences.",
            "Your account shows Accepted or Declined after review.",
            "We agree on the final details before travel.",
          ].map((s, i) => (
            <p key={s}>
              <span>{i + 1}</span>
              {s}
            </p>
          ))}
          <div className="quiet-panel">
            <Check size={24} />
            <p>
              No instant confirmations. No online payment. Just a carefully
              planned private trip.
            </p>
            <Link to="/contact">Have a question first?</Link>
          </div>
        </aside>
      </section>
    </>
  );
}
