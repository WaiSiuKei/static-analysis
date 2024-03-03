import path from 'node:path';
import ts, { isImportDeclaration, isInterfaceDeclaration, isNamedImports, isNamespaceImport, isStringLiteral } from 'typescript';
import { DCHECK } from '../base/common/assert';
import { NOTIMPLEMENTED, NOTREACHED } from '../base/common/notreached';
import { resolve } from '../resolver';
import { Context, ISANamespaceSymbol, ISASourceFile } from './common';
import { SALexicalEnvironment } from './lexicalEnvironment';
import { SASymbol } from './symbol/base';
import { SANamespaceSymbol } from './symbol/namespaceSymbol';

export class SASourceFile implements ISASourceFile {
    readonly deps: ISASourceFile[] = [];
    readonly asyncDeps: ISASourceFile[] = [];
    readonly rootLexicalEnvironment = new SALexicalEnvironment();
    readonly exportedSymbols = new Map<string, SASymbol>();
    private _namespaceSymbol: ISANamespaceSymbol | undefined;
    constructor(
        public readonly tsFile: ts.SourceFile,
        public readonly ctx: Context,
    ) {
    }

    get fullFileName() {
        return path.join(this.ctx.cwd, this.tsFile.fileName);
    }

    get namespaceSymbol(): ISANamespaceSymbol {
        if (!this._namespaceSymbol) {
            this._namespaceSymbol = new SANamespaceSymbol(this.tsFile, this, this.rootLexicalEnvironment, this.ctx);
        }
        return this._namespaceSymbol;
    }

    processModuleImport() {
        this.traverse(n => {
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

    processSymbolImport() {
        this.traverse(n => {
            if (isImportDeclaration(n)) {
                const { moduleSpecifier, importClause } = n;
                let file: ISASourceFile | undefined;
                if (isStringLiteral(moduleSpecifier)) {
                    const relativedPath = moduleSpecifier.text;
                    const fullPath = path.resolve(path.dirname(this.fullFileName), relativedPath);
                    const resolved = resolve(fullPath);
                    file = this.ctx.files.get(resolved)!;
                    DCHECK(importClause);
                    if (importClause.namedBindings) {
                        importClause.namedBindings.forEachChild(binding => {
                            if (isNamedImports(binding)) {
                                binding.elements.forEach(id => {
                                    DCHECK(file);
                                    let text: string;
                                    if (id.propertyName) {
                                        text = id.propertyName.text;

                                    } else if (id.name) {
                                        text = id.name.text;
                                    } else {
                                        NOTIMPLEMENTED();
                                    }
                                    const type = file.exportedSymbols.get(text);
                                    DCHECK(type);
                                    this.rootLexicalEnvironment.importedSymbols.set(text, type);
                                });
                            } else if (isNamespaceImport(binding)) {
                                DCHECK(file);
                                this.rootLexicalEnvironment.importedSymbols.set(binding.name.text, file.namespaceSymbol);
                            } else {
                                debugger;
                                NOTIMPLEMENTED();
                            }
                            return true;
                        });
                    } else if (importClause.name) {
                        const name = importClause.name.text;
                        this.rootLexicalEnvironment.importedSymbols.set(name, file.namespaceSymbol);
                    } else {
                        NOTIMPLEMENTED();
                    }
                } else {
                    NOTREACHED();
                }
            }
        });
    }

    processSymbolExport() {
        this.traverse(n => {
            if (isInterfaceDeclaration(n)) {
                const isExported = n.modifiers?.some(n => n.kind === ts.SyntaxKind.ExportKeyword);
                if (isExported) {
                    const d = new SASymbol(
                        n,
                        this,
                        this.rootLexicalEnvironment,
                        this.ctx
                    );
                    this.ctx.symbols.set(d.uuid, d);
                    this.exportedSymbols.set(n.name.text, d);
                }
            }
        });
    }

    private traverse(cb: (n: ts.Node) => boolean | void) {
        const toTraverse: Array<ts.Node> = [];
        this.tsFile.forEachChild((child) => toTraverse.push(child));

        while (toTraverse.length) {
            const n = toTraverse.shift()!;
            const stop = cb(n);
            if (stop) return;
        }
    }
}
