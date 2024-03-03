import ts, { isTypeReferenceNode } from 'typescript';
import { Context, ISALexicalEnvironment, ISASourceFile, ISASymbol } from '../common';
import { v4 as uuid } from 'uuid';

export class SASymbol implements ISASymbol {
    readonly uuid: string;
    constructor(
        public readonly tsNode: ts.Node,
        public readonly file: ISASourceFile,
        public readonly lexicalEnvironment: ISALexicalEnvironment,
        public readonly ctx: Context,
    ) {
        this.uuid = uuid();
    }

    processDeps() {
        const toTraverse: Array<ts.Node> = [this.tsNode];
        while (toTraverse.length) {
            const n = toTraverse.shift()!;
            if (isTypeReferenceNode(n)) {
                console.log(n);
            } else {
                n.forEachChild((child) => toTraverse.push(child));
            }
        }
    }
}
