import { appGraph } from "@/lib/agents";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const encoder = new TextEncoder();
    
    // We create a standard readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Initialize the LangGraph (no initial messages needed)
          const events = await appGraph.stream({});

          // Process the graph nodes asynchronously
          for await (const event of events) {
            // event represents the state updates yielded by each node.
            const nodeName = Object.keys(event)[0];
            const payload = (event as any)[nodeName];
            
            const data = JSON.stringify({ node: nodeName, payload });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        } catch (e) {
          console.error("LangGraph error:", e);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(e) })}\n\n`));
        } finally {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
  }
}
