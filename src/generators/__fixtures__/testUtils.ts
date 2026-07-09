import type {GenerateResult} from '../types.js';

export interface CapturedFileHandle<T = any> {
    readonly content: T;
}

export function filesOf(result: GenerateResult) {
    return {
        file<T = any>(path: string): CapturedFileHandle<T> | null {
            const found = result.files.find((f) => f.path === path);
            if (!found) {
                return null;
            }
            return {
                get content() {
                    try {
                        return JSON.parse(found.content);
                    } catch {
                        return found.content;
                    }
                },
            };
        },
    };
}
