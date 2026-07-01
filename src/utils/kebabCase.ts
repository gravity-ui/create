const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isKebabCase(value: string): boolean {
    return KEBAB_CASE.test(value);
}
