"use client";

import {
  ActionMenu,
  type ActionMenuEntry,
} from "@/components/overlays/action-menu";
import type { GenerationActions } from "@/hooks/use-generation-actions";

export interface TileMenuProps {
  actions: GenerationActions;
  liked: boolean;
  triggerClassName?: string;
}

/*
 * A feed tile's overflow menu, in the live order.
 *
 * The four items that open submenus upstream carry their chevron but no
 * submenu — those sub-surfaces are out of this route's scope, and an
 * affordance that leads nowhere is still the honest shape of the menu.
 *
 * Two rows are ours rather than measured, and both are deliberate. `Copy
 * image` is new: the live rail is four buttons with no room for a fifth, and
 * an image you cannot get onto the clipboard is a worse gap than an extra
 * line here. `Share` was an inert submenu and is now `Copy link`, which is
 * the one thing that submenu would have offered that works without a backend.
 */
export function TileMenu({ actions, liked, triggerClassName }: TileMenuProps) {
  const entries: (ActionMenuEntry | null)[] = [
    {
      id: "open",
      label: "Open",
      icon: "arrow-up-right",
      onSelect: actions.open,
    },
    /*
     * Regenerate loads the composer rather than firing: this is the only
     * place a single click could spend a generation, and it does not read
     * like a confirmation. Reuse is the narrower one — the recipe without
     * the prompt, so a written prompt survives being given new settings.
     */
    {
      id: "regenerate",
      label: "Regenerate",
      icon: "rotate-cw",
      onSelect: actions.recreate,
    },
    { id: "reuse", label: "Reuse", icon: "copy", onSelect: actions.reuse },
    {
      id: "copy-image",
      label: "Copy image",
      icon: "clipboard",
      onSelect: actions.copyImage,
    },
    {
      id: "create-element",
      label: "Create element",
      icon: "at-sign",
      submenu: true,
    },
    { id: "assign-element", label: "Assign to element", icon: "at-sign" },
    {
      id: "additional",
      label: "Additional",
      icon: "wand-sparkles",
      submenu: true,
    },
    null,
    {
      id: "like",
      label: liked ? "Unlike" : "Like",
      icon: "heart",
      onSelect: actions.toggleLike,
    },
    {
      id: "share",
      label: "Copy link",
      icon: "link",
      onSelect: actions.copyLink,
    },
    {
      id: "folder",
      label: "Add to folder",
      icon: "folder-plus",
      submenu: true,
    },
    null,
    {
      id: "download",
      label: "Download",
      icon: "download",
      onSelect: actions.download,
    },
    {
      id: "delete",
      label: "Delete",
      icon: "trash-2",
      danger: true,
      onSelect: actions.remove,
    },
  ];

  return <ActionMenu entries={entries} triggerClassName={triggerClassName} />;
}
