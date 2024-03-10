import ts from 'typescript';
import * as path from 'node:path';
import { Graph } from './base/common/graph';
import { ISASourceFile, ISASymbol } from './types/common';
import { SAContext } from './types/context';
import { SASourceFile } from './types/sourceFile';

export function programFromConfig(configFileName: string,
                                  onlyIncludeFiles?: string[]): ts.Program {
    // basically a copy of https://github.com/Microsoft/TypeScript/blob/3663d400270ccae8b69cbeeded8ffdc8fa12d7ad/src/compiler/tsc.ts -> parseConfigFile
    const result = ts.parseConfigFileTextToJson(configFileName, ts.sys.readFile(configFileName)!);
    const configObject = result.config;

    const configParseResult = ts.parseJsonConfigFileContent(
        configObject,
        ts.sys,
        path.dirname(configFileName),
        {},
        path.basename(configFileName)
    );
    const options = configParseResult.options;
    options.noEmit = true;
    delete options.out;
    delete options.outDir;
    delete options.outFile;
    delete options.declaration;
    delete options.declarationDir;
    delete options.declarationMap;

    const program = ts.createProgram({
        rootNames: onlyIncludeFiles || configParseResult.fileNames,
        options,
        projectReferences: configParseResult.projectReferences,
    });
    return program;
}

async function main() {
    const program = programFromConfig('sample/index.ts');
    const ctx = new SAContext(program);
    const topSorted = ctx.sort();
    // transform
    topSorted.forEach(f => f.processSymbolExport());
    topSorted.forEach(f => f.processSymbolImport());
    // link
}

main();
