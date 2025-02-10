import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  try {
    // Parse the request body
    const body = JSON.parse(req.body);
    const { videoDescription, question, chatHistory = [] } = body;

    if (!videoDescription || !question) {
      throw new Error("Missing required parameters: videoDescription or question");
    }

    // Initialize the chat model
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini", //don't change this, until we implement whisper voice to text
      temperature: 0.7,
    });

    // Create the prompt template
    const promptTemplate = PromptTemplate.fromTemplate(`
      You are a helpful AI assistant that answers questions about videos based on their descriptions.
      Use the video description as context to answer the user's question.
      If you cannot answer the question based on the description, say so.
      
      Video Description: {videoDescription}
      
      Chat History:
      {chatHistory}
      
      Current Question: {question}
      
      Answer:`);

    // Create the chain
    const chain = RunnableSequence.from([
      promptTemplate,
      model,
      new StringOutputParser(),
    ]);

    // Format chat history
    const formattedChatHistory = chatHistory
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    // Run the chain
    const response = await chain.invoke({
      videoDescription,
      question,
      chatHistory: formattedChatHistory,
    });

    // Return the response
    return res.json({
      answer: response,
      success: true,
    });

  } catch (err) {
    error(err.message);
    return res.json({
      success: false,
      error: err.message,
    }, 500);
  }
};
