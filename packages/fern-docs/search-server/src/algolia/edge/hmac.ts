export async function generateHmacAndEncode(
  parentApiKey: string,
  queryParameters: string
): Promise<string> {
  // Convert the key and data to Uint8Array
  const encoder = new TextEncoder();
  const keyData = encoder.encode(parentApiKey);
  const data = encoder.encode(queryParameters);
  // Import the key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Sign the data
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);

  // Convert the signature to a hexadecimal string
  const hexSignature = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Concatenate the hex signature with the query parameters
  const combined = hexSignature + queryParameters;

  // Convert the result to a Uint8Array
  const combinedData = encoder.encode(combined);

  // Encode the result to base64
  const base64String = btoa(String.fromCharCode(...combinedData));

  return base64String;
}
