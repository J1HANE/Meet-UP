import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/2fa-setup")({
  component: TwoFactorSetup,
});

function TwoFactorSetup() {
  const { user, setup2FA, enable2FA, disable2FA, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Refresh user data on mount
  React.useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleSetup = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await setup2FA();
      setQrCodeUrl(response.qrCodeUrl);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to setup 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    setError("");

    try {
      await enable2FA(verificationCode);
      await refreshUser();
      navigate({ to: "/profile", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setError("");

    try {
      await disable2FA(verificationCode);
      await refreshUser();
      navigate({ to: "/profile", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {user.twoFactorEnabled ? "Disable 2FA" : "Setup 2FA"}
        </h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {step === "setup" && !user.twoFactorEnabled && (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              Enable two-factor authentication to add an extra layer of security to your account.
            </p>
            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "Setting up..." : "Setup 2FA"}
            </button>
          </div>
        )}
        {step === "verify" && !user.twoFactorEnabled && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Scan this QR code with your authenticator app:</p>
              {qrCodeUrl && (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                  alt="QR Code"
                  className="mx-auto mb-4"
                  style={{ maxWidth: "200px" }}
                />
              )}
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 6-digit code"
              />
            </div>
            <button
              onClick={handleEnable}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "Enabling..." : "Enable 2FA"}
            </button>
            <button
              onClick={() => setStep("setup")}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
        {user.twoFactorEnabled && (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              Enter your current 2FA code to disable two-factor authentication.
            </p>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 6-digit code"
              />
            </div>
            <button
              onClick={handleDisable}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "Disabling..." : "Disable 2FA"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
