import { Archetype } from "./Archetype";
import { ComponentType } from "./components";
import { Game } from "./Game";

export class ArchetypeManager {
  private archetypes: Record<string, Archetype> = {};
  public emptyId = new Array(this.game.componentManager.componentTypes.length).fill('0').join('');

  constructor(private game: Game) {

  }

  private getArchetypeId(Components: ComponentType[]) {
    let id = this.emptyId;
    for (let Type of Components) {
      id.
    }
  }
}
