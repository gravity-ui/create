type Language = 'ts' | 'js';

export interface ProjectModel {
    // Location & registry
    destination: string; // absolute path
    projectName: string; // derived from destination
    registry?: string; // optional custom npm registry

    // Language
    language: Language;

    // Frontend
    hasFrontend: boolean;
    hasStyles: boolean;
    hasReact: boolean;

    // Backend
    hasBackend: boolean;

    // Derived flags (computed from answers)
    packages: {
        dependencies: Record<string, string>;
        devDependencies: Record<string, string>;
    };
    scripts: Record<string, string>;
}
