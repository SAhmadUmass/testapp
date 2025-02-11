import { Client } from 'node-appwrite';
import OpenAI from 'openai';
import { writeFile, unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import dotenv from 'dotenv';
import FormData from 'form-data';

// Load environment variables from .env
dotenv.config();

// Supported audio formats
const SUPPORTED_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  try {
    // Log request details
    log('Request method:', req.method);
    log('Request path:', req.path);
    
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      error('OpenAI API key not found in environment variables');
      return res.json({ 
        error: "Configuration error", 
        details: "OpenAI API key not configured",
        success: false
      }, 500);
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Handle /ping route
    if (req.path === "/ping") {
      return res.text("Pong");
    }

    // Parse the request body
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      log('Parsed request body:', { ...body, audioData: 'TRUNCATED' });
    } catch (parseError) {
      error('Failed to parse request body:', parseError);
      return res.json({
        error: 'Invalid request body',
        details: 'Request body must be valid JSON',
        success: false
      }, 400);
    }

    // Handle transcription
    if (body.path === "/transcribe") {
      let tempPath = null;

      try {
        const { audioData, fileName, mimeType } = body;

        // Input validation
        if (!audioData || !fileName || !mimeType) {
          error('Missing required fields');
          return res.json({ 
            error: "Invalid request",
            details: "Request must include audioData, fileName, and mimeType",
            success: false
          }, 400);
        }

        // Create temporary file from base64 data
        tempPath = join(tmpdir(), `whisper_${Date.now()}_${fileName}`);
        const buffer = Buffer.from(audioData, 'base64');
        
        // Check file size
        if (buffer.length > MAX_FILE_SIZE) {
          error(`File size ${buffer.length} exceeds limit of ${MAX_FILE_SIZE}`);
          return res.json({ 
            error: "File too large", 
            details: "Maximum file size is 25MB",
            success: false
          }, 400);
        }

        // Check file format
        const fileExtension = fileName.split('.').pop().toLowerCase();
        if (!SUPPORTED_FORMATS.includes(fileExtension)) {
          error(`Unsupported file format: ${fileExtension}`);
          return res.json({ 
            error: "Unsupported file format", 
            details: `Supported formats are: ${SUPPORTED_FORMATS.join(', ')}`,
            success: false
          }, 400);
        }

        // Save the audio data to a temporary file
        await writeFile(tempPath, buffer);
        log('Audio file saved to:', tempPath);

        // Create file stream for OpenAI
        const fileStream = createReadStream(tempPath);

        // Perform transcription using OpenAI Whisper
        log('Starting OpenAI Whisper transcription...');
        const transcription = await openai.audio.transcriptions.create({
          file: fileStream,
          model: 'whisper-1',
          response_format: 'json'
        });
        log('Transcription completed successfully');
        log('Transcription result:', transcription);

        // Check if we got actual transcription text
        if (!transcription.text || transcription.text.trim() === '') {
          error('Received empty transcription from OpenAI');
          return res.json({
            error: "Transcription failed",
            details: "No speech detected or audio was unclear",
            success: false
          }, 400);
        }

        return res.json({
          transcription: transcription.text,
          success: true,
          metadata: {
            timestamp: new Date().toISOString(),
            model: "whisper-1",
            type: "audio_transcription"
          },
          bookmark_data: {
            description: transcription.text,
            context: transcription.text,
            source: "whisper_transcription"
          }
        });

      } catch (err) {
        error("Transcription failed:", err.message);
        error("Error stack:", err.stack);
        return res.json({ 
          error: "Transcription failed", 
          details: err.message,
          success: false
        }, 500);
      } finally {
        // Clean up temporary file
        if (tempPath) {
          try {
            await unlink(tempPath);
            log('Temporary file cleaned up:', tempPath);
          } catch (cleanupErr) {
            error("Failed to clean up temporary file:", cleanupErr.message);
          }
        }
      }
    }

    // Default response
    return res.json({
      status: "ready",
      supported_formats: SUPPORTED_FORMATS,
      max_file_size: "25MB",
      endpoints: {
        transcribe: "POST /transcribe"
      }
    });
  } catch (err) {
    error("Unexpected error:", err.message);
    error("Error stack:", err.stack);
    return res.json({
      error: "Internal server error",
      details: err.message,
      success: false
    }, 500);
  }
};
