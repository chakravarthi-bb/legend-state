import { onChange } from './onChange';
import { getNodeValue } from './globals';
import { set } from './observable';
import { ListenerFn, ListenerOptions, NodeValue, ObservableListenerDispose } from './observableInterfaces';
import { updateTracking, tracking } from './tracking';

export class ObservablePrimitiveClass {
    constructor(proxy) {
        return proxy;
    }
}

// export class ObservablePrimitive<T = any> {
//     #node: NodeValue;

//     constructor(node: NodeValue) {
//         this.#node = node;
//         this.set = this.set.bind(this);
//     }
//     get value() {
//         const node = this.#node;
//         if (tracking.nodes) {
//             updateTracking(node);
//         }
//         const value = getNodeValue(node);
//         return node.root.isPrimitive ? value.value : value;
//     }
//     set value(value: T) {
//         set(this.#node, value);
//     }
//     get(): T {
//         return this.value;
//     }
//     set(value: T | ((prev: T) => T)) {
//         set(this.#node, value);
//         return this;
//     }
//     onChange(cb: ListenerFn<T>, options?: ListenerOptions): ObservableListenerDispose {
//         return onChange(this.#node, cb, options);
//     }
//     /** @internal */
//     getNode() {
//         return this.#node;
//     }
// }
