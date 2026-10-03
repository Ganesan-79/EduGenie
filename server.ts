import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-3.1-flash-lite'];

async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return res;
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} failed: ${err.message}. Trying next fallback if available...`);
    }
  }

  throw lastError;
}

// Helper to check API Key
function verifyApiKey(res: Response): boolean {
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured in the server environment.',
    });
    return false;
  }
  return true;
}

// 1. Q&A Module (/api/qa)
app.all('/api/qa', async (req: Request, res: Response) => {
  try {
    if (!verifyApiKey(res)) return;

    const question = (req.method === 'GET' ? req.query.question : req.body.question) as string;
    if (!question || !question.trim()) {
      res.status(400).json({ error: 'Please provide a question.' });
      return;
    }

    const prompt = `You are EduGenie's academic and general knowledge Q&A assistant.
Answer the following question clearly, concisely, and factually for a student learner.
Provide the direct answer first, followed by a brief 1-2 sentence supporting context or explanation if relevant.

Question: ${question.trim()}`;

    const response = await generateContentWithFallback({
      contents: prompt,
    });

    const answer = response.text?.trim() || 'No answer generated.';
    res.json({
      question: question.trim(),
      answer,
    });
  } catch (error: any) {
    console.error('Error in /api/qa:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate answer for your question.',
    });
  }
});

// 2. Explanation Module (/api/explain)
app.post('/api/explain', async (req: Request, res: Response) => {
  try {
    if (!verifyApiKey(res)) return;

    const topic = (req.body.topic || req.query.topic) as string;
    if (!topic || !topic.trim()) {
      res.status(400).json({ error: 'Please provide a topic to explain.' });
      return;
    }

    const audience = req.body.audience || 'school student or beginner learner';

    const prompt = `You are EduGenie's concept explanation tutor.
Explain the concept of "${topic.trim()}" in a simple, clear, and engaging way suitable for a ${audience}.
Break down complex jargon, provide a clear everyday analogy, highlight key takeaways, and keep the tone encouraging and accessible.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            summary: {
              type: Type.STRING,
              description: 'A 1-2 sentence high-level simplified explanation',
            },
            explanation: {
              type: Type.STRING,
              description: 'Detailed yet simple breakdown in plain words',
            },
            analogy: {
              type: Type.STRING,
              description: 'An easy to picture real-world analogy',
            },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 core takeaways or facts',
            },
            didYouKnow: {
              type: Type.STRING,
              description: 'An interesting fun fact related to this concept',
            },
          },
          required: ['topic', 'summary', 'explanation', 'keyPoints'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    res.json({
      topic: topic.trim(),
      ...parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/explain:', error);
    res.status(500).json({
      error: error?.message || 'Failed to explain topic.',
    });
  }
});

// 3. Quiz Generation Module (/api/quiz)
app.post('/api/quiz', async (req: Request, res: Response) => {
  try {
    if (!verifyApiKey(res)) return;

    const text = req.body.text || req.body.topic || '';
    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Please provide a topic or passage for the quiz.' });
      return;
    }

    const questionCount = Math.min(Math.max(req.body.questionCount || 3, 1), 10);

    const prompt = `You are EduGenie's quiz generator.
From the following topic or passage, create exactly ${questionCount} multiple-choice questions (MCQs).
Each question must include:
- A clear, concise question
- A list of exactly 4 options labeled or clean strings
- A correct answer that exactly matches one of the 4 options
- A short 1-line explanation why that answer is correct

Passage/Topic:
"""
${text.trim()}
"""`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: 'The multiple choice question text',
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Four plausible answer choices',
              },
              answer: {
                type: Type.STRING,
                description: 'The correct option which must match one item in options exactly',
              },
              explanation: {
                type: Type.STRING,
                description: 'Brief explanation of why the correct option is right',
              },
            },
            required: ['question', 'options', 'answer'],
          },
        },
      },
    });

    const quizText = response.text?.trim() || '[]';
    const questions = JSON.parse(quizText);

    res.json({
      topic: text.trim(),
      quiz: questions,
    });
  } catch (error: any) {
    console.error('Error in /api/quiz:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate quiz.',
    });
  }
});

// 4. Summarization Module (/api/summarize)
app.post('/api/summarize', async (req: Request, res: Response) => {
  try {
    if (!verifyApiKey(res)) return;

    const text = (req.body.text || '') as string;
    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Please provide text to summarize.' });
      return;
    }

    const prompt = `You are EduGenie's text summarization assistant.
Summarize the following educational text or passage in simple, accessible language.
Make it ideal for quick revision: eliminate redundancy, capture the core concepts, and produce:
1. A concise overview summary paragraph.
2. 3 to 5 bullet points with key takeaways.
3. A 1-sentence quick takeaway.

Text to summarize:
"""
${text.trim()}
"""`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'The concise summary paragraph in clear language',
            },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Core bullet points from the passage',
            },
            oneLiner: {
              type: Type.STRING,
              description: 'Single-sentence essence of the text',
            },
          },
          required: ['summary', 'keyPoints'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    const originalWordCount = text.trim().split(/\s+/).length;
    const summaryWordCount = parsed.summary ? parsed.summary.split(/\s+/).length : 0;

    res.json({
      summary: parsed.summary || '',
      keyPoints: parsed.keyPoints || [],
      oneLiner: parsed.oneLiner || '',
      stats: {
        originalWords: originalWordCount,
        summaryWords: summaryWordCount,
        reductionPercent: Math.max(0, Math.round(((originalWordCount - summaryWordCount) / originalWordCount) * 100)),
      },
    });
  } catch (error: any) {
    console.error('Error in /api/summarize:', error);
    res.status(500).json({
      error: error?.message || 'Failed to summarize text.',
    });
  }
});

// 5. Learning Path Module (/api/learn/recommendations)
app.all('/api/learn/recommendations', async (req: Request, res: Response) => {
  try {
    if (!verifyApiKey(res)) return;

    const topic = (req.method === 'GET' ? req.query.topic : req.body.topic) as string;
    if (!topic || !topic.trim()) {
      res.status(400).json({ error: 'Please provide a topic for learning recommendations.' });
      return;
    }

    const prompt = `You are an expert AI tutor on EduGenie.
The student wants to learn: "${topic.trim()}".
Create a structured, adaptive learning path from beginner to advanced levels.
Include realistic estimated timelines, key concepts, and practical recommended resources (interactive tutorials, videos, books, documentation).
Also include practical adaptive tips for success.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'E.g., SQL Learning Path: From Zero to Hero' },
            overview: { type: Type.STRING, description: 'Introductory guidance on learning this topic' },
            levels: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  levelName: { type: Type.STRING, description: 'e.g. Beginner Level: Building a Foundation' },
                  estimatedTime: { type: Type.STRING, description: 'e.g. 1-2 weeks' },
                  keyTopics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Specific concepts and skills to learn',
                  },
                  resources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        category: { type: Type.STRING, description: 'e.g. Interactive Tutorials, Books, Videos, Documentation' },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ['category', 'title', 'description'],
                    },
                  },
                },
                required: ['levelName', 'estimatedTime', 'keyTopics', 'resources'],
              },
            },
            adaptiveTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Practical study advice, common pitfalls, and practice methods',
            },
            milestoneProject: {
              type: Type.STRING,
              description: 'A recommended capstone mini-project to prove mastery',
            },
          },
          required: ['title', 'overview', 'levels', 'adaptiveTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({
      topic: topic.trim(),
      recommendation: parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/learn/recommendations:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate learning recommendations.',
    });
  }
});

// Setup Vite middleware for development or serve dist for production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
