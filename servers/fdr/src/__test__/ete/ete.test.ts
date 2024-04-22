import axios from "axios";

const PORT = 8080;

// We don't spin up the server in this test.
it("check health", async () => {
    // register empty definition
    const healthResponse = await axios.get(`http://localhost:${PORT}/health`);
    expect(healthResponse.status).toEqual(200);
});
