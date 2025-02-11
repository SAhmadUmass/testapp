# whispertranscribe

## 🧰 Usage

### GET /ping

- Returns a "Pong" message.

**Response**

Sample `200` Response:

```text
Pong
```

### POST /transcribe

- Accepts an audio file and returns the transcription.

**Request**

- **Headers**:
  - `Content-Type: multipart/form-data`

- **Body**:
  - `audio`: The audio file to transcribe.

**Response**

Sample `200` Response:

```json
{
  "transcription": "Transcribed text here.",
  "success": true
}
```

**Error Response**

Sample `400` Response:

```json
{
  "error": "No audio file provided"
}
```

Sample `500` Response:

```json
{
  "error": "Transcription failed",
  "details": "Error message here."
}
```

## ⚙️ Configuration

| Setting           | Value              |
| ----------------- | ------------------ |
| Runtime           | Node (18.0)        |
| Entrypoint        | `src/main.js`      |
| Build Commands    | `npm install`      |
| Permissions       | `any`              |
| Timeout (Seconds) | 15                 |

## 🔒 Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key for Whisper transcription.

Ensure that your `.env` file contains the necessary environment variables.
````

## 5. Deploy the Updated Function

After making these changes, deploy your updated function to Appwrite.

1. **Install Dependencies**:

   Navigate to the `functions/whispertranscribe/` directory and run:

   ```bash
   npm install
   ```

2. **Set Environment Variables**:

   Ensure your `.env` file includes your OpenAI API key:

   ```env:functions/whispertranscribe/.env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Deploy the Function**:

   Use the Appwrite CLI or the web console to deploy your updated function. Ensure that the environment variables are correctly set in the deployment settings.

## 6. Testing the Transcription Endpoint

You can test the `/transcribe` endpoint using tools like Postman or cURL.

### Using cURL:

```bash
curl -X POST http://localhost/functions/whispertranscribe/transcribe \
  -H "Content-Type: multipart/form-data" \
  -F "audio=@/path/to/your/audiofile.mp3"
```

### Sample Response:

```json
{
  "transcription": "Hello, this is a test transcription.",
  "success": true
}
```

### Handling Errors:

- **No Audio File Provided**:

  If no audio file is sent, the response will be:

  ```json
  {
    "error": "No audio file provided"
  }
  ```

- **Transcription Failure**:

  If there's an error during transcription, the response will be:

  ```json
  {
    "error": "Transcription failed",
    "details": "Error message here."
  }
  ```

## Summary

By following these steps, you've successfully integrated an easy Whisper transcription feature into your `whispertranscribe` Appwrite function. This implementation ensures simplicity while maintaining security and scalability. Now, your function can accept audio files and return transcriptions seamlessly.

Feel free to reach out if you need further assistance or have any questions!
