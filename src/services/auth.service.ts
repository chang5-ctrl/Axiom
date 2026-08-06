import { guard, supabase } from "./service-utils";
import { provisionWorkspace } from "@/lib/workspace.functions";
import type { AuthCredentials, RegistrationInput, ServiceResult } from "@/types/core";

/**
 * Authentication service.
 *
 * Deliberately thin and provider-agnostic: OTP, MFA or SSO can be added as
 * extra methods here without touching any UI or route.
 */
export const authService = {
  async signIn({ email, password }: AuthCredentials): Promise<ServiceResult<null>> {
    return guard(async () => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return null;
    }, "Unable to sign in");
  },

  /**
   * Registers the business owner and provisions their workspace.
   * Workspace creation is a single atomic database operation.
   */
  async registerBusiness(input: RegistrationInput): Promise<ServiceResult<string>> {
    return guard(async () => {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { full_name: input.fullName ?? null, phone: input.phone },
        },
      });
      if (error) throw error;
      if (!data.session) {
        throw new Error("Check your inbox to confirm your email, then sign in.");
      }

      const { tenantId } = await provisionWorkspace({
        data: {
          name: input.businessName,
          ...(input.phone ? { phone: input.phone } : {}),
          ...(input.businessDescription ? { description: input.businessDescription } : {}),
          ...(input.industry ? { industry: input.industry } : {}),
          ...(input.fullName ? { fullName: input.fullName } : {}),
        },
      });

      return tenantId;
    }, "Unable to create your workspace");
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  async requestPasswordReset(email: string): Promise<ServiceResult<null>> {
    return guard(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return null;
    }, "Unable to send the reset email");
  },
};
