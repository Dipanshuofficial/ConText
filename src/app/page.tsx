import { ContextualChatPopup } from "@/components/contextual-chat-popup";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-6 md:p-12">
      <div className="z-10 w-full max-w-4xl text-center font-sans">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-6">
          Welcome to Our AI-Powered Contextual Chat
        </h1>
        <p className="text-base md:text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          Engage with our intelligent chatbot that understands this page’s context, powered by advanced AI. Ask about the content below or explore general knowledge questions!
        </p>

        <div className="space-y-8 text-left max-w-3xl mx-auto">
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Why Our Chatbot Stands Out</h2>
            <p className="text-gray-600 mb-4">
              Our chatbot leverages a GenAI model with simulated web crawling to provide context-aware responses based on this page.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Interactive floating chat popup in the bottom-right corner.</li>
              <li>Toggle between compact and full-screen modes.</li>
              <li>Seamlessly integrates page content for relevant answers.</li>
              <li>Powered by a large language model for intelligent responses.</li>
              <li>Smartly decides when to use page context or general knowledge.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Try These Questions</h2>
            <p className="text-gray-600 mb-4">Get started with these sample prompts:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>“What’s this page about?”</li>
              <li>“List the chatbot’s key features.”</li>
              <li>“What’s the capital of Japan?”</li>
              <li>“Does this page mention Node.js?”</li>
            </ul>
          </section>

          <section>
            <p className="text-gray-600">
              Curious about more? Check out{" "}
              <a href="https://en.wikipedia.org/wiki/Artificial_intelligence" className="text-blue-600 hover:underline">
                AI advancements on Wikipedia
              </a>.
            </p>
          </section>
        </div>

        <ContextualChatPopup />
      </div>
    </main>
  );
}