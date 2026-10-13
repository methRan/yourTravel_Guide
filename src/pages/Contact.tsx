import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { ContactButton, ModeNote, PageIntro } from "../components/ui";
import { site } from "../config/site";
import { packages } from "../data/packages";
import { guides } from "../data/guides";
import { destinations } from "../data/destinations";
import { supabase, errorMessage, writeLocal, readLocal } from "../lib/backend";
export default function Contact() {
  const [params] = useSearchParams();
  const tour = packages.find((t) => t.id === params.get("tour"));
  const guide = guides.find((g) => g.id === params.get("guide"));
  const destination = destinations.find(
    (d) => d.id === params.get("destination"),
  );
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setBusy(true);
    setError("");
    setResult("");
    try {
      if (supabase) {
        const { error } = await supabase
          .from("enquiries")
          .insert({ ...data, travellers: Number(data.travellers) });
        if (error) throw error;
        setResult(
          "Your enquiry has been saved for the business to review. This is not a confirmed booking.",
        );
      } else {
        writeLocal("enquiries", [
          data,
          ...readLocal<unknown[]>("enquiries", []),
        ]);
        setResult(
          "Demo enquiry saved in this browser only. No message was delivered to the business.",
        );
      }
      form.reset();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro
        eyebrow="EVERY JOURNEY STARTS WITH A HELLO"
        title="Let’s dream up your trip."
        text="An idea, a question, or a whole itinerary — we’d love to hear what you have in mind."
      />
      <section className="container section contact-layout compact-top">
        <aside>
          <span className="eyebrow">A FRIENDLY CONVERSATION</span>
          <h2>
            A little local knowledge
            <br />
            <em>goes a long way.</em>
          </h2>
          <p>
            Tell us your dates and what you love. We’ll help you find your way
            around the island.
          </p>
          <ContactButton />
          <div className="contact-info">
            <Mail size={21} />
            <div>
              <strong>Email us</strong>
              {site.contactsConfigured ? (
                <a href={`mailto:${site.email}`}>{site.email}</a>
              ) : (
                <span>{site.email} (sample, not configured)</span>
              )}
            </div>
          </div>
          <div className="contact-info">
            <MapPin size={21} />
            <div>
              <strong>Our home</strong>
              <span>Sri Lanka · Private journeys island-wide</span>
            </div>
          </div>
          <div className="location-card">
            <MapPin size={30} />
            <span>7.8731° N · 80.7718° E</span>
            <h3>
              A little island.
              <br />A warm welcome.
            </h3>
            <span className="small">
              Map placeholder · Business address to be added.
            </span>
          </div>
        </aside>
        <div className="form-panel">
          <h3>Tell us a little about your adventure.</h3>
          <ModeNote />
          <form onSubmit={(e) => void submit(e)} className="form-grid">
            <label>
              Full name
              <input name="name" autoComplete="name" required maxLength={100} />
            </label>
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            </label>
            <label>
              Country
              <input
                name="country"
                autoComplete="country-name"
                required
                maxLength={100}
              />
            </label>
            <label>
              WhatsApp number <span>(optional)</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+44 7700 900123"
                pattern="\+[0-9 ()-]{7,20}"
                title="Include the international country code, starting with +"
                maxLength={25}
              />
            </label>
            <label>
              Planned arrival date
              <input
                name="travel_date"
                type="date"
                min={new Date().toLocaleDateString("en-CA")}
                required
              />
            </label>
            <label>
              Number of travellers
              <input
                name="travellers"
                type="number"
                min="1"
                max="30"
                defaultValue="2"
                required
              />
            </label>
            <label className="full-width">
              Interested package
              <select name="package_id" defaultValue={tour?.id || ""}>
                <option value="">A custom journey / not sure yet</option>
                {packages.map((t) => (
                  <option value={t.id} key={t.id}>
                    {t.name} · {t.days} days
                  </option>
                ))}
              </select>
            </label>
            <label className="full-width">
              What are you dreaming of?
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={3000}
                rows={5}
                defaultValue={
                  guide
                    ? `I'd like to travel with ${guide.name}. `
                    : destination
                      ? `I'd love to visit ${destination.name}. `
                      : ""
                }
                placeholder="Places you’d love to see, the things you enjoy, any questions…"
              />
            </label>
            <p className="small full-width">
              Your details are used to respond to this enquiry. Please don’t
              include sensitive personal information.
            </p>
            {error && (
              <p role="alert" className="alert error full-width">
                {error}
              </p>
            )}
            {result && (
              <p role="status" className="alert success full-width">
                {result}
              </p>
            )}
            <button disabled={busy} className="btn full-width">
              {busy
                ? "Saving…"
                : supabase
                  ? "Send enquiry"
                  : "Save demo enquiry"}
              <ArrowUpRight size={18} />
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
