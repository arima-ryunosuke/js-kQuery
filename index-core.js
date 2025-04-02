/**!
 * kQuery
 *
 * @file
 * @license MIT
 * @copyright ryunosuke
 * @ignore
 */
import {KQuery} from './src/KQuery.js';
import {autoproperties} from './src/plugins/@autoproperties.js';
import {events} from './src/plugins/@events.js';

const instance = new KQuery(import.meta ?? document.currentScript);

instance.logger.time('register Plugins');
instance.extends(autoproperties);
instance.extends(events);
instance.logger.timeEnd('register Plugins');

export default instance;
