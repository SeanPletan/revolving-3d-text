# Demo 3D Revolving Text

## Description
This is refactored code from threejs/examples/modifier/curve. It removes the green line, and the handles from the scene, but they are still used in the interpolation between points, and in the calculation of text paths. It needs refactoring such that the path is an instance of EllipseCurve class, and the path can be transformed (such as rotation or scaling).

``` bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev
```
