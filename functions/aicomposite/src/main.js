import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import OpenAI from 'openai';
import { writeFile, unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Constants from whispertranscribe
const SUPPORTED_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

// Error types for better error handling
const ErrorTypes = {
  TRANSCRIPTION: 'transcription_error',
  AI_CHAT: 'ai_chat_error',
  VALIDATION: 'validation_error',
  NETWORK: 'network_error'
};

// Helper function for transcription (from whispertranscribe)
async function handleTranscription({ audioData, fileName, mimeType, log, error }) {
  let tempPath = null;
  
  try {
    // Input validation
    if (!audioData || !fileName || !mimeType) {
      throw { type: ErrorTypes.VALIDATION, message: "Missing required audio fields" };
    }

    // Create temporary file
    tempPath = join(tmpdir(), `whisper_${Date.now()}_${fileName}`);
    const buffer = Buffer.from(audioData, 'base64');
    
    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      throw { type: ErrorTypes.VALIDATION, message: "File too large (max 25MB)" };
    }

    // Validate format
    const fileExtension = fileName.split('.').pop().toLowerCase();
    if (!SUPPORTED_FORMATS.includes(fileExtension)) {
      throw { type: ErrorTypes.VALIDATION, message: `Unsupported format. Supported: ${SUPPORTED_FORMATS.join(', ')}` };
    }

    // Save and process file
    await writeFile(tempPath, buffer);
    log('Audio file saved:', tempPath);

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Transcribe
    let fileStream;
    try {
      fileStream = createReadStream(tempPath);
    } catch (err) {
      throw { type: ErrorTypes.TRANSCRIPTION, message: "Failed to read audio file" };
    }

    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      response_format: 'json'
    });

    if (!transcription.text || transcription.text.trim() === '') {
      throw { type: ErrorTypes.TRANSCRIPTION, message: "No speech detected or audio unclear" };
    }

    return transcription;

  } catch (err) {
    error('Transcription error:', err);
    throw { type: ErrorTypes.TRANSCRIPTION, message: err.message };
  } finally {
    // Cleanup
    if (tempPath) {
      try {
        await unlink(tempPath);
        log('Temporary file cleaned up:', tempPath);
      } catch (cleanupErr) {
        error('Cleanup error:', cleanupErr);
      }
    }
  }
}

// Helper function for AI chat (from aichat)
async function handleAIChat({ videoDescription, question, chatHistory = [], additionalContext = "", log }) {
  try {
    // Initialize chat model
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.7,
    });

    // Create prompt template
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
      additionalContext,
    });

    return response;

  } catch (err) {
    throw { type: ErrorTypes.AI_CHAT, message: err.message };
  }
}

// Main composite function
export default async ({ req, res, log, error }) => {
  try {
    // Log request details
    log('Request method:', req.method);
    log('Request path:', req.path);

    // Handle ping route
    if (req.path === "/ping") {
      return res.text("Pong");
    }

    // Parse request body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // Extract all possible fields
    const {
      videoDescription,
      question,
      chatHistory = [],
      additionalContext = "",
      audioData,
      fileName,
      mimeType
    } = body;

    // Log request info
    log('Processing request:', {
      hasAudio: !!audioData,
      questionLength: question?.length,
      videoDescriptionLength: videoDescription?.length,
      timestamp: new Date().toISOString()
    });

    // Handle audio transcription if provided
    let finalQuestion = question;
    if (audioData && fileName && mimeType) {
      const transcription = await handleTranscription({
        audioData,
        fileName,
        mimeType,
        log,
        error
      });
      finalQuestion = transcription.text;
      log('Transcription completed:', { textLength: finalQuestion.length });
    }

    // Validate required fields
    if (!videoDescription || !finalQuestion) {
      throw { 
        type: ErrorTypes.VALIDATION, 
        message: "Missing required fields: videoDescription or question/audio" 
      };
    }

    // Get AI response
    const response = await handleAIChat({
      videoDescription,
      question: finalQuestion,
      chatHistory,
      additionalContext,
      log
    });

    // Return success response
    return res.json({
      answer: response,
      success: true,
      source: audioData ? 'audio_transcription' : 'text_input'
    });

  } catch (err) {
    // Log error details
    error('Error details:', {
      type: err.type || 'unknown',
      message: err.message,
      stack: err.stack
    });

    // Return error response
    return res.json({
      success: false,
      error: err.message,
      errorType: err.type || 'unknown'
    }, 500);
  }
};
