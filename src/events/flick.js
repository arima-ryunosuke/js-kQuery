import {Vector2} from '../API.js';

export default class {
    constructor(target, selector, options, trigger) {
        options.buttons ??= 1;
        this.starting = false;
        this.vectors = [];

        this.down = (e) => {
            e.target.setPointerCapture(e.pointerId);

            this.starting = true;
            this.vectors.splice(0);
        };
        this.move = (e) => {
            if ((e.buttons & options.buttons) && this.starting) {
                this.vectors.push(new Vector2(e.offsetX, e.offsetY, e.timeStamp));
            }
        };
        this.up = (e) => {
            e.target.releasePointerCapture(e.pointerId);

            if (this.starting) {
                this.starting = false;
                if (this.vectors.length === 0) {
                    return;
                }

                const threshold = options.threshold ?? 50;

                const currentVenctor = new Vector2(e.offsetX, e.offsetY, e.timeStamp);
                const startIndex = 1 + this.vectors.findLastIndex((v) => v.during(currentVenctor) > threshold);
                const firstVector = this.vectors[startIndex];

                const vectors = this.vectors.slice(startIndex);
                const distance = vectors.slice(0, -1).reduce((acc, v, i) => acc + vectors[i].distance(vectors[i + 1]), 0);
                if (distance === 0) {
                    return;
                }

                this.vectors.splice(0);
                trigger(e.target, {
                    velocity: distance / firstVector.during(currentVenctor),
                    degree: firstVector.degree(currentVenctor),
                    during: firstVector.during(currentVenctor),
                }, {$original: e, bubbles: true});
            }
        };
        this.cancel = (e) => {
            e.target.releasePointerCapture(e.pointerId);

            this.starting = false;
            this.vectors.splice(0);
        };

        target.addEventListener('pointerdown', this.down);
        target.addEventListener('pointercancel', this.cancel);
        target.addEventListener('pointermove', this.move);
        target.addEventListener('pointerup', this.up);
    }

    destructor(target) {
        target.removeEventListener('pointerdown', this.down);
        target.removeEventListener('pointercancel', this.cancel);
        target.removeEventListener('pointermove', this.move);
        target.removeEventListener('pointerup', this.up);
    }
}
