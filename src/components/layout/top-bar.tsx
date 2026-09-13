import { Button } from "@/components/core/button";
import { Icon } from "@/components/core/icon";
import { IconButton } from "@/components/core/icon-button";
import { Avatar } from "@/components/display/avatar";
import { CreditMeter } from "@/components/display/credit-meter";
import { Wordmark } from "@/components/layout/wordmark";

export interface TopBarProps {
  title?: string;
}

/** Fixed 56px chrome. Credits are first-class here. */
export function TopBar({ title }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-hairline bg-page px-5">
      <Wordmark />
      {title && (
        <>
          <span className="h-5 w-px bg-hairline" />
          <span className="text-body-sm font-medium text-secondary">
            {title}
          </span>
        </>
      )}
      <span className="flex-1" />

      <search className="flex h-8 w-65 items-center gap-2 rounded-full border border-hairline bg-w-06 px-3 focus-within:border-lime">
        <Icon name="search" size={15} className="text-muted" />
        <input
          type="search"
          aria-label="Search"
          placeholder="Search presets, models, creators"
          className="min-w-0 flex-1 border-none bg-transparent text-body-sm text-primary outline-none placeholder:text-muted"
        />
      </search>

      <CreditMeter credits={1840} total={3000} />
      <Button size="sm" pill iconLeft="crown">
        Upgrade
      </Button>
      <IconButton icon="bell" label="Notifications" size="sm" />
      <Avatar name="Ava Lindqvist" size={28} ring />
    </header>
  );
}
