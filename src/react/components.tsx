import { isFunction } from '@legendapp/state';
import {
    ChangeEvent,
    createElement,
    CSSProperties,
    DetailedHTMLProps,
    forwardRef,
    InputHTMLAttributes,
    LegacyRef,
    ReactElement,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
    useCallback,
} from 'react';
import type { ObservableWriteable, Primitive } from '../observableInterfaces';
import { observer } from '@legendapp/state/react';

type Props<TValue, TProps> = Omit<TProps, 'className' | 'style'> & {
    className?: string | ((value: TValue) => string);
    style?: CSSProperties | ((value: TValue) => CSSProperties);
    bind?: ObservableWriteable<TValue>;
};

export const Binder = function <
    TValue extends Primitive,
    TElement,
    TProps extends { onChange?: any; value?: any; className?: string; style?: CSSProperties }
>(Component) {
    return observer(
        forwardRef(function Bound({ bind, ...props }: Props<TValue, TProps>, ref: LegacyRef<TElement>) {
            if (bind) {
                const { onChange, className, style } = props;

                // Set the bound value and forward onChange
                props.onChange = useCallback(
                    (e: ChangeEvent<HTMLInputElement>) => {
                        bind.set(e.target.value as any);
                        onChange?.(e);
                    },
                    [onChange]
                );

                // Get the bound value
                const value = (props.value = bind.get());

                // Call className if it's a function
                if (isFunction(className)) {
                    props.className = className(value);
                }
                // Call style if it's a function
                if (isFunction(style)) {
                    props.style = style(value);
                }
            }

            return createElement(Component as any, ref ? { ...props, ref } : props);
        }) as (props: Props<TValue, TProps>) => ReactElement | null
    );
};

export namespace LS {
    export const input = Binder<
        Primitive,
        HTMLInputElement,
        DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
    >('input');
    export const textarea = Binder<
        string,
        HTMLTextAreaElement,
        DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
    >('textarea');
    export const select = Binder<
        string,
        HTMLSelectElement,
        DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>
    >('select');
}
