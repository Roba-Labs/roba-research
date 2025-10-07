type RuntimeSmokeMarker = {
  moduleEntry: string;
  assetsIndex: string;
};

export const runtimeSmokeMarker: RuntimeSmokeMarker = {
  moduleEntry: '../../distribution/runtime/wasm/simforge-runtime.js',
  assetsIndex: '../../apps/browser-lab/assets/scenes/index.json',
};
