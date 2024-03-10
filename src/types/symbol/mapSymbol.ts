import { ISAProject, ISALexicalEnvironment, ISACollectionSymbol, ISASourceFile, ISASymbol } from '../common';
import { SASymbol } from './base';

export class SACollectionSymbol extends SASymbol implements ISACollectionSymbol {
    constructor(
        public readonly collection: { [key: string | number | symbol]: ISASymbol },
        file: ISASourceFile,
        lexicalEnvironment: ISALexicalEnvironment,
        ctx: ISAProject,
    ) {
        super(file, lexicalEnvironment, ctx);
    }
}
