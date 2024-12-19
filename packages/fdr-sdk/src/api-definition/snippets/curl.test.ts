import { convertToCurl, getUrlQueriesGetString } from "./curl";

describe("curl", () => {
    it("generates basic GET request", () => {
        expect(
            convertToCurl(
                {
                    method: "GET",
                    url: "https://api.example.com/users",
                    headers: {},
                    searchParams: {},
                    body: undefined,
                },
                { usesApplicationJsonInFormDataValue: false }
            )
        ).toMatchInlineSnapshot('"curl https://api.example.com/users"');
    });

    it("generates POST request with JSON body", () => {
        expect(
            convertToCurl(
                {
                    method: "POST",
                    url: "https://api.example.com/users",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    searchParams: {},
                    body: {
                        type: "json",
                        value: {
                            name: "John Doe",
                            email: "john@example.com",
                        },
                    },
                },
                { usesApplicationJsonInFormDataValue: false }
            )
        ).toMatchInlineSnapshot(`
          "curl -X POST https://api.example.com/users \\
               -H "Content-Type: application/json" \\
               -d '{
            "name": "John Doe",
            "email": "john@example.com"
          }'"
        `);
    });

    it("generates request with basic auth", () => {
        expect(
            convertToCurl(
                {
                    method: "GET",
                    url: "https://api.example.com/secure",
                    headers: {},
                    searchParams: {},
                    basicAuth: {
                        username: "user",
                        password: "pass123",
                    },
                    body: undefined,
                },
                { usesApplicationJsonInFormDataValue: false }
            )
        ).toMatchInlineSnapshot(`
          "curl https://api.example.com/secure \\
               -u "user:pass123""
        `);
    });

    it("generates request with form data", () => {
        expect(
            convertToCurl(
                {
                    method: "POST",
                    url: "https://api.example.com/upload",
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    searchParams: {},
                    body: {
                        type: "form",
                        value: {
                            file: {
                                type: "filename",
                                filename: "test.txt",
                                contentType: "text/plain",
                            },
                        },
                    },
                },
                { usesApplicationJsonInFormDataValue: false }
            )
        ).toMatchInlineSnapshot(`
          "curl -X POST https://api.example.com/upload \\
               -H "Content-Type: multipart/form-data" \\
               -F file=@"test.txt;type=text/plain""
        `);
    });

    it("generates request with multiple files in form data", () => {
        expect(
            convertToCurl(
                {
                    method: "POST",
                    url: "https://api.example.com/upload",
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    searchParams: {},
                    body: {
                        type: "form",
                        value: {
                            files: {
                                type: "filenames",
                                files: [
                                    {
                                        filename: "test1.txt",
                                        contentType: "text/plain",
                                    },
                                    {
                                        filename: "test2.jpg",
                                        contentType: "image/jpeg",
                                    },
                                ],
                            },
                        },
                    },
                },
                { usesApplicationJsonInFormDataValue: false }
            )
        ).toMatchInlineSnapshot(`
          "curl -X POST https://api.example.com/upload \\
               -H "Content-Type: multipart/form-data" \\
               -F "files[]"=@"test1.txt;type=text/plain" \\
               -F "files[]"=@"test2.jpg;type=image/jpeg""
        `);
    });

    it("generates request with multiple form fields including files", () => {
        expect(
            convertToCurl(
                {
                    method: "POST",
                    url: "https://api.example.com/upload",
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    searchParams: {},
                    body: {
                        type: "form",
                        value: {
                            title: {
                                type: "json",
                                value: "My Upload",
                            },
                            description: {
                                type: "json",
                                value: "Multiple file upload test",
                            },
                            files: {
                                type: "filenames",
                                files: [
                                    {
                                        filename: "document.pdf",
                                        contentType: "application/pdf",
                                    },
                                    {
                                        filename: "image.png",
                                        contentType: "image/png",
                                    },
                                ],
                            },
                        },
                    },
                },
                { usesApplicationJsonInFormDataValue: false }
            )
        ).toMatchInlineSnapshot(`
          "curl -X POST https://api.example.com/upload \\
               -H "Content-Type: multipart/form-data" \\
               -F title="My Upload" \\
               -F description="Multiple file upload test" \\
               -F "files[]"=@"document.pdf;type=application/pdf" \\
               -F "files[]"=@"image.png;type=image/png""
        `);
    });

    it("generates request without urlencoded parameters", () => {
        expect(
            convertToCurl(
                {
                    method: "POST",
                    url: "https://api.example.com/form",
                    headers: {},
                    searchParams: {
                        name: "John Doe",
                        email: "john@example.com",
                        items: ["item1", "item2"],
                    },
                    body: undefined,
                },
                { usesApplicationJsonInFormDataValue: false }
            )
        ).toMatchInlineSnapshot(
            '"curl -X POST "https://api.example.com/form?name=John%20Doe&email=john%40example.com&items[]=item1&items[]=item2""'
        );
    });

    it("generates request with urlencoded form data", () => {
        expect(
            convertToCurl(
                {
                    method: "POST",
                    url: "https://api.example.com/form",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    searchParams: {},
                    body: {
                        type: "json",
                        value: {
                            name: "John Doe",
                            email: "john@example.com",
                            items: ["item1", "item2"],
                        },
                    },
                },
                { usesApplicationJsonInFormDataValue: false }
            )
        ).toMatchInlineSnapshot(`
          "curl -X POST https://api.example.com/form \\
               -H "Content-Type: application/x-www-form-urlencoded" \\
               --data-urlencode name="John Doe" \\
               --data-urlencode email=john@example.com \\
               -d "items[]"=item1 \\
               -d "items[]"=item2"
        `);
    });

    it("generates GET request with urlencoded parameters", () => {
        expect(
            convertToCurl(
                {
                    method: "GET",
                    url: "https://api.example.com/search",
                    headers: {},
                    searchParams: {
                        q: "search term with spaces",
                        filter: ["category1", "category2"],
                        sort: "date desc",
                    },
                    body: undefined,
                },
                { usesApplicationJsonInFormDataValue: false }
            )
        ).toMatchInlineSnapshot(
            `
          "curl -G https://api.example.com/search \\
               --data-urlencode q="search term with spaces" \\
               -d "filter[]"=category1 \\
               -d "filter[]"=category2 \\
               --data-urlencode sort="date desc""
        `
        );
    });

    it("does not include nulls in urlencoded parameters", () => {
        expect(getUrlQueriesGetString({ a: null, b: "b" }))
            .toMatchInlineSnapshot(`
          [
            "-d b=b",
          ]
        `);

        expect(getUrlQueriesGetString({ a: ["b1", null, "b2"] }))
            .toMatchInlineSnapshot(`
          [
            "-d "a[]"=b1",
            "-d "a[]"=b2",
          ]
        `);
    });
});
