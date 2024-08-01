import "./App.css";
import { ChatbotModal } from "./components/ChatbotModal";
import { ChatbotMessage } from "./types";

function App() {
    const handleChatStream = async () => {
        const abort = new AbortController();
        const stream = new ReadableStream<ChatbotMessage>({
            async start(controller) {
                await new Promise((resolve) => setTimeout(resolve, 3000));

                controller.enqueue({ role: "AI", message: "Hello! ", citations: [] });
                await new Promise((resolve) => setTimeout(resolve, 100));
                if (abort.signal.aborted) {
                    return controller.close();
                }
                controller.enqueue({ role: "AI", message: "Hello! How ", citations: [] });
                await new Promise((resolve) => setTimeout(resolve, 100));
                if (abort.signal.aborted) {
                    return controller.close();
                }
                controller.enqueue({ role: "AI", message: "Hello! How can ", citations: [] });
                await new Promise((resolve) => setTimeout(resolve, 100));
                if (abort.signal.aborted) {
                    return controller.close();
                }
                controller.enqueue({ role: "AI", message: "Hello! How can I ", citations: [] });
                await new Promise((resolve) => setTimeout(resolve, 100));
                if (abort.signal.aborted) {
                    return controller.close();
                }
                controller.enqueue({ role: "AI", message: "Hello! How can I help ", citations: [] });
                await new Promise((resolve) => setTimeout(resolve, 100));
                if (abort.signal.aborted) {
                    return controller.close();
                }
                controller.enqueue({ role: "AI", message: "Hello! How can I help you?", citations: [] });
                await new Promise((resolve) => setTimeout(resolve, 100));
                if (abort.signal.aborted) {
                    return controller.close();
                }
                controller.enqueue({
                    role: "AI",
                    message: "Hello! How can I help you?",
                    citations: [
                        {
                            start: 0,
                            end: 0,
                            documents: [{ title: "Cohere", url: "https://cohere.ai" }],
                        },
                    ],
                });
                controller.close();
            },
        });
        return [stream, abort] as const;
    };
    return (
        <div className="max-w-[40rem] w-screen dark max-h-screen flex">
            <ChatbotModal
                chatStream={handleChatStream}
                className="bg-grayscale-2 rounded-lg w-full text-black dark:text-white"
            />
        </div>
    );
}

export default App;
