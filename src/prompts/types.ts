import type {ConfirmOptions, SelectOptions, TextOptions} from '@clack/prompts';

export interface Prompter {
    text(opts: TextOptions): Promise<string>;
    select<T>(opts: SelectOptions<T>): Promise<T>;
    confirm(opts: ConfirmOptions): Promise<boolean>;
    step(message: string): void;
}

export type StepConfig<T> = {
    cli: T | undefined;
    yesDefault: T;
    label: string;
    format: (value: T) => string;
    set: (value: T) => void;
    ask: () => Promise<void>;
};
