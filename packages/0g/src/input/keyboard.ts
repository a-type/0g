export type KeyboardKey = string;

export class Keyboard {
  private keysPressed = new Set<string>();
  private keysDown = new Set<string>();
  private keysUp = new Set<string>();

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (ev: KeyboardEvent) => {
    if (ev.target === document.body && ev.key !== 'F5' && ev.key !== 'F12') {
      ev.preventDefault();
    }

    const key = ev.key;
    // avoid key-repeat triggering?
    if (!this.keysPressed.has(key)) {
      this.keysPressed.add(key);
      this.keysDown.add(key);
    }
  };

  private handleKeyUp = (ev: KeyboardEvent) => {
    const key = ev.key;
    this.keysPressed.delete(ev.key);
    this.keysUp.add(key);
  };

  getKeyPressed = (key: KeyboardKey) => {
    return this.keysPressed.has(key);
  };

  getKeyDown = (key: KeyboardKey) => {
    return this.keysDown.has(key);
  };

  getKeyUp = (key: KeyboardKey) => {
    return this.keysUp.has(key);
  };

  getAllPressedKeys = () => {
    return this.keysPressed;
  };

  frame = () => {
    this.keysDown.clear();
    this.keysUp.clear();
  };
}

export const keyboard = new Keyboard();
