export * from './src/react/observer';
export * from './src/react/useComputed';
export * from './src/react/useObservable';
import type { ObservableBaseFns } from '@legendapp/state';
import type { ReactFragment } from 'react';

declare module '@legendapp/state' {
    export interface ObservablePrimitive<T = any> extends ObservableBaseFns<T>, ReactFragment {
        set?(value: T | ((prev: T) => T)): ObservablePrimitive<T>;
    }
}
