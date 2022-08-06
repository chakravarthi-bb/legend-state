import { getNodeValue } from './globals';
import { isObjectEmpty } from './is';
import {
    ListenerFn,
    ListenerFnSaved,
    ObservableListenerDispose,
    OnReturnValue,
    ProxyValue,
} from './observableInterfaces';

const symbolHasValue = Symbol('__hasValue');

export function onEquals<T>(node: ProxyValue, value: T, callback: (value: T) => void): OnReturnValue<T> {
    let dispose: ObservableListenerDispose;

    const promise = new Promise<any>((resolve) => {
        let isDone = false;
        function check(newValue) {
            if (
                !isDone &&
                (value === (symbolHasValue as any)
                    ? // If value param is symbolHasValue, then this is from onHasValue so resolve if newValue is anything but undefined or empty object
                      newValue !== undefined && newValue !== null && !isObjectEmpty(newValue)
                    : newValue === value)
            ) {
                isDone = true;
                (callback as (value: T) => void)?.(newValue);
                resolve(newValue);

                dispose();
            }
            return isDone;
        }
        if (!check(getNodeValue(node))) {
            dispose = onChange(node, check, /*shallow*/ true);
        }
    });

    return {
        promise,
        dispose,
    };
}

export function onHasValue<T>(node: ProxyValue, callback: (value: T) => void): OnReturnValue<T> {
    return onEquals(node, symbolHasValue as any, callback);
}

export function onTrue<T extends boolean>(node: ProxyValue, callback?: () => void): OnReturnValue<T> {
    return onEquals(node, true as T, callback);
}

export function onChange(node: ProxyValue, callback: ListenerFnSaved<any>, shallow?: boolean) {
    if (shallow) {
        callback.shallow = true;
    }
    let listeners = node.listeners;
    if (!listeners) {
        listeners = new Set();
        node.listeners = listeners;
    }
    listeners.add(callback);

    return () => listeners.delete(callback);
}

export function onChangeShallow(node: ProxyValue, callback: ListenerFnSaved<any>) {
    return onChange(node, callback, /*shallow*/ true);
}
