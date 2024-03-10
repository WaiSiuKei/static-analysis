import { JSPrimitiveType } from '../../base/common/types';
import { ISAProject, ISALexicalEnvironment, ISAPrimitiveSymbol, ISASourceFile } from '../common';
import { SASymbol } from './base';

export class SAPrimitiveSymbol extends SASymbol implements ISAPrimitiveSymbol {
    constructor(
        public readonly value: JSPrimitiveType,
        file: ISASourceFile,
        lexicalEnvironment: ISALexicalEnvironment,
        ctx: ISAProject,
    ) {
        super(file, lexicalEnvironment, ctx);
    }
}
