## What this changes

<!-- One or two sentences. What is different after this merges. -->

## Why

<!-- The problem being solved. Link the issue or ADR if there is one. -->

## Checklist

- [ ] One logical change
- [ ] Documentation updated in the same pull request, if behaviour changed
- [ ] Type check, lint, and tests pass

### If this touches domain data (`packages/catalog`)

- [ ] Every changed value cites a source — extension service, peer-reviewed literature, or manufacturer specification
- [ ] No value in this change originated from a language model
- [ ] `reviewed_by` and `reviewed_at` updated

### If this touches prompts, model configuration, or the engine

- [ ] Evaluation run against the golden set attached, with no primary metric regressing
- [ ] Prompt version bumped, if a prompt changed
- [ ] Property tests added for new engine behaviour, not only example tests
- [ ] Determinism preserved — the same input still produces byte-identical output

### If this touches safety rules, structural limits, or electrical guidance

- [ ] Second reviewer requested
- [ ] Safety template text unchanged, or its change reviewed as safety-critical content

### If this touches the 3D viewer

- [ ] Scene still projects deterministically from the layout; no authored or generated geometry
- [ ] Frame-time budget on the mid-range device profile still met
- [ ] Keyboard path and the structured component equivalent still work
- [ ] No-WebGL fallback still exercised by the end-to-end tests

## Risk

<!-- What could this break, and how would we notice. -->
