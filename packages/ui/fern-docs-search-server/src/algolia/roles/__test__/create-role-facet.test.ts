import { createRoleFacet } from "../create-role-facet";

describe("createRoleFacet with 25 roles", () => {
    it("handles complex role combinations", () => {
        const allRoles = Array.from({ length: 25 }, (_, i) => String.fromCharCode(97 + i));

        const roleIndexes = new Map(allRoles.map((role, index) => [role, index]));

        expect(createRoleFacet(["a"], roleIndexes)).toBe("1");

        expect(createRoleFacet(["y"], roleIndexes)).toBe("1000000");

        expect(createRoleFacet(["a", "m", "y"], roleIndexes)).toBe("1001001");

        expect(createRoleFacet(allRoles, roleIndexes)).toBe("1ffffff");

        const alternatingRoles = allRoles.filter((_, i) => i % 2 === 0);
        expect(createRoleFacet(alternatingRoles, roleIndexes)).toBe("1555555");

        const edgeRoles = [...allRoles.slice(0, 5), ...allRoles.slice(-5)];
        expect(createRoleFacet(edgeRoles, roleIndexes)).toBe("1f0001f");

        const middleRoles = allRoles.slice(7, 17);
        expect(createRoleFacet(middleRoles, roleIndexes)).toBe("1ff80");
    });
});
