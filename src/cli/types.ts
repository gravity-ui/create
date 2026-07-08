interface DryRunFileEntry {
    path: string;
    size: number;
}

export interface DryRunSummary {
    title: string;
    files: DryRunFileEntry[];
}
