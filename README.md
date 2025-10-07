# ROBA Research

ROBA Research brings together our most active initiatives in **robotics, simulation, and embodied AI**.  
This repository serves as a central hub for research-focused projects developed by **[ROBA Labs](https://www.robalabs.com)** — including **MuJoCo WebAssembly ports**, **advanced browser front-ends**, a **humanoid research platform**, **MuJoCo Warp-based reinforcement learning environments**, and a **comprehensive object-model library**.

Alongside the **ROBA Studio** and **Creator Hub**, this repository acts as a shared store of **templates, simulation environments, and reference implementations**. It is designed both for experienced developers and newcomers who want to experiment, learn, and build upon open robotic systems in realistic physics-based environments.

Our goal is to make **robotics research accessible, transparent, and reproducible** — empowering anyone to simulate, visualize, and train intelligent agents directly in the browser or on local compute infrastructure.

## Projects

### sim2game
![Simforge Browser Lab](sim2game/thumbnail.png)

Sim2game streams MuJoCo physics straight into the browser through a WASM runtime paired with a modular Three.js front-end. Ready-to-run aerospace and legged-robot scenes, telemetry overlays, recording pipelines, ROS hooks, and a cleanly segmented codebase (runtime, browser app, generators, toolchain) make it easy to extend.

We reorganised the workspace into the Simforge layout, consolidated the asset pipeline with `index.json`, modularised controller generators, and expanded the telemetry/recording stack. Shortcuts, richer waypoint editing, video capture, logging, and automation scripts for WASM bindings round out the experience.

#### Quick Start
```bash
# Serve from the project root
python -m http.server 8000
# Browser: http://localhost:8000/simforge/apps/browser-lab/public/lab.html
```
```bash
# Serve only the browser lab
cd simforge/apps/browser-lab
npx serve public
```

### mujoco_wasm
![MuJoCo Browser Sandbox](mujoco_wasm/thumbnail.png)

mujoco_wasm delivers a fully client-side MuJoCo sandbox. The web app combines the WebAssembly engine with a Three.js interface, packaged scenes, and tools for recording, replay, and tuning simulations.

We expanded the sandbox into a complete browser application with a modular interaction toolkit, CMA-ES tuner, Chart.js dashboards, automated binding generators, and prebuilt deployment artefacts in `deployables/`.

#### Quick Start
```bash
npm install
npx http-server -p 8080 .
# Browser: http://localhost:8080/index.html
```

### mujoco_scanned_objects
<p align="center">
  <img src="https://github.com/kevinzakka/mujoco_scanned_objects/blob/main/assets/clock.png?raw=true" width="45%" alt="Clock" />
  <img src="https://github.com/kevinzakka/mujoco_scanned_objects/blob/main/assets/REPLACE_ME_1.png?raw=true" width="45%" alt="Item 2" />
  <br/>
  <img src="https://github.com/kevinzakka/mujoco_scanned_objects/blob/main/assets/REPLACE_ME_2.png?raw=true" width="45%" alt="Item 3" />
  <img src="https://github.com/kevinzakka/mujoco_scanned_objects/blob/main/assets/REPLACE_ME_3.png?raw=true" width="45%" alt="Item 4" />
</p>

mujoco_scanned_objects provides MJCF models for 1,030 household objects from Google’s Scanned Objects dataset. Each object ships with visual and collision meshes plus textures, ready to drop into MuJoCo.

#### Quick Start
Open any `model.xml` inside `mujoco_scanned_objects/models/**/` with the MuJoCo `simulate` binary (drag and drop or pass the path as an argument) to inspect the meshes. Switch between visual (group 2) and collision (group 3) layers in the viewer.


## Project Summary
| Name | Description | License | Original Repo |
| --- | --- | --- | --- |
| sim2game | Browser-based MuJoCo lab with WASM runtime and modular controllers | MIT | https://github.com/k1a11220/sim2game |
| mujoco_wasm | Client-side MuJoCo sandbox with a Three.js front-end | MIT  | https://github.com/zalo/mujoco_wasm |
| mujoco_scanned_objects | 1,030 MJCF models of scanned household objects | CC-BY 4.0 + MIT | https://github.com/kevinzakka/mujoco_scanned_objects |

## Update Submodules
```bash
git submodule update --init --recursive
```
