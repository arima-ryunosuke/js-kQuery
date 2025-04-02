/**!
 * kQuery
 *
 * @file
 * @license MIT
 * @copyright ryunosuke
 * @ignore
 */
import attribute from './src/events/attribute.js';
import child from './src/events/child.js';
import cookie from './src/events/cookie.js';
import disable from './src/events/disable.js';
import flick from './src/events/flick.js';
import intersect from './src/events/intersect.js';
import resize from './src/events/resize.js';
import swipe from './src/events/swipe.js';
import visible from './src/events/visible.js';
import {KQuery} from './src/KQuery.js';
import {autoproperties} from './src/plugins/@autoproperties.js';
import {events} from './src/plugins/@events.js';
import {attributes} from './src/plugins/attributes.js';
import {data} from './src/plugins/data.js';
import {dimensions} from './src/plugins/dimensions.js';
import {effects} from './src/plugins/effects.js';
import {forms} from './src/plugins/forms.js';
import {manipulation} from './src/plugins/manipulation.js';
import {miscellaneous} from './src/plugins/miscellaneous.js';
import {networks} from './src/plugins/networks.js';
import {traversing} from './src/plugins/traversing.js';

// documentation.js
/**
 * @typedef {EventTarget} EventTarget
 */
/**
 * @typedef {Window} Window
 */
/**
 * @typedef {Document} Document
 */
/**
 * @typedef {Document|DocumentFragment|Element} DocumentLikeElement
 */
/**
 * @typedef {Node} Node
 */
/**
 * @typedef {Element} Element
 */
/**
 * @typedef {HTMLElement} HTMLElement
 */
/**
 * @typedef {HTMLTemplateElement} HTMLTemplateElement
 */
/**
 * @typedef {HTMLStyleElement|HTMLLinkElement} HTMLStylableElement
 */
/**
 * @typedef {HTMLScriptElement} HTMLScriptElement
 */
/**
 * @typedef {HTMLAnchorElement} HTMLAnchorElement
 */
/**
 * @typedef {HTMLImageElement} HTMLImageElement
 */
/**
 * @typedef {HTMLDialogElement} HTMLDialogElement
 */
/**
 * @typedef {HTMLFormElement} HTMLFormElement
 */
/**
 * @typedef {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} HTMLInputLikeElement
 */
/**
 * @typedef {HTMLInputElement|RadioNodeList} HTMLInputCheckableElement
 */
/**
 * @typedef {HTMLInputElement} HTMLInputElement
 */
/**
 * @typedef {RadioNodeList} RadioNodeList
 */
/**
 * @typedef {FormData} FormData
 */
/**
 * @typedef {Blob} Blob
 */
/**
 * @typedef {DOMRectReadOnly} DOMRectReadOnly
 */
/**
 * @typedef {NodeList} NodeList
 */
/**
 * @typedef {FileList|NodeList|DataTransferItemList} List
 */

const instance = new KQuery(import.meta ?? document.currentScript);

instance.logger.time('register Plugins');
instance.extends(autoproperties);
instance.extends(events);
instance.extends(attributes);
instance.extends(data);
instance.extends(forms);
instance.extends(traversing);
instance.extends(manipulation);
instance.extends(dimensions);
instance.extends(effects);
instance.extends(networks);
instance.extends(miscellaneous);
instance.logger.timeEnd('register Plugins');

Object.assign(instance.customEvents, {attribute, child, cookie, disable, flick, intersect, resize, swipe, visible});

export default instance;
