import React from 'react';
import { Route } from 'wouter';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ThemeProvider } from '@emotion/react';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Header />
        <Route path="/">
          <HomePage />
        </Route>
      </div>
    </ThemeProvider>
  );
}

export default App;
