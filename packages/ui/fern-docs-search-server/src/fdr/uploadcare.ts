export const uploadcare = {
    id: "test-uuid-replacement",
    endpoints: {
        "endpoint_file.filesList": {
            description:
                "Getting a paginated list of files. If you need multiple results pages, use `previous`/`next` from the response to navigate back/forth.",
            namespace: ["File"],
            id: "endpoint_file.filesList",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "files",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            queryParameters: [
                {
                    key: "removed",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: {
                                    type: "primitive",
                                    value: {
                                        type: "boolean",
                                        default: false,
                                    },
                                },
                            },
                        },
                    },
                    description:
                        "`true` to only include removed files in the response, `false` to include existing files. Defaults to `false`.",
                },
                {
                    key: "stored",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: {
                                    type: "primitive",
                                    value: {
                                        type: "boolean",
                                    },
                                },
                            },
                        },
                    },
                    description:
                        "`true` to only include files that were stored, `false` to include temporary ones. The default is unset: both stored and not stored files are returned.",
                },
                {
                    key: "limit",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: {
                                    type: "primitive",
                                    value: {
                                        type: "double",
                                        minimum: 1,
                                        maximum: 1000,
                                        default: 100,
                                    },
                                },
                            },
                        },
                    },
                    description:
                        "A preferred amount of files in a list for a single response. Defaults to 100, while the maximum is 1000.",
                },
                {
                    key: "ordering",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "enum",
                                values: [
                                    {
                                        value: "datetime_uploaded",
                                    },
                                    {
                                        value: "-datetime_uploaded",
                                    },
                                ],
                                default: "datetime_uploaded",
                            },
                            default: "datetime_uploaded",
                        },
                    },
                    description:
                        "Specifies the way files are sorted in a returned list. `datetime_uploaded` for ascending order, `-datetime_uploaded` for descending order.",
                },
                {
                    key: "from",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                    description:
                        "A starting point for filtering the files. If provided, the value MUST adhere to the ISO 8601 Extended Date/Time Format (`YYYY-MM-DDTHH:MM:SSZ`).",
                },
                {
                    key: "include",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                    description: "Include additional fields to the file object, such as: appdata.",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "next",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Next page URL.",
                            },
                            {
                                key: "previous",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Previous page URL.",
                            },
                            {
                                key: "total",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "double",
                                            minimum: 0,
                                        },
                                    },
                                },
                                description:
                                    "Total number of the files of the queried type. The queried type depends on the stored and removed query parameters.",
                            },
                            {
                                key: "totals",
                                valueShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [
                                        {
                                            key: "removed",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "double",
                                                        minimum: 0,
                                                        default: 0,
                                                    },
                                                },
                                            },
                                            description: "Total number of the files that are marked as removed.",
                                        },
                                        {
                                            key: "stored",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "double",
                                                        minimum: 0,
                                                        default: 0,
                                                    },
                                                },
                                            },
                                            description: "Total number of the files that are marked as stored.",
                                        },
                                        {
                                            key: "unstored",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "double",
                                                        minimum: 0,
                                                        default: 0,
                                                    },
                                                },
                                            },
                                            description: "Total number of the files that are not marked as stored.",
                                        },
                                    ],
                                },
                            },
                            {
                                key: "per_page",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "double",
                                        },
                                    },
                                },
                                description: "Number of the files per page.",
                            },
                            {
                                key: "results",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "list",
                                        itemShape: {
                                            type: "alias",
                                            value: {
                                                type: "id",
                                                id: "file",
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [
                {
                    path: "/files/",
                    responseStatusCode: 200,
                    name: "with-appdata",
                    responseBody: {
                        type: "json",
                        value: {
                            next: "https://api.uploadcare.com/files/?limit=1&from=2018-11-27T01%3A00%3A43.001705%2B00%3A00&offset=0",
                            previous:
                                "https://api.uploadcare.com/files/?limit=1&to=2018-11-27T01%3A00%3A36.436838%2B00%3A00&offset=0",
                            total: 2484,
                            totals: {
                                removed: 0,
                                stored: 2480,
                                unstored: 4,
                            },
                            per_page: 1,
                            results: [
                                {
                                    datetime_removed: null,
                                    datetime_stored: "2018-11-26T12:49:10.477888Z",
                                    datetime_uploaded: "2018-11-26T12:49:09.945335Z",
                                    variations: null,
                                    is_image: true,
                                    is_ready: true,
                                    mime_type: "image/jpeg",
                                    original_file_url:
                                        "https://ucarecdn.com/22240276-2f06-41f8-9411-755c8ce926ed/pineapple.jpg",
                                    original_filename: "pineapple.jpg",
                                    size: 642,
                                    url: "https://api.uploadcare.com/files/22240276-2f06-41f8-9411-755c8ce926ed/",
                                    uuid: "test-uuid-replacement",
                                    content_info: {
                                        mime: {
                                            mime: "image/jpeg",
                                            type: "image",
                                            subtype: "jpeg",
                                        },
                                        image: {
                                            format: "JPEG",
                                            width: 500,
                                            height: 500,
                                            sequence: false,
                                            color_mode: "RGB",
                                            orientation: 6,
                                            geo_location: {
                                                latitude: 55.62013611111111,
                                                longitude: 37.66299166666666,
                                            },
                                            datetime_original: "2018-08-20T08:59:50",
                                            dpi: [72, 72],
                                        },
                                    },
                                    metadata: {
                                        subsystem: "uploader",
                                        pet: "cat",
                                    },
                                    appdata: {
                                        uc_clamav_virus_scan: {
                                            data: {
                                                infected: true,
                                                infected_with: "Win.Test.EICAR_HDB-1",
                                            },
                                            version: "0.104.2",
                                            datetime_created: "2021-09-21T11:24:33.159663Z",
                                            datetime_updated: "2021-09-21T11:24:33.159663Z",
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    snippets: {
                        javascript: [
                            {
                                name: "JS",
                                language: "JavaScript",
                                code: "import {\n  listOfFiles,\n  UploadcareSimpleAuthSchema,\n} from '@uploadcare/rest-client';\n\nconst uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({\n  publicKey: 'YOUR_PUBLIC_KEY',\n  secretKey: 'YOUR_SECRET_KEY',\n});\n\nconst result = await listOfFiles(\n  {},\n  { authSchema: uploadcareSimpleAuthSchema }\n)\n",
                                generated: false,
                            },
                        ],
                        php: [
                            {
                                name: "PHP",
                                language: "PHP",
                                code: "<?php\n$configuration = Uploadcare\\Configuration::create((string) $_ENV['UPLOADCARE_PUBLIC_KEY'], (string) $_ENV['UPLOADCARE_SECRET_KEY']);\n\n$api = (new Uploadcare\\Api($configuration))->file();\n$list = $api->listFiles();\nforeach ($list->getResults() as $result) {\n    echo \\sprintf('URL: %s', $result->getUrl());\n}\nwhile (($next = $api->nextPage($list)) !== null) {\n    foreach ($next->getResults() as $result) {\n        echo \\sprintf('URL: %s', $result->getUrl());\n    }\n}\n",
                                generated: false,
                            },
                        ],
                        python: [
                            {
                                name: "Python",
                                language: "Python",
                                code: "from pyuploadcare import Uploadcare\nuploadcare = Uploadcare(public_key='YOUR_PUBLIC_KEY', secret_key='YOUR_SECRET_KEY')\n\nfiles = uploadcare.list_files(stored=True, limit=10)\nfor file in files:\n    print(file.info)\n",
                                generated: false,
                            },
                        ],
                        ruby: [
                            {
                                name: "Ruby",
                                language: "Ruby",
                                code: "require 'uploadcare'\nUploadcare.config.public_key = 'YOUR_PUBLIC_KEY'\nUploadcare.config.secret_key = 'YOUR_SECRET_KEY'\n\nlist = Uploadcare::FileList.file_list(stored: true, removed: false, limit: 100)\nlist.each { |file| puts file.inspect }\n",
                                generated: false,
                            },
                        ],
                        swift: [
                            {
                                name: "Swift",
                                language: "Swift",
                                code: 'import Uploadcare\n\nlet uploadcare = Uploadcare(withPublicKey: "YOUR_PUBLIC_KEY", secretKey: "YOUR_SECRET_KEY")\n\nlet query = PaginationQuery()\n  .stored(true)\n  .ordering(.dateTimeUploadedDESC)\n  .limit(10)\nvar list = uploadcare.listOfFiles()\n\ntry await list.get(withQuery: query)\nprint(list)\n\n// Next page\nif list.next != nil {\n  try await list.nextPage()\n  print(list)\n}\n\n// Previous page\nif list.previous != nil {\n  try await filesList.previousPage()\n  print(list)\n}\n',
                                generated: false,
                            },
                        ],
                        kotlin: [
                            {
                                name: "Kotlin",
                                language: "Kotlin",
                                code: 'import com.uploadcare.android.library.api.UploadcareClient\n\nval uploadcare = UploadcareClient(publicKey = "YOUR_PUBLIC_KEY", secretKey = "YOUR_SECRET_KEY")\n\nval filesQueryBuilder = uploadcare.getFiles()\nval files = filesQueryBuilder\n    .stored(true)\n    .ordering(Order.UPLOAD_TIME_DESC)\n    .asList()\nLog.d("TAG", files.toString())\n',
                                generated: false,
                            },
                        ],
                    },
                },
                {
                    path: "/files/",
                    responseStatusCode: 200,
                    name: "without-appdata",
                    responseBody: {
                        type: "json",
                        value: {
                            next: "https://api.uploadcare.com/files/?limit=1&from=2018-11-27T01%3A00%3A43.001705%2B00%3A00&offset=0",
                            previous:
                                "https://api.uploadcare.com/files/?limit=1&to=2018-11-27T01%3A00%3A36.436838%2B00%3A00&offset=0",
                            total: 2484,
                            totals: {
                                removed: 0,
                                stored: 2480,
                                unstored: 4,
                            },
                            per_page: 1,
                            results: [
                                {
                                    datetime_removed: null,
                                    datetime_stored: "2021-09-21T11:24:33.159663Z",
                                    datetime_uploaded: "2021-09-21T11:24:33.159663Z",
                                    is_image: false,
                                    is_ready: true,
                                    mime_type: "video/mp4",
                                    original_file_url:
                                        "https://ucarecdn.com/7ed2aed0-0482-4c13-921b-0557b193edc2/16317390663260.mp4",
                                    original_filename: "16317390663260.mp4",
                                    size: 14479722,
                                    url: "https://api.uploadcare.com/files/7ed2aed0-0482-4c13-921b-0557b193edc2/",
                                    uuid: "test-uuid-replacement",
                                    variations: null,
                                    content_info: {
                                        mime: {
                                            mime: "video/mp4",
                                            type: "video",
                                            subtype: "mp4",
                                        },
                                        video: {
                                            audio: [
                                                {
                                                    codec: "aac",
                                                    bitrate: 129,
                                                    channels: 2,
                                                    sample_rate: 44100,
                                                },
                                            ],
                                            video: [
                                                {
                                                    codec: "h264",
                                                    width: 640,
                                                    height: 480,
                                                    bitrate: 433,
                                                    frame_rate: 30,
                                                },
                                            ],
                                            format: "mp4",
                                            bitrate: 579,
                                            duration: 200044,
                                        },
                                    },
                                    metadata: {
                                        subsystem: "tester",
                                        pet: "dog",
                                    },
                                },
                            ],
                        },
                    },
                    snippets: {
                        javascript: [
                            {
                                name: "JS",
                                language: "JavaScript",
                                code: "import {\n  listOfFiles,\n  UploadcareSimpleAuthSchema,\n} from '@uploadcare/rest-client';\n\nconst uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({\n  publicKey: 'YOUR_PUBLIC_KEY',\n  secretKey: 'YOUR_SECRET_KEY',\n});\n\nconst result = await listOfFiles(\n  {},\n  { authSchema: uploadcareSimpleAuthSchema }\n)\n",
                                generated: false,
                            },
                        ],
                        php: [
                            {
                                name: "PHP",
                                language: "PHP",
                                code: "<?php\n$configuration = Uploadcare\\Configuration::create((string) $_ENV['UPLOADCARE_PUBLIC_KEY'], (string) $_ENV['UPLOADCARE_SECRET_KEY']);\n\n$api = (new Uploadcare\\Api($configuration))->file();\n$list = $api->listFiles();\nforeach ($list->getResults() as $result) {\n    echo \\sprintf('URL: %s', $result->getUrl());\n}\nwhile (($next = $api->nextPage($list)) !== null) {\n    foreach ($next->getResults() as $result) {\n        echo \\sprintf('URL: %s', $result->getUrl());\n    }\n}\n",
                                generated: false,
                            },
                        ],
                        python: [
                            {
                                name: "Python",
                                language: "Python",
                                code: "from pyuploadcare import Uploadcare\nuploadcare = Uploadcare(public_key='YOUR_PUBLIC_KEY', secret_key='YOUR_SECRET_KEY')\n\nfiles = uploadcare.list_files(stored=True, limit=10)\nfor file in files:\n    print(file.info)\n",
                                generated: false,
                            },
                        ],
                        ruby: [
                            {
                                name: "Ruby",
                                language: "Ruby",
                                code: "require 'uploadcare'\nUploadcare.config.public_key = 'YOUR_PUBLIC_KEY'\nUploadcare.config.secret_key = 'YOUR_SECRET_KEY'\n\nlist = Uploadcare::FileList.file_list(stored: true, removed: false, limit: 100)\nlist.each { |file| puts file.inspect }\n",
                                generated: false,
                            },
                        ],
                        swift: [
                            {
                                name: "Swift",
                                language: "Swift",
                                code: 'import Uploadcare\n\nlet uploadcare = Uploadcare(withPublicKey: "YOUR_PUBLIC_KEY", secretKey: "YOUR_SECRET_KEY")\n\nlet query = PaginationQuery()\n  .stored(true)\n  .ordering(.dateTimeUploadedDESC)\n  .limit(10)\nvar list = uploadcare.listOfFiles()\n\ntry await list.get(withQuery: query)\nprint(list)\n\n// Next page\nif list.next != nil {\n  try await list.nextPage()\n  print(list)\n}\n\n// Previous page\nif list.previous != nil {\n  try await filesList.previousPage()\n  print(list)\n}\n',
                                generated: false,
                            },
                        ],
                        kotlin: [
                            {
                                name: "Kotlin",
                                language: "Kotlin",
                                code: 'import com.uploadcare.android.library.api.UploadcareClient\n\nval uploadcare = UploadcareClient(publicKey = "YOUR_PUBLIC_KEY", secretKey = "YOUR_SECRET_KEY")\n\nval filesQueryBuilder = uploadcare.getFiles()\nval files = filesQueryBuilder\n    .stored(true)\n    .ordering(Order.UPLOAD_TIME_DESC)\n    .asList()\nLog.d("TAG", files.toString())\n',
                                generated: false,
                            },
                        ],
                    },
                },
            ],
        },
        "endpoint_file.storeFile": {
            description:
                "Store a single file by UUID. When file is stored, it is available permanently. If not stored — it will only be available for 24 hours. If the parameter is omitted, it checks the `Auto file storing` setting of your Uploadcare project identified by the `public_key` provided in the `auth-param`.",
            namespace: ["File"],
            id: "endpoint_file.storeFile",
            method: "PUT",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "files",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "uuid",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "storage",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            pathParameters: [
                {
                    key: "uuid",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "uuid",
                            },
                        },
                    },
                    description: "File UUID.",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "datetime_removed",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "datetime",
                                        },
                                    },
                                },
                                description: "Date and time when a file was removed, if any.",
                            },
                            {
                                key: "datetime_stored",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "datetime",
                                        },
                                    },
                                },
                                description: "Date and time of the last store request, if any.",
                            },
                            {
                                key: "datetime_uploaded",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "datetime",
                                        },
                                    },
                                },
                                description: "Date and time when a file was uploaded.",
                            },
                            {
                                key: "is_image",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "boolean",
                                        },
                                    },
                                },
                                description: "Is file is image.",
                            },
                            {
                                key: "is_ready",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "boolean",
                                        },
                                    },
                                },
                                description: "Is file is ready to be used after upload.",
                            },
                            {
                                key: "mime_type",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "File MIME-type.",
                            },
                            {
                                key: "original_file_url",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Publicly available file CDN URL. Available if a file is not deleted.",
                            },
                            {
                                key: "original_filename",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Original file name taken from uploaded file.",
                            },
                            {
                                key: "size",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "integer",
                                        },
                                    },
                                },
                                description: "File size in bytes.",
                            },
                            {
                                key: "url",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "API resource URL for a particular file.",
                            },
                            {
                                key: "uuid",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "uuid",
                                        },
                                    },
                                },
                                description: "File UUID.",
                            },
                            {
                                key: "appdata",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "optional",
                                        shape: {
                                            type: "alias",
                                            value: {
                                                type: "id",
                                                id: "applicationDataObject",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                key: "variations",
                                valueShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [],
                                },
                                description:
                                    "Dictionary of other files that were created using this file as a source. It's used for video processing and document conversion jobs. E.g., `<conversion_path>: <uuid>`.",
                            },
                            {
                                key: "content_info",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "contentInfo",
                                    },
                                },
                            },
                            {
                                key: "metadata",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "metadata",
                                    },
                                },
                            },
                        ],
                    },
                    description: "File stored. File info in JSON.",
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 404,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Not found.",
                            },
                        ],
                    },
                    name: "Not Found",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_file.deleteFileStorage": {
            description:
                "Removes individual files. Returns file info.\n\nNote: this operation removes the file from storage but doesn't invalidate CDN cache.\n",
            namespace: ["File"],
            id: "endpoint_file.deleteFileStorage",
            method: "DELETE",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "files",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "uuid",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "storage",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            pathParameters: [
                {
                    key: "uuid",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "uuid",
                            },
                        },
                    },
                    description: "File UUID.",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "datetime_removed",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "datetime",
                                        },
                                    },
                                },
                                description: "Date and time when a file was removed, if any.",
                            },
                            {
                                key: "datetime_stored",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "datetime",
                                        },
                                    },
                                },
                                description: "Date and time of the last store request, if any.",
                            },
                            {
                                key: "datetime_uploaded",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "datetime",
                                        },
                                    },
                                },
                                description: "Date and time when a file was uploaded.",
                            },
                            {
                                key: "is_image",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "boolean",
                                        },
                                    },
                                },
                                description: "Is file is image.",
                            },
                            {
                                key: "is_ready",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "boolean",
                                        },
                                    },
                                },
                                description: "Is file is ready to be used after upload.",
                            },
                            {
                                key: "mime_type",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "File MIME-type.",
                            },
                            {
                                key: "original_file_url",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Publicly available file CDN URL. Available if a file is not deleted.",
                            },
                            {
                                key: "original_filename",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Original file name taken from uploaded file.",
                            },
                            {
                                key: "size",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "integer",
                                        },
                                    },
                                },
                                description: "File size in bytes.",
                            },
                            {
                                key: "url",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "API resource URL for a particular file.",
                            },
                            {
                                key: "uuid",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "uuid",
                                        },
                                    },
                                },
                                description: "File UUID.",
                            },
                            {
                                key: "appdata",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "optional",
                                        shape: {
                                            type: "alias",
                                            value: {
                                                type: "id",
                                                id: "applicationDataObject",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                key: "variations",
                                valueShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [],
                                },
                                description:
                                    "Dictionary of other files that were created using this file as a source. It's used for video processing and document conversion jobs. E.g., `<conversion_path>: <uuid>`.",
                            },
                            {
                                key: "content_info",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "contentInfo",
                                    },
                                },
                            },
                            {
                                key: "metadata",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "metadata",
                                    },
                                },
                            },
                        ],
                    },
                    description: "File deleted. File info in JSON.",
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 404,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Not found.",
                            },
                        ],
                    },
                    name: "Not Found",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [
                {
                    path: "/files/{uuid}/storage/",
                    responseStatusCode: 200,
                    name: "removed-file",
                    responseBody: {
                        type: "json",
                        value: {
                            datetime_removed: "2018-11-26T12:49:11.477888Z",
                            datetime_stored: null,
                            datetime_uploaded: "2018-11-26T12:49:09.945335Z",
                            variations: null,
                            is_image: true,
                            is_ready: true,
                            mime_type: "image/jpeg",
                            original_file_url:
                                "https://ucarecdn.com/22240276-2f06-41f8-9411-755c8ce926ed/pineapple.jpg",
                            original_filename: "pineapple.jpg",
                            size: 642,
                            url: "https://api.uploadcare.com/files/22240276-2f06-41f8-9411-755c8ce926ed/",
                            uuid: "test-uuid-replacement",
                            content_info: {
                                mime: {
                                    mime: "image/jpeg",
                                    type: "image",
                                    subtype: "jpeg",
                                },
                                image: {
                                    format: "JPEG",
                                    width: 500,
                                    height: 500,
                                    sequence: false,
                                    color_mode: "RGB",
                                    orientation: 6,
                                    geo_location: {
                                        latitude: 55.62013611111111,
                                        longitude: 37.66299166666666,
                                    },
                                    datetime_original: "2018-08-20T08:59:50",
                                    dpi: [72, 72],
                                },
                            },
                            metadata: {
                                subsystem: "uploader",
                                pet: "cat",
                            },
                            appdata: {
                                uc_clamav_virus_scan: {
                                    data: {
                                        infected: true,
                                        infected_with: "Win.Test.EICAR_HDB-1",
                                    },
                                    version: "0.104.2",
                                    datetime_created: "2021-09-21T11:24:33.159663Z",
                                    datetime_updated: "2021-09-21T11:24:33.159663Z",
                                },
                            },
                        },
                    },
                    snippets: {
                        javascript: [
                            {
                                name: "JS",
                                language: "JavaScript",
                                code: "import {\n  deleteFile,\n  UploadcareSimpleAuthSchema,\n} from '@uploadcare/rest-client';\n\nconst uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({\n  publicKey: 'YOUR_PUBLIC_KEY',\n  secretKey: 'YOUR_SECRET_KEY',\n});\n\nconst result = await deleteFile(\n  {\n    uuid: '1bac376c-aa7e-4356-861b-dd2657b5bfd2',\n  },\n  { authSchema: uploadcareSimpleAuthSchema }\n)\n",
                                generated: false,
                            },
                        ],
                        php: [
                            {
                                name: "PHP",
                                language: "PHP",
                                code: "<?php\n$configuration = Uploadcare\\Configuration::create((string) $_ENV['UPLOADCARE_PUBLIC_KEY'], (string) $_ENV['UPLOADCARE_SECRET_KEY']);\n\n$fileInfo = (new Uploadcare\\Api($configuration))->file()->deleteFile('1bac376c-aa7e-4356-861b-dd2657b5bfd2');\necho \\sprintf('File \\'%s\\' deleted at \\'%s\\'', $fileInfo->getUuid(), $fileInfo->getDatetimeRemoved()->format(\\DateTimeInterface::ATOM));\n",
                                generated: false,
                            },
                        ],
                        python: [
                            {
                                name: "Python",
                                language: "Python",
                                code: "from pyuploadcare import Uploadcare\nuploadcare = Uploadcare(public_key='YOUR_PUBLIC_KEY', secret_key='YOUR_SECRET_KEY')\n\nfile = uploadcare.file(\"1bac376c-aa7e-4356-861b-dd2657b5bfd2\")\nfile.delete()\n",
                                generated: false,
                            },
                        ],
                        ruby: [
                            {
                                name: "Ruby",
                                language: "Ruby",
                                code: "require 'uploadcare'\nUploadcare.config.public_key = 'YOUR_PUBLIC_KEY'\nUploadcare.config.secret_key = 'YOUR_SECRET_KEY'\n\nputs Uploadcare::File.delete('1bac376c-aa7e-4356-861b-dd2657b5bfd2')\n",
                                generated: false,
                            },
                        ],
                        swift: [
                            {
                                name: "Swift",
                                language: "Swift",
                                code: 'import Uploadcare\n\nlet uploadcare = Uploadcare(withPublicKey: "YOUR_PUBLIC_KEY", secretKey: "YOUR_SECRET_KEY")\n\nlet file = try await uploadcare.deleteFile(withUUID: "1bac376c-aa7e-4356-861b-dd2657b5bfd2")\nprint(file)\n',
                                generated: false,
                            },
                        ],
                        kotlin: [
                            {
                                name: "Kotlin",
                                language: "Kotlin",
                                code: 'import com.uploadcare.android.library.api.UploadcareClient\n\nval uploadcare = UploadcareClient(publicKey = "YOUR_PUBLIC_KEY", secretKey = "YOUR_SECRET_KEY")\n\nuploadcare.deleteFile(fileId = "1bac376c-aa7e-4356-861b-dd2657b5bfd2")\n',
                                generated: false,
                            },
                        ],
                    },
                },
            ],
        },
        "endpoint_file.fileInfo": {
            description: "Get file information by its UUID (immutable).",
            namespace: ["File"],
            id: "endpoint_file.fileInfo",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "files",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "uuid",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            pathParameters: [
                {
                    key: "uuid",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "uuid",
                            },
                        },
                    },
                    description: "File UUID.",
                },
            ],
            queryParameters: [
                {
                    key: "include",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                    description: "Include additional fields to the file object, such as: appdata.",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "datetime_removed",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "datetime",
                                        },
                                    },
                                },
                                description: "Date and time when a file was removed, if any.",
                            },
                            {
                                key: "datetime_stored",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "datetime",
                                        },
                                    },
                                },
                                description: "Date and time of the last store request, if any.",
                            },
                            {
                                key: "datetime_uploaded",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "datetime",
                                        },
                                    },
                                },
                                description: "Date and time when a file was uploaded.",
                            },
                            {
                                key: "is_image",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "boolean",
                                        },
                                    },
                                },
                                description: "Is file is image.",
                            },
                            {
                                key: "is_ready",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "boolean",
                                        },
                                    },
                                },
                                description: "Is file is ready to be used after upload.",
                            },
                            {
                                key: "mime_type",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "File MIME-type.",
                            },
                            {
                                key: "original_file_url",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Publicly available file CDN URL. Available if a file is not deleted.",
                            },
                            {
                                key: "original_filename",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Original file name taken from uploaded file.",
                            },
                            {
                                key: "size",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "integer",
                                        },
                                    },
                                },
                                description: "File size in bytes.",
                            },
                            {
                                key: "url",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "API resource URL for a particular file.",
                            },
                            {
                                key: "uuid",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "uuid",
                                        },
                                    },
                                },
                                description: "File UUID.",
                            },
                            {
                                key: "appdata",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "optional",
                                        shape: {
                                            type: "alias",
                                            value: {
                                                type: "id",
                                                id: "applicationDataObject",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                key: "variations",
                                valueShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [],
                                },
                                description:
                                    "Dictionary of other files that were created using this file as a source. It's used for video processing and document conversion jobs. E.g., `<conversion_path>: <uuid>`.",
                            },
                            {
                                key: "content_info",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "contentInfo",
                                    },
                                },
                            },
                            {
                                key: "metadata",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "metadata",
                                    },
                                },
                            },
                        ],
                    },
                    description: "File info in JSON.",
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 404,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Not found.",
                            },
                        ],
                    },
                    name: "Not Found",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [
                {
                    path: "/files/{uuid}/",
                    responseStatusCode: 200,
                    name: "Image",
                    responseBody: {
                        type: "json",
                        value: {
                            datetime_removed: null,
                            datetime_stored: "2018-11-26T12:49:10.477888Z",
                            datetime_uploaded: "2018-11-26T12:49:09.945335Z",
                            variations: null,
                            is_image: true,
                            is_ready: true,
                            mime_type: "image/jpeg",
                            original_file_url:
                                "https://ucarecdn.com/22240276-2f06-41f8-9411-755c8ce926ed/pineapple.jpg",
                            original_filename: "pineapple.jpg",
                            size: 642,
                            url: "https://api.uploadcare.com/files/22240276-2f06-41f8-9411-755c8ce926ed/",
                            uuid: "test-uuid-replacement",
                            content_info: {
                                mime: {
                                    mime: "image/jpeg",
                                    type: "image",
                                    subtype: "jpeg",
                                },
                                image: {
                                    format: "JPEG",
                                    width: 500,
                                    height: 500,
                                    sequence: false,
                                    color_mode: "RGB",
                                    orientation: 6,
                                    geo_location: {
                                        latitude: 55.62013611111111,
                                        longitude: 37.66299166666666,
                                    },
                                    datetime_original: "2018-08-20T08:59:50",
                                    dpi: [72, 72],
                                },
                            },
                            metadata: {
                                subsystem: "uploader",
                                pet: "cat",
                            },
                            appdata: {
                                aws_rekognition_detect_labels: {
                                    data: {
                                        LabelModelVersion: "2.0",
                                        Labels: [
                                            {
                                                Confidence: 93.41645812988281,
                                                Instances: [],
                                                Name: "Home Decor",
                                                Parents: [],
                                            },
                                            {
                                                Confidence: 70.75951385498047,
                                                Instances: [],
                                                Name: "Linen",
                                                Parents: [
                                                    {
                                                        Name: "Home Decor",
                                                    },
                                                ],
                                            },
                                            {
                                                Confidence: 64.7123794555664,
                                                Instances: [],
                                                Name: "Sunlight",
                                                Parents: [],
                                            },
                                            {
                                                Confidence: 56.264793395996094,
                                                Instances: [],
                                                Name: "Flare",
                                                Parents: [
                                                    {
                                                        Name: "Light",
                                                    },
                                                ],
                                            },
                                            {
                                                Confidence: 50.47153854370117,
                                                Instances: [],
                                                Name: "Tree",
                                                Parents: [
                                                    {
                                                        Name: "Plant",
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    version: "2016-06-27",
                                    datetime_created: "2021-09-21T11:25:31.259763Z",
                                    datetime_updated: "2021-09-21T11:27:33.359763Z",
                                },
                                aws_rekognition_detect_moderation_labels: {
                                    data: {
                                        ModerationModelVersion: "6.0",
                                        ModerationLabels: [
                                            {
                                                Confidence: 93.41645812988281,
                                                Name: "Weapons",
                                                ParentName: "Violence",
                                            },
                                        ],
                                    },
                                    version: "2016-06-27",
                                    datetime_created: "2023-02-21T11:25:31.259763Z",
                                    datetime_updated: "2023-02-21T11:27:33.359763Z",
                                },
                                remove_bg: {
                                    data: {
                                        foreground_type: "person",
                                    },
                                    version: "1.0",
                                    datetime_created: "2021-07-25T12:24:33.159663Z",
                                    datetime_updated: "2021-07-25T12:24:33.159663Z",
                                },
                                uc_clamav_virus_scan: {
                                    data: {
                                        infected: true,
                                        infected_with: "Win.Test.EICAR_HDB-1",
                                    },
                                    version: "0.104.2",
                                    datetime_created: "2021-09-21T11:24:33.159663Z",
                                    datetime_updated: "2021-09-21T11:24:33.159663Z",
                                },
                            },
                        },
                    },
                    snippets: {
                        javascript: [
                            {
                                name: "JS",
                                language: "JavaScript",
                                code: "import {\n  fileInfo,\n  UploadcareSimpleAuthSchema,\n} from '@uploadcare/rest-client';\n\nconst uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({\n  publicKey: 'YOUR_PUBLIC_KEY',\n  secretKey: 'YOUR_SECRET_KEY',\n});\n\nconst result = await fileInfo(\n  {\n    uuid: '1bac376c-aa7e-4356-861b-dd2657b5bfd2',\n  },\n  { authSchema: uploadcareSimpleAuthSchema }\n)\n",
                                generated: false,
                            },
                        ],
                        php: [
                            {
                                name: "PHP",
                                language: "PHP",
                                code: "<?php\n$configuration = Uploadcare\\Configuration::create((string) $_ENV['UPLOADCARE_PUBLIC_KEY'], (string) $_ENV['UPLOADCARE_SECRET_KEY']);\n\n$api = (new Uploadcare\\Api($configuration))->file();\n$fileInfo = $api->fileInfo('1bac376c-aa7e-4356-861b-dd2657b5bfd2');\necho \\sprintf('URL: %s, ID: %s, Mime type: %s', $fileInfo->getUrl(), $fileInfo->getUuid(), $fileInfo->getMimeType());\n",
                                generated: false,
                            },
                        ],
                        python: [
                            {
                                name: "Python",
                                language: "Python",
                                code: "from pyuploadcare import Uploadcare\nuploadcare = Uploadcare(public_key='YOUR_PUBLIC_KEY', secret_key='YOUR_SECRET_KEY')\n\nfile = uploadcare.file(\"1bac376c-aa7e-4356-861b-dd2657b5bfd2\")\nprint(file.info)\n",
                                generated: false,
                            },
                        ],
                        ruby: [
                            {
                                name: "Ruby",
                                language: "Ruby",
                                code: "require 'uploadcare'\nUploadcare.config.public_key = 'YOUR_PUBLIC_KEY'\nUploadcare.config.secret_key = 'YOUR_SECRET_KEY'\n\nuuid = '1bac376c-aa7e-4356-861b-dd2657b5bfd2'\nputs Uploadcare::File.info(uuid).inspect\n",
                                generated: false,
                            },
                        ],
                        swift: [
                            {
                                name: "Swift",
                                language: "Swift",
                                code: 'import Uploadcare\n\nlet uploadcare = Uploadcare(withPublicKey: "YOUR_PUBLIC_KEY", secretKey: "YOUR_SECRET_KEY")\n\nlet fileInfoQuery = FileInfoQuery().include(.appdata)\nlet file = try await uploadcare.fileInfo(withUUID: "1bac376c-aa7e-4356-861b-dd2657b5bfd2", withQuery: fileInfoQuery)\nprint(file)\n',
                                generated: false,
                            },
                        ],
                        kotlin: [
                            {
                                name: "Kotlin",
                                language: "Kotlin",
                                code: 'import com.uploadcare.android.library.api.UploadcareClient\n\nval uploadcare = UploadcareClient(publicKey = "YOUR_PUBLIC_KEY", secretKey = "YOUR_SECRET_KEY")\n\nval file = uploadcare.getFile(fileId = "1bac376c-aa7e-4356-861b-dd2657b5bfd2")\nLog.d("TAG", file.toString())\n',
                                generated: false,
                            },
                        ],
                    },
                },
                {
                    path: "/files/{uuid}/",
                    responseStatusCode: 200,
                    name: "Video",
                    responseBody: {
                        type: "json",
                        value: {
                            datetime_removed: null,
                            datetime_stored: "2021-09-21T11:24:33.159663Z",
                            datetime_uploaded: "2021-09-21T11:24:33.159663Z",
                            is_image: false,
                            is_ready: true,
                            mime_type: "video/mp4",
                            original_file_url:
                                "https://ucarecdn.com/7ed2aed0-0482-4c13-921b-0557b193edc2/16317390663260.mp4",
                            original_filename: "16317390663260.mp4",
                            size: 14479722,
                            url: "https://api.uploadcare.com/files/7ed2aed0-0482-4c13-921b-0557b193edc2/",
                            uuid: "test-uuid-replacement",
                            variations: null,
                            content_info: {
                                mime: {
                                    mime: "video/mp4",
                                    type: "video",
                                    subtype: "mp4",
                                },
                                video: {
                                    audio: [
                                        {
                                            codec: "aac",
                                            bitrate: 129,
                                            channels: 2,
                                            sample_rate: 44100,
                                        },
                                    ],
                                    video: [
                                        {
                                            codec: "h264",
                                            width: 640,
                                            height: 480,
                                            bitrate: 433,
                                            frame_rate: 30,
                                        },
                                    ],
                                    format: "mp4",
                                    bitrate: 579,
                                    duration: 200044,
                                },
                            },
                            metadata: {
                                subsystem: "tester",
                                pet: "dog",
                            },
                        },
                    },
                    snippets: {
                        javascript: [
                            {
                                name: "JS",
                                language: "JavaScript",
                                code: "import {\n  fileInfo,\n  UploadcareSimpleAuthSchema,\n} from '@uploadcare/rest-client';\n\nconst uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({\n  publicKey: 'YOUR_PUBLIC_KEY',\n  secretKey: 'YOUR_SECRET_KEY',\n});\n\nconst result = await fileInfo(\n  {\n    uuid: '1bac376c-aa7e-4356-861b-dd2657b5bfd2',\n  },\n  { authSchema: uploadcareSimpleAuthSchema }\n)\n",
                                generated: false,
                            },
                        ],
                        php: [
                            {
                                name: "PHP",
                                language: "PHP",
                                code: "<?php\n$configuration = Uploadcare\\Configuration::create((string) $_ENV['UPLOADCARE_PUBLIC_KEY'], (string) $_ENV['UPLOADCARE_SECRET_KEY']);\n\n$api = (new Uploadcare\\Api($configuration))->file();\n$fileInfo = $api->fileInfo('1bac376c-aa7e-4356-861b-dd2657b5bfd2');\necho \\sprintf('URL: %s, ID: %s, Mime type: %s', $fileInfo->getUrl(), $fileInfo->getUuid(), $fileInfo->getMimeType());\n",
                                generated: false,
                            },
                        ],
                        python: [
                            {
                                name: "Python",
                                language: "Python",
                                code: "from pyuploadcare import Uploadcare\nuploadcare = Uploadcare(public_key='YOUR_PUBLIC_KEY', secret_key='YOUR_SECRET_KEY')\n\nfile = uploadcare.file(\"1bac376c-aa7e-4356-861b-dd2657b5bfd2\")\nprint(file.info)\n",
                                generated: false,
                            },
                        ],
                        ruby: [
                            {
                                name: "Ruby",
                                language: "Ruby",
                                code: "require 'uploadcare'\nUploadcare.config.public_key = 'YOUR_PUBLIC_KEY'\nUploadcare.config.secret_key = 'YOUR_SECRET_KEY'\n\nuuid = '1bac376c-aa7e-4356-861b-dd2657b5bfd2'\nputs Uploadcare::File.info(uuid).inspect\n",
                                generated: false,
                            },
                        ],
                        swift: [
                            {
                                name: "Swift",
                                language: "Swift",
                                code: 'import Uploadcare\n\nlet uploadcare = Uploadcare(withPublicKey: "YOUR_PUBLIC_KEY", secretKey: "YOUR_SECRET_KEY")\n\nlet fileInfoQuery = FileInfoQuery().include(.appdata)\nlet file = try await uploadcare.fileInfo(withUUID: "1bac376c-aa7e-4356-861b-dd2657b5bfd2", withQuery: fileInfoQuery)\nprint(file)\n',
                                generated: false,
                            },
                        ],
                        kotlin: [
                            {
                                name: "Kotlin",
                                language: "Kotlin",
                                code: 'import com.uploadcare.android.library.api.UploadcareClient\n\nval uploadcare = UploadcareClient(publicKey = "YOUR_PUBLIC_KEY", secretKey = "YOUR_SECRET_KEY")\n\nval file = uploadcare.getFile(fileId = "1bac376c-aa7e-4356-861b-dd2657b5bfd2")\nLog.d("TAG", file.toString())\n',
                                generated: false,
                            },
                        ],
                    },
                },
            ],
        },
        "endpoint_file.filesStoring": {
            description:
                "Used to store multiple files in one go. Up to 100 files are supported per request. A JSON object holding your File list SHOULD be put into a request body.",
            namespace: ["File"],
            id: "endpoint_file.filesStoring",
            method: "PUT",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "files",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "storage",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            requests: [],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "status",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                            {
                                key: "problems",
                                valueShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [],
                                },
                                description:
                                    "Dictionary of passed files UUIDs and problems associated with these UUIDs.",
                            },
                            {
                                key: "result",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "list",
                                        itemShape: {
                                            type: "alias",
                                            value: {
                                                type: "id",
                                                id: "file",
                                            },
                                        },
                                    },
                                },
                                description: "List of file objects that have been stored/deleted.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "undiscriminatedUnion",
                        variants: [
                            {
                                shape: {
                                    type: "object",
                                    extends: [],
                                    properties: [
                                        {
                                            key: "detail",
                                            valueShape: {
                                                type: "enum",
                                                values: [
                                                    {
                                                        value: "Expected list of UUIDs",
                                                    },
                                                    {
                                                        value: "List of UUIDs can not be empty",
                                                    },
                                                    {
                                                        value: "Maximum UUIDs per request is exceeded. The limit is 100",
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                                description: "File UUIDs list validation errors.",
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_file.filesDelete": {
            description:
                "Used to delete multiple files in one go. Up to 100 files are supported per request. A JSON object holding your File list SHOULD be put into a request body.\n\nNote: this operation removes files from storage but doesn't invalidate CDN cache.\n",
            namespace: ["File"],
            id: "endpoint_file.filesDelete",
            method: "DELETE",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "files",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "storage",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            requests: [],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "status",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                            {
                                key: "problems",
                                valueShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [],
                                },
                                description:
                                    "Dictionary of passed files UUIDs and problems associated with these UUIDs.",
                            },
                            {
                                key: "result",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "list",
                                        itemShape: {
                                            type: "alias",
                                            value: {
                                                type: "id",
                                                id: "file",
                                            },
                                        },
                                    },
                                },
                                description: "List of file objects that have been stored/deleted.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "undiscriminatedUnion",
                        variants: [
                            {
                                shape: {
                                    type: "object",
                                    extends: [],
                                    properties: [
                                        {
                                            key: "detail",
                                            valueShape: {
                                                type: "enum",
                                                values: [
                                                    {
                                                        value: "Expected list of UUIDs",
                                                    },
                                                    {
                                                        value: "List of UUIDs can not be empty",
                                                    },
                                                    {
                                                        value: "Maximum UUIDs per request is exceeded. The limit is 100",
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                                description: "File UUIDs list validation errors.",
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_file.createLocalCopy": {
            description:
                "POST requests are used to copy original files or their modified versions to a default storage.\n\nSource files MAY either be stored or just uploaded and MUST NOT be deleted.\n\nCopying of large files is not supported at the moment. If the file CDN URL includes transformation operators, its size MUST NOT exceed 100 MB. If not, the size MUST NOT exceed 5 GB.\n",
            namespace: ["File"],
            id: "endpoint_file.createLocalCopy",
            method: "POST",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "files",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "local_copy",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            requests: [
                {
                    contentType: "application/json",
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "source",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "A CDN URL or just UUID of a file subjected to copy.",
                            },
                            {
                                key: "store",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "optional",
                                        shape: {
                                            type: "enum",
                                            values: [
                                                {
                                                    value: "true",
                                                },
                                                {
                                                    value: "false",
                                                },
                                            ],
                                            default: "false",
                                        },
                                        default: "false",
                                    },
                                },
                                description:
                                    "The parameter only applies to the Uploadcare storage and MUST be either true or false.",
                            },
                            {
                                key: "metadata",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "optional",
                                        shape: {
                                            type: "object",
                                            extends: [],
                                            properties: [],
                                        },
                                    },
                                },
                                description: "Arbitrary additional metadata.",
                            },
                        ],
                    },
                },
            ],
            responses: [
                {
                    statusCode: 201,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "type",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default: "file",
                                        },
                                    },
                                },
                            },
                            {
                                key: "result",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "fileCopy",
                                    },
                                },
                            },
                        ],
                    },
                    description:
                        "The file was copied successfully. HTTP response contains `result` field with information about the copy.",
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Bad `source` parameter. Use UUID or CDN URL.",
                                        },
                                        {
                                            value: "`source` parameter is required.",
                                        },
                                        {
                                            value: "Project has no storage with provided name.",
                                        },
                                        {
                                            value: "`store` parameter should be `true` or `false`.",
                                        },
                                        {
                                            value: "Invalid pattern provided: `pattern_value`",
                                        },
                                        {
                                            value: "Invalid pattern provided: Invalid character in a pattern.",
                                        },
                                        {
                                            value: "File is not ready yet.",
                                        },
                                        {
                                            value: "Copying of large files is not supported at the moment.",
                                        },
                                        {
                                            value: "Not allowed on your current plan.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_file.createRemoteCopy": {
            description:
                "POST requests are used to copy original files or their modified versions to a custom storage.\n\nSource files MAY either be stored or just uploaded and MUST NOT be deleted.\n\nCopying of large files is not supported at the moment. File size MUST NOT exceed 5 GB.\n",
            namespace: ["File"],
            id: "endpoint_file.createRemoteCopy",
            method: "POST",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "files",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "remote_copy",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            requests: [
                {
                    contentType: "application/json",
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "source",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "A CDN URL or just UUID of a file subjected to copy.",
                            },
                            {
                                key: "target",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description:
                                    "Identifies a custom storage name related to your project. It implies that you are copying a file to a specified custom storage. Keep in mind that you can have multiple storages associated with a single S3 bucket.",
                            },
                            {
                                key: "make_public",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "optional",
                                        shape: {
                                            type: "alias",
                                            value: {
                                                type: "primitive",
                                                value: {
                                                    type: "boolean",
                                                    default: true,
                                                },
                                            },
                                        },
                                    },
                                },
                                description:
                                    "MUST be either `true` or `false`. The `true` value makes copied files available via public links, `false` does the opposite.",
                            },
                            {
                                key: "pattern",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "optional",
                                        shape: {
                                            type: "enum",
                                            values: [
                                                {
                                                    value: "${default}",
                                                },
                                                {
                                                    value: "${auto_filename}",
                                                },
                                                {
                                                    value: "${effects}",
                                                },
                                                {
                                                    value: "${filename}",
                                                },
                                                {
                                                    value: "${uuid}",
                                                },
                                                {
                                                    value: "${ext}",
                                                },
                                            ],
                                            default: "${default}",
                                        },
                                        default: "${default}",
                                    },
                                },
                                description:
                                    "The parameter is used to specify file names Uploadcare passes to a custom storage. If the parameter is omitted, your custom storages pattern is used. Use any combination of allowed values.\n\nParameter values:\n- `${default}` = `${uuid}/${auto_filename}`\n- `${auto_filename}` = `${filename}${effects}${ext}`\n- `${effects}` = processing operations put into a CDN URL\n- `${filename}` = original filename without extension\n- `${uuid}` = file UUID\n- `${ext}` = file extension, including period, e.g. .jpg\n",
                            },
                        ],
                    },
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "type",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default: "url",
                                        },
                                    },
                                },
                            },
                            {
                                key: "result",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description:
                                    "URL with an s3 scheme. Your bucket name is put as a host, and an s3 object path follows.",
                            },
                        ],
                    },
                },
                {
                    statusCode: 201,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "type",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default: "url",
                                        },
                                    },
                                },
                            },
                            {
                                key: "result",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description:
                                    "URL with an s3 scheme. Your bucket name is put as a host, and an s3 object path follows.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "undiscriminatedUnion",
                        variants: [],
                    },
                    description: "Simple HTTP auth. on HTTP or file copy errors.",
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_addOns.awsRekognitionExecute": {
            description:
                "An `Add-On` is an application implemented by Uploadcare that accepts uploaded files as an\ninput and can produce other files and/or [appdata](/docs/api/rest/file/info/#response.body.appdata) as an output.\n\nExecute [AWS Rekognition](https://docs.aws.amazon.com/rekognition/latest/dg/labels-detect-labels-image.html) Add-On for a given target to detect labels in images. **Note:** Detected labels are stored in the file's appdata.\n",
            namespace: ["Add-Ons"],
            id: "endpoint_addOns.awsRekognitionExecute",
            method: "POST",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "addons",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "aws_rekognition_detect_labels",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "execute",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            requests: [
                {
                    contentType: "application/json",
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "target",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "uuid",
                                        },
                                    },
                                },
                                description: "Unique ID of the file to process",
                            },
                        ],
                    },
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "request_id",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "uuid",
                                        },
                                    },
                                },
                                description: "Request ID.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 409,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default: "Concurrent call attempted",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Conflict",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_addOns.awsRekognitionExecutionStatus": {
            description:
                "Check the status of an Add-On execution request that had been started\nusing the [Execute Add-On](/docs/api/rest/add-ons/aws-rekognition-execute/) operation.\n",
            namespace: ["Add-Ons"],
            id: "endpoint_addOns.awsRekognitionExecutionStatus",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "addons",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "aws_rekognition_detect_labels",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "execute",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "status",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            queryParameters: [
                {
                    key: "request_id",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "uuid",
                            },
                        },
                    },
                    description: "Request ID returned by the Add-On execution request described above.\n",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "status",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "in_progress",
                                        },
                                        {
                                            value: "error",
                                        },
                                        {
                                            value: "done",
                                        },
                                        {
                                            value: "unknown",
                                        },
                                    ],
                                },
                                description:
                                    "Defines the status of an Add-On execution.\nIn most cases, once the status changes to `done`, [Application Data](/docs/api/rest/file/info/#response.body.appdata) of the file that had been specified as a `appdata`, will contain the result of the execution.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_addOns.awsRekognitionDetectModerationLabelsExecute": {
            description:
                "Execute [AWS Rekognition Moderation](https://docs.aws.amazon.com/rekognition/latest/dg/moderation.html) Add-On for a given target to detect moderation labels in images. **Note:** Detected moderation labels are stored in the file's appdata.",
            namespace: ["Add-Ons"],
            id: "endpoint_addOns.awsRekognitionDetectModerationLabelsExecute",
            method: "POST",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "addons",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "aws_rekognition_detect_moderation_labels",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "execute",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            requests: [
                {
                    contentType: "application/json",
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "target",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "uuid",
                                        },
                                    },
                                },
                                description: "Unique ID of the file to process",
                            },
                        ],
                    },
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "request_id",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "uuid",
                                        },
                                    },
                                },
                                description: "Request ID.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 409,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default: "Concurrent call attempted",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Conflict",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_addOns.awsRekognitionDetectModerationLabelsExecutionStatus": {
            description:
                "Check the status of an Add-On execution request that had been started\nusing the [Execute Add-On](/docs/api/rest/add-ons/aws-rekognition-detect-moderation-labels-execution-status/) operation.\n",
            namespace: ["Add-Ons"],
            id: "endpoint_addOns.awsRekognitionDetectModerationLabelsExecutionStatus",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "addons",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "aws_rekognition_detect_moderation_labels",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "execute",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "status",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            queryParameters: [
                {
                    key: "request_id",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "uuid",
                            },
                        },
                    },
                    description: "Request ID returned by the Add-On execution request described above.\n",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "status",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "in_progress",
                                        },
                                        {
                                            value: "error",
                                        },
                                        {
                                            value: "done",
                                        },
                                        {
                                            value: "unknown",
                                        },
                                    ],
                                },
                                description:
                                    "Defines the status of an Add-On execution.\nIn most cases, once the status changes to `done`, [Application Data](/docs/api/rest/file/info/#response.body.appdata) of the file that had been specified as a `appdata`, will contain the result of the execution.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_addOns.ucClamavVirusScanExecute": {
            description: "Execute [ClamAV](https://www.clamav.net/) virus checking Add-On for a given target.",
            namespace: ["Add-Ons"],
            id: "endpoint_addOns.ucClamavVirusScanExecute",
            method: "POST",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "addons",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "uc_clamav_virus_scan",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "execute",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            requests: [
                {
                    contentType: "application/json",
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "target",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "uuid",
                                        },
                                    },
                                },
                                description: "Unique ID of the file to process",
                            },
                            {
                                key: "params",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "optional",
                                        shape: {
                                            type: "object",
                                            extends: [],
                                            properties: [
                                                {
                                                    key: "purge_infected",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "boolean",
                                                            },
                                                        },
                                                    },
                                                    description: "Purge infected file.",
                                                },
                                            ],
                                        },
                                    },
                                },
                                description: "Optional object with Add-On specific parameters",
                            },
                        ],
                    },
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "request_id",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "uuid",
                                        },
                                    },
                                },
                                description: "Request ID.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 409,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default: "Concurrent call attempted",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Conflict",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_addOns.ucClamavVirusScanExecutionStatus": {
            description:
                "Check the status of an Add-On execution request that had been started\nusing the [Execute Add-On](/docs/api/rest/add-ons/uc-clamav-virus-scan-execute/) operation.\n",
            namespace: ["Add-Ons"],
            id: "endpoint_addOns.ucClamavVirusScanExecutionStatus",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "addons",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "uc_clamav_virus_scan",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "execute",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "status",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            queryParameters: [
                {
                    key: "request_id",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "uuid",
                            },
                        },
                    },
                    description: "Request ID returned by the Add-On execution request described above.\n",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "status",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "in_progress",
                                        },
                                        {
                                            value: "error",
                                        },
                                        {
                                            value: "done",
                                        },
                                        {
                                            value: "unknown",
                                        },
                                    ],
                                },
                                description:
                                    "Defines the status of an Add-On execution.\nIn most cases, once the status changes to `done`, [Application Data](/docs/api/rest/file/info/#response.body.appdata) of the file that had been specified as a `appdata`, will contain the result of the execution.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_addOns.removeBgExecute": {
            description: "Execute [remove.bg](https://remove.bg/) background image removal Add-On for a given target.",
            namespace: ["Add-Ons"],
            id: "endpoint_addOns.removeBgExecute",
            method: "POST",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "addons",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "remove_bg",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "execute",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            requests: [
                {
                    contentType: "application/json",
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "target",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "uuid",
                                        },
                                    },
                                },
                                description: "Unique ID of the file to process",
                            },
                            {
                                key: "params",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "optional",
                                        shape: {
                                            type: "object",
                                            extends: [],
                                            properties: [
                                                {
                                                    key: "crop",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "boolean",
                                                                default: false,
                                                            },
                                                        },
                                                    },
                                                    description: "Whether to crop off all empty regions",
                                                },
                                                {
                                                    key: "crop_margin",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "string",
                                                                default: "0",
                                                            },
                                                        },
                                                    },
                                                    description:
                                                        "Adds a margin around the cropped subject, e.g 30px or 30%",
                                                },
                                                {
                                                    key: "scale",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "string",
                                                            },
                                                        },
                                                    },
                                                    description:
                                                        "Scales the subject relative to the total image size, e.g 80%",
                                                },
                                                {
                                                    key: "add_shadow",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "boolean",
                                                                default: false,
                                                            },
                                                        },
                                                    },
                                                    description: "Whether to add an artificial shadow to the result",
                                                },
                                                {
                                                    key: "type_level",
                                                    valueShape: {
                                                        type: "enum",
                                                        values: [
                                                            {
                                                                value: "none",
                                                            },
                                                            {
                                                                value: "1",
                                                            },
                                                            {
                                                                value: "2",
                                                            },
                                                            {
                                                                value: "latest",
                                                            },
                                                        ],
                                                        default: "none",
                                                    },
                                                    description:
                                                        '"none" = No classification (foreground_type won\'t bet set in the application data)\n\n"1" = Use coarse classification classes: [person, product, animal, car, other]\n\n"2" = Use more specific classification classes: [person, product, animal, car,\n      car_interior, car_part, transportation, graphics, other]\n\n"latest" = Always use the latest classification classes available\n',
                                                },
                                                {
                                                    key: "type",
                                                    valueShape: {
                                                        type: "enum",
                                                        values: [
                                                            {
                                                                value: "auto",
                                                            },
                                                            {
                                                                value: "person",
                                                            },
                                                            {
                                                                value: "product",
                                                            },
                                                            {
                                                                value: "car",
                                                            },
                                                        ],
                                                    },
                                                    description: "Foreground type.",
                                                },
                                                {
                                                    key: "semitransparency",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "boolean",
                                                                default: true,
                                                            },
                                                        },
                                                    },
                                                    description:
                                                        "Whether to have semi-transparent regions in the result",
                                                },
                                                {
                                                    key: "channels",
                                                    valueShape: {
                                                        type: "enum",
                                                        values: [
                                                            {
                                                                value: "rgba",
                                                            },
                                                            {
                                                                value: "alpha",
                                                            },
                                                        ],
                                                        default: "rgba",
                                                    },
                                                    description:
                                                        "Request either the finalized image ('rgba', default) or an alpha mask ('alpha').",
                                                },
                                                {
                                                    key: "roi",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "string",
                                                            },
                                                        },
                                                    },
                                                    description:
                                                        "Region of interest: Only contents of this rectangular region can be detected\nas foreground. Everything outside is considered background and will be removed.\nThe rectangle is defined as two x/y coordinates in the format \"x1 y1 x2 y2\".\nThe coordinates can be in absolute pixels (suffix 'px') or relative to the\nwidth/height of the image (suffix '%'). By default, the whole image is the\nregion of interest (\"0% 0% 100% 100%\").\n",
                                                },
                                                {
                                                    key: "position",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "string",
                                                            },
                                                        },
                                                    },
                                                    description:
                                                        'Positions the subject within the image canvas. Can be "original"\n(default unless "scale" is given), "center" (default when "scale" is given) or a value from "0%" to "100%"\n(both horizontal and vertical) or two values (horizontal, vertical).\n',
                                                },
                                            ],
                                        },
                                    },
                                },
                                description: "Optional object with Add-On specific parameters",
                            },
                        ],
                    },
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "request_id",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "uuid",
                                        },
                                    },
                                },
                                description: "Request ID.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 409,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default: "Concurrent call attempted",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Conflict",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_addOns.removeBgExecutionStatus": {
            description:
                "Check the status of an Add-On execution request that had been started\nusing the [Execute Add-On](/docs/api/rest/add-ons/remove-bg-execute/) operation.\n",
            namespace: ["Add-Ons"],
            id: "endpoint_addOns.removeBgExecutionStatus",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "addons",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "remove_bg",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "execute",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "status",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            queryParameters: [
                {
                    key: "request_id",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "uuid",
                            },
                        },
                    },
                    description: "Request ID returned by the Add-On execution request described above.\n",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: ["addonExecutionStatus"],
                        properties: [],
                    },
                    description:
                        "Add-On execution response. See `file_id` in response in order to get image without background.",
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_fileMetadata._fileMetadata": {
            description:
                "File metadata is additional, arbitrary data, associated with uploaded file. As an example, you could store unique file identifier from your system.\n\nMetadata is key-value data. You can specify up to 50 keys, with key names up to 64 characters long and values up to 512 characters long.\nRead more in the [docs](/docs/file-metadata/).\n\n**Notice:** Do not store any sensitive information (bank account numbers, card details, etc.) as metadata.\n\n**Notice:** File metadata is provided by the end-users uploading the files and can contain symbols unsafe in, for example, HTML context. Please escape the metadata before use according to the rules of the target runtime context (HTML browser, SQL query parameter, etc).\n\nGet file's metadata keys and values.\n",
            namespace: ["File metadata"],
            id: "endpoint_fileMetadata._fileMetadata",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "files",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "uuid",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "metadata",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            pathParameters: [
                {
                    key: "uuid",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "uuid",
                            },
                        },
                    },
                    description: "File UUID.",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_fileMetadata.fileMetadataKey": {
            description: "Get the value of a single metadata key.",
            namespace: ["File metadata"],
            id: "endpoint_fileMetadata.fileMetadataKey",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "files",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "uuid",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "metadata",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "key",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            pathParameters: [
                {
                    key: "uuid",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "uuid",
                            },
                        },
                    },
                    description: "File UUID.",
                },
                {
                    key: "key",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description:
                        "Key of file metadata.\nList of allowed characters for the key:\n  - Latin letters in lower or upper case (a-z,A-Z)\n  - digits (0-9)\n  - underscore `_`\n  - a hyphen `-`\n  - dot `.`\n  - colon `:`\n",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Value of a file's metadata key.",
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_fileMetadata.updateFileMetadataKey": {
            description: "Update the value of a single metadata key. If the key does not exist, it will be created.",
            namespace: ["File metadata"],
            id: "endpoint_fileMetadata.updateFileMetadataKey",
            method: "PUT",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "files",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "uuid",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "metadata",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "key",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            pathParameters: [
                {
                    key: "uuid",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "uuid",
                            },
                        },
                    },
                    description: "File UUID.",
                },
                {
                    key: "key",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description:
                        "Key of file metadata.\nList of allowed characters for the key:\n  - Latin letters in lower or upper case (a-z,A-Z)\n  - digits (0-9)\n  - underscore `_`\n  - a hyphen `-`\n  - dot `.`\n  - colon `:`\n",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            requests: [],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Value of a file's metadata key successfully updated.",
                },
                {
                    statusCode: 201,
                    body: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Key of a file metadata successfully added.",
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_fileMetadata.deleteFileMetadataKey": {
            description: "Delete a file's metadata key.",
            namespace: ["File metadata"],
            id: "endpoint_fileMetadata.deleteFileMetadataKey",
            method: "DELETE",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "files",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "uuid",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "metadata",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "key",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            pathParameters: [
                {
                    key: "uuid",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "uuid",
                            },
                        },
                    },
                    description: "File UUID.",
                },
                {
                    key: "key",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description:
                        "Key of file metadata.\nList of allowed characters for the key:\n  - Latin letters in lower or upper case (a-z,A-Z)\n  - digits (0-9)\n  - underscore `_`\n  - a hyphen `-`\n  - dot `.`\n  - colon `:`\n",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_group.groupsList": {
            description: "Get a paginated list of groups.",
            namespace: ["Group"],
            id: "endpoint_group.groupsList",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "groups",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            queryParameters: [
                {
                    key: "limit",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: {
                                    type: "primitive",
                                    value: {
                                        type: "double",
                                    },
                                },
                            },
                        },
                    },
                    description:
                        "A preferred amount of groups in a list for a single response.\nDefaults to 100, while the maximum is 1000.\n",
                },
                {
                    key: "from",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: {
                                    type: "primitive",
                                    value: {
                                        type: "datetime",
                                    },
                                },
                            },
                        },
                    },
                    description:
                        "A starting point for filtering the list of groups.\nIf passed, MUST be a date and time value in ISO-8601 format.\n",
                },
                {
                    key: "ordering",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "enum",
                                values: [
                                    {
                                        value: "datetime_created",
                                    },
                                    {
                                        value: "-datetime_created",
                                    },
                                ],
                                default: "datetime_created",
                            },
                            default: "datetime_created",
                        },
                    },
                    description:
                        "Specifies the way groups should be sorted in the returned list.\n`datetime_created` for the ascending order (default),\n`-datetime_created` for the descending one.\n",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "enum",
                        values: [
                            {
                                value: "application/vnd.uploadcare-v0.7+json",
                            },
                        ],
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "next",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Next page URL.",
                            },
                            {
                                key: "previous",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Previous page URL.",
                            },
                            {
                                key: "total",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "double",
                                            minimum: 0,
                                        },
                                    },
                                },
                                description: "Total number of groups in the project.",
                            },
                            {
                                key: "per_page",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "double",
                                        },
                                    },
                                },
                                description: "Number of groups per page.",
                            },
                            {
                                key: "results",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "list",
                                        itemShape: {
                                            type: "alias",
                                            value: {
                                                type: "id",
                                                id: "group",
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [
                {
                    path: "/groups/",
                    responseStatusCode: 200,
                    name: "list",
                    responseBody: {
                        type: "json",
                        value: {
                            next: "https://api.uploadcare.com/groups/?limit=3&from=2016-11-09T14%3A30%3A22.421889%2B00%3A00&offset=0",
                            previous: null,
                            total: 100,
                            per_page: 2,
                            results: [
                                {
                                    id: "dd43982b-5447-44b2-86f6-1c3b52afa0ff~1",
                                    datetime_created: "2018-11-27T14:14:37.583654Z",
                                    files_count: 1,
                                    cdn_url: "https://ucarecdn.com/dd43982b-5447-44b2-86f6-1c3b52afa0ff~1/",
                                    url: "https://api.uploadcare.com/groups/dd43982b-5447-44b2-86f6-1c3b52afa0ff~1/",
                                },
                                {
                                    id: "fd59dbcb-40a1-4f3a-8062-cc7d23f66885~1",
                                    datetime_created: "2018-11-27T15:14:39.586674Z",
                                    files_count: 1,
                                    cdn_url: "https://ucarecdn.com/fd59dbcb-40a1-4f3a-8062-cc7d23f66885~1/",
                                    url: "https://api.uploadcare.com/groups/fd59dbcb-40a1-4f3a-8062-cc7d23f66885~1/",
                                },
                            ],
                        },
                    },
                    snippets: {
                        javascript: [
                            {
                                name: "JS",
                                language: "JavaScript",
                                code: "import {\n  listOfGroups,\n  UploadcareSimpleAuthSchema,\n} from '@uploadcare/rest-client';\n\nconst uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({\n  publicKey: 'YOUR_PUBLIC_KEY',\n  secretKey: 'YOUR_SECRET_KEY',\n});\n\nconst result = await listOfGroups({}, { authSchema: uploadcareSimpleAuthSchema })\n",
                                generated: false,
                            },
                        ],
                        php: [
                            {
                                name: "PHP",
                                language: "PHP",
                                code: "<?php\n$configuration = Uploadcare\\Configuration::create((string) $_ENV['UPLOADCARE_PUBLIC_KEY'], (string) $_ENV['UPLOADCARE_SECRET_KEY']);\n\n$api = (new Uploadcare\\Api($configuration))->group();\n$list = $api->listGroups();\nforeach ($list->getResults() as $group) {\n    \\sprintf('Group URL: %s, ID: %s', $group->getUrl(), $group->getUuid());\n}\nwhile (($next = $api->nextPage($list)) !== null) {\n    foreach ($next->getResults() as $group) {\n        \\sprintf('Group URL: %s, ID: %s', $group->getUrl(), $group->getUuid());\n    }\n}\n",
                                generated: false,
                            },
                        ],
                        python: [
                            {
                                name: "Python",
                                language: "Python",
                                code: "from pyuploadcare import Uploadcare\nuploadcare = Uploadcare(public_key='YOUR_PUBLIC_KEY', secret_key='YOUR_SECRET_KEY')\n\ngroups_list = uploadcare.list_file_groups()\nprint('Number of groups is', groups_list.count())\n",
                                generated: false,
                            },
                        ],
                        ruby: [
                            {
                                name: "Ruby",
                                language: "Ruby",
                                code: "require 'uploadcare'\nUploadcare.config.public_key = 'YOUR_PUBLIC_KEY'\nUploadcare.config.secret_key = 'YOUR_SECRET_KEY'\n\ngroups = Uploadcare::GroupList.list(limit: 10)\ngroups.each { |group| puts group.inspect }\n",
                                generated: false,
                            },
                        ],
                        swift: [
                            {
                                name: "Swift",
                                language: "Swift",
                                code: 'import Uploadcare\n\nlet uploadcare = Uploadcare(withPublicKey: "YOUR_PUBLIC_KEY", secretKey: "YOUR_SECRET_KEY")\n\nlet query = GroupsListQuery()\n  .limit(10)\n  .ordering(.datetimeCreatedDESC)\n  \nlet groupsList = uploadcare.listOfGroups()\n\nlet list = try await groupsList.get(withQuery: query)\nprint(list)\n\n// Next page\nlet next = try await groupsList.nextPage()\nprint(list)\n\n// Previous page\nlet previous = try await groupsList.previousPage()\nprint(list)\n',
                                generated: false,
                            },
                        ],
                        kotlin: [
                            {
                                name: "Kotlin",
                                language: "Kotlin",
                                code: 'import com.uploadcare.android.library.api.UploadcareClient\n\nval uploadcare = UploadcareClient(publicKey = "YOUR_PUBLIC_KEY", secretKey = "YOUR_SECRET_KEY")\n\nval groupsQueryBuilder = uploadcare.getGroups()\nval groups = groupsQueryBuilder\n    .ordering(Order.UPLOAD_TIME_DESC)\n    .asList()\nLog.d("TAG", groups.toString())\n',
                                generated: false,
                            },
                        ],
                    },
                },
            ],
        },
        "endpoint_group.groupInfo": {
            description:
                "Get a file group by its ID.\n\nGroups are identified in a way similar to individual files. A group ID consists of a UUID\nfollowed by a “~” (tilde) character and a group size: integer number of the files in the group.\n",
            namespace: ["Group"],
            id: "endpoint_group.groupInfo",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "groups",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "uuid",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            pathParameters: [
                {
                    key: "uuid",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Group UUID.",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "enum",
                        values: [
                            {
                                value: "application/vnd.uploadcare-v0.7+json",
                            },
                        ],
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: ["group"],
                        properties: [],
                    },
                    description: "Group's info",
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 404,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Group not found.",
                            },
                        ],
                    },
                    name: "Not Found",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_group.deleteGroup": {
            description:
                "Delete a file group by its ID.\n\n**Note**: The operation only removes the group object itself. **All the files that were part of the group are left as is.**\n",
            namespace: ["Group"],
            id: "endpoint_group.deleteGroup",
            method: "DELETE",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "groups",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "uuid",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            pathParameters: [
                {
                    key: "uuid",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Group UUID.",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "enum",
                        values: [
                            {
                                value: "application/vnd.uploadcare-v0.7+json",
                            },
                        ],
                    },
                    description: "Version header.",
                },
            ],
            responses: [],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 404,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Group not found.",
                            },
                        ],
                    },
                    name: "Not Found",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_project.projectInfo": {
            description: "Getting info about account project.",
            namespace: ["Project"],
            id: "endpoint_project.projectInfo",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "project",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "collaborators",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "list",
                                        itemShape: {
                                            type: "object",
                                            extends: [],
                                            properties: [
                                                {
                                                    key: "email",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "string",
                                                            },
                                                        },
                                                    },
                                                    description: "Collaborator email.",
                                                },
                                                {
                                                    key: "name",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "string",
                                                            },
                                                        },
                                                    },
                                                    description: "Collaborator name.",
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                            {
                                key: "name",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Project login name.",
                            },
                            {
                                key: "pub_key",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Project public key.",
                            },
                            {
                                key: "autostore_enabled",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "boolean",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    description: "Your project details.",
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                                value: {
                                    detail: "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_webhook.webhooksList": {
            description: "List of project webhooks.",
            namespace: ["Webhook"],
            id: "endpoint_webhook.webhooksList",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "webhooks",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "alias",
                        value: {
                            type: "list",
                            itemShape: {
                                type: "alias",
                                value: {
                                    type: "id",
                                    id: "webhook_of_list_response",
                                },
                            },
                        },
                    },
                    description: "List of project webhooks.",
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "undiscriminatedUnion",
                        variants: [],
                    },
                    description: "Simple HTTP Auth or webhook permission errors.",
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_webhook.webhookCreate": {
            description:
                "Create and subscribe to a webhook. You can use webhooks to receive notifications about your uploads. For instance, once a file gets uploaded to your project, we can notify you by sending a message to a target URL.",
            namespace: ["Webhook"],
            id: "endpoint_webhook.webhookCreate",
            method: "POST",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "webhooks",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            requests: [],
            responses: [
                {
                    statusCode: 201,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "id",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_id",
                                    },
                                },
                            },
                            {
                                key: "project",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_project",
                                    },
                                },
                            },
                            {
                                key: "created",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_created",
                                    },
                                },
                            },
                            {
                                key: "updated",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_updated",
                                    },
                                },
                            },
                            {
                                key: "event",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_event",
                                    },
                                },
                            },
                            {
                                key: "target_url",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_target",
                                    },
                                },
                            },
                            {
                                key: "is_active",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_is_active",
                                    },
                                },
                            },
                            {
                                key: "version",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_version_of_list_response",
                                    },
                                },
                            },
                            {
                                key: "signing_secret",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_signing_secret",
                                    },
                                },
                            },
                        ],
                    },
                    description: "Webhook successfully created.",
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "undiscriminatedUnion",
                        variants: [],
                    },
                    description: "Simple HTTP Auth or webhook permission or endpoint errors.",
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_webhookCallbacks.fileUploaded": {
            description: "file.uploaded event payload",
            namespace: ["Webhook Callbacks"],
            id: "endpoint_webhookCallbacks.fileUploaded",
            method: "POST",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "file-uploaded",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "X-Uc-Signature",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                    description:
                        "Optional header with an HMAC-SHA256 signature that is sent to the `target_url`,\nif the webhook has a `signing_secret` associated with it.\n",
                },
            ],
            requests: [
                {
                    contentType: "application/json",
                    body: {
                        type: "alias",
                        value: {
                            type: "id",
                            id: "webhookFilePayload",
                        },
                    },
                },
            ],
            responses: [],
            errors: [],
            examples: [],
        },
        "endpoint_webhookCallbacks.fileInfected": {
            description: "file.infected event payload",
            namespace: ["Webhook Callbacks"],
            id: "endpoint_webhookCallbacks.fileInfected",
            method: "POST",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "file-infected",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "X-Uc-Signature",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                    description:
                        "Optional header with an HMAC-SHA256 signature that is sent to the `target_url`,\nif the webhook has a `signing_secret` associated with it.\n",
                },
            ],
            requests: [
                {
                    contentType: "application/json",
                    body: {
                        type: "alias",
                        value: {
                            type: "id",
                            id: "webhookFilePayload",
                        },
                    },
                },
            ],
            responses: [],
            errors: [],
            examples: [],
        },
        "endpoint_webhookCallbacks.fileStored": {
            description: "file.stored event payload",
            namespace: ["Webhook Callbacks"],
            id: "endpoint_webhookCallbacks.fileStored",
            method: "POST",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "file-stored",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "X-Uc-Signature",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                    description:
                        "Optional header with an HMAC-SHA256 signature that is sent to the `target_url`,\nif the webhook has a `signing_secret` associated with it.\n",
                },
            ],
            requests: [
                {
                    contentType: "application/json",
                    body: {
                        type: "alias",
                        value: {
                            type: "id",
                            id: "webhookFilePayload",
                        },
                    },
                },
            ],
            responses: [],
            errors: [],
            examples: [],
        },
        "endpoint_webhookCallbacks.fileDeleted": {
            description: "file.deleted event payload",
            namespace: ["Webhook Callbacks"],
            id: "endpoint_webhookCallbacks.fileDeleted",
            method: "POST",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "file-deleted",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "X-Uc-Signature",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                    description:
                        "Optional header with an HMAC-SHA256 signature that is sent to the `target_url`,\nif the webhook has a `signing_secret` associated with it.\n",
                },
            ],
            requests: [
                {
                    contentType: "application/json",
                    body: {
                        type: "alias",
                        value: {
                            type: "id",
                            id: "webhookFilePayload",
                        },
                    },
                },
            ],
            responses: [],
            errors: [],
            examples: [],
        },
        "endpoint_webhookCallbacks.fileInfoUpdated": {
            description: "file.info_updated event payload",
            namespace: ["Webhook Callbacks"],
            id: "endpoint_webhookCallbacks.fileInfoUpdated",
            method: "POST",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "file-info-updated",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "X-Uc-Signature",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                    description:
                        "Optional header with an HMAC-SHA256 signature that is sent to the `target_url`,\nif the webhook has a `signing_secret` associated with it.\n",
                },
            ],
            requests: [
                {
                    contentType: "application/json",
                    body: {
                        type: "alias",
                        value: {
                            type: "id",
                            id: "webhookFileInfoUpdatedPayload",
                        },
                    },
                },
            ],
            responses: [],
            errors: [],
            examples: [],
        },
        "endpoint_webhook.updateWebhook": {
            description: "Update webhook attributes.",
            namespace: ["Webhook"],
            id: "endpoint_webhook.updateWebhook",
            method: "PUT",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "webhooks",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "id",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            pathParameters: [
                {
                    key: "id",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "double",
                            },
                        },
                    },
                    description: "Webhook ID.",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            requests: [],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "id",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_id",
                                    },
                                },
                            },
                            {
                                key: "project",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_project",
                                    },
                                },
                            },
                            {
                                key: "created",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_created",
                                    },
                                },
                            },
                            {
                                key: "updated",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_updated",
                                    },
                                },
                            },
                            {
                                key: "event",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_event",
                                    },
                                },
                            },
                            {
                                key: "target_url",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_target",
                                    },
                                },
                            },
                            {
                                key: "is_active",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_is_active",
                                    },
                                },
                            },
                            {
                                key: "version",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_version",
                                    },
                                },
                            },
                            {
                                key: "signing_secret",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_signing_secret",
                                    },
                                },
                            },
                        ],
                    },
                    description: "Webhook attributes successfully updated.",
                },
            ],
            errors: [
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 404,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Not found.",
                            },
                        ],
                    },
                    description: "Webhook with ID {id} not found.",
                    name: "Not Found",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_webhook.webhookUnsubscribe": {
            description: "Unsubscribe and delete a webhook.",
            namespace: ["Webhook"],
            id: "endpoint_webhook.webhookUnsubscribe",
            method: "DELETE",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "webhooks",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "unsubscribe",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            requests: [],
            responses: [],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "undiscriminatedUnion",
                        variants: [],
                    },
                    description: "Simple HTTP Auth or webhook permission or endpoint errors.",
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_conversion.documentConvertInfo": {
            description: "The endpoint allows you to determine the document format and possible conversion formats.",
            namespace: ["Conversion"],
            id: "endpoint_conversion.documentConvertInfo",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "convert",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "document",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "uuid",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            pathParameters: [
                {
                    key: "uuid",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "File uuid.",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "error",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Holds an error if your document can't be handled.",
                            },
                            {
                                key: "format",
                                valueShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [
                                        {
                                            key: "name",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "string",
                                                    },
                                                },
                                            },
                                            description: "A detected document format.",
                                        },
                                        {
                                            key: "conversion_formats",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "list",
                                                    itemShape: {
                                                        type: "object",
                                                        extends: [],
                                                        properties: [
                                                            {
                                                                key: "name",
                                                                valueShape: {
                                                                    type: "alias",
                                                                    value: {
                                                                        type: "primitive",
                                                                        value: {
                                                                            type: "string",
                                                                        },
                                                                    },
                                                                },
                                                                description: "Supported target document format.",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            description: "The conversions that are supported for the document.",
                                        },
                                    ],
                                },
                                description: "Document format details.",
                            },
                            {
                                key: "converted_groups",
                                valueShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [
                                        {
                                            key: "{conversion_format}",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "string",
                                                    },
                                                },
                                            },
                                            description: "Converted group UUID.",
                                        },
                                    ],
                                },
                                description: "Information about already converted groups.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "undiscriminatedUnion",
                        variants: [],
                    },
                    description: "Simple HTTP Auth or document conversion permission errors.",
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 404,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default: "Not found.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    description: "Document with specified ID is not found.",
                    name: "Not Found",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_conversion.documentConvert": {
            description:
                "Uploadcare allows you to convert files to different target formats. Check out the [conversion capabilities](/docs/transformations/document-conversion/#document-file-formats) for each supported format.",
            namespace: ["Conversion"],
            id: "endpoint_conversion.documentConvert",
            method: "POST",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "convert",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "document",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            requests: [
                {
                    contentType: "application/json",
                    body: {
                        type: "alias",
                        value: {
                            type: "id",
                            id: "documentJobSubmitParameters",
                        },
                    },
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "problems",
                                valueShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [],
                                    extraProperties: {
                                        type: "primitive",
                                        value: {
                                            type: "uuid",
                                        },
                                    },
                                },
                                description:
                                    "Dictionary of problems related to your processing job, if any. A key is the `path` you requested.",
                            },
                            {
                                key: "result",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "list",
                                        itemShape: {
                                            type: "object",
                                            extends: [],
                                            properties: [
                                                {
                                                    key: "original_source",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "string",
                                                            },
                                                        },
                                                    },
                                                    description:
                                                        "Source file identifier including a target format, if present.",
                                                },
                                                {
                                                    key: "uuid",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "uuid",
                                                            },
                                                        },
                                                    },
                                                    description: "A UUID of your converted document.",
                                                },
                                                {
                                                    key: "token",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "integer",
                                                            },
                                                        },
                                                    },
                                                    description:
                                                        "A conversion job token that can be used to get a job status.",
                                                },
                                            ],
                                        },
                                    },
                                },
                                description: "Result for each requested path, in case of no errors for that path.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "undiscriminatedUnion",
                        variants: [
                            {
                                shape: {
                                    type: "object",
                                    extends: [],
                                    properties: [
                                        {
                                            key: "detail",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "string",
                                                        default: "“paths” parameter is required.",
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    description: "Simple HTTP Auth or document conversion permission errors.",
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_conversion.documentConvertStatus": {
            description:
                "Once you get a conversion job result, you can acquire a conversion job status via token. Just put it in your request URL as `:token`.",
            namespace: ["Conversion"],
            id: "endpoint_conversion.documentConvertStatus",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "convert",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "document",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "status",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "token",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            pathParameters: [
                {
                    key: "token",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "integer",
                            },
                        },
                    },
                    description: "Job token.",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "status",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "pending",
                                        },
                                        {
                                            value: "processing",
                                        },
                                        {
                                            value: "finished",
                                        },
                                        {
                                            value: "failed",
                                        },
                                        {
                                            value: "cancelled",
                                        },
                                    ],
                                },
                                description:
                                    "Conversion job status, can have one of the following values: - `pending` — a source file is being prepared for conversion. - `processing` — conversion is in progress. - `finished` — the conversion is finished. - `failed` — failed to convert the source, see `error` for details. - `canceled` — the conversion was canceled.",
                            },
                            {
                                key: "error",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Holds a conversion error if your file can't be handled.",
                            },
                            {
                                key: "result",
                                valueShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [
                                        {
                                            key: "uuid",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "uuid",
                                                    },
                                                },
                                            },
                                            description: "A UUID of a converted target file.",
                                        },
                                    ],
                                },
                                description: "Repeats the contents of your processing output.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "undiscriminatedUnion",
                        variants: [],
                    },
                    description: "Simple HTTP Auth or document conversion permission errors.",
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 404,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default: "Not found.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    description: "Job with specified ID is not found.",
                    name: "Not Found",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_conversion.videoConvert": {
            description:
                "Uploadcare video processing adjusts video quality, format (mp4, webm, ogg), and size, cuts it, and generates thumbnails. Processed video is instantly available over CDN.",
            namespace: ["Conversion"],
            id: "endpoint_conversion.videoConvert",
            method: "POST",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "convert",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "video",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            requests: [
                {
                    contentType: "application/json",
                    body: {
                        type: "alias",
                        value: {
                            type: "id",
                            id: "videoJobSubmitParameters",
                        },
                    },
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "problems",
                                valueShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [],
                                    extraProperties: {
                                        type: "primitive",
                                        value: {
                                            type: "uuid",
                                        },
                                    },
                                },
                                description:
                                    "Dictionary of problems related to your processing job, if any. Key is the `path` you requested.",
                            },
                            {
                                key: "result",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "list",
                                        itemShape: {
                                            type: "object",
                                            extends: [],
                                            properties: [
                                                {
                                                    key: "original_source",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "string",
                                                            },
                                                        },
                                                    },
                                                    description:
                                                        "Input file identifier including operations, if present.",
                                                },
                                                {
                                                    key: "uuid",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "uuid",
                                                            },
                                                        },
                                                    },
                                                    description: "A UUID of your processed video file.",
                                                },
                                                {
                                                    key: "token",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "integer",
                                                            },
                                                        },
                                                    },
                                                    description:
                                                        "A processing job token that can be used to get a job status.",
                                                },
                                                {
                                                    key: "thumbnails_group_uuid",
                                                    valueShape: {
                                                        type: "alias",
                                                        value: {
                                                            type: "primitive",
                                                            value: {
                                                                type: "uuid",
                                                            },
                                                        },
                                                    },
                                                    description:
                                                        "UUID of a file group with thumbnails for an output video, based on the `thumbs` operation parameters.",
                                                },
                                            ],
                                        },
                                    },
                                },
                                description: "Result for each requested path, in case of no errors for that path.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "undiscriminatedUnion",
                        variants: [
                            {
                                shape: {
                                    type: "object",
                                    extends: [],
                                    properties: [
                                        {
                                            key: "detail",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "string",
                                                        default: "“paths” parameter is required.",
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    description: "Simple HTTP Auth or video conversion permission errors.",
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
        "endpoint_conversion.videoConvertStatus": {
            description:
                "Once you get a processing job result, you can acquire a processing job status via token. Just put it in your request URL as `:token`.",
            namespace: ["Conversion"],
            id: "endpoint_conversion.videoConvertStatus",
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "convert",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "video",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "status",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "pathParameter",
                    value: "token",
                },
                {
                    type: "literal",
                    value: "/",
                },
                {
                    type: "literal",
                    value: "",
                },
            ],
            auth: ["apiKeyAuth"],
            defaultEnvironment: "https://api.uploadcare.com",
            environments: [
                {
                    id: "https://api.uploadcare.com",
                    baseUrl: "https://api.uploadcare.com",
                },
            ],
            pathParameters: [
                {
                    key: "token",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "integer",
                            },
                        },
                    },
                    description: "Job token.",
                },
            ],
            requestHeaders: [
                {
                    key: "Accept",
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    description: "Version header.",
                },
            ],
            responses: [
                {
                    statusCode: 200,
                    body: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "status",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "pending",
                                        },
                                        {
                                            value: "processing",
                                        },
                                        {
                                            value: "finished",
                                        },
                                        {
                                            value: "failed",
                                        },
                                        {
                                            value: "cancelled",
                                        },
                                    ],
                                },
                                description:
                                    "Processing job status, can have one of the following values: - `pending` — video file is being prepared for conversion. - `processing` — video file processing is in progress. - `finished` — the processing is finished. - `failed` — we failed to process the video, see `error` for details. - `canceled` — video processing was canceled.",
                            },
                            {
                                key: "error",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                description: "Holds a processing error if we failed to handle your video.",
                            },
                            {
                                key: "result",
                                valueShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [
                                        {
                                            key: "uuid",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "uuid",
                                                    },
                                                },
                                            },
                                            description: "A UUID of your processed video file.",
                                        },
                                        {
                                            key: "thumbnails_group_uuid",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "uuid",
                                                    },
                                                },
                                            },
                                            description:
                                                "A UUID of a file group with thumbnails for an output video, based on the `thumbs` operation parameters.",
                                        },
                                    ],
                                },
                                description: "Repeats the contents of your processing output.",
                            },
                        ],
                    },
                },
            ],
            errors: [
                {
                    statusCode: 400,
                    shape: {
                        type: "undiscriminatedUnion",
                        variants: [],
                    },
                    description: "Simple HTTP Auth or video conversion permission errors.",
                    name: "Bad Request",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 401,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        {
                                            value: "Incorrect authentication credentials.",
                                        },
                                        {
                                            value: "Public key {public_key} not found.",
                                        },
                                        {
                                            value: "Secret key not found.",
                                        },
                                        {
                                            value: "Invalid signature. Please check your Secret key.",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    name: "Unauthorized",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 404,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default: "Not found.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    description: "Job with specified ID is not found.",
                    name: "Not Found",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 406,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                            default:
                                                "Incorrect Accept header provided. Make sure to specify API version. Refer to REST API docs for details.",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Not Acceptable",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
                {
                    statusCode: 429,
                    shape: {
                        type: "object",
                        extends: [],
                        properties: [
                            {
                                key: "detail",
                                valueShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    name: "Too Many Requests",
                    examples: [
                        {
                            responseBody: {
                                type: "json",
                            },
                        },
                    ],
                },
            ],
            examples: [],
        },
    },
    websockets: {},
    webhooks: {},
    types: {
        addonExecutionStatus: {
            name: "addonExecutionStatus",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "status",
                        valueShape: {
                            type: "enum",
                            values: [
                                {
                                    value: "in_progress",
                                },
                                {
                                    value: "error",
                                },
                                {
                                    value: "done",
                                },
                                {
                                    value: "unknown",
                                },
                            ],
                        },
                        description:
                            "Defines the status of an Add-On execution.\nIn most cases, once the status changes to `done`, [Application Data](/docs/api/rest/file/info/#response.body.appdata) of the file that had been specified as a `appdata`, will contain the result of the execution.",
                    },
                ],
            },
        },
        webhookFilePayload: {
            name: "webhookFilePayload",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "initiator",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhookInitiator",
                            },
                        },
                    },
                    {
                        key: "hook",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhookPublicInfo",
                            },
                        },
                    },
                    {
                        key: "data",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "file",
                            },
                        },
                    },
                    {
                        key: "file",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "File CDN URL.",
                    },
                ],
            },
        },
        webhookFileInfoUpdatedPayload: {
            name: "webhookFileInfoUpdatedPayload",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "initiator",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhookInitiator",
                            },
                        },
                    },
                    {
                        key: "hook",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhookPublicInfo",
                            },
                        },
                    },
                    {
                        key: "data",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "file",
                            },
                        },
                    },
                    {
                        key: "file",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "File CDN URL.",
                    },
                    {
                        key: "previous_values",
                        valueShape: {
                            type: "object",
                            extends: [],
                            properties: [
                                {
                                    key: "appdata",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "id",
                                            id: "applicationDataObject",
                                        },
                                    },
                                },
                                {
                                    key: "metadata",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "id",
                                            id: "metadata",
                                        },
                                    },
                                },
                            ],
                        },
                        description:
                            "Object containing the values of the updated file data attributes and their values prior to the event.",
                    },
                ],
            },
        },
        fileCopy: {
            name: "fileCopy",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "datetime_removed",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "datetime",
                                },
                            },
                        },
                        description: "Date and time when a file was removed, if any.",
                    },
                    {
                        key: "datetime_stored",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "datetime",
                                },
                            },
                        },
                        description: "Date and time of the last store request, if any.",
                    },
                    {
                        key: "datetime_uploaded",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "datetime",
                                },
                            },
                        },
                        description: "Date and time when a file was uploaded.",
                    },
                    {
                        key: "is_image",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "boolean",
                                },
                            },
                        },
                        description: "Is file is image.",
                    },
                    {
                        key: "is_ready",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "boolean",
                                },
                            },
                        },
                        description: "Is file is ready to be used after upload.",
                    },
                    {
                        key: "mime_type",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "File MIME-type.",
                    },
                    {
                        key: "original_file_url",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "Publicly available file CDN URL. Available if a file is not deleted.",
                    },
                    {
                        key: "original_filename",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "Original file name taken from uploaded file.",
                    },
                    {
                        key: "size",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                        description: "File size in bytes.",
                    },
                    {
                        key: "url",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "API resource URL for a particular file.",
                    },
                    {
                        key: "uuid",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "uuid",
                                },
                            },
                        },
                        description: "File UUID.",
                    },
                    {
                        key: "variations",
                        valueShape: {
                            type: "enum",
                            values: [],
                        },
                    },
                    {
                        key: "content_info",
                        valueShape: {
                            type: "enum",
                            values: [],
                        },
                    },
                    {
                        key: "metadata",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "metadata",
                            },
                        },
                    },
                ],
            },
        },
        file: {
            name: "file",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "datetime_removed",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "datetime",
                                },
                            },
                        },
                        description: "Date and time when a file was removed, if any.",
                    },
                    {
                        key: "datetime_stored",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "datetime",
                                },
                            },
                        },
                        description: "Date and time of the last store request, if any.",
                    },
                    {
                        key: "datetime_uploaded",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "datetime",
                                },
                            },
                        },
                        description: "Date and time when a file was uploaded.",
                    },
                    {
                        key: "is_image",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "boolean",
                                },
                            },
                        },
                        description: "Is file is image.",
                    },
                    {
                        key: "is_ready",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "boolean",
                                },
                            },
                        },
                        description: "Is file is ready to be used after upload.",
                    },
                    {
                        key: "mime_type",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "File MIME-type.",
                    },
                    {
                        key: "original_file_url",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "Publicly available file CDN URL. Available if a file is not deleted.",
                    },
                    {
                        key: "original_filename",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "Original file name taken from uploaded file.",
                    },
                    {
                        key: "size",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                        description: "File size in bytes.",
                    },
                    {
                        key: "url",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "API resource URL for a particular file.",
                    },
                    {
                        key: "uuid",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "uuid",
                                },
                            },
                        },
                        description: "File UUID.",
                    },
                    {
                        key: "appdata",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "optional",
                                shape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "applicationDataObject",
                                    },
                                },
                            },
                        },
                    },
                    {
                        key: "variations",
                        valueShape: {
                            type: "object",
                            extends: [],
                            properties: [],
                        },
                        description:
                            "Dictionary of other files that were created using this file as a source. It's used for video processing and document conversion jobs. E.g., `<conversion_path>: <uuid>`.",
                    },
                    {
                        key: "content_info",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "contentInfo",
                            },
                        },
                    },
                    {
                        key: "metadata",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "metadata",
                            },
                        },
                    },
                ],
            },
        },
        metadata: {
            name: "metadata",
            shape: {
                type: "object",
                extends: [],
                properties: [],
            },
            description: "Arbitrary metadata associated with a file.",
        },
        metadataItemValue: {
            name: "metadataItemValue",
            shape: {
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "string",
                    },
                },
            },
            description: "Value of metadata key.",
        },
        contentInfo: {
            name: "contentInfo",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "mime",
                        valueShape: {
                            type: "object",
                            extends: [],
                            properties: [
                                {
                                    key: "mime",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "string",
                                            },
                                        },
                                    },
                                    description: "Full MIME type.",
                                },
                                {
                                    key: "type",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "string",
                                            },
                                        },
                                    },
                                    description: "Type of MIME type.",
                                },
                                {
                                    key: "subtype",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "string",
                                            },
                                        },
                                    },
                                    description: "Subtype of MIME type.",
                                },
                            ],
                        },
                        description: "MIME type.",
                    },
                    {
                        key: "image",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "imageInfo",
                            },
                        },
                    },
                    {
                        key: "video",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "videoInfo",
                            },
                        },
                    },
                ],
            },
            description: "Information about file content.",
        },
        imageInfo: {
            name: "imageInfo",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "color_mode",
                        valueShape: {
                            type: "enum",
                            values: [
                                {
                                    value: "RGB",
                                },
                                {
                                    value: "RGBA",
                                },
                                {
                                    value: "RGBa",
                                },
                                {
                                    value: "RGBX",
                                },
                                {
                                    value: "L",
                                },
                                {
                                    value: "LA",
                                },
                                {
                                    value: "La",
                                },
                                {
                                    value: "P",
                                },
                                {
                                    value: "PA",
                                },
                                {
                                    value: "CMYK",
                                },
                                {
                                    value: "YCbCr",
                                },
                                {
                                    value: "HSV",
                                },
                                {
                                    value: "LAB",
                                },
                            ],
                        },
                        description: "Image color mode.",
                    },
                    {
                        key: "orientation",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                    minimum: 0,
                                    maximum: 8,
                                },
                            },
                        },
                        description: "Image orientation from EXIF.",
                    },
                    {
                        key: "format",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "Image format.",
                    },
                    {
                        key: "sequence",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "boolean",
                                },
                            },
                        },
                        description: "Set to true if a file contains a sequence of images (GIF for example).",
                    },
                    {
                        key: "height",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                        description: "Image height in pixels.",
                    },
                    {
                        key: "width",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                        description: "Image width in pixels.",
                    },
                    {
                        key: "geo_location",
                        valueShape: {
                            type: "object",
                            extends: [],
                            properties: [
                                {
                                    key: "latitude",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "double",
                                            },
                                        },
                                    },
                                    description: "Location latitude.",
                                },
                                {
                                    key: "longitude",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "double",
                                            },
                                        },
                                    },
                                    description: "Location longitude.",
                                },
                            ],
                        },
                        description: "Geo-location of image from EXIF.",
                    },
                    {
                        key: "datetime_original",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "datetime",
                                },
                            },
                        },
                        description:
                            "Image date and time from EXIF. Please be aware that this data is not always formatted and displayed exactly as it appears in the EXIF.",
                    },
                    {
                        key: "dpi",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "list",
                                itemShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "double",
                                        },
                                    },
                                },
                            },
                        },
                        description: "Image DPI for two dimensions.",
                    },
                ],
            },
            description: "Image metadata.",
        },
        videoInfo: {
            name: "videoInfo",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "duration",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                        description: "Video file's duration in milliseconds.",
                    },
                    {
                        key: "format",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "Video file's format.",
                    },
                    {
                        key: "bitrate",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                        description: "Video file's bitrate.",
                    },
                    {
                        key: "audio",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "list",
                                itemShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [
                                        {
                                            key: "bitrate",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "integer",
                                                    },
                                                },
                                            },
                                            description: "Audio stream's bitrate.",
                                        },
                                        {
                                            key: "codec",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "string",
                                                    },
                                                },
                                            },
                                            description: "Audio stream's codec.",
                                        },
                                        {
                                            key: "sample_rate",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "integer",
                                                    },
                                                },
                                            },
                                            description: "Audio stream's sample rate.",
                                        },
                                        {
                                            key: "channels",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "integer",
                                                    },
                                                },
                                            },
                                            description: "Audio stream's number of channels.",
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    {
                        key: "video",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "list",
                                itemShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [
                                        {
                                            key: "height",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "integer",
                                                    },
                                                },
                                            },
                                            description: "Video stream's image height.",
                                        },
                                        {
                                            key: "width",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "integer",
                                                    },
                                                },
                                            },
                                            description: "Video stream's image width.",
                                        },
                                        {
                                            key: "frame_rate",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "double",
                                                    },
                                                },
                                            },
                                            description: "Video stream's frame rate.",
                                        },
                                        {
                                            key: "bitrate",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "integer",
                                                    },
                                                },
                                            },
                                            description: "Video stream's bitrate.",
                                        },
                                        {
                                            key: "codec",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "string",
                                                    },
                                                },
                                            },
                                            description: "Video stream's codec.",
                                        },
                                    ],
                                },
                            },
                        },
                    },
                ],
            },
            description: "Video metadata.",
        },
        legacyVideoInfo: {
            name: "legacyVideoInfo",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "duration",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "double",
                                },
                            },
                        },
                        description: "Video file's duration in milliseconds.",
                    },
                    {
                        key: "format",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "Video file's format.",
                    },
                    {
                        key: "bitrate",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "double",
                                },
                            },
                        },
                        description: "Video file's bitrate.",
                    },
                    {
                        key: "audio",
                        valueShape: {
                            type: "object",
                            extends: [],
                            properties: [
                                {
                                    key: "bitrate",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "double",
                                            },
                                        },
                                    },
                                    description: "Audio stream's bitrate.",
                                },
                                {
                                    key: "codec",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "string",
                                            },
                                        },
                                    },
                                    description: "Audio stream's codec.",
                                },
                                {
                                    key: "sample_rate",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "double",
                                            },
                                        },
                                    },
                                    description: "Audio stream's sample rate.",
                                },
                                {
                                    key: "channels",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "string",
                                            },
                                        },
                                    },
                                    description: "Audio stream's number of channels.",
                                },
                            ],
                        },
                        description: "Audio stream's metadata.",
                    },
                    {
                        key: "video",
                        valueShape: {
                            type: "object",
                            extends: [],
                            properties: [
                                {
                                    key: "height",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "double",
                                            },
                                        },
                                    },
                                    description: "Video stream's image height.",
                                },
                                {
                                    key: "width",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "double",
                                            },
                                        },
                                    },
                                    description: "Video stream's image width.",
                                },
                                {
                                    key: "frame_rate",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "double",
                                            },
                                        },
                                    },
                                    description: "Video stream's frame rate.",
                                },
                                {
                                    key: "bitrate",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "double",
                                            },
                                        },
                                    },
                                    description: "Video stream's bitrate.",
                                },
                                {
                                    key: "codec",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "string",
                                            },
                                        },
                                    },
                                    description: "Video stream codec.",
                                },
                            ],
                        },
                        description: "Video stream's metadata.",
                    },
                ],
            },
            description: "Video metadata.",
        },
        copiedFileURL: {
            name: "copiedFileURL",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "type",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                    default: "url",
                                },
                            },
                        },
                    },
                    {
                        key: "result",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description:
                            "URL with an s3 scheme. Your bucket name is put as a host, and an s3 object path follows.",
                    },
                ],
            },
        },
        group: {
            name: "group",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "id",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "Group's identifier.",
                    },
                    {
                        key: "datetime_created",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "datetime",
                                },
                            },
                        },
                        description: "ISO-8601 date and time when the group was created.",
                    },
                    {
                        key: "files_count",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                    minimum: 1,
                                },
                            },
                        },
                        description: "Number of the files in the group.",
                    },
                    {
                        key: "cdn_url",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "Group's CDN URL.",
                    },
                    {
                        key: "url",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "Group's API resource URL.",
                    },
                ],
            },
        },
        groupWithFiles: {
            name: "groupWithFiles",
            shape: {
                type: "object",
                extends: ["group"],
                properties: [],
            },
        },
        project: {
            name: "project",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "collaborators",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "list",
                                itemShape: {
                                    type: "object",
                                    extends: [],
                                    properties: [
                                        {
                                            key: "email",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "string",
                                                    },
                                                },
                                            },
                                            description: "Collaborator email.",
                                        },
                                        {
                                            key: "name",
                                            valueShape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "string",
                                                    },
                                                },
                                            },
                                            description: "Collaborator name.",
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    {
                        key: "name",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "Project login name.",
                    },
                    {
                        key: "pub_key",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "Project public key.",
                    },
                    {
                        key: "autostore_enabled",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "boolean",
                                },
                            },
                        },
                    },
                ],
            },
        },
        webhook_id: {
            name: "webhook_id",
            shape: {
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "double",
                    },
                },
            },
            description: "Webhook's ID.",
        },
        webhook_project: {
            name: "webhook_project",
            shape: {
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "double",
                    },
                },
            },
            description: "Project ID the webhook belongs to.",
        },
        webhook_project_pubkey: {
            name: "webhook_project_pubkey",
            shape: {
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "string",
                    },
                },
            },
            description: "Public project key the webhook belongs to.",
        },
        webhook_created: {
            name: "webhook_created",
            shape: {
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "datetime",
                    },
                },
            },
            description: "date-time when a webhook was created.",
        },
        webhook_updated: {
            name: "webhook_updated",
            shape: {
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "datetime",
                    },
                },
            },
            description: "date-time when a webhook was updated.",
        },
        webhook_target: {
            name: "webhook_target",
            shape: {
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "string",
                    },
                },
            },
            description:
                "A URL that is triggered by an event, for example, a file upload. A target URL MUST be unique for each `project` — `event type` combination.",
        },
        webhook_event: {
            name: "webhook_event",
            shape: {
                type: "enum",
                values: [
                    {
                        value: "file.uploaded",
                    },
                    {
                        value: "file.infected",
                    },
                    {
                        value: "file.stored",
                    },
                    {
                        value: "file.deleted",
                    },
                    {
                        value: "file.info_updated",
                    },
                ],
            },
            description: "An event you subscribe to.",
        },
        webhook_is_active: {
            name: "webhook_is_active",
            shape: {
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "boolean",
                        default: true,
                    },
                },
            },
            description: "Marks a subscription as either active or not, defaults to `true`, otherwise `false`.",
        },
        webhook_signing_secret: {
            name: "webhook_signing_secret",
            shape: {
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "string",
                    },
                },
            },
            description:
                "Optional [HMAC/SHA-256](https://en.wikipedia.org/wiki/HMAC) secret that, if set, will be used to\ncalculate signatures for the webhook payloads sent to the `target_url`.\n\nCalculated signature will be sent to the `target_url` as a value of the `X-Uc-Signature` HTTP\nheader. The header will have the following format: `X-Uc-Signature: v1=<HMAC-SHA256-HEX-DIGEST>`.\nSee [Secure Webhooks](/docs/webhooks/#signed-webhooks) for details.\n",
        },
        webhook_version: {
            name: "webhook_version",
            shape: {
                type: "enum",
                values: [
                    {
                        value: "0.7",
                    },
                ],
            },
            description: "Webhook payload's version.",
        },
        webhook_version_of_request: {
            name: "webhook_version_of_request",
            shape: {
                type: "enum",
                values: [
                    {
                        value: "0.7",
                    },
                ],
                default: "0.7",
            },
            description: "Webhook payload's version.",
        },
        webhook_version_of_list_response: {
            name: "webhook_version_of_list_response",
            shape: {
                type: "enum",
                values: [
                    {
                        value: "",
                    },
                    {
                        value: "0.5",
                    },
                    {
                        value: "0.6",
                    },
                    {
                        value: "0.7",
                    },
                ],
            },
            description: "Webhook payload's version.",
        },
        webhook: {
            name: "webhook",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "id",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_id",
                            },
                        },
                    },
                    {
                        key: "project",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_project",
                            },
                        },
                    },
                    {
                        key: "created",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_created",
                            },
                        },
                    },
                    {
                        key: "updated",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_updated",
                            },
                        },
                    },
                    {
                        key: "event",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_event",
                            },
                        },
                    },
                    {
                        key: "target_url",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_target",
                            },
                        },
                    },
                    {
                        key: "is_active",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_is_active",
                            },
                        },
                    },
                    {
                        key: "version",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_version",
                            },
                        },
                    },
                    {
                        key: "signing_secret",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_signing_secret",
                            },
                        },
                    },
                ],
            },
            description: "Webhook.",
        },
        webhook_of_list_response: {
            name: "webhook_of_list_response",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "id",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_id",
                            },
                        },
                    },
                    {
                        key: "project",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_project",
                            },
                        },
                    },
                    {
                        key: "created",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_created",
                            },
                        },
                    },
                    {
                        key: "updated",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_updated",
                            },
                        },
                    },
                    {
                        key: "event",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_event",
                            },
                        },
                    },
                    {
                        key: "target_url",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_target",
                            },
                        },
                    },
                    {
                        key: "is_active",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_is_active",
                            },
                        },
                    },
                    {
                        key: "version",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_version_of_list_response",
                            },
                        },
                    },
                    {
                        key: "signing_secret",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_signing_secret",
                            },
                        },
                    },
                ],
            },
            description: "Webhook.",
        },
        webhookInitiator: {
            name: "webhookInitiator",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "type",
                        valueShape: {
                            type: "enum",
                            values: [
                                {
                                    value: "api",
                                },
                                {
                                    value: "system",
                                },
                                {
                                    value: "addon",
                                },
                            ],
                        },
                        description: "Initiator type name.",
                    },
                    {
                        key: "detail",
                        valueShape: {
                            type: "object",
                            extends: [],
                            properties: [
                                {
                                    key: "request_id",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "primitive",
                                            value: {
                                                type: "uuid",
                                            },
                                        },
                                    },
                                    description: "Request ID.",
                                },
                                {
                                    key: "addon_name",
                                    valueShape: {
                                        type: "enum",
                                        values: [
                                            {
                                                value: "aws_rekognition_detect_labels",
                                            },
                                            {
                                                value: "aws_rekognition_detect_moderation_labels",
                                            },
                                            {
                                                value: "uc_clamav_virus_scan",
                                            },
                                            {
                                                value: "remove_bg",
                                            },
                                            {
                                                value: "zamzar_convert_document",
                                            },
                                            {
                                                value: "zencoder_convert_video",
                                            },
                                        ],
                                    },
                                    description: "Add-On name.",
                                },
                                {
                                    key: "source_file_uuid",
                                    valueShape: {
                                        type: "alias",
                                        value: {
                                            type: "optional",
                                            shape: {
                                                type: "alias",
                                                value: {
                                                    type: "primitive",
                                                    value: {
                                                        type: "uuid",
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    description: "Source file UUID if the current is derivative.",
                                },
                            ],
                        },
                    },
                ],
            },
            description: "Webhook event initiator.",
        },
        webhookPublicInfo: {
            name: "webhookPublicInfo",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "id",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_id",
                            },
                        },
                    },
                    {
                        key: "project",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "optional",
                                shape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_project",
                                    },
                                },
                            },
                        },
                    },
                    {
                        key: "project_pub_key",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "optional",
                                shape: {
                                    type: "alias",
                                    value: {
                                        type: "id",
                                        id: "webhook_project_pubkey",
                                    },
                                },
                            },
                        },
                    },
                    {
                        key: "created_at",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_created",
                            },
                        },
                    },
                    {
                        key: "updated_at",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_updated",
                            },
                        },
                    },
                    {
                        key: "event",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_event",
                            },
                        },
                    },
                    {
                        key: "target",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_target",
                            },
                        },
                    },
                    {
                        key: "is_active",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_is_active",
                            },
                        },
                    },
                    {
                        key: "version",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "webhook_version",
                            },
                        },
                    },
                ],
            },
            description: "Public Webhook information (does not include secret data like `signing_secret`)",
        },
        documentJobSubmitParameters: {
            name: "documentJobSubmitParameters",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "paths",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "list",
                                itemShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        },
                        description:
                            "An array of UUIDs of your source documents to convert together with the specified target format (see [documentation](/docs/transformations/document-conversion/)).",
                    },
                    {
                        key: "store",
                        valueShape: {
                            type: "enum",
                            values: [
                                {
                                    value: "0",
                                },
                                {
                                    value: "false",
                                },
                                {
                                    value: "1",
                                },
                                {
                                    value: "true",
                                },
                            ],
                        },
                        description:
                            'When `store` is set to `"0"`, the converted files will only be available for 24 hours. `"1"` makes converted files available permanently. If the parameter is omitted, it checks the `Auto file storing` setting of your Uploadcare project identified by the `public_key` provided in the `auth-param`.\n',
                    },
                    {
                        key: "save_in_group",
                        valueShape: {
                            type: "enum",
                            values: [
                                {
                                    value: "0",
                                },
                                {
                                    value: "false",
                                },
                                {
                                    value: "1",
                                },
                                {
                                    value: "true",
                                },
                            ],
                            default: "0",
                        },
                        description:
                            'When `save_in_group` is set to `"1"`, multi-page documents additionally will be saved as a file group.\n',
                    },
                ],
            },
        },
        videoJobSubmitParameters: {
            name: "videoJobSubmitParameters",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "paths",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "list",
                                itemShape: {
                                    type: "alias",
                                    value: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        },
                        description:
                            "An array of UUIDs of your video files to process together with a set of assigned operations (see [documentation](/docs/transformations/video-encoding/)).",
                    },
                    {
                        key: "store",
                        valueShape: {
                            type: "enum",
                            values: [
                                {
                                    value: "0",
                                },
                                {
                                    value: "false",
                                },
                                {
                                    value: "1",
                                },
                                {
                                    value: "true",
                                },
                            ],
                        },
                        description:
                            'When `store` is set to `"0"`, the converted files will only be available for 24 hours. `"1"` makes converted files available permanently. If the parameter is omitted, it checks the `Auto file storing` setting of your Uploadcare project identified by the `public_key` provided in the `auth-param`.\n',
                    },
                ],
            },
        },
        cantUseDocsConversionError: {
            name: "cantUseDocsConversionError",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "detail",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                    default: "Document conversion feature is not available for this project.",
                                },
                            },
                        },
                    },
                ],
            },
        },
        cantUseVideoConversionError: {
            name: "cantUseVideoConversionError",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "detail",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                    default: "Video conversion feature is not available for this project.",
                                },
                            },
                        },
                    },
                ],
            },
        },
        cantUseWebhooksError: {
            name: "cantUseWebhooksError",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "detail",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                    default: "You can't use webhooks",
                                },
                            },
                        },
                    },
                ],
            },
        },
        jsonObjectParseError: {
            name: "jsonObjectParseError",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "detail",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "Expected JSON object.",
                    },
                ],
            },
        },
        localCopyResponse: {
            name: "localCopyResponse",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "type",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                    default: "file",
                                },
                            },
                        },
                    },
                    {
                        key: "result",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "fileCopy",
                            },
                        },
                    },
                ],
            },
        },
        applicationData: {
            name: "applicationData",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "version",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                        description: "An application version.",
                    },
                    {
                        key: "datetime_created",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "datetime",
                                },
                            },
                        },
                        description: "Date and time when an application data was created.",
                    },
                    {
                        key: "datetime_updated",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "datetime",
                                },
                            },
                        },
                        description: "Date and time when an application data was updated.",
                    },
                    {
                        key: "data",
                        valueShape: {
                            type: "object",
                            extends: [],
                            properties: [],
                        },
                        description: "Dictionary with a result of an application execution result.",
                    },
                ],
            },
        },
        removeBg_v1_0: {
            name: "removeBg_v1_0",
            shape: {
                type: "object",
                extends: ["applicationData"],
                properties: [],
            },
        },
        awsRekognitionDetectLabels_v2016_06_27: {
            name: "awsRekognitionDetectLabels_v2016_06_27",
            shape: {
                type: "object",
                extends: ["applicationData"],
                properties: [],
            },
        },
        awsRekognitionDetectModerationLabels_v2016_06_27: {
            name: "awsRekognitionDetectModerationLabels_v2016_06_27",
            shape: {
                type: "object",
                extends: ["applicationData"],
                properties: [],
            },
        },
        ucClamavVirusScan: {
            name: "ucClamavVirusScan",
            shape: {
                type: "object",
                extends: ["applicationData"],
                properties: [],
            },
        },
        applicationDataObject: {
            name: "applicationDataObject",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "aws_rekognition_detect_labels",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "awsRekognitionDetectLabels_v2016_06_27",
                            },
                        },
                    },
                    {
                        key: "aws_rekognition_detect_moderation_labels",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "awsRekognitionDetectModerationLabels_v2016_06_27",
                            },
                        },
                    },
                    {
                        key: "remove_bg",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "removeBg_v1_0",
                            },
                        },
                    },
                    {
                        key: "uc_clamav_virus_scan",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: "ucClamavVirusScan",
                            },
                        },
                    },
                ],
            },
            description: "Dictionary of application names and data associated with these applications.",
        },
        simpleAuthHTTPForbidden: {
            name: "simpleAuthHTTPForbidden",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "detail",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                    default:
                                        "Simple authentication over HTTP is forbidden. Please, use HTTPS or signed requests instead.",
                                },
                            },
                        },
                    },
                ],
            },
        },
        webhookTargetUrlError: {
            name: "webhookTargetUrlError",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "detail",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                    default: "`target_url` is missing.",
                                },
                            },
                        },
                        description: "`target_url` is missing.",
                    },
                ],
            },
        },
    },
    subpackages: {
        File: {
            id: "File",
            name: "File",
        },
        "Add-Ons": {
            id: "Add-Ons",
            name: "Add-Ons",
        },
        "File metadata": {
            id: "File metadata",
            name: "File metadata",
        },
        Group: {
            id: "Group",
            name: "Group",
        },
        Project: {
            id: "Project",
            name: "Project",
        },
        Webhook: {
            id: "Webhook",
            name: "Webhook",
        },
        "Webhook Callbacks": {
            id: "Webhook Callbacks",
            name: "Webhook Callbacks",
        },
        Conversion: {
            id: "Conversion",
            name: "Conversion",
        },
    },
    auths: {
        apiKeyAuth: {
            type: "header",
            headerWireValue: "Authorization",
        },
    },
};
