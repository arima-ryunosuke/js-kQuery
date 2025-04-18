import {Vector2} from '../API.js';

export default class {
    constructor(target, selector, options, trigger) {
        options.buttons ??= 1;
        this.firstVector = null;

        this.down = (e) => {
            e.target.setPointerCapture(e.pointerId);

            this.firstVector = new Vector2(e.offsetX, e.offsetY, e.timeStamp);
        };
        this.move = (e) => {
            if ((e.buttons & options.buttons) && this.firstVector) {
                const currentVector = new Vector2(e.offsetX, e.offsetY, e.timeStamp);
                const distance = this.firstVector.distance(currentVector);
                if (distance !== 0) {
                    trigger(e.target, {
                        distance: distance,
                        deltaX: this.firstVector.deltaX(currentVector),
                        deltaY: this.firstVector.deltaY(currentVector),
                        velocity: this.firstVector.velocity(currentVector),
                        degree: this.firstVector.degree(currentVector),
                        during: this.firstVector.during(currentVector),
                    }, {$original: e, bubbles: true});
                }
            }
        };
        this.up = (e) => {
            e.target.releasePointerCapture(e.pointerId);

            this.firstVector = null;
        };
        this.cancel = (e) => {
            e.target.releasePointerCapture(e.pointerId);

            this.firstVector = null;
        };

        target.addEventListener('pointerdown', this.down);
        target.addEventListener('pointermove', this.move);
        target.addEventListener('pointerup', this.up);
        target.addEventListener('pointercancel', this.cancel);
    }

    destructor(target) {
        target.removeEventListener('pointerdown', this.down);
        target.removeEventListener('pointermove', this.move);
        target.removeEventListener('pointerup', this.up);
        target.removeEventListener('pointercancel', this.cancel);
    }
}
