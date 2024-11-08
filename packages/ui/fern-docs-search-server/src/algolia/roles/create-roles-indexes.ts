export function createRoleIndexes(roles: string[]): Map<string, number> {
    const roleIndexes = new Map<string, number>();
    roles.forEach((role, idx) => roleIndexes.set(role, idx));
    return roleIndexes;
}
