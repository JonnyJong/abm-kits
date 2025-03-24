import { DataSource } from 'typeorm';
import { QueryOptions } from '../types';
import { IconsToCompile } from './compiler';
export declare function initDB(): Promise<void>;
export declare function queryIcon({ name, region, type, size, }?: QueryOptions): Promise<{
    id: string;
    name: string;
    region: string;
    type: string;
    size: number;
    file: string;
}[]>;
export declare function getValues(): Promise<{
    regions: any[];
    types: any[];
    sizes: any[];
}>;
export declare function getIcon(name: string): Promise<{
    id: string;
    name: string;
    region: string;
    type: string;
    size: number;
    file: string;
}[]>;
export declare function getDB(): DataSource;
export declare function getAllIcons(): Promise<IconsToCompile>;
