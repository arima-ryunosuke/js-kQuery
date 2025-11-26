import {$FileList, $NodeList} from '../API.js';

/**
 * @param {KQuery} kQuery
 *
 * @ignore
 *
 * this is core, must not depend on other plugins.
 */
export function autoproperties(kQuery) {
    const ignoreProperties = {
        EventTarget: ["dispatchEvent"],
        Element: ["computedStyleMap", "elementTiming", "getInnerHTML", "onbeforecopy", "onbeforecut", "onbeforepaste", "onfullscreenchange", "onfullscreenerror", "onsearch", "scrollIntoViewIfNeeded"],
        HTMLAnchorElement: ["attributionSrc", "charset", "coords", "name", "rev", "shape"],
        HTMLAreaElement: ["noHref"],
        HTMLBRElement: ["clear"],
        HTMLBodyElement: ["aLink", "background", "bgColor", "link", "onafterprint", "onbeforeprint", "onbeforeunload", "onblur", "onerror", "onfocus", "onhashchange", "onlanguagechange", "onload", "onmessage", "onmessageerror", "onoffline", "ononline", "onpagehide", "onpageshow", "onpopstate", "onrejectionhandled", "onresize", "onscroll", "onstorage", "onunhandledrejection", "onunload", "text", "vLink"],
        HTMLDListElement: ["compact"],
        HTMLDirectoryElement: ["*"],
        HTMLDivElement: ["align"],
        HTMLElement: ["attributeStyleMap", "editContext", "onabort", "onanimationend", "onanimationiteration", "onanimationstart", "onauxclick", "onbeforeinput", "onbeforematch", "onbeforetoggle", "onbeforexrselect", "onblur", "oncancel", "oncanplay", "oncanplaythrough", "onchange", "onclick", "onclose", "oncommand", "oncontentvisibilityautostatechange", "oncontextlost", "oncontextmenu", "oncontextrestored", "oncopy", "oncuechange", "oncut", "ondblclick", "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange", "onemptied", "onended", "onerror", "onfocus", "onformdata", "ongotpointercapture", "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onload", "onloadeddata", "onloadedmetadata", "onloadstart", "onlostpointercapture", "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmousewheel", "onpaste", "onpause", "onplay", "onplaying", "onpointercancel", "onpointerdown", "onpointerenter", "onpointerleave", "onpointermove", "onpointerout", "onpointerover", "onpointerrawupdate", "onpointerup", "onprogress", "onratechange", "onreset", "onresize", "onscroll", "onscrollend", "onscrollsnapchange", "onscrollsnapchanging", "onsecuritypolicyviolation", "onseeked", "onseeking", "onselect", "onselectionchange", "onselectstart", "onslotchange", "onstalled", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle", "ontransitioncancel", "ontransitionend", "ontransitionrun", "ontransitionstart", "onvolumechange", "onwaiting", "onwheel", "virtualKeyboardPolicy", "writingSuggestions"],
        HTMLEmbedElement: ["align", "name"],
        HTMLFencedFrameElement: ["*"],
        HTMLFontElement: ["color", "face", "size"],
        HTMLFormElement: ["requestAutocomplete"],
        HTMLFrameElement: ["*"],
        HTMLFrameSetElement: ["cols", "onafterprint", "onbeforeprint", "onbeforeunload", "onblur", "onerror", "onfocus", "onhashchange", "onlanguagechange", "onload", "onmessage", "onmessageerror", "onoffline", "ononline", "onpagehide", "onpageshow", "onpopstate", "onrejectionhandled", "onresize", "onscroll", "onstorage", "onunhandledrejection", "onunload", "rows"],
        HTMLHRElement: ["align", "color", "noShade", "size", "width"],
        HTMLHeadingElement: ["align"],
        HTMLHtmlElement: ["version"],
        HTMLIFrameElement: ["adAuctionHeaders", "align", "allowPaymentRequest", "credentialless", "csp", "featurePolicy", "frameBorder", "longDesc", "marginHeight", "marginWidth", "privateToken", "sharedStorageWritable", "scrolling"],
        HTMLImageElement: ["align", "attributionSrc", "border", "fetchPriority", "hspace", "longDesc", "name", "sharedStorageWritable", "vspace"],
        HTMLInputElement: ["align", "incremental", "useMap", "webkitdirectory"],
        HTMLLIElement: ["type"],
        HTMLLegendElement: ["align"],
        HTMLLinkElement: ["charset", "blocking", "fetchPriority", "rev", "target"],
        HTMLMarqueeElement: ["*"],
        HTMLMediaElement: ["captureStream", "controller", "controlsList", "disableRemotePlayback", "mediaGroup", "onencrypted", "onwaitingforkey", "remote", "setSinkId", "sinkId"],
        HTMLMenuElement: ["compact"],
        HTMLMetaElement: ["scheme"],
        HTMLOListElement: ["compact"],
        HTMLObjectElement: ["align", "archive", "border", "code", "codeBase", "codeType", "declare", "hspace", "standby", "vspace"],
        HTMLParagraphElement: ["align"],
        HTMLParamElement: ["name", "type", "value", "valueType"],
        HTMLPreElement: ["width"],
        HTMLScriptElement: ["attributionSrc", "blocking", "charset", "event", "fetchPriority"],
        HTMLStyleElement: ["blocking", "type"],
        HTMLTableCaptionElement: ["align"],
        HTMLTableCellElement: ["align", "axis", "bgColor", "ch", "chOff", "height", "noWrap", "vAlign", "width"],
        HTMLTableColElement: ["align", "ch", "chOff", "span", "vAlign", "width"],
        HTMLTableElement: ["align", "bgColor", "border", "cellPadding", "cellSpacing", "frame", "rules", "summary", "width"],
        HTMLTableRowElement: ["align", "bgColor", "ch", "chOff", "vAlign"],
        HTMLTableSectionElement: ["align", "ch", "chOff", "vAlign"],
        HTMLUListElement: ["compact", "type"],
        HTMLVideoElement: ["cancelVideoFrameCallback", "onenterpictureinpicture", "onleavepictureinpicture", "playsInline", "requestPictureInPicture", "requestVideoFrameCallback"],
    };

    const targetProperties = {
        // https://developer.mozilla.org/docs/Web/API/Blob
        Blob: ["arrayBuffer", "size", "slice", "stream", "text", "type"],
        // https://developer.mozilla.org/docs/Web/API/Element
        Element: ["after", "animate", "append", "ariaActiveDescendantElement", "ariaAtomic", "ariaAutoComplete", "ariaBrailleLabel", "ariaBrailleRoleDescription", "ariaBusy", "ariaChecked", "ariaColCount", "ariaColIndex", "ariaColIndexText", "ariaColSpan", "ariaControlsElements", "ariaCurrent", "ariaDescribedByElements", "ariaDescription", "ariaDetailsElements", "ariaDisabled", "ariaErrorMessageElements", "ariaExpanded", "ariaFlowToElements", "ariaHasPopup", "ariaHidden", "ariaInvalid", "ariaKeyShortcuts", "ariaLabel", "ariaLabelledByElements", "ariaLevel", "ariaLive", "ariaModal", "ariaMultiLine", "ariaMultiSelectable", "ariaOrientation", "ariaPlaceholder", "ariaPosInSet", "ariaPressed", "ariaReadOnly", "ariaRelevant", "ariaRequired", "ariaRoleDescription", "ariaRowCount", "ariaRowIndex", "ariaRowIndexText", "ariaRowSpan", "ariaSelected", "ariaSetSize", "ariaSort", "ariaValueMax", "ariaValueMin", "ariaValueNow", "ariaValueText", "assignedSlot", "attachShadow", "attributes", "before", "checkVisibility", "childElementCount", "children", "classList", "className", "clientHeight", "clientLeft", "clientTop", "clientWidth", "closest", "currentCSSZoom", "firstElementChild", "getAnimations", "getAttribute", "getAttributeNS", "getAttributeNames", "getAttributeNode", "getAttributeNodeNS", "getBoundingClientRect", "getClientRects", "getElementsByClassName", "getElementsByTagName", "getElementsByTagNameNS", "getHTML", "hasAttribute", "hasAttributeNS", "hasAttributes", "hasPointerCapture", "id", "innerHTML", "insertAdjacentElement", "insertAdjacentHTML", "insertAdjacentText", "lastElementChild", "localName", "matches", "moveBefore", "namespaceURI", "nextElementSibling", "outerHTML", "part", "prefix", "prepend", "previousElementSibling", "querySelector", "querySelectorAll", "releasePointerCapture", "remove", "removeAttribute", "removeAttributeNS", "removeAttributeNode", "replaceChildren", "replaceWith", "requestFullscreen", "requestPointerLock", "role", "scroll", "scrollBy", "scrollHeight", "scrollIntoView", "scrollLeft", "scrollTo", "scrollTop", "scrollWidth", "setAttribute", "setAttributeNS", "setAttributeNode", "setAttributeNodeNS", "setHTMLUnsafe", "setPointerCapture", "shadowRoot", "slot", "tagName", "toggleAttribute"],
        // https://developer.mozilla.org/docs/Web/API/EventTarget
        EventTarget: ["addEventListener", "removeEventListener", "when"],
        // https://developer.mozilla.org/docs/Web/API/File
        File: ["lastModified", "lastModifiedDate", "name"],
        // https://developer.mozilla.org/docs/Web/API/HTMLAnchorElement
        HTMLAnchorElement: ["download", "hash", "host", "hostname", "href", "hreflang", "origin", "password", "pathname", "ping", "port", "protocol", "referrerPolicy", "rel", "relList", "search", "target", "text", "toString", "type", "username"],
        // https://developer.mozilla.org/docs/Web/API/HTMLAreaElement
        HTMLAreaElement: ["alt", "coords", "download", "hash", "host", "hostname", "href", "origin", "password", "pathname", "ping", "port", "protocol", "referrerPolicy", "rel", "relList", "search", "shape", "target", "toString", "username"],
        // https://developer.mozilla.org/docs/Web/API/HTMLBaseElement
        HTMLBaseElement: ["href", "target"],
        // https://developer.mozilla.org/docs/Web/API/HTMLButtonElement
        HTMLButtonElement: ["checkValidity", "command", "commandForElement", "disabled", "form", "formAction", "formEnctype", "formMethod", "formNoValidate", "formTarget", "labels", "name", "popoverTargetAction", "popoverTargetElement", "reportValidity", "setCustomValidity", "type", "validationMessage", "validity", "value", "willValidate"],
        // https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement
        HTMLCanvasElement: ["captureStream", "getContext", "height", "toBlob", "toDataURL", "transferControlToOffscreen", "width"],
        // https://developer.mozilla.org/docs/Web/API/HTMLDataElement
        HTMLDataElement: ["value"],
        // https://developer.mozilla.org/docs/Web/API/HTMLDataListElement
        HTMLDataListElement: ["options"],
        // https://developer.mozilla.org/docs/Web/API/HTMLDetailsElement
        HTMLDetailsElement: ["name", "open"],
        // https://developer.mozilla.org/docs/Web/API/HTMLDialogElement
        HTMLDialogElement: ["close", "closedBy", "open", "requestClose", "returnValue", "show", "showModal"],
        // https://developer.mozilla.org/docs/Web/API/HTMLElement
        HTMLElement: ["accessKey", "attachInternals", "autocapitalize", "autofocus", "blur", "click", "contentEditable", "dataset", "dir", "draggable", "enterKeyHint", "focus", "hidden", "hidePopover", "inert", "innerText", "inputMode", "isContentEditable", "lang", "nonce", "offsetHeight", "offsetLeft", "offsetParent", "offsetTop", "offsetWidth", "outerText", "popover", "showPopover", "spellcheck", "style", "tabIndex", "title", "togglePopover", "translate"],
        // https://developer.mozilla.org/docs/Web/API/HTMLEmbedElement
        HTMLEmbedElement: ["getSVGDocument", "height", "src", "type", "width"],
        // https://developer.mozilla.org/docs/Web/API/HTMLFieldSetElement
        HTMLFieldSetElement: ["checkValidity", "disabled", "elements", "form", "name", "reportValidity", "setCustomValidity", "type", "validationMessage", "validity", "willValidate"],
        // https://developer.mozilla.org/docs/Web/API/HTMLFormElement
        HTMLFormElement: ["acceptCharset", "action", "autocomplete", "checkValidity", "elements", "encoding", "enctype", "length", "method", "name", "noValidate", "rel", "relList", "reportValidity", "requestSubmit", "reset", "submit", "target"],
        // https://developer.mozilla.org/docs/Web/API/HTMLIFrameElement
        HTMLIFrameElement: ["allow", "allowFullscreen", "contentDocument", "contentWindow", "getSVGDocument", "height", "loading", "name", "referrerPolicy", "sandbox", "src", "srcdoc", "width"],
        // https://developer.mozilla.org/docs/Web/API/HTMLImageElement
        HTMLImageElement: ["alt", "complete", "crossOrigin", "currentSrc", "decode", "decoding", "height", "isMap", "loading", "lowsrc", "naturalHeight", "naturalWidth", "referrerPolicy", "sizes", "src", "srcset", "useMap", "width", "x", "y"],
        // https://developer.mozilla.org/docs/Web/API/HTMLInputElement
        HTMLInputElement: ["accept", "alt", "autocomplete", "checkValidity", "checked", "defaultChecked", "defaultValue", "dirName", "disabled", "files", "form", "formAction", "formEnctype", "formMethod", "formNoValidate", "formTarget", "height", "indeterminate", "labels", "list", "max", "maxLength", "min", "minLength", "multiple", "name", "pattern", "placeholder", "popoverTargetAction", "popoverTargetElement", "readOnly", "reportValidity", "required", "select", "selectionDirection", "selectionEnd", "selectionStart", "setCustomValidity", "setRangeText", "setSelectionRange", "showPicker", "size", "src", "step", "stepDown", "stepUp", "type", "validationMessage", "validity", "value", "valueAsDate", "valueAsNumber", "width", "willValidate"],
        // https://developer.mozilla.org/docs/Web/API/HTMLLIElement
        HTMLLIElement: ["value"],
        // https://developer.mozilla.org/docs/Web/API/HTMLLabelElement
        HTMLLabelElement: ["control", "form", "htmlFor"],
        // https://developer.mozilla.org/docs/Web/API/HTMLLegendElement
        HTMLLegendElement: ["form"],
        // https://developer.mozilla.org/docs/Web/API/HTMLLinkElement
        HTMLLinkElement: ["as", "crossOrigin", "disabled", "href", "hreflang", "imageSizes", "imageSrcset", "integrity", "media", "referrerPolicy", "rel", "relList", "sheet", "sizes", "type"],
        // https://developer.mozilla.org/docs/Web/API/HTMLMapElement
        HTMLMapElement: ["areas", "name"],
        // https://developer.mozilla.org/docs/Web/API/HTMLMediaElement
        HTMLMediaElement: ["addTextTrack", "autoplay", "buffered", "canPlayType", "controls", "crossOrigin", "currentSrc", "currentTime", "defaultMuted", "defaultPlaybackRate", "duration", "ended", "error", "load", "loop", "muted", "networkState", "pause", "paused", "play", "playbackRate", "played", "preload", "preservesPitch", "readyState", "seekable", "seeking", "src", "srcObject", "textTracks", "volume"],
        // https://developer.mozilla.org/docs/Web/API/HTMLMetaElement
        HTMLMetaElement: ["content", "httpEquiv", "media", "name"],
        // https://developer.mozilla.org/docs/Web/API/HTMLMeterElement
        HTMLMeterElement: ["high", "labels", "low", "max", "min", "optimum", "value"],
        // https://developer.mozilla.org/docs/Web/API/HTMLModElement
        HTMLModElement: ["cite", "dateTime"],
        // https://developer.mozilla.org/docs/Web/API/HTMLOListElement
        HTMLOListElement: ["reversed", "start", "type"],
        // https://developer.mozilla.org/docs/Web/API/HTMLObjectElement
        HTMLObjectElement: ["checkValidity", "contentDocument", "contentWindow", "data", "form", "getSVGDocument", "height", "name", "reportValidity", "setCustomValidity", "type", "useMap", "validationMessage", "validity", "width", "willValidate"],
        // https://developer.mozilla.org/docs/Web/API/HTMLOptGroupElement
        HTMLOptGroupElement: ["disabled", "label"],
        // https://developer.mozilla.org/docs/Web/API/HTMLOptionElement
        HTMLOptionElement: ["defaultSelected", "disabled", "form", "index", "label", "selected", "text", "value"],
        // https://developer.mozilla.org/docs/Web/API/HTMLOutputElement
        HTMLOutputElement: ["checkValidity", "defaultValue", "form", "htmlFor", "labels", "name", "reportValidity", "setCustomValidity", "type", "validationMessage", "validity", "value", "willValidate"],
        // https://developer.mozilla.org/docs/Web/API/HTMLProgressElement
        HTMLProgressElement: ["labels", "max", "position", "value"],
        // https://developer.mozilla.org/docs/Web/API/HTMLQuoteElement
        HTMLQuoteElement: ["cite"],
        // https://developer.mozilla.org/docs/Web/API/HTMLScriptElement
        HTMLScriptElement: ["async", "crossOrigin", "defer", "htmlFor", "integrity", "noModule", "referrerPolicy", "src", "text", "type"],
        // https://developer.mozilla.org/docs/Web/API/HTMLSelectElement
        HTMLSelectElement: ["add", "autocomplete", "checkValidity", "disabled", "form", "item", "labels", "length", "multiple", "name", "namedItem", "options", "remove", "reportValidity", "required", "selectedIndex", "selectedOptions", "setCustomValidity", "showPicker", "size", "type", "validationMessage", "validity", "value", "willValidate"],
        // https://developer.mozilla.org/docs/Web/API/HTMLSlotElement
        HTMLSlotElement: ["assign", "assignedElements", "assignedNodes", "name"],
        // https://developer.mozilla.org/docs/Web/API/HTMLSourceElement
        HTMLSourceElement: ["height", "media", "sizes", "src", "srcset", "type", "width"],
        // https://developer.mozilla.org/docs/Web/API/HTMLStyleElement
        HTMLStyleElement: ["disabled", "media", "sheet"],
        // https://developer.mozilla.org/docs/Web/API/HTMLTableCellElement
        HTMLTableCellElement: ["abbr", "cellIndex", "colSpan", "headers", "rowSpan", "scope"],
        // https://developer.mozilla.org/docs/Web/API/HTMLTableElement
        HTMLTableElement: ["caption", "createCaption", "createTBody", "createTFoot", "createTHead", "deleteCaption", "deleteRow", "deleteTFoot", "deleteTHead", "insertRow", "rows", "tBodies", "tFoot", "tHead"],
        // https://developer.mozilla.org/docs/Web/API/HTMLTableRowElement
        HTMLTableRowElement: ["cells", "deleteCell", "insertCell", "rowIndex", "sectionRowIndex"],
        // https://developer.mozilla.org/docs/Web/API/HTMLTableSectionElement
        HTMLTableSectionElement: ["deleteRow", "insertRow", "rows"],
        // https://developer.mozilla.org/docs/Web/API/HTMLTemplateElement
        HTMLTemplateElement: ["content", "shadowRootClonable", "shadowRootDelegatesFocus", "shadowRootMode", "shadowRootSerializable"],
        // https://developer.mozilla.org/docs/Web/API/HTMLTextAreaElement
        HTMLTextAreaElement: ["autocomplete", "checkValidity", "cols", "defaultValue", "dirName", "disabled", "form", "labels", "maxLength", "minLength", "name", "placeholder", "readOnly", "reportValidity", "required", "rows", "select", "selectionDirection", "selectionEnd", "selectionStart", "setCustomValidity", "setRangeText", "setSelectionRange", "textLength", "type", "validationMessage", "validity", "value", "willValidate", "wrap"],
        // https://developer.mozilla.org/docs/Web/API/HTMLTimeElement
        HTMLTimeElement: ["dateTime"],
        // https://developer.mozilla.org/docs/Web/API/HTMLTitleElement
        HTMLTitleElement: ["text"],
        // https://developer.mozilla.org/docs/Web/API/HTMLTrackElement
        HTMLTrackElement: ["default", "kind", "label", "readyState", "src", "srclang", "track"],
        // https://developer.mozilla.org/docs/Web/API/HTMLVideoElement
        HTMLVideoElement: ["disablePictureInPicture", "getVideoPlaybackQuality", "height", "poster", "videoHeight", "videoWidth", "width"],
        // https://developer.mozilla.org/docs/Web/API/Node
        Node: ["appendChild", "baseURI", "childNodes", "cloneNode", "compareDocumentPosition", "contains", "firstChild", "getRootNode", "hasChildNodes", "insertBefore", "isConnected", "isDefaultNamespace", "isEqualNode", "isSameNode", "lastChild", "lookupNamespaceURI", "lookupPrefix", "nextSibling", "nodeName", "nodeType", "nodeValue", "normalize", "ownerDocument", "parentElement", "parentNode", "previousSibling", "removeChild", "replaceChild", "textContent"],
    };
    const typeProperties = !kQuery.config.debug ? targetProperties : (function () {
        const result = Object.create(null);

        // collect
        for (const name of Object.keys(Object.getOwnPropertyDescriptors(globalThis))) {
            if (!name.match(/^((EventTarget)|(Blob|File)|(Node|Element)|(HTML.*Element))$/)) {
                continue;
            }

            const prototype = globalThis[name];
            for (const property in prototype.prototype) {
                // ignore CONSTANT
                if (property.toUpperCase() === property) {
                    continue;
                }
                // not standard
                if (property.match(/^(webkit|moz)[A-Z]/) || property.startsWith('onwebkit')) {
                    continue;
                }
                // only ownself
                if (!Object.prototype.hasOwnProperty.call(prototype.prototype, property)) {
                    continue;
                }
                // deprecated or on*event
                if (name in ignoreProperties && (ignoreProperties[name].includes(property) || ignoreProperties[name].includes('*'))) {
                    continue;
                }

                result[prototype.name] = (result[prototype.name] ?? new Set()).add(property);
            }
        }

        // unique/sort
        const result2 = {};
        for (const name of Object.keys(result).toSorted()) {
            result2[name] = [...result[name]].toSorted();
        }

        // export output
        kQuery.logger.debug(Object.keys(result2).map(name => `// https://developer.mozilla.org/docs/Web/API/${name}\n${name}: ${JSON.stringify(result2[name])},`).join('\n'));

        return result2;
    })();

    kQuery.config.configure({
        appendNative: true,
        resetNative: true,
    });

    // specials
    const defineProperties = kQuery.config.appendNative ? {
        [[Node.name]]: /** @lends Node.prototype */{
            /**
             * to HTML for debug or utility
             *
             * @return {String}
             */
            [Symbol.toPrimitive]() {
                return this.outerHTML ?? this.nodeValue ?? null;
            },
        },
        [[NodeList.name]]: /** @lends NodeList.prototype */{
            /**
             * to HTML for debug or utility
             *
             * @return {String}
             */
            [Symbol.toPrimitive]() {
                return [...this].join('');
            },
            /**
             * same as dispatchEvent for NodeList
             *
             * original dispatchEvent is fired only once sometimes. probably because the EventObject is consumed
             *
             * @param {Event} event
             * @return {Boolean[]}
             */
            dispatchEvent(event) {
                const result = [];
                for (const node of this) {
                    // clone Event
                    const newevent = new event.constructor(event.type, event);

                    result.push(node.dispatchEvent(newevent));
                }
                return result;
            },
        },
        [[RadioNodeList.name]]: /** @lends RadioNodeList.prototype */{
            /**
             * get name of RadioNodeList
             *
             * @descriptor get
             *
             * @return {?String}
             */
            get name() {
                return this[0]?.name;
            },
            /**
             * set name of RadioNodeList
             *
             * @descriptor set
             *
             * @param {String} name
             */
            set name(name) {
                // RadioNodeList is live collection, remove when renamed
                [...this].forEach(function (e) {
                    e.name = name;
                });
            },
        },
    } : {};

    const defineProperty = function (type, property, descriptor) {
        defineProperties[type] ??= {};
        Object.defineProperty(defineProperties[type], property, descriptor);
    };

    for (const [type, properties] of Object.entries(typeProperties)) {
        if (type in globalThis) {
            const prototype = globalThis[type].prototype;
            for (const property of properties) {
                const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
                if (descriptor) {
                    defineProperty(type, property, descriptor);

                    if (globalThis[type] === globalThis['EventTarget'] || prototype instanceof EventTarget) {
                        defineProperty($NodeList.name, property, descriptor);
                    }
                    if (globalThis[type] === globalThis['Node'] || prototype instanceof Node) {
                        defineProperty($NodeList.name, property, descriptor);
                    }
                    if (globalThis[type] === globalThis['Blob'] || prototype instanceof Blob) {
                        defineProperty($FileList.name, property, descriptor);
                    }
                }
            }
        }
    }

    return defineProperties;
}
