import * as React from 'react';
import { Game } from '0g';

export const gameContext = React.createContext<Game | null>(null);

export const GameProvider = gameContext.Provider;
