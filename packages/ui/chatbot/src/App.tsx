import "./App.scss";
import { ChatbotModal } from "./components/ChatbotModal";

function App() {
    return (
        <div className="max-w-[40rem] w-screen dark max-h-screen flex">
            <ChatbotModal
                chatStream={async () => [undefined, new AbortController()]}
                className="bg-grayscale-2 rounded-lg w-full text-black dark:text-white"
            />
        </div>
    );
}

export default App;
