import { Game } from './Game';

export class Archetype {
  entities = new Array<number>();
  constructor(public id: string, private game: Game) {}
}
