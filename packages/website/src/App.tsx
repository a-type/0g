import React from 'react';
import { Route, Router } from 'wouter';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ThemeProvider } from '@emotion/react';
import { theme } from './theme';

function App() {
  return (
    <Router base={process.env.PUBLIC_URL}>
      <ThemeProvider theme={theme}>
        <div className="App">
          <Header />
          <Route path="/">
            <HomePage />
          </Route>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
