import { v4 as uuid } from 'uuid';
import { ISASymbol } from './common';

export class SALexicalEnvironment {
    readonly uuid = uuid();
    readonly importedSymbols = new Map<string, ISASymbol>;
}
