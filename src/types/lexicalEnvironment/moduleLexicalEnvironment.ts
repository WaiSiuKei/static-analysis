import ts, { isClassDeclaration, isFunctionDeclaration, isImportDeclaration, isInterfaceDeclaration, isVariableDeclaration, isVariableStatement } from 'typescript';
import { NOTIMPLEMENTED } from '../../base/common/notreached';
import { ISASymbol, ISAModuleLexicalEnvironment, Keyword } from '../common';
import { SALexicalEnvironment } from './lexicalEnvironment';

export class SAModuleLexicalEnvironment extends SALexicalEnvironment implements ISAModuleLexicalEnvironment {
    readonly exported = new Map<string, ISASymbol>;

    allocate(symbol: ISASymbol,
             name: string,
             declaration: ts.Node,
    ) {
        super.allocate(symbol, name, declaration);
        if (isInterfaceDeclaration(declaration)) {
            // export interface
            if (isExport(declaration)) this.exported.set(name, symbol);
        } else if (isVariableDeclaration(declaration)) {
            // export const
            const statement = declaration.parent.parent;
            if (isVariableStatement(statement) && isExport(statement)) {
                this.exported.set(name, symbol);
            }
        } else if (isFunctionDeclaration(declaration)) {
            NOTIMPLEMENTED();
        } else if (isClassDeclaration(declaration)) {
            NOTIMPLEMENTED();
        } else if (isImportDeclaration(declaration)) {
            // noop
        } else {
            NOTIMPLEMENTED();
        }
    }
}

function isExport(n:
                      ts.InterfaceDeclaration |
                      ts.VariableStatement
) {
    return n.modifiers?.some(n => n.kind === ts.SyntaxKind.ExportKeyword);
}
