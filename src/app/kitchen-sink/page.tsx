"use client";

import { useState } from "react";

import { Badge } from "@/components/core/badge";
import { Button } from "@/components/core/button";
import { IconButton } from "@/components/core/icon-button";
import { Tag } from "@/components/core/tag";
import { Checkbox } from "@/components/forms/checkbox";
import { Input } from "@/components/forms/input";
import { PromptComposer } from "@/components/forms/prompt-composer";
import { RadioGroup } from "@/components/forms/radio-group";
import { Select } from "@/components/forms/select";
import { Slider } from "@/components/forms/slider";
import { Switch } from "@/components/forms/switch";
import { Textarea } from "@/components/forms/textarea";

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

      <section className="flex flex-col gap-3">
        <h2 className="hf-eyebrow">Prompt composer</h2>
        <PromptComposer
          cost={12}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </section>
    </main>
  );
}
