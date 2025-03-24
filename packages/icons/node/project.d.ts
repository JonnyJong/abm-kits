import { Icons } from '../types';
export declare class Project {
    name: string;
}
export declare function getProjects(): Promise<string[]>;
export declare function createProject(name: string): Promise<boolean>;
export declare function getProject(name: string): Promise<Icons>;
export declare function writeProject(name: string, icons: Icons): Promise<void>;
export declare function deleteProject(name: string): Promise<void>;
export declare function listAvailableProjects(): Promise<string[]>;
