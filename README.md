# 🚀 Aether AI - Multi-Agent Web Architect

Welcome to **Aether AI**, a state-of-the-art Multi-Agent Fullstack Developer system. This application leverages the power of Large Language Models (LLMs) via **LangGraph** to dynamically architect, design, and code user interface components based exclusively on your simple natural language prompts!

![Project Banner](https://img.shields.io/badge/Status-Active-success.svg) ![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js) ![LangChain](https://img.shields.io/badge/LangGraph-Powered-blue)

---

## ✨ Features

- **🧠 Multi-Agent Architecture**: Uses `LangGraph` to sequentially orchestrate specialized AI personas (Architect -> Frontend Developer -> Backend Designer).
- **⚡ Real-Time Streaming**: Live Server-Sent Events (SSE) seamlessly connect backend Agent executions directly to a glowing, glassmorphic UI terminal.
- **💻 Dynamic Code Generation**: Instead of rigid templates, the embedded `gpt-4o-mini` Engine writes uniquely customized Raw React Code every single time.
- **🎨 Premium UI/UX**: Overhauled with ultra-modern glassmorphism, dynamic gradients, Tailwind CSS enhancements, and Framer Motion micro-animations.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, Server-Sent Events)
- **Styling**: Tailwind CSS & Framer Motion
- **AI Core**: LangChain Core, LangGraph, and OpenAI (`gpt-4o-mini`)
- **Language**: TypeScript

---

## 🚀 Getting Started

Follow these instructions to spin up the Multi-Agent prototype on your local machine.

### 1. Requirements

- Node.js (v18 or higher recommended)
- An active `OPENAI_API_KEY` for LLM integrations.

### 2. Installation

Clone the repository and install the NPM packages:

```bash
git clone https://github.com/MADHANRAJ24/AI-fullstack-devoloper.git
cd "AI-fullstack-devoloper"
npm install
```

### 3. Environment Variables

Create a new file called `.env.local` in the project root directory and drop in your secret OpenAI key:

```env
OPENAI_API_KEY=sk-proj-...
```

### 4. Start the Dev Server

Once variables are loaded, start up the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You're ready to engineer apps entirely by text!

---

## 🔮 Future Road Map

- [ ] Connect the dynamic frontend code generation to an active sandbox (like Sandpack) to live-render the AI-authored HTML/React.
- [ ] Incorporate custom API route execution for backend Agent integration.
- [ ] Memory persistence across LLM generations.

---

*Bootstrapped with `create-next-app` under the hood! Feedback and contributions are welcome.*
