import { v4 as uuid } from 'uuid';
import { DCHECK } from '../../base/common/assert';
import { NOTIMPLEMENTED, NOTREACHED } from '../../base/common/notreached';
import { JSPrimitiveType } from '../../base/common/types';
import { traverseDeep } from '../../utils/ts';
import { ISAAliasSymbol, ISAProject, ISALexicalEnvironment, ISACollectionSymbol, ISANamespaceSymbol, ISAPrimitiveSymbol, ISASourceFile, ISASymbol, ISAFunctionSymbol, ISATypeAnySymbol, Keyword } from '../common';
import ts, { Block, CaseBlock, isArrayBindingPattern, isBigIntLiteral, isBlock, isCaseBlock, isClassDeclaration, isFunctionDeclaration, isIdentifier, isImportDeclaration, isInterfaceDeclaration, isModuleBlock, isNamedImports, isNamespaceImport, isNumericLiteral, isObjectBindingPattern, isStringLiteral, isVariableDeclaration, SyntaxKind, VariableDeclaration } from 'typescript';
import { SAAliasSymbol } from '../symbol/aliasSymbol';
import { SANamespaceSymbol } from '../symbol/namespaceSymbol';
import { SAPrimitiveSymbol } from '../symbol/primitiveSymbol';
import { SATypeAnySymbol } from '../symbol/typeAnySymbol';

export class SALexicalEnvironment implements ISALexicalEnvironment {
    readonly uuid = uuid();
    readonly symbols = new Map<string, ISASymbol>;
    private typeAnySymbol: ISATypeAnySymbol;
    readonly children: ISALexicalEnvironment[] = [];

    constructor(
        public tsNode: ts.Node,
        public readonly parent: ISALexicalEnvironment | undefined,
        public readonly file: ISASourceFile,
        public readonly project: ISAProject,
    ) {
        this.typeAnySymbol = new SATypeAnySymbol(this.file, this, this.project);
    }

    allocate(symbol: ISASymbol,
             name: string,
             // for override
             declaration: ts.Node,
    ) {
        this.symbols.set(name, symbol);
    }

    createPrimitiveSymbol(val: JSPrimitiveType): ISAPrimitiveSymbol {
        return new SAPrimitiveSymbol(val, this.file, this, this.project);
    }

    createFunctionSymbol(val: ts.Node): ISAFunctionSymbol {
        return NOTIMPLEMENTED();
    }

    createCollectionSymbol(node: ts.Node): ISACollectionSymbol {
        return NOTIMPLEMENTED();
        // return new SACollectionSymbol(node, this.file, this, this.ctx);
    }

    createNameSpaceSymbol(node: ts.SourceFile): ISANamespaceSymbol {
        return new SANamespaceSymbol(node, this.file, this, this.project);
    }

    createTypeAnySymbol(): ISATypeAnySymbol {
        return this.typeAnySymbol;
    }

    createAliasSymbol(alias: string,
                      origin: ISASymbol): ISAAliasSymbol {
        return new SAAliasSymbol(alias, origin, this.file, this, this.project);
    }

    visitInterfaceDeclaration(n: ts.InterfaceDeclaration) {
        const symbol = this.createCollectionSymbol(n);
        const name = n.name.text;
        this.allocate(symbol, name, n);
    }

    visitVariableDeclaration(n: ts.VariableDeclaration) {
        if (!n.initializer) NOTIMPLEMENTED();
        if (isIdentifier(n.name)) {
            // const a;
            let symbol: ISASymbol;
            if (n.initializer) {
                // const a = ...;
                if (isNumericLiteral(n.initializer)) {
                    symbol = this.createPrimitiveSymbol(+n.initializer.text);
                } else if (isStringLiteral(n.initializer)) {
                    symbol = this.createPrimitiveSymbol(n.initializer.text);
                } else if (n.initializer.kind === SyntaxKind.NullKeyword) {
                    symbol = this.createPrimitiveSymbol(null);
                } else if (n.initializer.kind === SyntaxKind.UndefinedKeyword) {
                    symbol = this.createPrimitiveSymbol(undefined);
                } else if (isBigIntLiteral(n.initializer)) {
                    symbol = this.createPrimitiveSymbol(BigInt(n.initializer.text));
                } else if (n.initializer.kind === SyntaxKind.TrueKeyword) {
                    symbol = this.createPrimitiveSymbol(true);
                } else if (n.initializer.kind === SyntaxKind.FalseKeyword) {
                    symbol = this.createPrimitiveSymbol(false);
                } else {
                    NOTIMPLEMENTED();
                }
            } else {
                symbol = this.createTypeAnySymbol();
            }
            this.allocate(symbol, n.name.text, n);
        } else if (isObjectBindingPattern(n.name)) {
            // const { name1, name2: bar } = o;
            NOTIMPLEMENTED();
        } else if (isArrayBindingPattern(n.name)) {
            // const [ name1, name2 ] = array;
            NOTIMPLEMENTED();
        } else {
            NOTIMPLEMENTED();
        }
    }

    visitImportDeclaration(n: ts.ImportDeclaration) {
        const { moduleSpecifier, importClause } = n;
        if (!isStringLiteral(moduleSpecifier)) NOTIMPLEMENTED();
        const relativedPath = moduleSpecifier.text;
        const file = this.project.resolve(this.file, relativedPath);
        DCHECK(file);
        if (importClause) {
            if (importClause.namedBindings) {
                if (isNamedImports(importClause.namedBindings)) {
                    // import { export1 } from "module-name";
                    // import { export1 as alias1 } from "module-name";
                    // import { default as alias } from "module-name";
                    importClause.namedBindings.elements.forEach(id => {
                        DCHECK(file);
                        let name: string = '';
                        let aliased: string = '';
                        if (id.propertyName) {
                            aliased = id.propertyName.text;
                        } else if (id.name) {
                            name = id.name.text;
                        } else {
                            NOTIMPLEMENTED();
                        }
                        const symbol: ISASymbol = aliased ? this.createAliasSymbol(name, file.exportedSymbols.get(aliased)!) : file.exportedSymbols.get(name)!;
                        this.symbols.set(name, symbol);
                    });
                } else if (isNamespaceImport(importClause.namedBindings)) {
                    // import * as name from "module-name";
                    DCHECK(file);
                    this.symbols.set(importClause.namedBindings.name.text, file.namespaceSymbol);
                } else {
                    NOTIMPLEMENTED();
                }
            } else if (importClause.name) {
                // import defaultExport from "module-name";
                const name = importClause.name.text;
                const defaultExport = file.exportedSymbols.get(Keyword.default)!;
                this.symbols.set(name, name === Keyword.default ? defaultExport : this.createAliasSymbol(name, defaultExport));
            } else {
                NOTIMPLEMENTED();
            }
        } else if (!importClause) {
            // import "module-name";
            // TODO: 处理这种情况
        } else {
            NOTIMPLEMENTED();
        }
    }

    processCodes() {
        const childBlocks = this.traverse((n) => {
            if (isInterfaceDeclaration(n)) {
                this.visitInterfaceDeclaration(n);
            } else if (isVariableDeclaration(n)) {
                this.visitVariableDeclaration(n);
                // const isExported = n.modifiers?.some(n => n.kind === ts.SyntaxKind.ExportKeyword);
                // if (isExported) {
                // }
            } else if (isFunctionDeclaration(n)) {
                NOTIMPLEMENTED();
            } else if (isClassDeclaration(n)) {
                NOTIMPLEMENTED();
            } else if (isImportDeclaration(n)) {
                this.visitImportDeclaration(n);
            } else {
                NOTIMPLEMENTED();
            }
        });
        childBlocks.forEach(b => {
            const c = new SALexicalEnvironment(
                b,
                this,
                this.file,
                this.project,
            );
            this.children.push(c);
            c.processCodes();
        });
    }

    traverse(cb: (n: ts.Node) => void) {
        const toTraverse: Array<ts.Node> = [];
        this.tsNode.forEachChild((child) => toTraverse.push(child));
        let childBlocks: Array<CaseBlock | Block> = [];
        while (toTraverse.length) {
            const n = toTraverse.shift()!;
            cb(n);
            n.forEachChild(child => {
                if (isBlock(child)) {
                    childBlocks.push(child);
                } else if (isCaseBlock(child)) {
                    childBlocks.push(child);
                } else {
                    toTraverse.push(child);
                }
            });
        }

        return childBlocks;
    }
}
