export const PYTHON_CODE_SNIPPET_1 = `import os
import openai
openai.api_key = os.getenv("OPENAI_API_KEY")

completion = openai.ChatCompletion.create(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "system", "content": "You are a poetic assistant, skilled in explaining complex programming concepts with creative flair."},
    {"role": "user", "content": "Compose a poem that explains the concept of recursion in programming."}
  ]
)

print(completion.choices[0].message)`;

export const JS_CODE_SNIPPET_1 = `import { MercoaClient } from "@mercoa/javascript"

const mercoa = new MercoaClient({
  token: process.env.MERCOA_API_KEY,
})

app.get('/generateMercoaToken', async (req, res) => {
  // ...
  // Authenticate your user using your existing auth system
  // ...
  const user = ... // This is the user returned from your database
  const entities = await mercoa.entity.find({ foreignId }) // Find existing Mercoa Entity
  const token = await mercoa.entity.getToken(entities[0].id, // Generate a token for the user
  {
    // Optional iFrame Options
    // See: https://mercoa.com/dashboard/developers#iframe
    pages: {
      paymentMethods: true
    }
  })
  res.send(token);
})`;
