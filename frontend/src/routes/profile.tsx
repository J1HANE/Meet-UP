import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BadgeCheck, Bell, KeyRound, Lock, LogOut, Mail, MapPin, ShieldCheck, Tag, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile — Meet-Up" },
      { name: "description", content: "Your personal dashboard" },
    ],
  }),
});

const availableTopics = [
  { label: "API Design", weight: 3 },
  { label: "Authentication", weight: 2 },
  { label: "Task Planning", weight: 3 },
  { label: "Code Review", weight: 2 },
  { label: "Security", weight: 1 },
  { label: "DevOps", weight: 2 },
  { label: "UX Research", weight: 1 },
  { label: "Performance", weight: 2 },
];

function ProfilePage() {
  const { user, isAuthenticated, logout, updateProfile, changePassword, deleteAccount, sendEmailVerification, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [showVerificationToken, setShowVerificationToken] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    location: "",
    recoveryEmail: "",
    phone: "",
    selectedTopics: [] as string[],
    meetingReminders: true,
    taskDigest: true,
    profileVisibility: false,
  });

  // Password change state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Refresh user data on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        bio: user.bio || "",
        location: user.location || "",
        recoveryEmail: user.recoveryEmail || "",
        phone: user.phone || "",
        selectedTopics: user.topics || [],
        meetingReminders: user.meetingReminders ?? true,
        taskDigest: user.taskDigest ?? true,
        profileVisibility: user.profileVisibility ?? false,
      });
    }
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recently";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate({ to: "/login" });
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success("Account deleted successfully");
      navigate({ to: "/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSendEmailVerification = async () => {
    try {
      const token = await sendEmailVerification();
      setVerificationToken(token);
      setShowVerificationToken(true);
      toast.success("Verification token generated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send verification email");
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleTopicToggle = (topic: string) => {
    setFormData((prev) => {
      const newTopics = prev.selectedTopics.includes(topic)
        ? prev.selectedTopics.filter((t) => t !== topic)
        : [...prev.selectedTopics, topic];
      return { ...prev, selectedTopics: newTopics };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }

    setIsSaving(true);
    
    // Log what we're sending
    const updateData = {
      displayName: formData.displayName || undefined,
      bio: formData.bio || undefined,
      location: formData.location || undefined,
      recoveryEmail: formData.recoveryEmail || undefined,
      phone: formData.phone || undefined,
      topics: formData.selectedTopics.length > 0 ? formData.selectedTopics : undefined,
      meetingReminders: formData.meetingReminders,
      taskDigest: formData.taskDigest,
      profileVisibility: formData.profileVisibility,
    };
    console.log("Sending profile update:", updateData);
    
    try {
      const updatedUser = await updateProfile(updateData);
      console.log("Profile updated successfully:", updatedUser);
      toast.success("Profile saved successfully!");
      setHasChanges(false);
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-[2rem] border border-primary/20 gradient-surface p-6 shadow-[0_24px_80px_oklch(0.08_0.03_280/0.45)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] gradient-accent text-3xl font-heading font-bold text-primary-foreground">
              {initials}
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <BadgeCheck className="w-3.5 h-3.5" />
                {user.roles.includes("admin") ? "Administrator" : "Verified collaborator"}
              </div>
              <h1 className="text-3xl font-heading font-bold text-foreground">{user.displayName}</h1>
              <p className="text-sm text-muted-foreground">{user.roles.join(", ")} · Joined {joinDate}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !hasChanges}
              className="bg-orange-500 text-slate-950 hover:bg-orange-400 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : hasChanges ? "Save profile" : "No changes"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border bg-card p-6">
            <div className="mb-5">
              <h2 className="font-heading text-xl font-semibold text-foreground">Edit profile information</h2>
              <p className="mt-1 text-sm text-muted-foreground">Update the usual personal details your teammates see across the workspace.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full name</label>
                <Input 
                  value={formData.displayName}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                  className="h-11 rounded-xl border-border/80 bg-muted/10" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <Input value={user.roles.join(", ")} readOnly className="h-11 rounded-xl border-border/80 bg-muted/10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input value={user.email} readOnly className="h-11 rounded-xl border-border/80 bg-muted/10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <Input 
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Your city, country"
                  className="h-11 rounded-xl border-border/80 bg-muted/10" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input 
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+212612345678"
                  className="h-11 rounded-xl border-border/80 bg-muted/10" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Recovery Email</label>
                <Input 
                  value={formData.recoveryEmail}
                  onChange={(e) => handleInputChange("recoveryEmail", e.target.value)}
                  placeholder="backup@example.com"
                  className="h-11 rounded-xl border-border/80 bg-muted/10" 
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                className="min-h-[120px] rounded-2xl border-border/80 bg-muted/10"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-heading text-lg font-semibold text-foreground">Recurring Topics</h3>
              <span className="text-xs text-muted-foreground ml-auto">Click to select</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTopics.map((topic) => {
                const isSelected = formData.selectedTopics.includes(topic.label);
                return (
                  <motion.button
                    key={topic.label}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleTopicToggle(topic.label)}
                    className={`rounded-xl border px-3 py-1.5 text-sm transition-all ${
                      isSelected 
                        ? "border-primary bg-primary/20 text-primary font-medium" 
                        : "border-border hover:border-primary/30 hover:bg-primary/5"
                    }`}
                    style={{ fontSize: `${12 + topic.weight * 2}px` }}
                  >
                    {topic.label} {isSelected && "✓"}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-lg font-semibold text-foreground">Preferences</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                <div>
                  <div className="font-medium text-foreground">Meeting reminders</div>
                  <div className="text-sm text-muted-foreground">Get notified 10 minutes before every meeting.</div>
                </div>
                <Switch 
                  checked={formData.meetingReminders}
                  onCheckedChange={(checked) => handleInputChange("meetingReminders", checked)}
                />
              </div>
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                <div>
                  <div className="font-medium text-foreground">Task digest</div>
                  <div className="text-sm text-muted-foreground">Receive a summary of assigned tasks at the end of the day.</div>
                </div>
                <Switch 
                  checked={formData.taskDigest}
                  onCheckedChange={(checked) => handleInputChange("taskDigest", checked)}
                />
              </div>
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                <div>
                  <div className="font-medium text-foreground">Profile visibility</div>
                  <div className="text-sm text-muted-foreground">Show your role and expertise to collaborators.</div>
                </div>
                <Switch 
                  checked={formData.profileVisibility}
                  onCheckedChange={(checked) => handleInputChange("profileVisibility", checked)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-lg font-semibold text-foreground">Security</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Password</div>
                    <div className="text-sm text-muted-foreground">Update your account password</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)}>Update</Button>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Two-factor authentication</div>
                    <div className="text-sm text-muted-foreground">
                      {user.twoFactorEnabled ? "Currently enabled" : "Not enabled - enhances account security"}
                    </div>
                  </div>
                </div>
                <a href="/2fa-setup">
                  <Button variant="outline" size="sm">{user.twoFactorEnabled ? "Manage" : "Setup"}</Button>
                </a>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Email verification</div>
                    <div className="text-sm text-muted-foreground">
                      {user.emailVerified ? "Email verified" : "Email not verified"}
                    </div>
                  </div>
                </div>
                {!user.emailVerified && (
                  <Button variant="outline" size="sm" onClick={handleSendEmailVerification}>Verify</Button>
                )}
              </div>

              {showVerificationToken && (
                <div className="rounded-2xl border border-green-200/50 bg-green-50/50 px-4 py-4">
                  <div className="mb-2">
                    <div className="font-medium text-green-900">Verification token generated!</div>
                    <div className="text-sm text-green-700">Copy this token and use it on the verify email page:</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-green-300 font-mono text-sm break-all">
                    {verificationToken}
                  </div>
                  <a href="/verify-email" className="block text-center text-blue-600 hover:underline mt-2">
                    Go to verify email page
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between rounded-2xl border border-red-200/50 bg-red-50/50 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <div>
                    <div className="font-medium text-red-900">Delete account</div>
                    <div className="text-sm text-red-700">Permanently delete your account and all data</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100" onClick={() => setShowDeleteDialog(true)}>Delete</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md mx-4 border border-border shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <Input 
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input 
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input 
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (passwordData.newPassword !== passwordData.confirmPassword) {
                    toast.error("New passwords do not match");
                    return;
                  }
                  if (passwordData.newPassword.length < 6) {
                    toast.error("Password must be at least 6 characters");
                    return;
                  }
                  setIsChangingPassword(true);
                  try {
                    await changePassword({
                      currentPassword: passwordData.currentPassword,
                      newPassword: passwordData.newPassword,
                    });
                    toast.success("Password changed successfully!");
                    setShowPasswordDialog(false);
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Failed to change password");
                  } finally {
                    setIsChangingPassword(false);
                  }
                }}
                disabled={isChangingPassword}
                className="flex-1 bg-orange-500 text-slate-950 hover:bg-orange-400"
              >
                {isChangingPassword ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Account</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
