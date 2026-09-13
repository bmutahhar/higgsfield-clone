"use client";

import { Avatar } from "@/components/display/avatar";
import { Dropdown } from "@/components/studio/dropdown";
import { useAuth } from "@/features/auth/auth-context";

/*
 * The signed-in header could not be observed from a logged-out session, so
 * this is designed rather than matched — see the spec's "not observable"
 * table. Everything it shows comes from the User the session already carries,
 * so nothing here needs a second request.
 */
export function AccountMenu() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  return (
    <Dropdown
      label="Account"
      role="menu"
      align="end"
      width={224}
      triggerClassName="flex size-8 shrink-0 items-center justify-center rounded-full focus-visible:shadow-ring focus-visible:outline-none"
      panelClassName="rounded-q-300 border border-q-subtle bg-q-modal p-1"
      trigger={<Avatar name={user.name} size={32} ring />}
    >
      {(close) => (
        <>
          <div className="flex flex-col gap-0.5 px-3 py-2">
            <span className="truncate text-sm font-medium text-q-body">
              {user.name}
            </span>
            <span className="truncate text-xs text-q-soft">{user.email}</span>
          </div>

          <div className="mx-3 border-t border-q-divider" />

          <div className="flex items-center justify-between px-3 py-2 text-xs text-q-soft">
            Credits
            <span className="font-medium text-q-brand">{user.credits}</span>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              void signOut();
            }}
            className="w-full rounded-q-200 px-3 py-2 text-left text-sm text-q-body transition-colors hover:bg-q-w-05 motion-reduce:transition-none"
          >
            Sign out
          </button>
        </>
      )}
    </Dropdown>
  );
}
