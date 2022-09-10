import { isFunction } from '@legendapp/state';
import { createElement, forwardRef, LegacyRef, ReactElement, useCallback } from 'react';
import {
    NativeSyntheticEvent,
    StyleProp,
    Switch as RNSwitch,
    SwitchChangeEvent,
    SwitchProps,
    TextInput as RNTextInput,
    TextInputChangeEventData,
    TextInputProps,
    TextStyle,
    ViewStyle,
} from 'react-native';
import { ObservableObject, ObservableWriteable, Primitive } from '../observableInterfaces';
import { observer } from '../react/observer';

type Props<TValue, TStyle, TProps> = Omit<TProps, 'style'> & {
    bind?: ObservableWriteable<TValue>;
    style?: StyleProp<TStyle> | ((value: TValue) => StyleProp<TStyle>);
};

export const Binder = function <
    TValue extends Primitive,
    TElement,
    TStyle,
    TProps extends { onChange?: any; style?: StyleProp<any> }
>(Component: TElement, getValue: (p: any) => TValue) {
    return observer(
        forwardRef(function Bound({ bind, ...props }: Props<TValue, TStyle, TProps>, ref: LegacyRef<TElement>) {
            if (bind) {
                const { onChange, style } = props;

                // Set the bound value and forward onChange
                props.onChange = useCallback(
                    (e) => {
                        bind.set(getValue(e));
                        onChange?.(e);
                    },
                    [onChange]
                );

                // Get the bound value
                const value = bind.get();

                // Call style if it's a function
                if (isFunction(style)) {
                    props.style = style(value);
                }
            }

            return createElement(Component as any, ref ? { ...props, ref } : props);
        })
        // TS hack because forwardRef messes with the templating
    ) as any as (props: Props<TValue, TStyle, TProps>) => ReactElement | null;
};

export namespace LS {
    export const TextInput = Binder<Primitive, typeof RNTextInput, TextStyle, TextInputProps>(
        RNTextInput,
        (e: NativeSyntheticEvent<TextInputChangeEventData>) => e.nativeEvent.text
    );
    export const Switch = Binder<Primitive, typeof RNSwitch, ViewStyle, SwitchProps>(
        RNSwitch,
        (e: SwitchChangeEvent) => e.value
    );
}
