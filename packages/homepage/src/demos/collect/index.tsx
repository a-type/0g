import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { defaultScene } from 'r2d';
import { Stage } from '@inlet/react-pixi';
import 'r2d/src/tools/tools.css';
import './index.css';
import { game } from './game';
import './systems';

function SceneLoader() {
  const [scene, setScene] = React.useState<any | null>(null);
  const [_, setFileHandle] = React.useState<any | null>(null);

  const handleLoad = React.useCallback(async () => {
    const [handle] = await (window as any).showOpenFilePicker();
    setFileHandle(handle);
    const file = await handle.getFile();
    const contents = await file.text();
    setScene(JSON.parse(contents));
  }, []);

  const handleCreate = React.useCallback(() => {
    setScene(defaultScene);
  }, []);

  if (!scene) {
    return (
      <div>
        <button onClick={handleLoad}>Load a scene</button>
        <button onClick={handleCreate}>New scene</button>
      </div>
    );
  }

  return (
    <div className="Viewport">
      <WorldRenderer scene={scene} />
    </div>
  );
}

const WorldRenderer = ({ scene }: any) => {
  const options = {
    backgroundColor: 0x10bb99,
  };

  return (
    <Stage options={options} width={320} height={240}>
      <game.World scene={scene} />
    </Stage>
  );
};

const App = () => <SceneLoader />;

ReactDOM.render(<App />, document.getElementById('root'));
