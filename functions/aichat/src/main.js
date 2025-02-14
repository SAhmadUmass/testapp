import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  try {
    // Parse the request body and log raw input
    const rawBody = req.body;
    console.log('Raw request body:', rawBody);
    
    const body = JSON.parse(rawBody);
    console.log('Parsed request body:', body);

    const { videoDescription, question, chatHistory = [], additionalContext = "" } = body;
    
    // Log extracted values
    console.log('Extracted values:', {
      additionalContext: additionalContext || 'NOT PROVIDED',
      questionLength: question?.length || 0,
      videoDescriptionLength: videoDescription?.length || 0,
      chatHistoryLength: chatHistory?.length || 0
    });

    if (!videoDescription || !question) {
      throw new Error("Missing required parameters: videoDescription or question");
    }

    // Initialize the chat model
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini", //don't change this, until we implement whisper voice to text
      temperature: 0.7,
    });

    // Create the prompt template with enhanced instructions for additional context
    const promptTemplate = PromptTemplate.fromTemplate(`
      You are a helpful AI assistant that answers questions about videos and takes into account any additional context provided about the user.
      
      Important Instructions:
      1. First, check if the question can be answered using the additional context about the user
      2. Then, consider the video description for recipe-related information
      3. Combine both sources of information when relevant
      4. If you find relevant information in the additional context, explicitly mention it in your response
      
      Video Description: {videoDescription}
      User Context: {additionalContext}
      
      Chat History:
      {chatHistory}
      
      Current Question: {question}
      
      Answer:`);

    // Log the template structure
    console.log('Prompt template structure:', promptTemplate.template);

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

    // Prepare the final payload for the chain
    const chainPayload = {
      videoDescription,
      question,
      chatHistory: formattedChatHistory,
      additionalContext,
    };

    // Log the complete chain payload
    console.log('Complete chain payload:', {
      ...chainPayload,
      videoDescriptionPreview: videoDescription.substring(0, 100) + '...',
      chatHistoryLength: chatHistory.length,
      additionalContextActual: additionalContext, // Log the actual value
    });

    // Format and log the complete prompt that will be sent to the AI
    const formattedPrompt = await promptTemplate.format(chainPayload);
    console.log('Formatted prompt to be sent to AI:', formattedPrompt);

    // Run the chain with additional context
    const response = await chain.invoke(chainPayload);

    // Log the AI's response
    console.log('AI Response:', response);

    // Return the response
    return res.json({
      answer: response,
      success: true,
    });

  } catch (err) {
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      body: req.body
    });
    error(err.message);
    return res.json({
      success: false,
      error: err.message,
    }, 500);
  }
};
