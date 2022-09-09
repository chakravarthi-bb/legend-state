import { effect, setupTracking, tracking } from '@legendapp/state';
import { useEffect } from 'react';
import { useForceRender } from './useForceRender';

export function useComputed(selector: () => void) {
    let inRender = true;
    let rendered;
    let cachedNodes;

    const forceRender = useForceRender();

    const update = function () {
        if (inRender) {
            // If rendering, run and return the component
            rendered = selector();
        } else {
            // If not rendering, this is from observable changing so trigger a render
            forceRender();
        }
        inRender = false;

        // Workaround for React 18's double calling useEffect - cached the tracking nodes
        if (process.env.NODE_ENV === 'development') {
            cachedNodes = tracking.nodes;
        }
    };

    let dispose = effect(update);

    if (process.env.NODE_ENV === 'development') {
        useEffect(() => {
            // Workaround for React 18's double calling useEffect. If this is the
            // second useEffect, set up tracking again.
            if (dispose === undefined) {
                dispose = setupTracking(cachedNodes, update);
            }
            return () => {
                dispose();
                dispose = undefined;
            };
        });
    } else {
        // Return dispose to cleanup before each render or unmount
        useEffect(() => dispose);
    }

    return rendered;
}
