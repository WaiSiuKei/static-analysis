import ts from 'typescript';
import { JSPrimitiveType } from '../base/common/types';

export interface ISAProject {
    readonly files: Map<string, ISASourceFile>;
    readonly cwd: string;
    resolve(currentFile: ISASourceFile,
            path: string): ISASourceFile | undefined;
}

export interface ISASourceFile {
    fullFileName: string;
    deps: ISASourceFile[];
    exportedSymbols: Map<string, ISASymbol>;
    namespaceSymbol: ISANamespaceSymbol;
    processModuleImport(): void;
}

export interface ISASymbol {
    uuid: string;
    file: ISASourceFile;
    lexicalEnvironment: ISALexicalEnvironment;
}
// js
export interface ISAPrimitiveSymbol extends ISASymbol {
    value: JSPrimitiveType;
}
export interface ISAFunctionSignature {
    arguments: ISACollectionSymbol;
    return: ISASymbol;
}
export interface ISAFunctionSymbol extends ISASymbol {
    signatures: Array<ISAFunctionSignature>;
}
export interface ISACollectionSymbol extends ISASymbol {

}
export interface ISANamespaceSymbol extends ISASymbol {
}
// ts
export interface ISATypeAnySymbol extends ISASymbol {}
export interface ISAAliasSymbol extends ISASymbol {
    alias: string;
    origin: ISASymbol;
}
export interface ISALexicalEnvironment {
    uuid: string;
    file: ISASourceFile;
    symbols: Map<string, ISASymbol>;
    children: ISALexicalEnvironment[];
    parent: ISALexicalEnvironment | undefined;
}
export interface ISAModuleLexicalEnvironment {
    exported: Map<string, ISASymbol>;
}

export enum Keyword {
    default = 'default'
}
