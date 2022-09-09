import { lockEdits } from './helpers';
import { effect } from './effect';
import { observable } from './observable';
import { Observable, ObservableComputed } from './observableInterfaces';

export function computed<T>(compute: () => T): ObservableComputed<T> {
    // Create an observable for this computed variable set to the initial value
    let obs: Observable;

    const fn = function () {
        const val = compute();
        if (obs) {
            // Update the computed value
            lockEdits(obs, false);
            obs.set(val);
            lockEdits(obs, true);
        } else {
            // Create the observable on the first run
            obs = observable(val as any);
            lockEdits(obs, true);
        }
    };

    effect(fn);

    return obs as unknown as ObservableComputed<T>;
}
