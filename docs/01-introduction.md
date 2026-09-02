# 1. Introduction

## The problem

Hydroponics — growing plants in nutrient solution without soil — is well understood as a technique. Thousands of guides, forum posts, and videos explain how to build an NFT channel or a deep water culture bucket.

What almost none of them do is answer the question a beginner actually has:

> *"I have **this** space. What should I build **here**, and what will it cost me?"*

The gap between generic instruction and a specific space is where most people give up. A prospective grower must independently:

1. Measure their space and decide what will physically fit
2. Learn the six or so major hydroponic methods well enough to pick one
3. Judge whether their available light is sufficient, or size supplemental lighting
4. Work out water source, drainage, and where a reservoir can sit
5. Confirm there is power, and that the circuit can take a pump plus lights
6. Translate all of that into a parts list with correct sizes and quantities
7. Price that parts list in their own country and currency
8. Sequence the build into an order that works

Each step is individually learnable. Together they represent perhaps twenty hours of research before a single component is purchased, and the output of that research is frequently wrong — the most common beginner failure is a system that does not fit, does not drain, or does not receive enough light.

## The solution

Hydroponer collapses those eight steps into one photograph and a short form.

The user takes a picture of the space they want to use. They state what they would like to grow, roughly what they want to spend, and how much building they are comfortable with. Within a couple of minutes they receive a complete, space-specific plan: what to build, where each piece goes, what to buy, what it costs, and how to assemble it.

The plan is not a generic template with the user's photo pasted on top. The layout is solved against the actual measured geometry of the space, the system type is selected against the actual light and access conditions found in the photo, and the bill of materials is derived from the actual layout.

## Why now

Three things make this feasible in a way it was not a few years ago:

**Vision-language models can read a scene.** A modern multimodal model can look at a photo of a garage and reliably report: concrete floor, one window on the north wall, a utility sink in the corner, an exposed outlet at waist height, roughly three metres of clear wall. That structured extraction used to require either a human or a bespoke computer-vision pipeline per object class.

**Monocular depth estimation has become practical.** Open models can produce a dense relative depth map from a single ordinary photo. Combined with one known reference dimension, that yields usable metric estimates of a room without specialist hardware.

**Structured output is reliable.** Constrained decoding and tool-use schemas mean a model can be made to return a strictly typed object rather than prose. That is what allows a language model to feed a deterministic engine safely.

## What Hydroponer is not

It is not a generic gardening chatbot. It is not a hydroponics encyclopedia. It is not a marketplace, and it does not sell components.

It does exactly one thing: it converts an image of a space into a buildable hydroponic plan for that space.

## Who it is for

- **The curious beginner** with a spare room, a balcony, or a garage, who wants to grow food and does not know where to start
- **The urban grower** working with severe space constraints where layout efficiency matters most
- **The smallholder or school** with an open field or polytunnel, planning something larger
- **The experienced builder** who wants a fast first-pass design and costing to react against rather than a blank page

## Reading order

If you are new to the project, read this document, then [Vision and Scope](02-vision-and-scope.md), then [How It Works](03-how-it-works.md). Those three give a complete picture without any implementation detail.

If you are here to build, continue into [System Architecture](05-architecture.md) and [AI Pipeline](06-ai-pipeline.md).
