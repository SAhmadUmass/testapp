import { Client, Functions } from 'node-appwrite';

// Init SDK
const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('67a3ff370019f23110f1') // Your project ID
    .setKey(process.env.APPWRITE_API_KEY); // Your secret API key

const functions = new Functions(client);

const payload = {
    videoDescription: "This is a test video about making pasta carbonara. The chef demonstrates how to properly cook the pasta al dente and create a creamy sauce using eggs, pecorino cheese, and guanciale.",
    question: "What ingredients are needed for the carbonara sauce?",
    chatHistory: []
};

try {
    const response = await functions.createExecution(
        'aichatid',
        JSON.stringify(payload)
    );
    console.log(response);
} catch (error) {
    console.log(error);
} 