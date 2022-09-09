export type ObservableEventType = 'change' | 'changeShallow' | 'equals' | 'hasValue' | 'true';
export interface ListenerOptions {
    runImmediately?: boolean;
    shallow?: boolean;
    optimized?: boolean;
}

export interface ObservableBaseFns<T> {
    get?(track?: boolean | Symbol): T;
    prop?(track?: boolean | Symbol): Observable<T>;
    prop?<K extends keyof T>(prop: K, track?: boolean | Symbol): Observable<T[K]>;
    onChange?(cb: ListenerFn<T>, options?: ListenerOptions): ObservableListenerDispose;
}
export interface ObservablePrimitive<T = any> extends ObservableBaseFns<T> {
    set?(value: T | ((prev: T) => T)): ObservablePrimitive<T>;
}
export interface ObservableFns<T> extends ObservableBaseFns<T> {
    get?(track?: boolean | Symbol): T;
    get?<K extends keyof T>(key: K, track?: boolean | Symbol): T[K];
    prop?(track?: boolean | Symbol): ObservableObject<T>;
    prop?<K extends keyof T>(
        prop: K,
        track?: boolean | Symbol
    ): T[K] extends Primitive ? ObservablePrimitive<T[K]> : ObservableObject<T[K]>;
    set?(value: T | ((prev: T) => T)): Observable<T>;
    set?<K extends keyof T>(key: K, prev: T[K] | ((prev: T[K]) => T[K])): Observable<T[K]>;
    set?<V>(key: string | number, value: V): Observable<V>;
    assign?(value: T | Partial<T>): Observable<T>;
    delete?(): Observable<T>;
    delete?<K extends keyof T>(key: K | string | number): Observable<T>;
}
export interface ObservableComputedFns<T> {
    get(track?: boolean | Symbol): T;
    onChange(cb: ListenerFn<T>, options?: ListenerOptions): ObservableListenerDispose;
}
type ArrayOverrideFnNames = 'every' | 'some' | 'filter' | 'reduce' | 'reduceRight' | 'forEach' | 'map';
export interface ObservableArrayOverride<T> extends Omit<Array<T>, 'forEach' | 'map'> {
    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
}

export type ListenerFn<T = any> = (
    value: T,
    getPrevious: () => T,
    path: (string | number)[],
    valueAtPath: any,
    prevAtPath: any,
    obs: Observable
) => void;

type PrimitiveKeys<T> = Pick<T, { [K in keyof T]-?: T[K] extends Primitive ? K : never }[keyof T]>;
type NonPrimitiveKeys<T> = Pick<T, { [K in keyof T]-?: T[K] extends Primitive ? never : K }[keyof T]>;

type Recurse<T, K extends keyof T, TRecurse> = T[K] extends
    | Function
    | Map<any, any>
    | WeakMap<any, any>
    | Set<any>
    | WeakSet<any>
    | Promise<any>
    ? T[K]
    : T[K] extends Primitive
    ? T[K] & ObservablePrimitive<T[K]>
    : T[K] extends Array<any>
    ? Omit<T[K], ArrayOverrideFnNames> & ObservableFns<T[K]> & ObservableArrayOverride<ObservableObject<T[K][number]>>
    : T extends object
    ? TRecurse
    : T[K];

type ObservableFnsRecursive<T> = {
    [K in keyof T]: Recurse<T, K, ObservableObject<T[K]>>;
};
type ObservableComputedFnsRecursive<T> = {
    [K in keyof T]: Recurse<T, K, ObservableComputedFns<T[K]>>;
};
type ObservableFnsRecursiveSafe<T> = {
    readonly [K in keyof T]: Recurse<T, K, ObservableObjectSafe<T[K]>>;
};
type ObservableFnsRecursiveDefaultObject<T> = {
    readonly [K in keyof T]: Recurse<T, K, ObservableObjectDefault<T[K]>>;
};
type PrimitiveChildren<T> = {
    [K in keyof T]: T[K] & ObservablePrimitive<T[K]>;
};
type ObservableFnsRecursiveDefault<T> = ObservableFnsRecursiveDefaultObject<NonPrimitiveKeys<T>> &
    PrimitiveChildren<PrimitiveKeys<T>>;

export interface ObservableEvent {
    dispatch(): void;
    on(cb?: () => void): ObservableListenerDispose;
    on(eventType: 'change', cb?: () => void): ObservableListenerDispose;
    get(): void;
}

export type QueryByModified<T> =
    | boolean
    | '*'
    | { '*': '*' | true }
    | {
          [K in keyof T]?: QueryByModified<T[K]>;
      };

export interface PersistOptionsRemote<T = any> {
    readonly?: boolean;
    once?: boolean;
    requireAuth?: boolean;
    saveTimeout?: number;
    adjustData?: {
        load: (value: any, basePath: string) => Promise<any>;
        save: (value: any, basePath: string, path: string[]) => Promise<any>;
    };
    firebase?: {
        syncPath: (uid: string) => `/${string}/`;
        fieldTransforms?: SameShapeWithStrings<T>;
        queryByModified?: QueryByModified<T>;
        ignoreKeys?: Record<string, true>;
    };
}
export interface PersistOptions<T = any> {
    local?: string;
    remote?: PersistOptionsRemote<T>;
    persistLocal?: ClassConstructor<ObservablePersistLocal>;
    persistRemote?: ClassConstructor<ObservablePersistRemote>;
    dateModifiedKey?: string;
}

export interface ObservablePersistLocal {
    get<T = any>(path: string): T;
    set(path: string, value: any): Promise<void>;
    delete(path: string): Promise<void>;
    load?(path: string): Promise<void>;
}
export interface ObservablePersistLocalAsync extends ObservablePersistLocal {
    preload(path: string): Promise<void>;
}
export interface ObservablePersistRemote {
    save<T>(
        options: PersistOptions<T>,
        value: T,
        getPrevious: () => T,
        path: (string | number)[],
        valueAtPath: any,
        prevAtPath: any
    ): Promise<T>;
    listen<T>(
        obs: ObservableReadable<T>,
        options: PersistOptions<T>,
        onLoad: () => void,
        onChange: (obs: ObservableReadable<T>, value: any) => void
    );
}

export interface ObservablePersistState {
    isLoadedLocal: boolean;
    isLoadedRemote: boolean;
    clearLocal: () => Promise<void>;
}
export type RecordValue<T> = T extends Record<string, infer t> ? t : never;
export type ArrayValue<T> = T extends Array<infer t> ? t : never;

// This converts the state object's shape to the field transformer's shape
// TODO: FieldTransformer and this shape can likely be refactored to be simpler
type SameShapeWithStringsRecord<T> = {
    [K in keyof Omit<T, '_id' | 'id'>]-?: T[K] extends Record<string, Record<string, any>>
        ?
              | {
                    _: string;
                    __obj: SameShapeWithStrings<RecordValue<T[K]>> | SameShapeWithStrings<T[K]>;
                }
              | {
                    _: string;
                    __dict: SameShapeWithStrings<RecordValue<T[K]>>;
                }
              | SameShapeWithStrings<T[K]>
        : T[K] extends Array<infer t>
        ?
              | {
                    _: string;
                    __arr: SameShapeWithStrings<t> | Record<string, string>;
                }
              | string
        : T[K] extends Record<string, object>
        ?
              | (
                    | {
                          _: string;
                          __obj: SameShapeWithStrings<RecordValue<T[K]>> | SameShapeWithStrings<T[K]>;
                      }
                    | { _: string; __dict: SameShapeWithStrings<RecordValue<T[K]>> }
                )
              | string
        : T[K] extends Record<string, any>
        ?
              | ({ _: string; __obj: SameShapeWithStrings<T[K]> } | { _: string; __dict: SameShapeWithStrings<T[K]> })
              | string
        : string | { _: string; __val: Record<string, string> };
};
type SameShapeWithStrings<T> = T extends Record<string, Record<string, any>>
    ? { __dict: SameShapeWithStrings<RecordValue<T>> } | SameShapeWithStringsRecord<T>
    : SameShapeWithStringsRecord<T>;

export interface OnReturnValue<T> {
    promise: Promise<T>;
    dispose: ObservableListenerDispose;
}

export type ClassConstructor<I, Args extends any[] = any[]> = new (...args: Args) => I;
export type ObservableListenerDispose = () => void;

export interface ObservableWrapper {
    _: any;
    isPrimitive: boolean;
    safeMode: 0 | 1 | 2;
    locked?: boolean;
}

export type Primitive = boolean | string | number | Date;
export type NotPrimitive<T> = T extends Primitive ? never : T;

export type ObservableObject<T = any> = ObservableFnsRecursive<T> & ObservableFns<T>;
export type ObservableObjectSafe<T = any> = ObservableFnsRecursiveSafe<T> & ObservableFns<T>;
export type ObservableObjectDefault<T = any> = ObservableFnsRecursiveDefault<T> & ObservableFns<T>;
// export type ObservableChild<T = any> = [T] extends [Primitive] ? ObservablePrimitive<T> : ObservableObject<T>;
// export type ObservableRef<T = any> = [T] extends [Primitive] ? ObservablePrimitive<T> : ObservableObject<T>;
export type ObservableObjectOrPrimitive<T> = [T] extends [Primitive] ? ObservablePrimitive<T> : ObservableObject<T>;
export type ObservableObjectOrPrimitiveSafe<T> = [T] extends [Primitive]
    ? ObservablePrimitive<T>
    : ObservableObjectSafe<T>;
export type ObservableObjectOrPrimitiveDefault<T> = [T] extends [Primitive]
    ? ObservablePrimitive<T>
    : ObservableObjectDefault<T>;
export type ObservableComputed<T = any> = ObservableComputedFns<T> &
    ObservableComputedFnsRecursive<T> &
    ([T] extends [Primitive] ? Omit<ObservablePrimitive<T>, 'set'> : T);

export type Observable<T = any> = ObservablePrimitive<T> | ObservableFns<T>;
export type ObservableReadable<T = any> = ObservableFns<T> | ObservableComputed<T> | ObservablePrimitive<T>;
// | ObservableRef<T>;
export type ObservableWriteable<T = any> = ObservableFns<T> | ObservablePrimitive<T>; // | ObservableRef<T>;

export interface NodeValue {
    id: number;
    parent: NodeValue;
    children?: Map<string | number, NodeValue>;
    proxy?: ObservableObject;
    key: string | number;
    root: ObservableWrapper;
    listeners?: Map<string, ListenerFn>;
}

/** @internal */
export interface TrackingNode {
    node: NodeValue;
    track?: boolean | Symbol;
    manual?: boolean;
    num?: number;
}
