import { Component } from '../components';

export class ComponentA extends Component<ComponentA>() {
  value = 10;
}
ComponentA.id = 1;

export class ComponentB extends Component<ComponentB>() {
  value = 'hello';
}
ComponentB.id = 2;

export class ComponentC extends Component<ComponentC>() {
  value = true;
}
ComponentC.id = 3;

export class ComponentD extends Component<ComponentD>() {
  value = [3];
}
ComponentD.id = 4;
