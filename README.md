# 🚀 How to Use the Contextual Chat Popup on Your Website

This project provides a **plug-and-play contextual chat popup** that you can easily integrate into any React (Next.js) website. The popup uses a backend AI flow and a simulated web crawler to answer questions based on the current page’s content.

## 🧩 Main Parts

- **Chat Popup UI:** The floating chat box you see in the bottom-right corner.
- **Backend AI Flow:** Handles questions, context, and AI responses.
- **Web Crawler:** Simulates crawling the current page for context.

---

## 1. Install the Chatbot

Clone or copy the contextual-chat-popup.tsx and its dependencies into your project.  
You’ll also need the use-chat.ts hook and the backend flow in answer-question-with-context.ts.

**Required files:**

- contextual-chat-popup.tsx
- use-chat.ts
- answer-question-with-context.ts
- web-crawler.ts
- UI dependencies from ui
- Utility: utils.ts

> **Tip:** The popup is designed to be modular and easy to drop into any React app.

---

## 2. Add the Popup to Your Page

Import and use the popup in your main layout or any page:

```tsx
// Example: pages/_app.tsx or src/app/page.tsx
import { ContextualChatPopup } from "@/components/contextual-chat-popup";

export default function App() {
  return (
    <>
      {/* ...your app content... */}
      <ContextualChatPopup />
    </>
  );
}
```

---

## 3. Backend Setup

- The popup relies on the backend AI flow (answer-question-with-context.ts) and a web crawler service.
- Make sure your backend can run the Genkit flow and has access to the Google Generative AI API key.
- Set your API key in `.env.local`:
  ```
  GOOGLE_GENAI_API_KEY=YOUR_API_KEY_HERE
  ```

---

## 4. Customization

- **Theme:** Change colors in globals.css using CSS variables.
- **Behavior:** Edit use-chat.ts to change chat logic.
- **AI Flow:** Adjust prompts or crawling logic in answer-question-with-context.ts.

---

## 5. Run the Project

Install dependencies and start the dev server:

```sh
npm install
npm run dev
```

---

## 6. Deploy

Deploy your app as you would any Next.js project.  
Make sure your backend endpoints are accessible from your deployed site.

---

## 📝 Notes

- The web crawler is simulated by default. For real crawling, update web-crawler.ts.
- The popup is fully responsive, accessible, and customizable.
- You can use the popup in any React/Next.js project with minimal changes.
