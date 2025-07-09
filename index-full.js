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

// code completion
/**
 * @typedef {{
 *     url?: String,
 *     target?: String,
 *     window?: Boolean,
 *     left?: String|Number,
 *     top?: String|Number,
 *     width?: String|Number,
 *     height?: String|Number,
 *     noopener?: String,
 *     noreferrer?: String,
 * }} WindowOpenOptions
 * @ignore
 * @preserve
 */
/**
 * @typedef {(url:String, options?:RequestInit) => Promise<Response>} HttpRequest
 * @ignore
 * @preserve
 */
/**
 * @typedef {{
 *     head: HttpRequest,
 *     get: HttpRequest,
 *     post: HttpRequest,
 *     put: HttpRequest,
 *     patch: HttpRequest,
 *     delete: HttpRequest,
 * }} HttpMethods
 * @ignore
 * @preserve
 */
/**
 * @typedef {{
 *     credentials?: Boolean,
 * }} ListenOptions
 * @ignore
 * @preserve
 */
/**
 * @typedef {{
 *     interval?: Number,
 *     invisible?: Boolean,
 *     retry?: String[],
 *     status?: Number[],
 * }} PollingOptions
 * @ignore
 * @preserve
 */
/**
 * @typedef {{
 *     async?: Boolean,
 *     form?: HTMLFormElement,
 *     method?: String,
 *     enctype?: String,
 *     novalidate?: Boolean,
 *     data?: Dictionary,
 * }} SubmitOptions
 * @ignore
 * @preserve
 */
/**
 * @typedef {{
 *     url?: String,
 *     method?: String,
 *     enctype?: String,
 *     novalidate?: Boolean,
 *     submitter?: HTMLElement,
 *     data?: Dictionary,
 *     fileConverter?: String|Function,
 *     timeout?: Number,
 * }} RequestOptions
 * @ignore
 * @preserve
 */
/**
 * @typedef {{
 *     once?: Boolean,
 *     capture?: Boolean,
 *     passive?: Boolean,
 *     signal?: AbortSignal,
 *     ownself: Boolean,
 *     interval: Number,
 *     throttle: Number,
 *     debounce: Number,
 *     leading: Boolean,
 *     trailing: Boolean,
 * }} ListenerOptions
 * @ignore
 * @preserve
 */
/**
 * @typedef {{
 *     bubbles?: Boolean,
 *     cancelable?: Boolean,
 *     composed?: Boolean,
 * }} EventOptions
 * @ignore
 * @preserve
 */
/**
 * @typedef {{
 *     initial?: Object,
 *     reset?: Boolean,
 *     duration?: Number,
 *     timing?: String,
 * }} TransitionOptions
 * @ignore
 * @preserve
 */
/**
 * @typedef {{
 *   relative?: Boolean,
 *   margin?: Boolean,
 * }} OffsetOptions
 * @ignore
 * @preserve
 */
/**
 * @typedef {{
 *     scroll?: Boolean,
 *     margin?: Boolean,
 *     border?: Boolean,
 *     padding?: Boolean,
 *     scrollbar?: Boolean,
 * }} SizeOptions
 * @ignore
 * @preserve
 */
/**
 * @typedef {{
 *     document?: Boolean,
 *     contentVisibilityAuto?: Boolean,
 *     contentVisibilityProperty?: Boolean,
 *     opacityProperty?: Boolean,
 *     visibilityProperty?: Boolean,
 *     size?: Boolean,
 *     intersection?: Boolean,
 * }} VisibilityOptions
 * @ignore
 * @preserve
 */
/**
 * @typedef {{
 *     outside?: Boolean,
 *     escape?: Boolean,
 * }} DialogModelOptions
 * @ignore
 * @preserve
 */
/**
 * @typedef {Object|Dictionary} Dictionary
 * @ignore
 * @preserve
 */

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
 * @typedef {HTMLSelectElement|HTMLDataListElement} HTMLOptionableElement
 */
/**
 * @typedef {HTMLSelectElement} HTMLSelectElement
 */
/**
 * @typedef {RadioNodeList} RadioNodeList
 */
/**
 * @typedef {URL} URL
 */
/**
 * @typedef {URLSearchParams} URLSearchParams
 */
/**
 * @typedef {FormData} FormData
 */
/**
 * @typedef {Blob} Blob
 */
/**
 * @typedef {Storage} Storage
 */
/**
 * @typedef {DOMRectReadOnly} DOMRectReadOnly
 */
/**
 * @typedef {FileList} FileList
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
