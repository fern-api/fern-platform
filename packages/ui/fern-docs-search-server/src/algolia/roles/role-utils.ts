import { EVERYONE_ROLE } from "@fern-ui/fern-docs-utils";
import { sortBy, uniq, uniqBy } from "es-toolkit/array";
import { createRoleFacet } from "./create-role-facet";

/**
 * Create a list of viewers for a given hierarchy of viewers.
 * This is used to create the `viewers` field in the Algolia record.
 *
 * The goal is to flip the logical operations in the output array to contain the minimum number of role requirements.
 * For example:
 * - [] -> []
 * - [[a]] -> [[a]]
 * - [[a], [b]] -> [[a, b]]
 * - [[a, b]] -> [[a], [b]]
 * - [[a, b], [c]] -> [[a, c], [b, c]]
 * - [[a, b], [a]] -> [[a]]
 * - [[a, b], [c, d]] -> [[a, c], [a, d], [b, c], [b, d]]
 * - [[a], [b], [a]] -> [[a]]
 *
 * @param roles is a 2d list of roles, where the outer array represents AND and the inner array represents OR
 * @returns a 2d list of roles where the outer array represents OR and the inner array represents AND
 */
export function flipAndOrToOrAnd(andOrRoles: string[][], roleIndexes: Map<string, number>): string[][] {
    if (andOrRoles.length === 0) {
        return [];
    }

    // generate all combinations
    const combinations: string[][] = combine(andOrRoles.filter((roles) => roles.length > 0));

    // remove duplicate roles in each combination, and sort lexicographically
    const uniqueCombinations = combinations.map((roles) => uniq(roles).sort());

    // if a combination is a subset of another, remove the larger one, e.g. [[a, b], [a]] -> [[a]]
    // this is because the larger one is redundant
    return sortBy(removeSubsets(uniqueCombinations), [(role) => createRoleFacet(role, roleIndexes)]);
}

function combine<T>(arrays: T[][]): T[][] {
    let result: T[][] = [[]];

    for (const array of arrays) {
        const newResult: T[][] = [];
        for (const combination of result) {
            for (const element of array) {
                newResult.push([...combination, element]);
            }
        }
        result = newResult;
    }

    return result;
}

function removeSubsets(arrays: string[][]): string[][] {
    // Sort arrays by length to ensure we check larger sets first
    arrays.sort((a, b) => b.length - a.length);

    return arrays.filter((currentArray, index) => {
        // Check if otherArray is a subset of currentArray
        return !arrays.slice(index + 1).some((otherArray) => {
            return otherArray.every((element) => currentArray.includes(element));
        });
    });
}

// [a] -> [a]
// [a, b] -> [a, b, a|b]
// [b, a] -> [a, b, a|b]
// [a, c, b] -> [a, b, c, a|b, a|c, b|c, a|b|c]
export function createPermutations(roles: string[], roleIndexes: Map<string, number>): string[][] {
    if (roles.length === 0) {
        return [];
    }

    const result: string[][] = [];

    // Add individual viewers
    roles.forEach((viewer) => result.push([viewer]));

    // Generate permutations
    for (let i = 2; i <= roles.length; i++) {
        const permutations = getPermutations(roles, i);
        permutations.forEach((perm) => {
            result.push(perm.sort());
        });
    }

    return sortBy(
        uniqBy(result, (role) => createRoleFacet(role, roleIndexes)),
        [(role) => createRoleFacet(role, roleIndexes)],
    );
}

function getPermutations(arr: string[], k: number): string[][] {
    const result: string[][] = [];

    function backtrack(start: number, current: string[]) {
        if (current.length === k) {
            result.push([...current]);
            return;
        }

        for (let i = start; i < arr.length; i++) {
            const value = arr[i];
            if (value != null) {
                current.push(value);
                backtrack(i + 1, current);
                current.pop();
            }
        }
    }

    backtrack(0, []);
    return result;
}

export function isVisibleByEveryone(roles: string[][]): boolean {
    return roles.some((roles) => roles.length === 1 && roles[0] === EVERYONE_ROLE);
}

/**
 * The "everyone" role is a special role that is used to represent unauthenticated users.
 * - If the docs site does not have auth enabled, we assume all records should be visible to everyone.
 * - If the docs site has auth enabled, if any of the roles contain JUST "everyone", we can eliminate the other roles requirements.
 * - If the docs site has auth enabled, and no roles contain JUST "everyone", we need to remove "everyone" from each of the role lists.
 * - an empty [] may be returned if the docs site is not visible to unauthenticated users, but has no othe role requirements.
 */
export function modifyRolesForEveryone(
    roles: string[][],
    authed: boolean,
): {
    roles: string[][];
    authed: boolean;
} {
    // ensure that ther are no empty lists
    roles = roles.filter((roles) => roles.length > 0);

    if (!authed || roles.length === 0 || isVisibleByEveryone(roles)) {
        return { roles: [[EVERYONE_ROLE]], authed: authed && !isVisibleByEveryone(roles) };
    } else {
        return {
            roles: roles.map((roles) => roles.filter((role) => role !== EVERYONE_ROLE)),
            authed: true,
        };
    }
}
