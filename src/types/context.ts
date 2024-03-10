import path from 'node:path';
import { Graph } from '../base/common/graph';
import { resolve } from '../resolver';
import { ISAProject, ISASourceFile } from './common';
import { SASourceFile } from './sourceFile';
import ts from 'typescript';

function findSourceFiles(fileName: string,
                         program: ts.Program): ts.SourceFile | undefined {
    return program.getSourceFiles().find(s => s.fileName === fileName);
}
export class SAContext implements ISAProject {
    readonly files = new Map<string, ISASourceFile>;
    constructor(
        private program: ts.Program,
    ) {
        this.collect();
    }

    collect() {
        this.program.getRootFileNames().forEach((fileName) => {
            const tsSrcFile = findSourceFiles(fileName, this.program)!;
            const f = new SASourceFile(tsSrcFile, this);
            this.files.set(f.fullFileName, f);
        });
    }

    sort() {
        const graph = new Graph<ISASourceFile>((f) => f.fullFileName);
        this.files.forEach(f => {
            f.processModuleImport();
            graph.insertVertex(f);
            f.deps.forEach((dep) => {
                graph.insertEdge(f, dep);
            });
        });
        return graph.topologicalSort().reverse();
    }

    get cwd() {
        return this.program.getCurrentDirectory();
    }
    resolve(currentFile: ISASourceFile,
            relativedPath: string): ISASourceFile | undefined {
        const fullPath = path.resolve(path.dirname(currentFile.fullFileName), relativedPath);
        const resolved = resolve(fullPath);
        return this.files.get(resolved);
    }
}
