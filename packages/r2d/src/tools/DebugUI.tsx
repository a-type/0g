import * as React from 'react';
import { SceneTree } from './SceneTree';
import { Html } from './Html';

export function DebugUI() {
  return (
    <Html>
      <SceneTree />
    </Html>
  );
}
