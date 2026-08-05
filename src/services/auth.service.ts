import { guard, supabase, unwrap } from "./service-utils";
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

      const args: {
        _name: string;
        _phone?: string;
        _description?: string;
        _industry?: string;
        _full_name?: string;
      } = { _name: input.businessName, _phone: input.phone };
      if (input.businessDescription) args._description = input.businessDescription;
      if (input.industry) args._industry = input.industry;
      if (input.fullName) args._full_name = input.fullName;

      const tenantId = unwrap(await supabase.rpc("create_tenant_workspace", args));
      return tenantId as string;
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
