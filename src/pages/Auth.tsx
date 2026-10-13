import Photo from "../components/Photo";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Leaf } from "lucide-react";
import { useAuth } from "../lib/auth";
import { supabase, errorMessage } from "../lib/backend";
import { ModeNote } from "../components/ui";
import { destinations } from "../data/destinations";
export default function AuthPage({ signup = false }: { signup?: boolean }) {
  const { user, loading, demoLogin } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const target =
    (location.state as { from?: string } | null)?.from || "/account";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  if (loading)
    return <div className="container section">Loading your account…</div>;
  if (user) return <Navigate to={target} replace />;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const email = String(d.get("email"));
    const name = String(d.get("name") || email.split("@")[0]);
    setBusy(true);
    setError("");
    try {
      if (!supabase) {
        demoLogin(email, name);
        nav(target, { replace: true });
      } else if (signup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: String(d.get("password")),
          options: {
            data: { name },
            emailRedirectTo: window.location.href.split("#")[0] + "#/account",
          },
        });
        if (error) throw error;
        if (data.session) nav(target, { replace: true });
        else
          setMessage(
            "Check your email to confirm your account, then log in to request your trip.",
          );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: String(d.get("password")),
        });
        if (error) throw error;
        nav(target, { replace: true });
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="container auth-layout section">
      <div className="auth-photo">
        <Photo
          src={destinations[1].image}
          alt="Sri Lanka’s green hill country"
        />
        <div>
          <Leaf size={35} />
          <h2>
            Your next chapter
            <br />
            <em>begins here.</em>
          </h2>
        </div>
      </div>
      <div className="auth-form">
        <span className="eyebrow">A WARM WELCOME</span>
        <h1>{signup ? "Join the journey." : "Welcome back."}</h1>
        <p>
          {supabase
            ? "Your island adventures, all in one place."
            : "Try a local demo account. No password, real registration, or email verification is used."}
        </p>
        <ModeNote />
        <form onSubmit={(e) => void submit(e)}>
          {signup && (
            <label>
              Full name
              <input name="name" required autoComplete="name" maxLength={100} />
            </label>
          )}
          <label>
            Email address
            <input name="email" type="email" required autoComplete="email" />
          </label>
          {supabase && (
            <label>
              Password
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={signup ? "new-password" : "current-password"}
              />
            </label>
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
          <button className="btn" disabled={busy}>
            {busy
              ? "One moment…"
              : supabase
                ? signup
                  ? "Create account"
                  : "Log in"
                : "Enter demo account"}
            <ArrowUpRight size={18} />
          </button>
        </form>
        <p className="small">
          {signup ? "Already part of the journey?" : "New here?"}{" "}
          <Link to={signup ? "/login" : "/signup"} state={{ from: target }}>
            {signup ? "Log in" : "Create an account"}
          </Link>
        </p>
        {!supabase && (
          <p className="small">
            Demo accounts are local browser profiles. Anyone using this browser
            can view demo data; don’t use sensitive details.
          </p>
        )}
      </div>
    </section>
  );
}
