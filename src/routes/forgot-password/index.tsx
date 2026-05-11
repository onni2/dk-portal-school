import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { forgotPassword } from "@/features/auth/api/auth.api";

export const Route = createFileRoute("/forgot-password/")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(username);
      setSubmitted(true);
    } catch {
      setError("Villa kom upp — reyndu aftur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-(--color-brand-navy)">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 flex flex-col items-center gap-2">
          <svg width="80" height="42" viewBox="0 0 280 147" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_fp)">
              <path d="M246.073 46.1325L205.527 0H240.481L280.001 46.1325V46.3215L240.481 92.5485H205.527L246.073 46.3215" fill="#4743F7" />
              <path d="M226.22 145.866L183.064 92.1704L223.516 46.227H188.377L151.839 88.8617L152.118 0H121.453L121.359 145.866V146.433H151.652L151.839 95.7627L191.08 145.866H226.22Z" fill="#ffffff" />
              <path d="M104.953 0H74.2876V46.6051C68.0426 46.227 57.976 45.7543 48.4687 45.7543C21.0652 45.7543 0 68.537 0 95.6682C0 122.799 17.0573 147.095 45.7656 147.095C48.6551 147.095 52.3835 147.095 56.3915 147L74.2876 126.013V146.527C75.2197 146.527 75.9654 146.527 76.8043 146.527H104.581L104.953 0ZM52.7563 119.963C40.5459 119.963 31.9707 108.052 31.9707 95.5736C31.9707 83.0952 40.6391 73.4527 52.7563 73.0746C60.9587 72.791 68.7883 73.0746 74.2876 73.3582V119.963H52.7563Z" fill="#ffffff" />
            </g>
            <defs>
              <clipPath id="clip0_fp">
                <rect width="280" height="147" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className="text-sm font-medium text-white/60 tracking-wide">Mínar síður</span>
        </div>

        <div className="w-full max-w-110 rounded-2xl bg-(--color-surface) p-8 shadow-2xl">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg className="h-7 w-7 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-(--color-text)">Athugaðu tölvupóstinn þinn</h1>
              <p className="text-sm text-(--color-text-secondary)">
                Ef notandanafnið er til í kerfinu munum við senda þér tengil til að endurstilla lykilorðið þitt. Tengillinn gildir í 1 klukkustund.
              </p>
              <a
                href="/login"
                className="mt-2 text-sm text-(--color-primary) underline underline-offset-2 hover:opacity-80"
              >
                Fara aftur á innskráningu
              </a>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-(--color-text)">Gleymt lykilorð?</h1>
              <p className="mt-1 text-sm text-(--color-text-secondary)">
                Sláðu inn notandanafnið þitt og við sendum þér tengil til að endurstilla lykilorðið.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <Input
                  label="Notendanafn"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="notendanafn"
                  required
                />
                {error && <p className="text-sm text-(--color-error)">{error}</p>}
                <Button type="submit" disabled={loading || !username} className="mt-2 w-full">
                  {loading ? "Sendi..." : "Senda endurstillingartengil"}
                </Button>
                <div className="text-center">
                  <a
                    href="/login"
                    className="text-sm text-(--color-text-muted) underline underline-offset-2 hover:text-(--color-text-secondary)"
                  >
                    Fara aftur á innskráningu
                  </a>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      <footer className="flex justify-center pb-6">
        <span className="text-xs text-white/40">dk© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
