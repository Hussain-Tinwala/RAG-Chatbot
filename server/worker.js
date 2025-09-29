import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Worker } from 'bullmq';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { QdrantVectorStore } from "@langchain/qdrant";

// import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const connection = { host: '127.0.0.1', port: 6379 };

console.log('Worker is starting...');

const worker = new Worker('pdf-processing', async job => {
    try {

        const { filePath } = job.data;
        console.log(`Processing job #${job.id} for file: ${filePath}`);

        // 1. Load the PDF document
        const loader = new PDFLoader(filePath);
        const docs = await loader.load();
        console.log(`Loaded ${docs.length} document(s) from PDF.`);

        // 2. Split the document into smaller chunks
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const chunks = await splitter.splitDocuments(docs);
        console.log(`Split document into ${chunks.length} chunks.`);

        // 3. Create vector embeddings for each chunk        
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: "text-embedding-004",
        });
        console.log('Embedding chunks via Google Gemini...');


        // 4. Store the embeddings in our Quadrant vector database
        await QdrantVectorStore.fromDocuments(chunks, embeddings, {
            url: "http://localhost:6333",
            collectionName: "pdf_documents",
        });
        console.log('Embeddings stored successfully.');

        return { status: 'Completed' };
    } catch (error) {
        console.error(`Error processing job #${job.id}:`, error);
        throw error;
    }
}, { connection });

worker.on('completed', job => {
    console.log(`Job #${job.id} has completed successfully!`);
});

worker.on('failed', (job, err) => {
    console.error(`Job #${job.id} has failed with error: ${err.message}`);
});

console.log('Worker is listening for jobs...');