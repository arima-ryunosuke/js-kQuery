(function () {
    const kQuery = window.kQuery;

    kQuery.extends(function exampleplugin(kQuery) {
        // example: register custom event
        kQuery.customEvents.style = function (target, selector, options, trigger) {
            const nodes = new kQuery.API.WeakMap();
            setInterval(function () {
                for (const [node, oldvalue] of nodes.entries()) {
                    const newvalue = window.getComputedStyle(node).getPropertyValue(options.cssName);
                    if (oldvalue !== newvalue) {
                        nodes.set(node, newvalue);
                        trigger(node, {
                            cssName: options.cssName,
                            oldValue: oldvalue,
                            newValue: newvalue,
                        });
                    }
                }
            }, options.interval ?? 1000);
            return {
                eventId: options.cssName,
                handlers: {
                    insert: (node) => nodes.set(node, window.getComputedStyle(node).getPropertyValue(options.cssName)),
                    delete: (node) => nodes.delete(node),
                },
            };
        };

        return {
            // example: register custom prototype
            [[Element.name, kQuery.API.$NodeList.name]]: function () {
                return {
                    $show() {
                        return this.$toggle(true);
                    },
                    $hide() {
                        return this.$toggle(false);
                    },
                    $toggle(display) {
                        display ??= !this.checkVisibility();
                        if (display) {
                            this.classList.remove('kQuery-example-hidden');
                        }
                        else {
                            this.classList.add('kQuery-example-hidden');
                        }
                        return this;
                    },
                };
            }(),
        };
    });
})();
