# Interceptor Unity Project

This is a minimal Unity project that replicates the browser game in Unity so it can be built as a mobile application.

Open the `UnityProject` folder with Unity 2022 or newer.
The main scene is located at `Assets/Scenes/Main.unity`.

## Features implemented
- Basic missile and interceptor prefabs
- GameManager spawns enemy missiles toward cities
- Interceptors are launched from launchers and home in on targets
- UI displays score and wave information

More functionality from the web version can be ported by expanding the scripts inside `Assets/Scripts`.

### TextMeshPro dependency

The UI relies on the TextMeshPro package. Unity will automatically download it
using the manifest under `Packages/manifest.json` when the project is opened.
If the package does not install automatically, add **TextMeshPro** through the
Package Manager before building.
