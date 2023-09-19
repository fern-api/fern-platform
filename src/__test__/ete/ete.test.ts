import axios from "axios";

const PORT = 8080;

it("definition register", async () => {
    // register empty definition
    const healthResponse = await axios.get(`http://localhost:${PORT}/health`);
    expect(healthResponse.status).toEqual(200);
});
