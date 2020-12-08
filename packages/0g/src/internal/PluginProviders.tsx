import { ReactElement } from 'react';
import { Plugin } from '../types';

export function PluginProviders({
  plugins,
  children,
}: {
  plugins: Record<string, Plugin>;
  children: ReactElement;
}) {
  return Object.values(plugins).reduce(
    (content, plugin) => (plugin.wrap ? plugin.wrap(content) : content),
    children
  );
}
