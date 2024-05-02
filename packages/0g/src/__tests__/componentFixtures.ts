import { component } from '../Component2.js';

export const ComponentA = component('A', () => ({
  value: 10,
}));
ComponentA.id = 1;

export const ComponentB = component('B', () => ({
  value: 'hello',
}));
ComponentB.id = 2;

export const ComponentC = component('C', () => ({
  value: true,
}));
ComponentC.id = 3;

export const ComponentD = component('D', () => ({
  value: [3],
}));
ComponentD.id = 4;
