"use client";

import {
  ActionMenu,
  type ActionMenuEntry,
} from "@/components/overlays/action-menu";
import type { GenerationActions } from "@/hooks/use-generation-actions";

export interface ClipMenuProps {
  actions: GenerationActions;
  liked: boolean;
  triggerClassName?: string;
}

/*
 * A history tile's overflow menu.
 *
 * Shorter than the image feed's, because less of it applies: there is no
 * element system on this surface and no folders. `Copy frame` rather than
 * `Copy clip` because no browser will put a video on a clipboard — the still
 * the tile is holding is what someone pointing at it means.
 */
export function ClipMenu({ actions, liked, triggerClassName }: ClipMenuProps) {
  const entries: (ActionMenuEntry | null)[] = [
    {
      id: "open",
      label: "Open",
      icon: "arrow-up-right",
      onSelect: actions.open,
    },
    { id: "reuse", label: "Reuse", icon: "copy", onSelect: actions.reuse },
    null,
    {
      id: "like",
      label: liked ? "Unlike" : "Like",
      icon: "heart",
      onSelect: actions.toggleLike,
    },
    {
      id: "copy-frame",
      label: "Copy frame",
      icon: "clipboard",
      onSelect: actions.copyImage,
    },
    {
      id: "copy-link",
      label: "Copy link",
      icon: "link",
      onSelect: actions.copyLink,
    },
    null,
    {
      id: "delete",
      label: "Delete",
      icon: "trash-2",
      danger: true,
      onSelect: actions.remove,
    },
  ];

  return (
    <ActionMenu
      entries={entries}
      triggerClassName={triggerClassName}
      width={168}
    />
  );
}
