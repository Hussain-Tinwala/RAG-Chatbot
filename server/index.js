import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { Queue } from 'bullmq';

import { QdrantVectorStore } from "@langchain/qdrant";
// import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
// import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";


const startServer = async () => {
  const app = express()
  app.use(cors())
  app.use(express.json())

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, `${uniqueSuffix}-${file.originalname}`)
    }
  })

  const upload = multer({ storage: storage })

  // Queue Setup
  const fileProcessingQueue = new Queue('pdf-processing', {
    connection: { host: '127.0.0.1', port: 6379 }
  });


  app.get('/', (req, res) => {
    return res.json({ status: "Perfect" })
  })

  // app.post('/upload/pdf', upload.single('pdf'), (req, res)=>{
  //     return res.json({message: 'uploaded'})
  // })

  app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded.' });
    }

    await fileProcessingQueue.add('process-pdf', {
      filePath: req.file.path
    });

    console.log(`File queued for processing: ${req.file.path}`);

    return res.json({
      message: 'File uploaded and is now queued for processing.'
    })
  })



  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "text-embedding-004",
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: "http://localhost:6333",
    collectionName: "pdf_documents",
  });
  const retriever = vectorStore.asRetriever();


  // 1. Initialize the Gemini Chat Model
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash",
  });

  // 2. Create a Prompt Template
  const template = `Answer the question based only on the following context:
{context}

Question: {question}`;
  const prompt = PromptTemplate.fromTemplate(template);

  // 3. Create the LangChain Chain
  const chain = RunnableSequence.from([
    {
      context: (input) => retriever.invoke(input.question).then(formatDocumentsAsString),
      question: (input) => input.question,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  console.log('Chat components initialized successfully.');


  //CHAT ENDPOINT
  app.post('/chat', async (req, res) => {
    const { messages } = req.body;
    if (!messages || !messages.length) {
      return res.status(400).json({ error: "Messages are required." });
    }

    const lastUserMessage = messages[messages.length - 1];
    const question = lastUserMessage.content;

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    try {
      const stream = await chain.stream({ question });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      for await (const chunk of stream) {
        res.write(chunk);
      }
      res.end();
    } catch (error) {
      console.error("Error during chat processing:", error);
      res.status(500).json({ error: "An error occurred during chat processing." });
    }
  });


  const PORT = 3001
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
  })
}

startServer().catch(error => {
  console.error("Failed to start server:", error);
});