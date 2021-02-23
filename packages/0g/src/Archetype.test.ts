import { Archetype } from './Archetype';
import { Component } from './Component';
import { EntityImpostor } from './EntityImpostor';

class A extends Component({}) {}
class B extends Component({}) {}
class C extends Component({}) {}

A.id = 0;
B.id = 1;
C.id = 2;

describe('Archetypes', () => {
  const entities = [
    <const>[[new A(), new B(), new C()] as [A, B, C], 1],
    <const>[[new A(), new B(), new C()] as [A, B, C], 5],
    <const>[[new A(), new B(), new C()] as [A, B, C], 100],
  ];

  it('stores and iterates entities', () => {
    const arch = new Archetype<[typeof A, typeof B, typeof C]>('111');

    entities.forEach(([components, id]) => arch.addEntity(id, components));

    // ordering is not guaranteed on the iteration, so just storing in
    // an intermediate array
    let i = 0;
    for (const item of arch) {
      expect(item.id).toBe(entities[i][1]);
      expect(item.get(A)).toEqual(entities[i][0][0]);
      expect(item.get(B)).toEqual(entities[i][0][1]);
      expect(item.get(C)).toEqual(entities[i][0][2]);
      i++;
    }
  });

  it('removes entities', () => {
    const arch = new Archetype<[typeof A, typeof B, typeof C]>('111');

    entities.forEach(([components, id]) => arch.addEntity(id, components));

    arch.removeEntity(entities[1][1]);

    const iterated = new Array<EntityImpostor<any>>();
    for (const item of arch) {
      expect(item.id).not.toEqual(5);
    }
  });
});
