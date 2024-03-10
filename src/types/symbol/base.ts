import { ISAProject, ISALexicalEnvironment, ISASourceFile, ISASymbol } from '../common';
import { v4 as uuid } from 'uuid';

export class SASymbol implements ISASymbol {
    readonly uuid: string;
    constructor(
        public readonly file: ISASourceFile,
        public readonly lexicalEnvironment: ISALexicalEnvironment,
        public readonly ctx: ISAProject,
    ) {
        this.uuid = uuid();
    }
}
