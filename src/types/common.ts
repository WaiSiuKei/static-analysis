export interface Context {
    readonly files: Map<string, ISASourceFile>;
    readonly cwd: string;
    readonly symbols: Map<string, ISASymbol>;
}

export interface ISASourceFile {
    fullFileName: string;
    deps: ISASourceFile[];
    exportedSymbols: Map<string, ISASymbol>;
    namespaceSymbol: ISANamespaceSymbol;
    processModuleImport(): void;
    processSymbolImport(): void;
    processSymbolExport(): void;
}

export interface ISASymbol {
    uuid: string;
    file: ISASourceFile;
    lexicalEnvironment: ISALexicalEnvironment;
}

export interface ISANamespaceSymbol extends ISASymbol {
}

export interface ISALexicalEnvironment {
    uuid: string;
    importedSymbols: Map<string, ISASymbol>;
}
