import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { World } from '../../src/index';
import * as prefabs from './prefabs';

const App = () => {
  return <World prefabs={prefabs} />;
};

ReactDOM.render(<App />, document.getElementById('root'));
