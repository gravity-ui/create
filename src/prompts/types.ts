export type StepConfig<T> = {
    cli: T | undefined;
    yesDefault: T;
    label: string;
    format: (value: T) => string;
    set: (value: T) => void;
    ask: () => Promise<void>;
};
