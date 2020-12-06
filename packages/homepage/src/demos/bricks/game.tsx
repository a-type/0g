import * as r2d from 'r2d';
import { box2d } from '../../common/plugins';
import * as stores from './stores';

export const game = r2d.create(stores, { box2d });
