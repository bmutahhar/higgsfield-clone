import { NavRail } from "@/components/layout/nav-rail";
import { TopBar } from "@/components/layout/top-bar";

/*
 * Signed-in product shell. Fixed chrome: 56px top bar, 72px icon rail. The
 * scroll container is the content column, so the chrome never moves.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex h-dvh flex-col">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <NavRail />
        <main className="hf-scrollbar flex min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
