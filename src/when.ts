import { isObservable } from './helpers';
import type { Observable } from './observableInterfaces';
import { effect as observableEffect } from './effect';
import { isFunction } from './is';

interface Options {
    repeat?: boolean;
}

export function when(predicate: Observable | (() => any)): Promise<void>;
export function when(
    predicate: Observable | (() => any),
    effect: () => void | (() => void),
    options?: Options
): () => void;
export function when(predicate: Observable | (() => any), effect?: () => void | (() => void), options?: Options) {
    let cleanup: () => void;
    let isDone = false;

    // Create a wrapping fn that calls the effect if predicate returns true
    const fn = function () {
        let ret = predicate;
        // Unwrap predicate if it's a function
        if (isFunction(ret)) {
            ret = ret();
        }
        // Unwrap predicate if it's a primitive
        ret = isObservable(ret) ? ret.get() : ret;
        if (ret) {
            // If value is truthy then run the effect and cleanup
            if (!options?.repeat) {
                isDone = true;
            }
            effect();
            if (isDone) {
                cleanup?.();
            }
        }
    };

    // If no effect parameter return a promise
    const promise =
        !effect &&
        new Promise<void>((resolve) => {
            effect = resolve;
        });

    // Create an effect for the fn
    cleanup = observableEffect(fn);

    // If it's already cleanup
    if (isDone) {
        cleanup();
    }

    return promise || cleanup;
}
