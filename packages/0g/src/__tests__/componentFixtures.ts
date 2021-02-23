import { Component } from '../components';

export class ComponentA extends Component({
  value: 10,
}) {}
ComponentA.id = 1;

export class ComponentB extends Component({
  value: 'hello',
}) {}
ComponentB.id = 2;

export class ComponentC extends Component({
  value: true,
}) {}
ComponentC.id = 3;

export class ComponentD extends Component({
  value: [3],
}) {}
ComponentD.id = 4;
