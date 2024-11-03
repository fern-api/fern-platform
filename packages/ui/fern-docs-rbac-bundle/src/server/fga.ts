import { workos } from "@/workos";

export async function isUserAdminOfOrg(email: string, org: string): Promise<boolean> {
    return workos.fga
        .check({
            checks: [
                {
                    subject: { resourceType: "user", resourceId: email },
                    relation: "admin",
                    resource: { resourceType: "org", resourceId: org },
                },
            ],
        })
        .then((check) => check.isAuthorized());
}

export async function isUserAdminOfDoc(email: string, doc: string): Promise<boolean> {
    return workos.fga
        .check({
            checks: [
                {
                    subject: { resourceType: "user", resourceId: email },
                    relation: "admin",
                    resource: { resourceType: "doc", resourceId: doc },
                },
            ],
        })
        .then((check) => check.isAuthorized());
}
