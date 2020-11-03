const configValues = {
  physicsStepPriority: 500,
  renderStepPriority: 1000,
};

export function config(v: Partial<typeof configValues>) {
  Object.assign(configValues, v);
}

export function getConfig() {
  return configValues;
}
