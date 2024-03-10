import ts, { isImportSpecifier } from 'typescript';
import { NOTIMPLEMENTED } from '../../base/common/notreached';
import { ISAProject, ISAAliasSymbol, ISALexicalEnvironment, ISASourceFile, ISASymbol } from '../common';
import { SASymbol } from './base';

export class SAAliasSymbol extends SASymbol implements ISAAliasSymbol {
    constructor(
        public alias: string,
        public origin: ISASymbol,
        file: ISASourceFile,
        lexicalEnvironment: ISALexicalEnvironment,
        ctx: ISAProject,
    ) {
        super(file, lexicalEnvironment, ctx);
    }
}
