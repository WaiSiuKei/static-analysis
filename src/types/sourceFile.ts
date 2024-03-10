import path from 'node:path';
import ts, { isImportDeclaration, isStringLiteral, } from 'typescript';
import { DCHECK } from '../base/common/assert';
import { NOTREACHED } from '../base/common/notreached';
import { resolve } from '../resolver';
import { traverseChild } from '../utils/ts';
import { ISAProject, ISALexicalEnvironment, ISANamespaceSymbol, ISASourceFile, ISASymbol, } from './common';
import { SAModuleLexicalEnvironment } from './lexicalEnvironment/moduleLexicalEnvironment';

export class SASourceFile implements ISASourceFile {
    readonly deps: ISASourceFile[] = [];
    readonly moduleLexicalEnvironment: ISALexicalEnvironment;
    readonly exportedSymbols = new Map<string, ISASymbol>();
    private _namespaceSymbol: ISANamespaceSymbol | undefined;
    constructor(
        public readonly tsFile: ts.SourceFile,
        public readonly ctx: ISAProject,
    ) {
        this.moduleLexicalEnvironment = new SAModuleLexicalEnvironment(this.tsFile, undefined, this, this.ctx);
    }

    get fullFileName() {
        return path.join(this.ctx.cwd, this.tsFile.fileName);
    }

    get namespaceSymbol(): ISANamespaceSymbol {
        if (!this._namespaceSymbol) {
            this._namespaceSymbol = this.moduleLexicalEnvironment.createNameSpaceSymbol(this.tsFile);
        }
        return this._namespaceSymbol;
    }

    processModuleImport() {
        traverseChild(this.tsFile, n => {
            if (isImportDeclaration(n)) {
                const { moduleSpecifier, importClause } = n;
                if (isStringLiteral(moduleSpecifier)) {
                    const relativedPath = moduleSpecifier.text;
                    const fullPath = path.resolve(path.dirname(this.fullFileName), relativedPath);
                    const resolved = resolve(fullPath);
                    const f = this.ctx.files.get(resolved);
                    DCHECK(f);
                    this.deps.push(f);
                    return;
                } else {
                    NOTREACHED();
                }
            }
        });
    }
}
