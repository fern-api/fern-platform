export const SPECIAL_TOKENS = [
    // privacy
    "PII",
    "PHI",
    "PCI",
    "GDPR",
    "CCPA",
    "HIPAA",
    "COPPA",
    "FERPA",
    "GLBA",
    "SOX",
    "FISMA",
    "NIST",
    "CIS",
    "ISO",
    "IEC",
    "ITAR",
    "EAR",
    "CMMC",
    "CUI",
    "CDI",
    "FTC",
    "FCC",
    "SEC",
    "FINRA",

    // security
    "XSS",
    "CSRF",
    "SSRF",
    "XSRF",
    "TLS",
    "SSL",
    "SSH",
    "API",
    "OAuth",
    "OAuth1",
    "OAuth1.0",
    "OAuth2",
    "OAuth2.0",
    "SAML",
    "OpenID",
    "OpenID Connect",
    "CAPTCHA",
    "reCAPTCHA",
    "2FA",
    "MFA",
    "OTP",
    "TOTP",
    "HOTP",
    "U2F",
    "FIDO",
    "FIDO2",
    "PKI",
    "HMAC",
    "AES",
    "RSA",
    "SHA",
    "MD5",
    "BCrypt",
    "PBKDF2",
    "Argon2",
    "SCrypt",
    "JWT",
    "JWE",
    "JWS",
    "JWK",
    "JWA",
    "JOSE",

    // shopping
    "SKU",
    "SKUs",
    "UPC",
    "EAN",
    "ISBN",
    "ASIN",
    "MPN",
    "MSRP",
    "MAP",
    "RRP",
    "MSRP",

    // time
    "AM",
    "PM",
    "UTC",
    "GMT",
    "PST",
    "PDT",
    "EST",
    "EDT",
    "CST",
    "CDT",
    "MST",
    "MDT",

    // geography
    "USA",
    "UK",
    "EU",
    "UAE",
    "APAC",
    "EMEA",
    "LATAM",
    "ANZ",
    "SEA",
    "MEA",
    "MENA",
    "NATO",
    "NA",
    "SA",
    "CA",
    "EU",
    "AU",
    "NZ",
    "JP",
    "KR",
    "CN",
    "HK",
    "TW",
    "SG",
    "MY",
    "TH",
    "ID",
    "PH",
    "VN",
    "IN",
    "PK",
    "BD",
    "LK",
    "NP",
    "MM",
    "KH",
    "LA",
    "MM",
    "BT",
    "MV",

    // finance
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CNY",
    "RUB",
    "INR",
    "AUD",
    "CAD",
    "CHF",
    "SGD",
    "MYR",
    "THB",
    "IDR",
    "KRW",
    "PHP",
    "VND",
    "HKD",
    "TWD",
    "MXN",
    "BRL",
    "ARS",
    "CLP",
    "COP",
    "PEN",
    "ZAR",
    "NGN",
    "EGP",
    "AED",
    "SAR",
    "ILS",
    "TRY",
    "SEK",
    "NOK",
    "DKK",
    "ISK",
    "HUF",
    "PLN",
    "CZK",
    "RON",
    "BGN",

    // programming
    "API",
    "APIs",
    "SDK",
    "SDKs",
    "AI",
    "OCR",
    "REST",
    "SOAP",
    "JSON",
    "XML",
    "HTTP",
    "HTTPS",
    "URI",
    "URL",
    "CRUD",
    "RESTful",
    "KYB",
    "KYC",
    "AML",
    "HTML",
    "CSS",
    "JS",
    "SQL",
    "DB",
    "UI",
    "UX",
    "SaaS",
    "PaaS",
    "IaaS",
    "IP",
    "TCP",
    "UDP",
    "DNS",
    "FTP",
    "SMTP",
    "IMAP",
    "POP3",
    "CSV",
    "MVC",
    "MVP",
    "MVVM",
    "DOM",
    "SPA",
    "SSR",
    "CSR",
    "DDoS",
    "CDN",
    "IoT",
    "ML",
    "DL",
    "NLP",
    "CLI",
    "GUI",
    "BI",
    "ETL",
    "RDBMS",
    "NoSQL",
    "IDE",
    "CMS",
    "CCPA",
    "POSIX",
    "ABI",
    "API",
    "AST",
    "COBOL",
    "DDL",
    "DML",

    // AI-related
    "NN", // Neural Network
    "CNN", // Convolutional Neural Network
    "RNN", // Recurrent Neural Network
    "LSTM", // Long Short Term Memory
    "GRU", // Gated Recurrent Unit
    "ANN", // Artificial Neural Network
    "GAN", // Generative Adversarial Network
    "RL", // Reinforcement Learning
    "DL", // Deep Learning
    "ML", // Machine Learning
    "NLP", // Natural Language Processing
    "NLG", // Natural Language Generation
    "NLU", // Natural Language Understanding
    "BERT", // Bidirectional Encoder Representations from Transformers
    "GPT", // Generative Pre-training Transformer
    "SVM", // Support Vector Machine
    "PCA", // Principal Component Analysis
    "AI", // Artificial Intelligence
    "CV", // Computer Vision
    "TF", // TensorFlow
    "TTS", // Text-to-Speech
    "ASR", // Automatic Speech Recognition
    "HMM", // Hidden Markov Model
    "DNN", // Deep Neural Network
    "MLP", // Multi-Layer Perceptron
    "RBM", // Restricted Boltzmann Machine
    "CRF", // Conditional Random Field

    // Media
    "PDF",
    "PDFs",
    "RTF",
    "TXT",
    "XLS",
    "XLSX",
    "PPT",

    // Image
    "JPG",
    "JPEG",
    "PNG",
    "GIF",
    "GIFs",
    "SVG",
    "TIFF",
    "BMP",
    "ICO",
    "PSD",
    "WebP",
    "AVIF",
    "HEIF",
    "HEIC",
    "EPS",

    // Audio
    "MP3",
    "WAV",
    "AIFF",
    "FLAC",
    "WMA",
    "AAC",
    "OGG",

    // Video
    "AVI",
    "WMV",
    "MOV",
    "M4V",
    "MP4",
    "MPG",
    "MPEG",
    "FLV",
    "SWF",
    "MKV",
    "WebM",

    // Cloud Computing
    "GCP", // Google Cloud Platform
    "AWS", // Amazon Web Services
    "VM", // Virtual Machines
    "VPC", // Virtual Private Cloud
    "S3", // AWS Simple Storage Service
    "EC2", // AWS Elastic Compute Cloud

    // Data Storage and Databases
    "DynamoDB",
    "CosmosDB",
    "BigQuery",
    "CI/CD",

    // Security and Compliance
    "SOC1", // Service Organization Control 1
    "SOC2", // Service Organization Control 2
    "SOC3", // Service Organization Control 3
    "PCI DSS", // Payment Card Industry Data Security Standard
    "WAF", // Web Application Firewall
    "IAM", // Identity and Access Management

    // Networking
    "SDN", // Software-Defined Networking
    "MPLS", // Multi-Protocol Label Switching
    "BGP", // Border Gateway Protocol

    // Frameworks and Libraries
    "Vue.js",
    "Node.js",
    ".NET",
];
