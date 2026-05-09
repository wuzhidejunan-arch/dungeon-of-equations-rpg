# Content Schema

## Purpose

This document records proposed future data schema conventions for:

- NPCs
- world objects
- story events
- story flags

These schemas are for future expansion only. They are not wired into gameplay yet. The current project still uses existing hardcoded scene logic for world interactions, routing, and tutorial flow.

## NPC Schema

### Proposed object shape

```js
{
  id: "npc_villager_01",
  scene: "WorldScene",
  name: "Villager",
  position: { x: 360, y: 180 },
  size: { width: 32, height: 40 },
  spriteKey: "villager01",
  placeholderStyle: { shape: "rect", color: 0xffff00 },
  dialogueKey: "villager1",
  interactionType: "dialogue",
  promptText: "Press E: Talk",
  visibleWhen: [{ type: "flag_not_set", flag: "story.metMayor" }],
  hiddenWhen: [],
  enabledWhen: [],
  lockMessage: "",
  difficultyGate: ["beginner", "intermediate", "challenge"],
  tutorialGate: null
}
```

### Required fields

- `id`
- `scene`
- `position`
- `size`
- `interactionType`

### Optional fields

- `name`
- `spriteKey`
- `placeholderStyle`
- `dialogueKey`
- `promptText`
- `visibleWhen`
- `hiddenWhen`
- `enabledWhen`
- `lockMessage`
- `difficultyGate`
- `tutorialGate`

### Field explanations

- `id`: Stable internal key for logic and content references.
- `scene`: Scene/map where the NPC exists, such as `WorldScene`.
- `name`: Player-facing display name if needed later.
- `position`: Spawn position in scene coordinates.
- `size`: Interaction or placeholder body size.
- `spriteKey`: Future image/sprite asset key.
- `placeholderStyle`: Safe fallback while no final art exists.
- `dialogueKey`: Key used to look up dialogue data.
- `interactionType`: Interaction behavior such as `dialogue`, `shop`, `quest`, or `cutscene`.
- `promptText`: Optional explicit interaction prompt.
- `visibleWhen`: Conditions that make the NPC visible.
- `hiddenWhen`: Conditions that hide the NPC.
- `enabledWhen`: Conditions that allow interaction while still visible.
- `lockMessage`: Message shown when visible but not usable.
- `difficultyGate`: Optional list of allowed internal difficulty keys.
- `tutorialGate`: Optional tutorial-step restriction.

### Example only

```js
{
  id: "npc_example_teacher",
  scene: "WorldScene",
  name: "Teacher",
  position: { x: 500, y: 220 },
  size: { width: 32, height: 40 },
  spriteKey: "teacher_placeholder",
  placeholderStyle: { shape: "rect", color: 0x66ccff },
  dialogueKey: "teacher_intro_example",
  interactionType: "dialogue",
  promptText: "Press E: Talk",
  visibleWhen: [],
  hiddenWhen: [],
  enabledWhen: [],
  lockMessage: "",
  difficultyGate: ["beginner", "intermediate", "challenge"],
  tutorialGate: null
}
```

This is an example only. It is not real content.

## World Object Schema

### Proposed object shape

```js
{
  id: "world_training_stone",
  type: "portal",
  scene: "WorldScene",
  position: { x: 650, y: 420 },
  size: { width: 50, height: 50 },
  spriteKey: null,
  placeholderStyle: { shape: "rect", color: 0xaa0000 },
  label: "Training Ground",
  promptText: "Press E: Training",
  action: {
    type: "scene_transition",
    targetScene: "TrainingScene",
    payload: { returnScene: "WorldScene" }
  },
  visibleWhen: [],
  enabledWhen: [],
  lockCondition: [{ type: "all_training_complete", difficulty: "beginner" }],
  lockMessage: "Finish Easy training first.",
  difficultyGate: ["beginner", "intermediate", "challenge"]
}
```

### Required fields

- `id`
- `type`
- `scene`
- `position`
- `size`

### Optional fields

- `spriteKey`
- `placeholderStyle`
- `label`
- `promptText`
- `action`
- `visibleWhen`
- `enabledWhen`
- `lockCondition`
- `lockMessage`
- `difficultyGate`

### Field explanations

- `id`: Stable internal key.
- `type`: Object behavior category such as `portal`, `shop`, `door`, `trigger`, or `decoration`.
- `scene`: Scene/map where the object exists.
- `position`: Placement in scene coordinates.
- `size`: Interaction or collision box size.
- `spriteKey`: Future asset key for art-driven objects.
- `placeholderStyle`: Safe fallback while art is missing.
- `label`: Optional display label for tooling or content review.
- `promptText`: Player-facing prompt text.
- `action`: What happens on interaction.
- `visibleWhen`: Conditions for object visibility.
- `enabledWhen`: Conditions for object usability while visible.
- `lockCondition`: Conditions that block interaction.
- `lockMessage`: Message shown if interaction is blocked.
- `difficultyGate`: Optional difficulty restriction using internal keys.

### Example only

```js
{
  id: "world_example_library_door",
  type: "portal",
  scene: "WorldScene",
  position: { x: 220, y: 260 },
  size: { width: 40, height: 30 },
  spriteKey: "library_door_placeholder",
  placeholderStyle: { shape: "rect", color: 0x775533 },
  label: "Library Door",
  promptText: "Press E: Library",
  action: {
    type: "scene_transition",
    targetScene: "LibraryScene",
    payload: {}
  },
  visibleWhen: [],
  enabledWhen: [],
  lockCondition: [],
  lockMessage: "",
  difficultyGate: ["beginner", "intermediate", "challenge"]
}
```

This is an example only. It is not real content.

## Story Event Schema

### Proposed object shape

```js
{
  id: "story_intro_training_reminder",
  trigger: {
    type: "scene_enter",
    scene: "WorldScene"
  },
  conditions: [
    { type: "difficulty_is", value: "beginner" },
    { type: "flag_not_set", flag: "story.seenTrainingReminder" }
  ],
  actions: [
    { type: "show_dialogue", dialogueKey: "intro_training_reminder" },
    { type: "set_flag", flag: "story.seenTrainingReminder", value: true }
  ],
  dialogueKey: null,
  rewards: [],
  setFlags: [],
  nextEvent: null,
  once: true
}
```

### Required fields

- `id`
- `trigger`
- `actions`

### Optional fields

- `conditions`
- `dialogueKey`
- `rewards`
- `setFlags`
- `nextEvent`
- `once`

### Trigger examples

- `scene_enter`
- `interact`
- `battle_win`
- `training_clear`
- `flag_changed`
- `room_enter`

### Action examples

- `show_dialogue`
- `set_flag`
- `start_scene`
- `grant_item`
- `grant_gold`
- `unlock_npc`
- `queue_cutscene`

### Field explanations

- `id`: Stable internal event key.
- `trigger`: What starts the event check.
- `conditions`: Requirements that must pass before actions run.
- `actions`: Effects that happen when the event runs.
- `dialogueKey`: Optional direct dialogue reference if needed by a later event system.
- `rewards`: Optional future reward payloads.
- `setFlags`: Optional future shorthand for flags to update.
- `nextEvent`: Optional chained event id.
- `once`: Whether the event should run only one time.

### Example only

```js
{
  id: "story_example_scene_intro",
  trigger: {
    type: "scene_enter",
    scene: "WorldScene"
  },
  conditions: [
    { type: "flag_not_set", flag: "story.exampleIntroSeen" }
  ],
  actions: [
    { type: "show_dialogue", dialogueKey: "example_intro_dialogue" },
    { type: "set_flag", flag: "story.exampleIntroSeen", value: true }
  ],
  dialogueKey: null,
  rewards: [],
  setFlags: [],
  nextEvent: null,
  once: true
}
```

This is an example only. It is not real content.

## Story Flag Naming Rules

- Use dot-separated stable keys.
- Recommended prefixes:
  - `story.`
  - `npc.`
  - `world.`
  - `quest.`
- Prefer stable internal IDs inside flags.
- Prefer booleans first unless counters are truly needed later.

### Examples

- `story.metMayor`
- `story.seenTrainingReminder`
- `npc.villager01.helped`
- `world.trainingStone.active`
- `quest.libraryKeyFound`

### Important warning

Do not use display text as logic keys.

Do not use:

- visible names like `Easy`, `Medium`, or `Challenge`
- NPC display names
- prompt text
- dialogue lines

Use stable internal keys instead.

## Current WorldScene Objects That May Later Move Into Data

- `house`
- `shop`
- `houseDoor`
- `dungeonGate`
- `villager`
- `trainingStone`
- `shopZone`
- `homeDoorZone`
- `villagerZone`
- `trainingZone`
- `dungeonZone`

## Migration Rules

- Do not migrate all world objects at once.
- Move one NPC first.
- Then move one portal/object.
- Keep routing logic unchanged until data loading is proven.
- Keep internal difficulty keys:
  - `beginner`
  - `intermediate`
  - `challenge`
- Do not use visible names like `Easy`, `Medium`, or `Challenge` as logic keys.

## Future Integration Notes

When these schemas are eventually used:

- `WorldScene` can read NPC/object entries for its scene and spawn placeholders or sprites from data.
- Dialogue can stay in data files and be linked by `dialogueKey`.
- Locking and visibility can be driven by future condition checks instead of hardcoded branches.
- Story events can be handled by a later event runner without changing battle or training systems.

These schema conventions are intentionally small and incremental so future migration can happen safely.
