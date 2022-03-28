import { FRAME as Frame } from '../../contracts/Figma';
import { Config } from '../../contracts/Config';
import { ProcessedToken } from '../../contracts/ProcessedToken';
import { WriteOperation } from '../../contracts/Write';
export declare const makeToken: (token: Frame, tokenName: string, config: Config) => Token;
export declare const makeSemanticToken: (token: Frame, tokenName: string, config: Config, primitives: []) => Token;
declare class Token {
    token: Frame;
    tokenName: string;
    config: Config;
    writeOperation: null | WriteOperation;
    constructor(token: Frame, tokenName: string, config: Config);
    extract(): Token;
    private extractTokens;
    private getChildren;
    protected getTokens: (frame: Frame, name: string, config: Config) => any;
    protected setWriteOperation(processedToken: ProcessedToken, tokenName: string): void;
    getWriteOperation: () => WriteOperation | null;
}
export {};
