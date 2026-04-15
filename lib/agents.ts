import { StateGraph, Annotation, MessagesAnnotation, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, SystemMessage, HumanMessage } from "@langchain/core/messages";

// Define the state for the multi-agent graph
export const AppState = Annotation.Root({
  ...MessagesAnnotation.spec,
  architect_plan: Annotation<string>({
    reducer: (s, v) => v ?? s,
    default: () => ""
  }),
  frontend_code: Annotation<string>({
    reducer: (s, v) => v ?? s,
    default: () => ""
  }),
  backend_logic: Annotation<string>({
    reducer: (s, v) => v ?? s,
    default: () => ""
  }),
  generation_status: Annotation<"idle" | "planning" | "coding" | "testing" | "done">({
    reducer: (s, v) => v ?? s,
    default: () => "idle"
  })
});

// Helper for grabbing the LLM
const getModel = () => new ChatOpenAI({ temperature: 0.1, modelName: "gpt-4o-mini" });

// Architect Agent Node
export const architectNode = async (state: typeof AppState.State) => {
  console.log("--- ARCHITECT ---");
  const lastMessage = state.messages[state.messages.length - 1];
  const model = getModel();
  
  const response = await model.invoke([
    new SystemMessage("You are an expert software architect. Look at the user's request and summarize the core structural components and state needed for a simple minimalist prototype. Keep it brief."),
    lastMessage
  ]);
  
  return {
    architect_plan: response.content as string,
    generation_status: "planning" as const,
    messages: [new AIMessage("Architect analyzed requirements and generated structural blueprint.")]
  };
};

// Frontend Agent Node
export const frontendNode = async (state: typeof AppState.State) => {
  console.log("--- FRONTEND ---");
  const model = getModel();
  
  const response = await model.invoke([
    new SystemMessage(`You are an expert React developer building a sleek, modern UI. 
Based on the provided architectural plan, write a functional, self-contained React component.
RULES:
1. Output ONLY RAW REACT CODE.
2. DO NOT wrap with \`\`\`tsx  or \`\`\`react or any markdown blocks.
3. The component MUST be exported as 'export default function App() { ... }'.
4. Do NOT use external imports other than 'react', 'lucide-react', or 'framer-motion' if needed. Feel free to use Tailwind classes for styling. \n`),
    new HumanMessage(`Plan details: ${state.architect_plan}\n\nUser request: ${state.messages[state.messages.length - 1].content}`)
  ]);

  let code = response.content as string;
  // Cleanup accidental markdown logic
  code = code.replace(/```(?:tsx?|jsx?|react)?/gi, '').replace(/```/g, '').trim();

  return {
    frontend_code: code,
    generation_status: "coding" as const,
    messages: [new AIMessage("Frontend generated stunning React components from blueprint.")]
  };
};

// Backend Agent Node
export const backendNode = async (state: typeof AppState.State) => {
  console.log("--- BACKEND ---");
  return {
    backend_logic: "Simulated Backend logic.",
    generation_status: "testing" as const,
    messages: [new AIMessage("Backend node configured logic interfaces and simulated API integration.")]
  };
};

// Create the Graph
const workflow = new StateGraph(AppState)
  .addNode("architect", architectNode)
  .addNode("frontend", frontendNode)
  .addNode("backend", backendNode)
  .addEdge("__start__", "architect")
  .addEdge("architect", "frontend")
  .addEdge("frontend", "backend")
  .addEdge("backend", END);

export const appGraph = workflow.compile();
