export type IconsToCompile = [file: string, id: string][];
export declare function compileProject(name: string): Promise<boolean>;
export declare function compileAllIconForProject(name: string): Promise<boolean>;
