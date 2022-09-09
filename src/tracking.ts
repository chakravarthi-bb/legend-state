import type { NodeValue, TrackingNode } from './observableInterfaces';

let lastNode: NodeValue;

export const tracking = {
    nodes: undefined as Map<number, TrackingNode>,
    listeners: undefined as (nodes: Map<number, TrackingNode>) => void,
    updates: undefined as (fn: () => void) => () => void,
};

export function updateTracking(node: NodeValue, track?: boolean | Symbol, manual?: boolean) {
    lastNode = node;
    const existing = tracking.nodes.get(node.id);
    if (existing) {
        existing.track = existing.track || track;
        existing.manual = existing.manual || manual;
        existing.num++;
    } else {
        tracking.nodes.set(node.id, { node, track, manual, num: 1 });
    }
}
