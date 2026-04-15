import { StateGraph, Annotation, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

// Define the state for the micro-learning graph
export const AppState = Annotation.Root({
  word_data: Annotation<{ word: string; meaning: string; example: string } | null>({
    reducer: (s, v) => v ?? s,
    default: () => null
  }),
  business_idea: Annotation<string>({
    reducer: (s, v) => v ?? s,
    default: () => ""
  }),
  daily_fact: Annotation<string>({
    reducer: (s, v) => v ?? s,
    default: () => ""
  })
});

// Helper for grabbing the LLM
// Using gpt-4o-mini for fast, consistent generation overhead
const getModel = () => new ChatOpenAI({ temperature: 0.7, modelName: "gpt-4o-mini" });

// Word Node
export const wordNode = async (state: typeof AppState.State) => {
  const model = getModel();
  
  const response = await model.invoke([
    new SystemMessage("You are an English vocabulary teacher. Return a JSON object with a highly useful, slightly advanced english word. Keys must be strictly: 'word', 'meaning' (short sentence), 'example' (short practical sentence)."),
    new HumanMessage("Generate today's word. Output ONLY RAW JSON.")
  ]);
  
  let jsonStr = (response.content as string).replace(/```json/gi, '').replace(/```/g, '').trim();
  let word_data = null;
  try {
    word_data = JSON.parse(jsonStr);
  } catch(e) {
    word_data = { word: "Serendipity", meaning: "Finding something good without looking for it.", example: "Meeting my future partner on a delayed train was pure serendipity." };
  }

  return { word_data };
};

// Idea Node
export const ideaNode = async (state: typeof AppState.State) => {
  const model = getModel();
  
  const response = await model.invoke([
    new SystemMessage("You are a pragmatic entrepreneur. Provide a unique, ultra-short actionable business or side-hustle idea. Maximum 2 sentences. Keep it extremely modern (e.g. AI, automation, niche services)."),
    new HumanMessage("Generate today's business idea.")
  ]);

  return { business_idea: response.content as string };
};

// Fact Node
export const factNode = async (state: typeof AppState.State) => {
  const model = getModel();
  
  const response = await model.invoke([
    new SystemMessage("You are a curator of mind-blowing obscure facts. Provide ONE short, fascinating fact. Maximum 2 sentences. Don't use introductory phrases like 'Here is a fact', just state the fact."),
    new HumanMessage("Generate today's fact.")
  ]);

  return { daily_fact: response.content as string };
};

// Create the Graph
const workflow = new StateGraph(AppState)
  .addNode("word", wordNode)
  .addNode("idea", ideaNode)
  .addNode("fact", factNode)
  .addEdge("__start__", "word")
  .addEdge("word", "idea")
  .addEdge("idea", "fact")
  .addEdge("fact", END);

export const appGraph = workflow.compile();
