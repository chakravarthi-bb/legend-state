import { tracking } from './state';
import { isArray, isFunction, isPrimitive } from './is';
import { ObservableCheckerRender, ProxyValue } from './observableInterfaces';

export const delim = '\uFEFF';

export const symbolDateModified = Symbol('dateModified');
export const symbolShallow = Symbol('shallow');
export const symbolShouldRender = Symbol('shouldRender');
export const symbolGet = Symbol('get');
export const symbolIsObservable = Symbol('isObservable');

export function getNodeValue(node: ProxyValue): any {
    let child = node.root._;
    let parent = child;
    const arr = node.path.split(delim);
    // let path = '_';
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        if (key !== undefined && child) {
            if (isArray(child)) {
                const path = arr.slice(0, i).join(delim);
                const arrayIDMap = node.root.arrayIDMaps.get(path);
                if (arrayIDMap) {
                    const k = arrayIDMap.get(key) ?? arrayIDMap.get(+key);
                    if (k !== undefined) key = k as any;
                }
            }
            // const key = isArray(parent) &&
            child = child[key];
            parent = child;

            // path += delim + arr[i];
        }
    }
    return child;
}

export function getParentNode(node: ProxyValue): { parent: ProxyValue; key: string | number } {
    if (node.path === '_') return { parent: node, key: undefined };
    const parent = node.root.proxyValues.get(node.pathParent);
    return { parent, key: node.key };
}

export function getChildNode(node: ProxyValue, key: string | number): ProxyValue {
    const path = node.path + delim + key;
    let child = node.root.proxyValues.get(path);
    if (!child) {
        // console.log('creating child', node.path, key);
        child = {
            root: node.root,
            path: node.path + delim + key,
            // arr: node.arr.concat(key),
            // arrParent: node.arr,
            pathParent: node.path,
            key,
        };
        node.root.proxyValues.set(path, child);
    }

    return child;
}

export function getObservableRawValue<T>(obs: ObservableCheckerRender<T>): T {
    if (!obs || isPrimitive(obs)) return obs as T;
    if (isFunction(obs)) return obs();

    const shallow = obs?.[symbolShallow];
    if (shallow) {
        tracking.shallow = true;
        obs = shallow;
    }
    let ret = obs?.[symbolGet];

    tracking.should = undefined;
    tracking.shallow = false;

    return ret;
}
