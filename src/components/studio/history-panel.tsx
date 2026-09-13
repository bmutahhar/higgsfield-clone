/**
 * The History tab.
 *
 * Signed out there is nothing to show and — deliberately — no empty-state
 * illustration or sign-in pitch: the surface stays a blank canvas, exactly as
 * the live studio leaves it. The header's zoom and layout controls are rendered
 * by the pane, since they belong to the toolbar rather than to this panel.
 */
export function HistoryPanel() {
  return (
    <div
      role="status"
      aria-label="No generations yet"
      className="min-h-full w-full"
    />
  );
}
