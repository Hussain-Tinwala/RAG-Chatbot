# RAG Chatbot 💬

An advanced, full-stack RAG (Retrieval-Augmented Generation) application that allows users to upload PDF documents and have real-time, intelligent conversations about their content. This project features a professional, custom-designed UI and a robust, asynchronous backend.

![Screenshot of the RAG Chatbot UI](https://i.imgur.com/your-screenshot-id.png)
*(Suggestion: Take a screenshot of your final application and replace the link above!)*

## Features

- **Secure User Authentication:** Handled by Clerk, providing a seamless sign-in/sign-up experience.
- **PDF Upload & Processing:** Users can upload PDF documents via a sleek drag-and-drop interface.
- **Asynchronous Backend:** Uses a BullMQ queue with a Redis (Valkey) backend to process documents without blocking the user.
- **Vector Embeddings:** Documents are chunked and vectorized using the Google Gemini embedding model.
- **Vector Storage:** Embeddings are stored and indexed in a Qdrant vector database for efficient searching.
- **Real-time AI Chat:** A beautiful chat interface that streams responses from an AI model (powered by Google Gemini) that answers questions based *only* on the context of the uploaded document.
- **Professional UI/UX:** A custom-designed "Project Aurora" theme with a dynamic gradient background, grain texture, and fluid animations using Framer Motion.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js
- **AI / LangChain:**
  - **Chat & Embeddings:** Google Gemini API (`@langchain/google-genai`)
  - **Vector Store:** Qdrant (`@langchain/qdrant`)
  - **Orchestration:** LangChain.js
- **Infrastructure & Services:**
  - **Authentication:** Clerk
  - **Queue System:** BullMQ
  - **Databases:** Valkey (Redis) & Qdrant running in Docker.

## Project Structure

```
/pdf-rag-app
├── client/         # Next.js Frontend Application
├── server/         # Express.js Backend API & Worker
└── docker-compose.yml # Defines backend services (Valkey & Qdrant)
```

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Set up API Keys:**
    Create a file named `.env.local` inside the `server/` directory. You will need a free API key from Google AI Studio.
    ```env
    # Location: server/.env.local
    GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx
    ```

3.  **Start Backend Services:**
    From the root directory, start the Valkey and Qdrant containers.
    ```bash
    docker-compose up -d
    ```

4.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    ```

5.  **Install Frontend Dependencies:**
    ```bash
    cd ../client
    npm install
    ```

## Running the Application

You will need **three separate terminals** to run the full application.

1.  **Terminal 1: Backend API**
    Navigate to the `server` directory and run:
    ```bash
    cd server
    npm run dev
    ```

2.  **Terminal 2: Backend Worker**
    Navigate to the `server` directory and run:
    ```bash
    cd server
    npm run start:worker
    ```

3.  **Terminal 3: Frontend Client**
    Navigate to the `client` directory and run:
    ```bash
    cd client
    npm run dev
    ```

Your application will be available at `http://localhost:3000`.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.