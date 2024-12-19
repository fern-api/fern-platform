import {
    extractOrgFromPreview,
    isPreviewDomain,
} from "../getPreviewUrlAuthConfig";

describe("isPreviewDomain", () => {
    it("should return true for valid preview domains", () => {
        const validDomains = [
            "fern-12345678-1234-1234-1234-123456789012.docs.buildwithfern.com",
            "acme-abcdef01-2345-6789-abcd-ef0123456789.docs.buildwithfern.com",
        ];

        validDomains.forEach((domain) => {
            expect(isPreviewDomain(domain)).toBe(true);
        });
    });

    it("should return false for invalid preview domains", () => {
        const invalidDomains = [
            "docs.buildwithfern.com",
            "example.com",
            "12345678-1234-1234-1234-123456789012.example.com",
            "12345678-1234-1234-1234-12345678901.docs.buildwithfern.com", // UUID too short
            "12345678-1234-1234-1234-1234567890123.docs.buildwithfern.com", // UUID too long
            "12345678-1234-1234-1234-12345678901g.docs.buildwithfern.com", // Invalid character in UUID
        ];

        invalidDomains.forEach((domain) => {
            expect(isPreviewDomain(domain)).toBe(false);
        });
    });

    describe("extractOrgFromPreview", () => {
        it("should return the organization name for valid preview domains", () => {
            const validDomains = [
                {
                    domain: "fern-preview-12345678-1234-1234-1234-123456789012.docs.buildwithfern.com",
                    org: "fern",
                },
                {
                    domain: "acme-preview-abcdef01-2345-6789-abcd-ef0123456789.docs.buildwithfern.com",
                    org: "acme",
                },
            ];

            validDomains.forEach(({ domain, org }) => {
                expect(extractOrgFromPreview(domain)).toBe(org);
            });
        });

        it("should return undefined for invalid preview domains", () => {
            const invalidDomains = [
                "docs.buildwithfern.com",
                "example.com",
                "12345678-1234-1234-1234-123456789012.example.com",
                "12345678-1234-1234-1234-12345678901.docs.buildwithfern.com", // UUID too short
                "12345678-1234-1234-1234-1234567890123.docs.buildwithfern.com", // UUID too long
                "12345678-1234-1234-1234-12345678901g.docs.buildwithfern.com", // Invalid character in UUID
                "fern-12345678-1234-1234-1234-123456789012.docs.buildwithfern.com", // Missing 'preview' keyword
            ];

            invalidDomains.forEach((domain) => {
                expect(extractOrgFromPreview(domain)).toBeUndefined();
            });
        });
    });
});
