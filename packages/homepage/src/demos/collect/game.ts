import * as stores from './stores';
import * as r2d from 'r2d';
import { box2d, pixi } from '../../common/plugins';

export const game = r2d.create(stores, { box2d, pixi });
