import { APIV1Write, SDKSnippetHolder, convertAPIDefinitionToDb, convertDbAPIDefinitionToRead } from "@fern-api/fdr-sdk";
import { ApiReferenceNavigationConverter, ApiDefinitionHolder } from "@fern-api/fdr-sdk/navigation";

const fdrWrite: APIV1Write.ApiDefinition = {
    types: {
        "type_v1Beta/models:Content": {
            description: "The base structured datatype containing multi-part content of a message.",
            name: "Content",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description:
                            "Ordered Parts that constitute a single message. Parts may have different MIME types.",
                        key: "parts",
                        valueType: {
                            type: "list",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:Part",
                            },
                        },
                    },
                    {
                        description:
                            "The producer of the content. Useful to set for multi-turn conversations, otherwise can be left blank or unset.",
                        key: "role",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:Role",
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:Tool": {
            name: "Tool",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description:
                            'A list of **FunctionDeclarations** available to the model that can be used for function calling.\n\nThe model or system does not execute the function. Instead the defined function may be returned as a\n[FunctionCall][content.part.function_call] with arguments to the client side for execution.\nThe model may decide to call a subset of these functions by populating [FunctionCall][content.part.function_call]\nin the response. The next conversation turn may contain a [FunctionResponse][content.part.function_response] with the\n[content.role] "function" generation context for the next model turn.',
                        key: "functionDeclarations",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "list",
                                itemType: {
                                    type: "id",
                                    value: "type_v1Beta/models:FunctionDeclaration",
                                },
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:ToolConfig": {
            name: "ToolConfig",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "Function calling config.",
                        key: "functionCallingConfig",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:FunctionCallingConfig",
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:FunctionCallingConfig": {
            name: "FunctionCallingConfig",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description:
                            "Specifies the mode in which function calling should execute. If unspecified, the default value will be set to AUTO.",
                        key: "mode",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:Mode",
                            },
                        },
                    },
                    {
                        description:
                            "A set of function names that, when provided, limits the functions the model will call.\n\nThis should only be set when the Mode is ANY. Function names should match [FunctionDeclaration.name]. With mode set\nto ANY, model will predict a function call from the set of function names provided.",
                        key: "allowedFunctionNames",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "list",
                                itemType: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:Mode": {
            name: "Mode",
            shape: {
                type: "enum",
                values: [
                    {
                        description: "Unspecified function calling mode. This value should not be used.",
                        value: "MODE_UNSPECIFIED",
                    },
                    {
                        description:
                            "Default model behavior, model decides to predict either a function call or a natural language response.",
                        value: "AUTO",
                    },
                    {
                        description:
                            'Model is constrained to always predicting a function call only. If "allowedFunctionNames" are set, the predicted\nfunction call will be limited to any one of "allowedFunctionNames", else the predicted function call will\nbe any one of the provided "functionDeclarations".',
                        value: "ANY",
                    },
                    {
                        description:
                            "Model will not predict any function call. Model behavior is same as when not passing any function declarations.",
                        value: "BLOCK_NONE",
                    },
                ],
            },
        },
        "type_v1Beta/models:GenerationConfig": {
            name: "GenerationConfig",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description:
                            "The set of character sequences (up to 5) that will stop output generation. If specified, the API will\nstop at the first appearance of a stop sequence. The stop sequence will not be included as part of the response.",
                        key: "stopSequences",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "list",
                                itemType: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                    {
                        description:
                            "Output response mimetype of the generated candidate text. Supported mimetype:\n**text/plain**: (default) Text output. **application/json**: JSON response in the candidates.",
                        key: "responseMimeType",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                    },
                    {
                        description:
                            "Output response schema of the generated candidate text when response mime type can have schema.\nSchema can be objects, primitives or arrays and is a subset of OpenAPI schema.\n\nIf set, a compatible responseMimeType must also be set. Compatible mimetypes: **application/json**:\nSchema for JSON response.",
                        key: "responseSchema",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:Schema",
                            },
                        },
                    },
                    {
                        description:
                            "Number of generated responses to return.\n\nCurrently, this value can only be set to 1. If unset, this will default to 1.",
                        key: "candidateCount",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                    },
                    {
                        description:
                            "The maximum number of tokens to include in a candidate.\n\nNote: The default value varies by model, see the **Model.output_token_limit** attribute of the **Model** returned from the **getModel** function.",
                        key: "maxOutputTokens",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                    },
                    {
                        description:
                            "Controls the randomness of the output.\n\nNote: The default value varies by model, see the **Model.temperature** attribute of the **Model** returned from the getModel function.\n\nValues can range from [0.0, 2.0].",
                        key: "temperature",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "double",
                                },
                            },
                        },
                    },
                    {
                        description:
                            "The maximum cumulative probability of tokens to consider when sampling.\n\nThe model uses combined Top-k and nucleus sampling.\n\nTokens are sorted based on their assigned probabilities so that only the most likely tokens are considered.\nTop-k sampling directly limits the maximum number of tokens to consider, while Nucleus sampling limits number\nof tokens based on the cumulative probability.\n\nNote: The default value varies by model, see the Model.top_p attribute of the Model returned from the getModel function.",
                        key: "topP",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "double",
                                },
                            },
                        },
                    },
                    {
                        description:
                            "The maximum number of tokens to consider when sampling.\n\nModels use nucleus sampling or combined Top-k and nucleus sampling. Top-k sampling considers the set of\n**topK** most probable tokens. Models running with nucleus sampling don't allow topK setting.\n\nNote: The default value varies by model, see the **Model.top_k** attribute of the **Model** returned from the\n**getModel** function. Empty **topK** field in **Model** indicates the model doesn't apply top-k sampling and\ndoesn't allow setting **topK** on requests.",
                        key: "topK",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:FunctionDeclaration": {
            name: "FunctionDeclaration",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description:
                            "The name of the function. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 63.",
                        key: "name",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        description: "A brief description of the function.",
                        key: "description",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        description:
                            "Describes the parameters to this function. Reflects the Open API 3.03 Parameter Object string Key: the\nname of the parameter. Parameter names are case sensitive. Schema Value: the Schema defining the type used for the parameter.",
                        key: "parameters",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:Schema",
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:Schema": {
            description:
                "The Schema object allows the definition of input and output data types. These types can be objects,\nbut also primitives and arrays. Represents a select subset of an OpenAPI 3.0 schema object.",
            name: "Schema",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "Data type",
                        key: "type",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:Type",
                        },
                    },
                    {
                        description:
                            "The format of the data. This is used only for primitive datatypes. Supported formats: for NUMBER type: float, double for INTEGER type: int32, int64",
                        key: "format",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                    },
                    {
                        description:
                            "A brief description of the parameter. This could contain examples of use. Parameter description may be formatted as Markdown.",
                        key: "description",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                    },
                    {
                        description: "Indicates if the value may be null.",
                        key: "nullable",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "boolean",
                                },
                            },
                        },
                    },
                    {
                        description:
                            'Possible values of the element of Type.STRING with enum format.\nFor example we can define an Enum Direction as : `{ type:STRING, format:enum, enum:["EAST", NORTH", "SOUTH", "WEST"]}`',
                        key: "enum",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "list",
                                itemType: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                    {
                        description:
                            'Properties of Type.OBJECT.\n\nAn object containing a list of **"key"**: **value** pairs. Example: `{ "name": "wrench", "mass": "1.3kg", "count": "3" }`.',
                        key: "properties",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "map",
                                keyType: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                                valueType: {
                                    type: "id",
                                    value: "type_v1Beta/models:Schema",
                                },
                            },
                        },
                    },
                    {
                        description: "Required properties of Type.OBJECT.",
                        key: "required",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "list",
                                itemType: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                    {
                        description: "Schema of the elements of Type.ARRAY.",
                        key: "items",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:Schema",
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:Type": {
            name: "Type",
            shape: {
                type: "enum",
                values: [
                    {
                        description: "String type.",
                        value: "STRING",
                    },
                    {
                        description: "Number type.",
                        value: "NUMBER",
                    },
                    {
                        description: "Integer type.",
                        value: "INTEGER",
                    },
                    {
                        description: "Boolean type.",
                        value: "BOOLEAN",
                    },
                    {
                        description: "Array type.",
                        value: "ARRAY",
                    },
                    {
                        description: "Object type.",
                        value: "OBJECT",
                    },
                ],
            },
        },
        "type_v1Beta/models:Role": {
            name: "Role",
            shape: {
                type: "enum",
                values: [
                    {
                        value: "user",
                    },
                    {
                        value: "model",
                    },
                ],
            },
        },
        "type_v1Beta/models:Part": {
            description:
                "A datatype containing media that is part of a multi-part `Content` message.\nA Part consists of data which has an associated datatype.",
            name: "Part",
            shape: {
                type: "undiscriminatedUnion",
                variants: [
                    {
                        typeName: "Text",
                        type: {
                            type: "id",
                            value: "type_v1Beta/models:Text",
                        },
                    },
                    {
                        typeName: "InlineData",
                        type: {
                            type: "id",
                            value: "type_v1Beta/models:InlineData",
                        },
                    },
                    {
                        typeName: "FunctionCall",
                        type: {
                            type: "id",
                            value: "type_v1Beta/models:FunctionCall",
                        },
                    },
                    {
                        typeName: "FunctionResponse",
                        type: {
                            type: "id",
                            value: "type_v1Beta/models:FunctionResponse",
                        },
                    },
                    {
                        typeName: "FileData",
                        type: {
                            type: "id",
                            value: "type_v1Beta/models:FileData",
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:Text": {
            name: "Text",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "Inline text",
                        key: "text",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:InlineData": {
            name: "InlineData",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "Inline media bytes.",
                        key: "inlineData",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:Blob",
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:Blob": {
            name: "Blob",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description:
                            "The IANA standard MIME type of the source data. Examples: `image/png`, `image/jpeg`.  \nIf an unsupported MIME type is provided, an error will be returned. For a complete\nlist of supported types, see Supported file formats.",
                        key: "mimeType",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        description: "Raw bytes for media formats.\nA base64-encoded string.",
                        key: "data",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "base64",
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:FunctionCall": {
            name: "FunctionCall",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description:
                            "A predicted **FunctionCall** returned from the model that contains a string\nrepresenting the **FunctionDeclaration.name** with the arguments and their values.",
                        key: "functionCall",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:PredictedFunctionCall",
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:PredictedFunctionCall": {
            name: "PredictedFunctionCall",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description:
                            "Required. The name of the function to call. Must be a-z, A-Z, 0-9,\nor contain underscores and dashes, with a maximum length of 63.",
                        key: "name",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        description: "The function parameters and values in JSON object format.",
                        key: "args",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "map",
                                keyType: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                                valueType: {
                                    type: "unknown",
                                },
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:FunctionResponse": {
            name: "FunctionResponse",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description:
                            "The result output of a **FunctionCall** that contains a string representing the **FunctionDeclaration.name**\nand a structured JSON object containing any output from the function is used as context to the model.",
                        key: "functionResponse",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:FunctionResponseProperties",
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:FunctionResponseProperties": {
            name: "FunctionResponseProperties",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description:
                            "The name of the function to call. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 63.",
                        key: "name",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        description: "The function response in JSON object format.",
                        key: "response",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "map",
                                keyType: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                                valueType: {
                                    type: "unknown",
                                },
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:FileData": {
            name: "FileData",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "URI based data.",
                        key: "fileData",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:FileDataProperties",
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:FileDataProperties": {
            name: "FileDataProperties",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "The IANA standard MIME type of the source data.",
                        key: "mimeType",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                    },
                    {
                        description: "URI.",
                        key: "fileUri",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:AnswerStyle": {
            description: "Style for grounded answers.",
            name: "AnswerStyle",
            shape: {
                type: "enum",
                values: [
                    {
                        description: "Unspecified answer style.",
                        value: "ANSWER_STYLE_UNSPECIFIED",
                    },
                    {
                        description: "Succint but abstract style.",
                        value: "ABSTRACTIVE",
                    },
                    {
                        description: "Very brief and extractive style.",
                        value: "EXTRACTIVE",
                    },
                    {
                        description:
                            "Verbose style including extra details. The response may be formatted as a sentence, paragraph, multiple paragraphs, or bullet points, etc.",
                        value: "VERBOSE",
                    },
                ],
            },
        },
        "type_v1Beta/models:SemanticRetrieverConfig": {
            name: "SemanticRetrieverConfig",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description:
                            "Name of the resource for retrieval, e.g. `corpora/123` or `corpora/123/documents/abc`.",
                        key: "source",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        description: "Query to use for similarity matching **Chunks** in the given resource.",
                        key: "query",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:Content",
                        },
                    },
                    {
                        description: "Filters for selecting Documents and/or Chunks from the resource.",
                        key: "metadataFilters",
                        valueType: {
                            type: "unknown",
                        },
                    },
                    {
                        description: "Maximum number of relevant **Chunks** to retrieve.",
                        key: "maxChunksCount",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                    },
                    {
                        description: "Minimum relevance score for retrieved relevant **Chunks**.",
                        key: "minimumRelevanceScore",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "double",
                                },
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:SafetySettings": {
            name: "SafetySettings",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "The category for this setting.",
                        key: "category",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:HarmCategory",
                        },
                    },
                    {
                        description: "Controls the probability threshold at which harm is blocked.",
                        key: "threshold",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:HarmBlockThreshold",
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:HarmCategory": {
            name: "HarmCategory",
            shape: {
                type: "enum",
                values: [
                    {
                        description: "Category is unspecified.",
                        value: "HARM_CATEGORY_UNSPECIFIED",
                    },
                    {
                        description: "Negative or harmful comments targeting identity and/or protected attribute.",
                        value: "HARM_CATEGORY_DEROGATORY",
                    },
                    {
                        description: "Content that is rude, disrespectful, or profane.",
                        value: "HARM_CATEGORY_TOXICITY",
                    },
                    {
                        description:
                            "Describes scenarios depicting violence against an individual or group, or general descriptions of gore.",
                        value: "HARM_CATEGORY_VIOLENCE",
                    },
                    {
                        description: "Contains references to sexual acts or other lewd content.",
                        value: "HARM_CATEGORY_SEXUAL",
                    },
                    {
                        description: "Promotes unchecked medical advice.",
                        value: "HARM_CATEGORY_MEDICAL",
                    },
                    {
                        description: "Dangerous content that promotes, facilitates, or encourages harmful acts.",
                        value: "HARM_CATEGORY_DANGEROUS",
                    },
                    {
                        description: "Harasment content.",
                        value: "HARM_CATEGORY_HARASSMENT",
                    },
                    {
                        description: "Hate speech and content.",
                        value: "HARM_CATEGORY_HATE_SPEECH",
                    },
                    {
                        description: "Sexually explicit content.",
                        value: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    },
                    {
                        description: "Dangerous content.",
                        value: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    },
                ],
            },
        },
        "type_v1Beta/models:HarmBlockThreshold": {
            name: "HarmBlockThreshold",
            shape: {
                type: "enum",
                values: [
                    {
                        description: "Threshold is unspecified.",
                        value: "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
                    },
                    {
                        description: "Content with NEGLIGIBLE will be allowed.",
                        value: "BLOCK_LOW_AND_ABOVE",
                    },
                    {
                        description: "Content with NEGLIGIBLE and LOW will be allowed.",
                        value: "BLOCK_MEDIUM_AND_ABOVE",
                    },
                    {
                        description: "Content with NEGLIGIBLE, LOW, and MEDIUM will be allowed.",
                        value: "BLOCK_ONLY_HIGH",
                    },
                    {
                        description: "All content will be allowed.",
                        value: "BLOCK_NONE",
                    },
                ],
            },
        },
        "type_v1Beta/models:GroundingPassage": {
            description: "Passage included inline with a grounding configuration.",
            name: "GroundingPassage",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "Identifier for the passage for attributing this passage in grounded answers.",
                        key: "id",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        description: "Content of the passage.",
                        key: "content",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:Content",
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:GenerateContentResponse": {
            name: "GenerateContentResponse",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "Candidate responses from the model.",
                        key: "candidates",
                        valueType: {
                            type: "list",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:Candidate",
                            },
                        },
                    },
                    {
                        description: "Returns the prompt's feedback related to the content filters.",
                        key: "promptFeedback",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:PromptFeedback",
                            },
                        },
                    },
                    {
                        description: "Output only. Metadata on the generation requests' token usage.",
                        key: "usageMetadata",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:UsageMetadata",
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:Candidate": {
            name: "Candidate",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "Output only. Generated content returned from the model.",
                        key: "content",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:Content",
                        },
                    },
                    {
                        description:
                            "Output only. The reason why the model stopped generating tokens.\nIf empty, the model has not stopped generating the tokens.",
                        key: "finishReason",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:FinishReason",
                            },
                        },
                    },
                    {
                        description:
                            "List of ratings for the safety of a response candidate.\nThere is at most one rating per category.",
                        key: "safetyRatings",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "list",
                                itemType: {
                                    type: "id",
                                    value: "type_v1Beta/models:SafetyRating",
                                },
                            },
                        },
                    },
                    {
                        description:
                            'Citation information for model-generated candidate.\nThis field may be populated with recitation information for any text included in the **content**. These are passages that are "recited" from copyrighted material in the foundational LLM\'s training data.',
                        key: "citationMetadata",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:CitationMetadata",
                            },
                        },
                    },
                    {
                        description: "Output only. Token count for this candidate.",
                        key: "tokenCount",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                    },
                    {
                        description: "Attribution information for sources that contributed to a grounded answer.",
                        key: "groundingAttributions",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "list",
                                itemType: {
                                    type: "id",
                                    value: "type_v1Beta/models:GroundingAttribution",
                                },
                            },
                        },
                    },
                    {
                        description: "Index of the candidate in the list of candidates.",
                        key: "index",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "integer",
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:PromptFeedback": {
            name: "PromptFeedback",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description:
                            "If set, the prompt was blocked and no candidates are returned. Rephrase your prompt.",
                        key: "blockReason",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:BlockReason",
                            },
                        },
                    },
                    {
                        description: "Ratings for safety of the prompt. There is at most one rating per category.",
                        key: "safetyRatings",
                        valueType: {
                            type: "list",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:SafetyRating",
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:BlockReason": {
            name: "BlockReason",
            shape: {
                type: "enum",
                values: [
                    {
                        description: "Default value. This value is unused.",
                        value: "BLOCK_REASON_UNSPECIFIED",
                    },
                    {
                        description:
                            "Prompt was blocked due to safety reasons. You can inspect safetyRatings to understand which safety category blocked it.",
                        value: "SAFETY",
                    },
                    {
                        description: "Prompt was blocked due to unknown reaasons.",
                        value: "OTHER",
                    },
                ],
            },
        },
        "type_v1Beta/models:UsageMetadata": {
            name: "UsageMetadata",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "Number of tokens in the prompt.",
                        key: "promptTokenCount",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                    },
                    {
                        description: "Total number of tokens across the generated candidates.",
                        key: "candidatesTokenCount",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                    },
                    {
                        description: "Total token count for the generation request (prompt + candidates).",
                        key: "totalTokenCount",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "integer",
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:SafetyRating": {
            description: "Safety rating for a piece of content.",
            name: "SafetyRating",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "The category for this rating.",
                        key: "category",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:HarmCategory",
                        },
                    },
                    {
                        description: "The probability of harm for this content.",
                        key: "probability",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:HarmProbability",
                        },
                    },
                    {
                        description: "Was this content blocked because of this rating?",
                        key: "blocked",
                        valueType: {
                            type: "optional",
                            itemType: {
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
        "type_v1Beta/models:CitationMetadata": {
            description: "A collection of source attributions for a piece of content.",
            name: "CitationMetadata",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "Citations to sources for a specific response.",
                        key: "citationSources",
                        valueType: {
                            type: "list",
                            itemType: {
                                type: "id",
                                value: "type_v1Beta/models:CitationSource",
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:CitationSource": {
            name: "CitationSource",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "Start of segment of the response that is attributed to this source.",
                        key: "startIndex",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                    },
                    {
                        description: "End of the attributed segment, exclusive.",
                        key: "endIndex",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "integer",
                                },
                            },
                        },
                    },
                    {
                        description: "URI that is attributed as a source for a portion of the text.",
                        key: "uri",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                    },
                    {
                        description:
                            "License for the GitHub project that is attributed as a source for segment.\n\nLicense info is required for code citations.",
                        key: "license",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:HarmProbability": {
            description: "The probability that a piece of content is harmful.",
            name: "HarmProbability",
            shape: {
                type: "enum",
                values: [
                    {
                        description: "Content has a negligible chance of being unsafe.",
                        value: "NEGLIGIBLE",
                    },
                    {
                        description: "Content has a low chance of being unsafe.",
                        value: "LOW",
                    },
                    {
                        description: "Content has a medium chance of being unsafe.",
                        value: "MEDIUM",
                    },
                    {
                        description: "Content has a high chance of being unsafe.",
                        value: "HIGH",
                    },
                ],
            },
        },
        "type_v1Beta/models:FinishReason": {
            name: "FinishReason",
            shape: {
                type: "enum",
                values: [
                    {
                        description: "Natural stop point of the model or provided stop sequence.",
                        value: "STOP",
                    },
                    {
                        description: "The maximum number of tokens as specified in the request was reached.",
                        value: "MAX_TOKENS",
                    },
                    {
                        description: "The candidate content was flagged for safety reasons.",
                        value: "SAFETY",
                    },
                    {
                        description: "The candidate content was flagged for recitation reasons.",
                        value: "RECITATION",
                    },
                    {
                        description: "Unknown reason.",
                        value: "OTHER",
                    },
                ],
            },
        },
        "type_v1Beta/models:GroundingAttribution": {
            name: "GroundingAttribution",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description: "Output only. Identifier for the source contributing to this attribution.",
                        key: "sourceId",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:AttributionSourceId",
                        },
                    },
                    {
                        description: "Grounding source content that makes up this attribution.",
                        key: "content",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:Content",
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:AttributionSourceId": {
            name: "AttributionSourceId",
            shape: {
                type: "undiscriminatedUnion",
                variants: [
                    {
                        typeName: "GroundingPassageId",
                        type: {
                            type: "id",
                            value: "type_v1Beta/models:GroundingPassageId",
                        },
                    },
                    {
                        typeName: "SemanticRetrieverChunk",
                        type: {
                            type: "id",
                            value: "type_v1Beta/models:SemanticRetrieverChunk",
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:GroundingPassageId": {
            name: "GroundingPassageId",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "groundingPassage",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:GroundingPassageIdProperties",
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:GroundingPassageIdProperties": {
            name: "GroundingPassageIdProperties",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description:
                            "Output only. ID of the passage matching the **GenerateAnswerRequest's GroundingPassage.id**.",
                        key: "passageId",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        description:
                            "Output only. Index of the part within the **GenerateAnswerRequest's GroundingPassage.content**.",
                        key: "partIndex",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:SemanticRetrieverChunk": {
            name: "SemanticRetrieverChunk",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "semanticRetrieverChunk",
                        valueType: {
                            type: "id",
                            value: "type_v1Beta/models:SemanticRetrieverChunkProperties",
                        },
                    },
                ],
            },
        },
        "type_v1Beta/models:SemanticRetrieverChunkProperties": {
            description: "Identifier for a Chunk fetched via Semantic Retriever.",
            name: "SemanticRetrieverChunkProperties",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        description:
                            "Output only. Name of the source matching the request's `SemanticRetrieverConfig.source.` Example: `corpora/123` or `corpora/123/documents/abc`",
                        key: "source",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        description:
                            "Output only. Name of the `Chunk` containing the attributed text. Example: `corpora/123/documents/abc/chunks/xyz`",
                        key: "chunk",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                ],
            },
        },
    },
    subpackages: {
        subpackage_v1Beta: {
            subpackageId: "subpackage_v1Beta",
            displayName: "v1beta",
            name: "v1Beta",
            endpoints: [],
            webhooks: [],
            websockets: [],
            types: [],
            subpackages: ["subpackage_v1Beta/models"],
        },
        "subpackage_v1Beta/models": {
            subpackageId: "subpackage_v1Beta/models",
            displayName: "models",
            name: "models",
            endpoints: [
                {
                    auth: false,
                    description:
                        "Generates a response from the model given an input `GenerateContentRequest`.\n\nInput capabilities differ between models, including tuned models. See the\n[model guide](https://ai.google.dev/gemini-api/docs/models/gemini) and\n[tuning guide](https://ai.google.dev/gemini-api/docs/model-tuning) for details.",
                    method: "POST",
                    defaultEnvironment: "Production",
                    environments: [
                        {
                            id: "Production",
                            baseUrl: "https://generativelanguage.googleapis.com",
                        },
                    ],
                    id: "generateContent",
                    originalEndpointId: "endpoint_v1Beta/models.generateContent",
                    name: "generateContent",
                    path: {
                        pathParameters: [
                            {
                                description: "The name of the Model to use for generating the grounded response.",
                                key: "model",
                                type: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                    },
                                },
                            },
                        ],
                        parts: [
                            {
                                type: "literal",
                                value: "/v1beta/models",
                            },
                            {
                                type: "literal",
                                value: "/",
                            },
                            {
                                type: "pathParameter",
                                value: "model",
                            },
                            {
                                type: "literal",
                                value: "",
                            },
                        ],
                    },
                    queryParameters: [
                        {
                            description:
                                "To use the Gemini API, you'll need an API key. If you don't already have one, create a key\nin [Google AI Studio](https://ai.google.dev/gemini-api/docs/workspace).",
                            key: "key",
                            type: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                    ],
                    headers: [],
                    request: {
                        type: {
                            type: "json",
                            contentType: "application/json",
                            shape: {
                                type: "object",
                                extends: [],
                                properties: [
                                    {
                                        description:
                                            "The content of the current conversation with the model. For single-turn queries, this is a single question to answer. \nFor multi-turn queries, this is a repeated field that contains conversation history and the last \n`Content` in the list containing the question.\n\nThis endpoint currently only supports queries in English.\n",
                                        key: "contents",
                                        valueType: {
                                            type: "list",
                                            itemType: {
                                                type: "id",
                                                value: "type_v1Beta/models:Content",
                                            },
                                        },
                                    },
                                    {
                                        description:
                                            "A list of **Tools** the model may use to generate the next response.\n\nA **Tool** is a piece of code that enables the system to interact with external systems to perform an \naction, or set of actions, outside of knowledge and scope of the model. \nThe only supported tool is currently **Function**.\n",
                                        key: "tools",
                                        valueType: {
                                            type: "optional",
                                            itemType: {
                                                type: "list",
                                                itemType: {
                                                    type: "id",
                                                    value: "type_v1Beta/models:Tool",
                                                },
                                            },
                                        },
                                    },
                                    {
                                        description: "Tool configuration for any **Tool** specified in the request.\n",
                                        key: "toolConfig",
                                        valueType: {
                                            type: "optional",
                                            itemType: {
                                                type: "id",
                                                value: "type_v1Beta/models:ToolConfig",
                                            },
                                        },
                                    },
                                    {
                                        description:
                                            "A list of unique SafetySetting instances for blocking unsafe content.",
                                        key: "safetySettings",
                                        valueType: {
                                            type: "optional",
                                            itemType: {
                                                type: "list",
                                                itemType: {
                                                    type: "id",
                                                    value: "type_v1Beta/models:SafetySettings",
                                                },
                                            },
                                        },
                                    },
                                    {
                                        description: "Developer set system instruction. Currently, text only.",
                                        key: "systemInstruction",
                                        valueType: {
                                            type: "optional",
                                            itemType: {
                                                type: "id",
                                                value: "type_v1Beta/models:Content",
                                            },
                                        },
                                    },
                                    {
                                        description: "Configuration options for model generation and outputs.",
                                        key: "generationConfig",
                                        valueType: {
                                            type: "optional",
                                            itemType: {
                                                type: "id",
                                                value: "type_v1Beta/models:GenerationConfig",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    response: {
                        type: {
                            type: "reference",
                            value: {
                                type: "id",
                                value: "type_v1Beta/models:GenerateContentResponse",
                            },
                        },
                    },
                    errorsV2: [],
                    examples: [
                        {
                            name: "Text only input",
                            path: "/v1beta/models/gemini-pro:generateContent",
                            pathParameters: {
                                model: "gemini-pro:generateContent",
                            },
                            queryParameters: {
                                key: "GOOGLE_API_KEY",
                            },
                            headers: {},
                            requestBody: {
                                contents: [
                                    {
                                        parts: [
                                            {
                                                text: "Write a story about a magic backpack",
                                            },
                                        ],
                                    },
                                ],
                            },
                            requestBodyV3: {
                                type: "json",
                                value: {
                                    contents: [
                                        {
                                            parts: [
                                                {
                                                    text: "Write a story about a magic backpack",
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                            responseStatusCode: 200,
                            responseBody: {
                                candidates: [
                                    {
                                        content: {
                                            parts: [
                                                {
                                                    text: "In the quaint town of Willow Creek, nestled amidst rolling hills and whispering willows, there lived an ordinary boy named Ethan. Ethan's life took an extraordinary turn the day he stumbled upon an enigmatic backpack hidden in the depths of his attic.\n\nCuriosity ignited within Ethan as he lifted the worn leather straps and unzipped its mysterious contents. Inside lay a shimmering array of vibrant objects and peculiar trinkets. There was a glowing orb that pulsated with an ethereal glow, a feather that seemed to have a life of its own, and a small, enigmatic key.\n\nAs Ethan explored each item, he realized they possessed astonishing abilities. The orb illuminated his path, casting a warm glow in the darkest of nights. The feather granted him the power of flight, allowing him to soar through the skies with newfound freedom. And the key opened a portal to a hidden world, a realm of endless wonder.\n\nArmed with his magical backpack, Ethan embarked on countless adventures. He flew over the towering mountains of Willow Creek, exploring their hidden secrets. He navigated the treacherous depths of the Enchanted Forest, where he encountered mythical creatures and ancient spirits. And he ventured into distant, unknown lands, uncovering lost civilizations and forgotten treasures.\n\nWith each adventure, Ethan's knowledge and abilities grew. He learned to harness the power of his backpack wisely, using its magic to help others and protect the world from evil forces. The backpack became an extension of himself, a symbol of hope and wonder in the face of adversity.\n\nAs the years went by, Ethan's reputation as the boy with the magic backpack spread far and wide. People from all walks of life came to him, seeking his guidance and protection. And Ethan never hesitated to lend a helping hand, using his extraordinary abilities to make the world a better place.\n\nIn the end, the magic backpack became more than just a collection of objects. It was a representation of Ethan's unwavering spirit, his boundless imagination, and his unwavering belief in the power of dreams. And as long as Ethan carried it with him, the magic of Willow Creek would live on, illuminating the darkest corners of the world with hope, wonder, and the limitless possibilities that resided within the heart of a child.",
                                                },
                                            ],
                                            role: "model",
                                        },
                                        finishReason: "STOP",
                                        index: 0,
                                        safetyRatings: [
                                            {
                                                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                                probability: "NEGLIGIBLE",
                                            },
                                            {
                                                category: "HARM_CATEGORY_HATE_SPEECH",
                                                probability: "NEGLIGIBLE",
                                            },
                                            {
                                                category: "HARM_CATEGORY_HARASSMENT",
                                                probability: "NEGLIGIBLE",
                                            },
                                            {
                                                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                                probability: "NEGLIGIBLE",
                                            },
                                        ],
                                    },
                                ],
                                promptFeedback: {
                                    safetyRatings: [
                                        {
                                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                            probability: "NEGLIGIBLE",
                                        },
                                        {
                                            category: "HARM_CATEGORY_HATE_SPEECH",
                                            probability: "NEGLIGIBLE",
                                        },
                                        {
                                            category: "HARM_CATEGORY_HARASSMENT",
                                            probability: "NEGLIGIBLE",
                                        },
                                        {
                                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                            probability: "NEGLIGIBLE",
                                        },
                                    ],
                                },
                            },
                            responseBodyV3: {
                                type: "json",
                                value: {
                                    candidates: [
                                        {
                                            content: {
                                                parts: [
                                                    {
                                                        text: "In the quaint town of Willow Creek, nestled amidst rolling hills and whispering willows, there lived an ordinary boy named Ethan. Ethan's life took an extraordinary turn the day he stumbled upon an enigmatic backpack hidden in the depths of his attic.\n\nCuriosity ignited within Ethan as he lifted the worn leather straps and unzipped its mysterious contents. Inside lay a shimmering array of vibrant objects and peculiar trinkets. There was a glowing orb that pulsated with an ethereal glow, a feather that seemed to have a life of its own, and a small, enigmatic key.\n\nAs Ethan explored each item, he realized they possessed astonishing abilities. The orb illuminated his path, casting a warm glow in the darkest of nights. The feather granted him the power of flight, allowing him to soar through the skies with newfound freedom. And the key opened a portal to a hidden world, a realm of endless wonder.\n\nArmed with his magical backpack, Ethan embarked on countless adventures. He flew over the towering mountains of Willow Creek, exploring their hidden secrets. He navigated the treacherous depths of the Enchanted Forest, where he encountered mythical creatures and ancient spirits. And he ventured into distant, unknown lands, uncovering lost civilizations and forgotten treasures.\n\nWith each adventure, Ethan's knowledge and abilities grew. He learned to harness the power of his backpack wisely, using its magic to help others and protect the world from evil forces. The backpack became an extension of himself, a symbol of hope and wonder in the face of adversity.\n\nAs the years went by, Ethan's reputation as the boy with the magic backpack spread far and wide. People from all walks of life came to him, seeking his guidance and protection. And Ethan never hesitated to lend a helping hand, using his extraordinary abilities to make the world a better place.\n\nIn the end, the magic backpack became more than just a collection of objects. It was a representation of Ethan's unwavering spirit, his boundless imagination, and his unwavering belief in the power of dreams. And as long as Ethan carried it with him, the magic of Willow Creek would live on, illuminating the darkest corners of the world with hope, wonder, and the limitless possibilities that resided within the heart of a child.",
                                                    },
                                                ],
                                                role: "model",
                                            },
                                            finishReason: "STOP",
                                            index: 0,
                                            safetyRatings: [
                                                {
                                                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                                    probability: "NEGLIGIBLE",
                                                },
                                                {
                                                    category: "HARM_CATEGORY_HATE_SPEECH",
                                                    probability: "NEGLIGIBLE",
                                                },
                                                {
                                                    category: "HARM_CATEGORY_HARASSMENT",
                                                    probability: "NEGLIGIBLE",
                                                },
                                                {
                                                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                                    probability: "NEGLIGIBLE",
                                                },
                                            ],
                                        },
                                    ],
                                    promptFeedback: {
                                        safetyRatings: [
                                            {
                                                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                                probability: "NEGLIGIBLE",
                                            },
                                            {
                                                category: "HARM_CATEGORY_HATE_SPEECH",
                                                probability: "NEGLIGIBLE",
                                            },
                                            {
                                                category: "HARM_CATEGORY_HARASSMENT",
                                                probability: "NEGLIGIBLE",
                                            },
                                            {
                                                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                                probability: "NEGLIGIBLE",
                                            },
                                        ],
                                    },
                                },
                            },
                            codeSamples: [
                                {
                                    language: "python",
                                    code: "model = genai.GenerativeModel('gemini-1.5-flash')\n\nprompt = \"Write a story about a magic backpack.\"\n\nresponse = model.generate_content(prompt)\n",
                                },
                                {
                                    language: "go",
                                    code: 'ctx := context.Background()\nclient, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("API_KEY")))\nif err != nil {\n  log.Fatal(err)\n}\ndefer client.Close()\n\nmodel := client.GenerativeModel("gemini-1.5-flash")\nresp, err := model.GenerateContent(ctx, genai.Text("Write a story about a magic backpack."))\nif err != nil {\n  log.Fatal(err)\n}\n',
                                },
                                {
                                    language: "javascript",
                                    code: 'const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });\nconst prompt = "Write a story about a magic backpack.";\n\nconst result = await model.generateContent(prompt);\nconsole.log(result.response.text());\n',
                                },
                            ],
                        },
                        {
                            name: "Multi-turn conversations (chat)",
                            path: "/v1beta/models/gemini-pro:generateContent",
                            pathParameters: {
                                model: "gemini-pro:generateContent",
                            },
                            queryParameters: {
                                key: "GOOGLE_API_KEY",
                            },
                            headers: {},
                            requestBody: {
                                contents: [
                                    {
                                        role: "user",
                                        parts: [
                                            {
                                                text: "Write the first line of a story about a magic backpack.",
                                            },
                                        ],
                                    },
                                    {
                                        role: "model",
                                        parts: [
                                            {
                                                text: "In the bustling city of Meadow brook, lived a young girl named Sophie. She was a bright and curious soul with an imaginative mind.",
                                            },
                                        ],
                                    },
                                    {
                                        role: "user",
                                        parts: [
                                            {
                                                text: "Can you set it in a quiet village in 1600s France?",
                                            },
                                        ],
                                    },
                                ],
                            },
                            requestBodyV3: {
                                type: "json",
                                value: {
                                    contents: [
                                        {
                                            role: "user",
                                            parts: [
                                                {
                                                    text: "Write the first line of a story about a magic backpack.",
                                                },
                                            ],
                                        },
                                        {
                                            role: "model",
                                            parts: [
                                                {
                                                    text: "In the bustling city of Meadow brook, lived a young girl named Sophie. She was a bright and curious soul with an imaginative mind.",
                                                },
                                            ],
                                        },
                                        {
                                            role: "user",
                                            parts: [
                                                {
                                                    text: "Can you set it in a quiet village in 1600s France?",
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                            responseStatusCode: 200,
                            responseBody: {
                                candidates: [
                                    {
                                        content: {
                                            parts: [
                                                {
                                                    text: "In the tranquil village of Verdon in the rolling hills of 17th century France, nestled a humble cottage where lived a young maiden named Lisette, with a heart filled with boundless curiosity.",
                                                },
                                            ],
                                            role: "model",
                                        },
                                        finishReason: "STOP",
                                        index: 0,
                                        safetyRatings: [
                                            {
                                                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                                probability: "NEGLIGIBLE",
                                            },
                                            {
                                                category: "HARM_CATEGORY_HATE_SPEECH",
                                                probability: "NEGLIGIBLE",
                                            },
                                            {
                                                category: "HARM_CATEGORY_HARASSMENT",
                                                probability: "NEGLIGIBLE",
                                            },
                                            {
                                                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                                probability: "NEGLIGIBLE",
                                            },
                                        ],
                                    },
                                ],
                                usageMetadata: {
                                    promptTokenCount: 59,
                                    candidatesTokenCount: 40,
                                    totalTokenCount: 99,
                                },
                            },
                            responseBodyV3: {
                                type: "json",
                                value: {
                                    candidates: [
                                        {
                                            content: {
                                                parts: [
                                                    {
                                                        text: "In the tranquil village of Verdon in the rolling hills of 17th century France, nestled a humble cottage where lived a young maiden named Lisette, with a heart filled with boundless curiosity.",
                                                    },
                                                ],
                                                role: "model",
                                            },
                                            finishReason: "STOP",
                                            index: 0,
                                            safetyRatings: [
                                                {
                                                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                                    probability: "NEGLIGIBLE",
                                                },
                                                {
                                                    category: "HARM_CATEGORY_HATE_SPEECH",
                                                    probability: "NEGLIGIBLE",
                                                },
                                                {
                                                    category: "HARM_CATEGORY_HARASSMENT",
                                                    probability: "NEGLIGIBLE",
                                                },
                                                {
                                                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                                    probability: "NEGLIGIBLE",
                                                },
                                            ],
                                        },
                                    ],
                                    usageMetadata: {
                                        promptTokenCount: 59,
                                        candidatesTokenCount: 40,
                                        totalTokenCount: 99,
                                    },
                                },
                            },
                            codeSamples: [
                                {
                                    language: "python",
                                    code: "model = genai.GenerativeModel('gemini-1.5-flash')\nchat = model.start_chat(history=[])\n\nresponse = chat.send_message(\n    \"Pretend you\\'re a snowman and stay in character for each response.\")\nprint(response.text)\n\nresponse = chat.send_message(\n    \"What\\'s your favorite season of the year?\")\nprint(response.text)\n",
                                },
                                {
                                    language: "go",
                                    code: 'model := client.GenerativeModel("gemini-1.5-flash")\ncs := model.StartChat()\ncs.History = []*genai.Content{\n  &genai.Content{\n    Parts: []genai.Part{\n      genai.Text("Pretend you\'re a snowman and stay in character for each response."),\n    },\n    Role: "user",\n  },\n  &genai.Content{\n    Parts: []genai.Part{\n      genai.Text("Hello! It\'s cold! Isn\'t that great?"),\n    },\n    Role: "model",\n  },\n}\n\nresp, err := cs.SendMessage(ctx, genai.Text("What\'s your favorite season of the year?"))\nif err != nil {\n  log.Fatal(err)\n}\n',
                                },
                                {
                                    language: "javascript",
                                    code: 'const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});\n\nconst chat = model.startChat({\n  history: [\n    {\n      role: "user",\n      parts: "Pretend you\'re a snowman and stay in character for each response.",\n    },\n    {\n      role: "model",\n      parts: "Hello! It\'s cold! Isn\'t that great?",\n    },\n  ],\n  generationConfig: {\n    maxOutputTokens: 100,\n  },\n});\n\nconst msg = "What\'s your favorite season of the year?";\nconst result = await chat.sendMessage(msg);\nconsole.log(result.response.text());\n',
                                },
                            ],
                        },
                        {
                            name: "Configuration",
                            path: "/v1beta/models/gemini-pro:generateContent",
                            pathParameters: {
                                model: "gemini-pro:generateContent",
                            },
                            queryParameters: {
                                key: "GOOGLE_API_KEY",
                            },
                            headers: {},
                            requestBody: {
                                contents: [
                                    {
                                        parts: [
                                            {
                                                text: "Write a story about a magic backpack.",
                                            },
                                        ],
                                    },
                                ],
                                safetySettings: [
                                    {
                                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                        threshold: "BLOCK_ONLY_HIGH",
                                    },
                                ],
                                generationConfig: {
                                    stopSequences: ["Title"],
                                    temperature: 1,
                                    maxOutputTokens: 800,
                                    topP: 0.8,
                                    topK: 10,
                                },
                            },
                            requestBodyV3: {
                                type: "json",
                                value: {
                                    contents: [
                                        {
                                            parts: [
                                                {
                                                    text: "Write a story about a magic backpack.",
                                                },
                                            ],
                                        },
                                    ],
                                    safetySettings: [
                                        {
                                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                            threshold: "BLOCK_ONLY_HIGH",
                                        },
                                    ],
                                    generationConfig: {
                                        stopSequences: ["Title"],
                                        temperature: 1,
                                        maxOutputTokens: 800,
                                        topP: 0.8,
                                        topK: 10,
                                    },
                                },
                            },
                            responseStatusCode: 200,
                            responseBody: {
                                candidates: [
                                    {
                                        content: {
                                            parts: [
                                                {
                                                    text: "In the bustling metropolis of Zenith City, nestled amidst towering skyscrapers and vibrant streets, there existed an extraordinary backpack. Its exterior was unassuming, crafted from rugged canvas in a muted shade of gray. However, within its seemingly ordinary confines lay a secret that would forever alter the life of its young owner, Anya.\n\nAnya, a curious and imaginative 12-year-old, stumbled upon the backpack in a dusty attic. As she reached out to touch it, a faint hum filled the air. The backpack's zipper quivered, as if beckoning her to explore its hidden depths.\n\nWith trembling hands, Anya unzipped the backpack and gasped in astonishment. Its interior was a kaleidoscope of vibrant colors and otherworldly wonders. Bookshelves lined the walls, filled with volumes that seemed to shimmer with knowledge. A bubbling cauldron emitted an ethereal glow, its contents swirling and changing like a miniature universe. And perched atop a miniature mountain was a tiny, mischievous gnome who greeted Anya with a mischievous grin.\n\n\"Welcome, traveler,\" the gnome said in a voice as soft as a summer breeze. \"This is the Backpack of Wonders, where imagination reigns supreme and dreams take flight.\"\n\nAnya's heart raced with excitement. She couldn't believe her luck. The backpack had the power to grant her every wish, no matter how wild or extraordinary. With newfound determination, she embarked on a series of adventures that would forever change her life.\n\nShe traveled through time, visiting ancient civilizations and witnessing firsthand the rise and fall of empires. She soared through the clouds on the back of a majestic eagle, feeling the wind caress her face as she explored the vast expanse of the sky. She even created her own fantastical worlds, filled with talking animals, magical creatures, and endless possibilities.\n\nBut with great power comes great responsibility. Anya soon realized that the Backpack of Wonders was not merely a tool for her own amusement. It had the potential to shape the world around her, for better or for worse.\n\nOne day, as she explored the future, Anya witnessed a devastating environmental disaster that threatened to destroy the planet. Horrified, she returned to the present and used the backpack's power to create a device that would purify the air and water.\n\nFrom that day forward, Anya understood that the Backpack of Wonders was more than just a magical artifact. It was a gift, an opportunity to make a difference in the world. She used its power wisely, spreading joy, fostering knowledge, and protecting the planet she loved.\n\nAnd so, the legend of the Backpack of Wonders was passed down through generations, inspiring countless others to believe in the boundless power of imagination and the importance of using their abilities for good.",
                                                },
                                            ],
                                            role: "model",
                                        },
                                        finishReason: "STOP",
                                        index: 0,
                                        safetyRatings: [
                                            {
                                                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                                probability: "NEGLIGIBLE",
                                            },
                                            {
                                                category: "HARM_CATEGORY_HATE_SPEECH",
                                                probability: "NEGLIGIBLE",
                                            },
                                            {
                                                category: "HARM_CATEGORY_HARASSMENT",
                                                probability: "NEGLIGIBLE",
                                            },
                                            {
                                                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                                probability: "NEGLIGIBLE",
                                            },
                                        ],
                                    },
                                ],
                                usageMetadata: {
                                    promptTokenCount: 8,
                                    candidatesTokenCount: 550,
                                    totalTokenCount: 558,
                                },
                            },
                            responseBodyV3: {
                                type: "json",
                                value: {
                                    candidates: [
                                        {
                                            content: {
                                                parts: [
                                                    {
                                                        text: "In the bustling metropolis of Zenith City, nestled amidst towering skyscrapers and vibrant streets, there existed an extraordinary backpack. Its exterior was unassuming, crafted from rugged canvas in a muted shade of gray. However, within its seemingly ordinary confines lay a secret that would forever alter the life of its young owner, Anya.\n\nAnya, a curious and imaginative 12-year-old, stumbled upon the backpack in a dusty attic. As she reached out to touch it, a faint hum filled the air. The backpack's zipper quivered, as if beckoning her to explore its hidden depths.\n\nWith trembling hands, Anya unzipped the backpack and gasped in astonishment. Its interior was a kaleidoscope of vibrant colors and otherworldly wonders. Bookshelves lined the walls, filled with volumes that seemed to shimmer with knowledge. A bubbling cauldron emitted an ethereal glow, its contents swirling and changing like a miniature universe. And perched atop a miniature mountain was a tiny, mischievous gnome who greeted Anya with a mischievous grin.\n\n\"Welcome, traveler,\" the gnome said in a voice as soft as a summer breeze. \"This is the Backpack of Wonders, where imagination reigns supreme and dreams take flight.\"\n\nAnya's heart raced with excitement. She couldn't believe her luck. The backpack had the power to grant her every wish, no matter how wild or extraordinary. With newfound determination, she embarked on a series of adventures that would forever change her life.\n\nShe traveled through time, visiting ancient civilizations and witnessing firsthand the rise and fall of empires. She soared through the clouds on the back of a majestic eagle, feeling the wind caress her face as she explored the vast expanse of the sky. She even created her own fantastical worlds, filled with talking animals, magical creatures, and endless possibilities.\n\nBut with great power comes great responsibility. Anya soon realized that the Backpack of Wonders was not merely a tool for her own amusement. It had the potential to shape the world around her, for better or for worse.\n\nOne day, as she explored the future, Anya witnessed a devastating environmental disaster that threatened to destroy the planet. Horrified, she returned to the present and used the backpack's power to create a device that would purify the air and water.\n\nFrom that day forward, Anya understood that the Backpack of Wonders was more than just a magical artifact. It was a gift, an opportunity to make a difference in the world. She used its power wisely, spreading joy, fostering knowledge, and protecting the planet she loved.\n\nAnd so, the legend of the Backpack of Wonders was passed down through generations, inspiring countless others to believe in the boundless power of imagination and the importance of using their abilities for good.",
                                                    },
                                                ],
                                                role: "model",
                                            },
                                            finishReason: "STOP",
                                            index: 0,
                                            safetyRatings: [
                                                {
                                                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                                    probability: "NEGLIGIBLE",
                                                },
                                                {
                                                    category: "HARM_CATEGORY_HATE_SPEECH",
                                                    probability: "NEGLIGIBLE",
                                                },
                                                {
                                                    category: "HARM_CATEGORY_HARASSMENT",
                                                    probability: "NEGLIGIBLE",
                                                },
                                                {
                                                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                                    probability: "NEGLIGIBLE",
                                                },
                                            ],
                                        },
                                    ],
                                    usageMetadata: {
                                        promptTokenCount: 8,
                                        candidatesTokenCount: 550,
                                        totalTokenCount: 558,
                                    },
                                },
                            },
                            codeSamples: [
                                {
                                    language: "python",
                                    code: 'import typing_extensions as typing\n\nclass Recipe(typing.TypedDict):\n  recipe_name: str\n\nmodel = genai.GenerativeModel(model_name="models/gemini-1.5-pro")\n\nresult = model.generate_content(\n  "List 5 popular cookie recipes",\n  generation_config=genai.GenerationConfig(response_mime_type="application/json",\n                                          response_schema = list[Recipe]))\n\nprint(result.text)\n',
                                },
                            ],
                        },
                    ],
                },
            ],
            webhooks: [],
            websockets: [],
            types: [
                "type_v1Beta/models:Content",
                "type_v1Beta/models:Tool",
                "type_v1Beta/models:ToolConfig",
                "type_v1Beta/models:FunctionCallingConfig",
                "type_v1Beta/models:Mode",
                "type_v1Beta/models:GenerationConfig",
                "type_v1Beta/models:FunctionDeclaration",
                "type_v1Beta/models:Schema",
                "type_v1Beta/models:Type",
                "type_v1Beta/models:Role",
                "type_v1Beta/models:Part",
                "type_v1Beta/models:Text",
                "type_v1Beta/models:InlineData",
                "type_v1Beta/models:Blob",
                "type_v1Beta/models:FunctionCall",
                "type_v1Beta/models:PredictedFunctionCall",
                "type_v1Beta/models:FunctionResponse",
                "type_v1Beta/models:FunctionResponseProperties",
                "type_v1Beta/models:FileData",
                "type_v1Beta/models:FileDataProperties",
                "type_v1Beta/models:AnswerStyle",
                "type_v1Beta/models:SemanticRetrieverConfig",
                "type_v1Beta/models:SafetySettings",
                "type_v1Beta/models:HarmCategory",
                "type_v1Beta/models:HarmBlockThreshold",
                "type_v1Beta/models:GroundingPassage",
                "type_v1Beta/models:GenerateContentResponse",
                "type_v1Beta/models:Candidate",
                "type_v1Beta/models:PromptFeedback",
                "type_v1Beta/models:BlockReason",
                "type_v1Beta/models:UsageMetadata",
                "type_v1Beta/models:SafetyRating",
                "type_v1Beta/models:CitationMetadata",
                "type_v1Beta/models:CitationSource",
                "type_v1Beta/models:HarmProbability",
                "type_v1Beta/models:FinishReason",
                "type_v1Beta/models:GroundingAttribution",
                "type_v1Beta/models:AttributionSourceId",
                "type_v1Beta/models:GroundingPassageId",
                "type_v1Beta/models:GroundingPassageIdProperties",
                "type_v1Beta/models:SemanticRetrieverChunk",
                "type_v1Beta/models:SemanticRetrieverChunkProperties",
            ],
            subpackages: [],
        },
    },
    rootPackage: {
        endpoints: [],
        webhooks: [],
        websockets: [],
        types: [],
        subpackages: ["subpackage_v1Beta"],
    },
    snippetsConfiguration: {},
    globalHeaders: [],
};

const mockHolder = new SDKSnippetHolder({
    snippetsBySdkId: {},
    snippetsConfigWithSdkId: {},
    snippetTemplatesByEndpoint: {},
    snippetsBySdkIdAndEndpointId: {},
    snippetTemplatesByEndpointId: {},
});

export const fdr = convertDbAPIDefinitionToRead(convertAPIDefinitionToDb(fdrWrite, "fdr", mockHolder));

export const root = ApiReferenceNavigationConverter.convert(
    {
        title: "API Reference",
        api: "api-reference",
        skipUrlSlug: true,
        showErrors: false,
        urlSlug: "api-reference",
    },
    fdr,
    "",
    "",
);

export const holder = ApiDefinitionHolder.create(fdr);