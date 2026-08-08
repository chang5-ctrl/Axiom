import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/platform/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  confirmPlatformPasswordChange,
  updatePlatformProfile,
} from "@/lib/platform-auth.functions";

export const Route = createFileRoute("/super-admin/_app/profile")({
  component: PlatformProfilePage,
});

function PlatformProfilePage() {
  const { employee, role, refresh } = usePlatformAuth();
  const [fullName, setFullName] = useState(employee?.fullName ?? "");
  const [department, setDepartment] = useState(employee?.department ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await updatePlatformProfile({
        data: { fullName, ...(department ? { department } : {}) },
      });
      await refresh();
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 10) {
      toast.error("Use at least 10 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setSavingPassword(false);
      toast.error(error.message);
      return;
    }
    try {
      await confirmPlatformPasswordChange();
      await refresh();
      setPassword("");
      setConfirm("");
      toast.success("Password changed");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not record the change");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Organisation"
        title="My profile"
        description="Platform staff details and account security. Passwords are only changed from inside this console."
      />

      <SectionCard title="Details" description={`${employee?.email ?? ""} · ${role?.name ?? "No role"}`}>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full name</Label>
            <Input id="profile-name" required value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-department">Department</Label>
            <Input id="profile-department" value={department} onChange={(event) => setDepartment(event.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? "Saving…" : "Save details"}
            </Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Password" description="Choose a strong password of at least 10 characters.">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={savePassword}>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? "Updating…" : "Change password"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </>
  );
}
