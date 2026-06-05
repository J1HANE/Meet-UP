import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) ?? "",
  }),
  component: VerifyEmail,
});

function VerifyEmail() {
  const { verifyEmail, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { token: urlToken } = useSearch({ from: "/verify-email" });
  const [token, setToken] = useState(urlToken ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (urlToken) {
      setToken(urlToken);
      handleVerify(urlToken);
    }
  }, [urlToken]);

  const handleVerify = async (t: string) => {
    if (!t) return;
    setLoading(true);
    setError("");
    try {
      await verifyEmail(t);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => navigate({ to: "/login", replace: true }), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleVerify(token);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Verify Email</h1>
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
            Email verified! Redirecting to login…
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Token
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your verification token"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "Verifying…" : "Verify Email"}
            </button>
          </form>
        )}
        {!success && !urlToken && (
          <p className="text-center mt-4 text-sm text-gray-600">
            Check your email for the verification link or paste the token above.
          </p>
        )}
      </div>
    </div>
  );
}
