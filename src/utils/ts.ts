import ts from 'typescript';

type TraverseCallback = (n: ts.Node,
                         control: { stop(): void }) => void;
export function traverseDeep(node: ts.Node,
                             cb: TraverseCallback) {
    const toTraverse: Array<ts.Node> = [];
    node.forEachChild((child) => toTraverse.push(child));
    const control = {
        stoped: false,
        stop() {
            this.stoped = true;
        }
    };
    while (toTraverse.length) {
        const n = toTraverse.shift()!;
        cb(n, control);
        n.forEachChild(child => toTraverse.push(child));
        if (control.stoped) return;
    }
}

export function traverseChild(node: ts.Node,
                              cb: TraverseCallback) {
    const toTraverse: Array<ts.Node> = [];
    node.forEachChild((child) => toTraverse.push(child));
    const control = {
        stoped: false,
        stop() {
            this.stoped = true;
        }
    };
    while (toTraverse.length) {
        const n = toTraverse.shift()!;
        cb(n, control);
        if (control.stoped) return;
    }
}
