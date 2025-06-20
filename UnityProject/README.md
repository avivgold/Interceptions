# Interceptor Unity Project

This is a minimal Unity project that replicates the browser game in Unity so it can be built as a mobile application.

Open the `UnityProject` folder with Unity 2022 or newer.
The main scene is located at `Assets/Scenes/Main.unity`.

## Features implemented
- Three missile types with increasing speed per wave
- Buildings that can take one hit before being destroyed
- Interceptors launched from visible launchers and homing on clicked missiles
- Score and wave tracking matching the web version
- Keyboard keys **1-3** switch between Iron Dome, David's Sling and Arrow systems

This project aims to mirror the browser game's core mechanics. Further polish like upgrade menus can be added by extending the scripts.

### TextMeshPro dependency

The UI relies on the TextMeshPro package. Unity will automatically download it
using the manifest under `Packages/manifest.json` when the project is opened.
If the package does not install automatically, add **TextMeshPro** through the
Package Manager before building.
