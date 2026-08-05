revoke execute on function public.is_platform_admin(uuid) from anon, authenticated, public;
revoke execute on function public.is_tenant_member(uuid, uuid) from anon, authenticated, public;
revoke execute on function public.has_tenant_role(uuid, text[], uuid) from anon, authenticated, public;
revoke execute on function public.my_tenant_ids(uuid) from anon, authenticated, public;
revoke execute on function public.set_updated_at() from anon, authenticated, public;
revoke execute on function public.has_permission(uuid, text, uuid) from anon, public;
grant execute on function public.has_permission(uuid, text, uuid) to authenticated;