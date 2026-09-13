"use client";

import { useState } from "react";

import { Badge } from "@/components/core/badge";
import { Button } from "@/components/core/button";
import { IconButton } from "@/components/core/icon-button";
import { Tag } from "@/components/core/tag";
import { Avatar } from "@/components/display/avatar";
import { Card } from "@/components/display/card";
import { CreditMeter } from "@/components/display/credit-meter";
import { MediaCard } from "@/components/display/media-card";
import { ModelCard } from "@/components/display/model-card";
import { ProgressBar } from "@/components/display/progress-bar";
import { Spinner } from "@/components/display/spinner";
import { Checkbox } from "@/components/forms/checkbox";
import { Input } from "@/components/forms/input";
import { PromptComposer } from "@/components/forms/prompt-composer";
import { RadioGroup } from "@/components/forms/radio-group";
import { Select } from "@/components/forms/select";
import { Slider } from "@/components/forms/slider";
import { Switch } from "@/components/forms/switch";
import { Textarea } from "@/components/forms/textarea";
import { NavRailItem } from "@/components/navigation/nav-rail-item";
import { SegmentedControl } from "@/components/navigation/segmented-control";
import { Tabs } from "@/components/navigation/tabs";
import { Dialog } from "@/components/overlays/dialog";
import { Toast } from "@/components/overlays/toast";
import { Tooltip } from "@/components/overlays/tooltip";
import { HERO, PRESETS } from "@/config/media";

function Row({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-b border-hairline pb-8">
      <h2 className="hf-eyebrow">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

export default function KitchenSinkPage() {
  const [checked, setChecked] = useState(true);
  const [on, setOn] = useState(true);
  const [radio, setRadio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [prompt, setPrompt] = useState("");
  const [tab, setTab] = useState("Explore");
  const [segment, setSegment] = useState("Video");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 p-10">
      <h1 className="text-display-3 uppercase">Kitchen sink</h1>

      <Row title="Buttons">
        <Button>Start generating</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="glass">Glass</Button>
        <Button variant="danger">Danger</Button>
        <Button pill size="lg" iconRight="arrow-right">
          Get started
        </Button>
        <Button loading>Generating</Button>
        <Button disabled>Disabled</Button>
      </Row>

      <Row title="Icon buttons + badges + tags">
        <IconButton icon="play" label="Play" />
        <IconButton icon="heart" label="Like" variant="solid" />
        <IconButton icon="download" label="Download" variant="glass" />
        <IconButton icon="sparkles" label="Enhance" variant="accent" />
        <Badge>New</Badge>
        <Badge tone="soft">Pro</Badge>
        <Badge tone="neutral">Top</Badge>
        <Badge tone="sand">Beta</Badge>
        <Tag icon="film">Cinematic</Tag>
        <Tag selected onClick={() => undefined}>
          Selected
        </Tag>
        <Tag onRemove={() => undefined}>Removable</Tag>
      </Row>

      <Row title="Forms">
        <Input
          label="Seed"
          placeholder="Random"
          suffix="1234"
          className="w-56"
        />
        <Input
          label="With error"
          error="Must be a number"
          defaultValue="abc"
          className="w-56"
        />
        <Select
          label="Model"
          options={["Seedance 2.5", "Nano Banana Pro", "GPT Image 2.5"]}
          className="w-56"
        />
        <Slider
          label="Duration"
          unit="s"
          min={1}
          max={10}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-56"
        />
      </Row>

      <Row title="Toggles">
        <Switch
          label="Upscale to 4K"
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
        />
        <Checkbox
          label="Remove watermark"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <RadioGroup
          direction="row"
          label="Aspect ratio"
          options={["16:9", "9:16", "1:1"]}
          value={radio}
          onChange={setRadio}
        />
      </Row>

      <Row title="Textarea">
        <Textarea
          label="Notes"
          counter
          maxLength={120}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full"
        />
      </Row>

      <Row title="Navigation">
        <Tabs
          items={["Explore", "Effects", "Projects"]}
          value={tab}
          onChange={setTab}
          className="w-full"
        />
        <SegmentedControl
          items={["Image", "Video", "Audio"]}
          value={segment}
          onChange={setSegment}
        />
        <div className="w-[248px] rounded-panel border border-hairline bg-panel p-2">
          <NavRailItem icon="compass" label="Explore" expanded active />
          <NavRailItem icon="clapperboard" label="Video" expanded />
          <NavRailItem icon="sparkles" label="Effects" expanded badge="New" />
        </div>
        <div className="flex flex-col gap-1 rounded-panel border border-hairline bg-panel p-2">
          <NavRailItem icon="compass" label="Explore" active />
          <NavRailItem icon="clapperboard" label="Video" />
        </div>
      </Row>

      <Row title="Display">
        <Avatar name="Mutahhar" ring />
        <Avatar name="Alex" size={44} />
        <CreditMeter credits={1240} total={2000} />
        <Spinner />
        <ProgressBar label="Rendering" value={62} className="w-56" />
        <ProgressBar label="Queued" indeterminate className="w-56" />
        <Card interactive className="w-56">
          <p className="text-body-sm text-secondary">
            Interactive card. Hover lifts 2px and brightens the hairline.
          </p>
        </Card>
      </Row>

      <Row title="Overlays">
        <Tooltip label="Also opens on keyboard focus">
          <Button variant="secondary">Hover or tab to me</Button>
        </Tooltip>
        <Button
          variant="outline"
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          Open dialog
        </Button>
        <Toast
          tone="accent"
          title="Render complete"
          description="Wild ride · 1080p · 5s"
          onClose={() => undefined}
        />
      </Row>

      <section className="flex flex-col gap-3">
        <h2 className="hf-eyebrow">Model cards</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {HERO.slice(0, 4).map((m, i) => (
            <ModelCard
              key={m.title}
              name={m.title}
              blurb={m.blurb}
              poster={m.poster}
              badge="New"
              selected={i === 0}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="hf-eyebrow">Media cards — hover to cross-fade</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {HERO.slice(0, 2).map((m) => (
            <MediaCard
              key={m.title}
              poster={m.poster}
              video={m.video}
              title={m.title}
              meta="16:9 · 1080p"
              badge="Promo"
              ratio="16 / 9"
              overlayActions={[{ icon: "heart", label: "Like" }]}
            />
          ))}
          {PRESETS.slice(0, 2).map((preset) => (
            <MediaCard
              key={preset.slug}
              poster={preset.poster}
              title={preset.name}
              meta="3:4 · preset"
              ratio="3 / 4"
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="hf-eyebrow">Prompt composer</h2>
        <PromptComposer
          cost={12}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </section>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        title="Discard this render?"
        description="This cannot be undone. Credits are not refunded."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setDialogOpen(false);
              }}
            >
              Keep
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setDialogOpen(false);
              }}
            >
              Discard
            </Button>
          </>
        }
      />
    </main>
  );
}
