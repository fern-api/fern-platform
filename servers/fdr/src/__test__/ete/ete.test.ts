/* eslint-disable vitest/expect-expect */

const PORT = 8080;

it("check health", async () => {
  // register empty definition

  for (let i = 0; i < 10; ++i) {
    await sleep(20_000);
    try {
      const response = await fetch(`http://localhost:${PORT}/health`);
      if (response.status === 200) {
        return;
      } else {
        console.log(`Received status ${response.status}`);
      }
    } catch (err) {
      console.log(err);
    }
  }
  throw new Error("Failed to make successfull request");
}, 100_000);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
