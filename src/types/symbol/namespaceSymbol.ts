import ts from 'typescript';
import { ISAProject, ISALexicalEnvironment, ISANamespaceSymbol, ISASourceFile } from '../common';
import { SASymbol } from './base';

export class SANamespaceSymbol extends SASymbol implements ISANamespaceSymbol {
    constructor(
        public readonly tsFile: ts.SourceFile,
        file: ISASourceFile,
        lexicalEnvironment: ISALexicalEnvironment,
        ctx: ISAProject,
    ) {
        super(file, lexicalEnvironment, ctx);
    }
}
