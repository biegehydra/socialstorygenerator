import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  SafetySetting,
  Type,
} from '@google/genai';
import type { Root, Message } from './instagram-models';

const prompt = `
System Prompt:
You are an expert sentiment analysis AI. Your task is to analyze messages for sentiment 
and importance, providing justifications based on the content and context. Adhere strictly 
to the specified JSON output format. Analyze each message independently based on its content. 
Output *only* the JSON, with no surrounding text or explanations.

Task Description:
Given a list of messages, generate the following JSON to determine the sentiment and importance, as well 
as whether the message is vulgar. Vulgar only refers to messages that are sexually explicit, very innapropriate,
or offensive, or contain explicit language.
Each message content has a messageID followed by the message itself. When determining the sentiment
and importance, consider the following:
- The previous messages in the conversation
- The future messages in the conversation
- The relationship between the sender and recipient
- The overall context of the conversation
- The emotional tone of the message
- The level of detail in the message
- The use of punctuation and capitalization


Example Input 1:
msg1
I HATE YOU

Example Output 1:
{
  "messages": [
    {
      "id": "msg1",
      "sentiment": "Anger",
      "importance": 10,
      "sentiment_justification": "Sender is expressing explicit hate using strong negative language and capitalization.",
      "importance_justification": "Message content is highly impactful emotionally due to the intense expression of anger directed at the recipient.",
      "vulgar": false
    }
  ]
}

Example Input 2:
msg2
ok, thanks!

Example Output 2:
{
  "messages": [
    {
      "id": "msg2",
      "sentiment": "Joy",
      "importance": 3,
      "sentiment_justification": "Sender shows gratitude and uses an exclamation mark, indicating positive emotion.",
      "importance_justification": "Message is polite but does not significantly further the conversation or evoke strong emotions.",
      "vulgar": false
    }
  ]
}

Example Input 3:
msg3
See you tomorrow.

Example Output 3:
{
  "messages": [
    {
      "id": "msg3",
      "sentiment": "Neutral",
      "importance": 2,
      "sentiment_justification": "The message is a simple statement of future plans, carrying no strong emotional tone.",
      "importance_justification": "The message provides information but has minimal emotional impact or conversational weight.",
      "vulgar": false
    }
  ]
}

Example Input 4:
msg4
Oh, *great*, another meeting.

Example Output 4:
{
  "messages": [
    {
      "id": "msg4",
      "sentiment": "Sarcasm",
      "importance": 4,
      "sentiment_justification": "The word 'great' is used ironically, indicated by context and italics, expressing displeasure.",
      "importance_justification": "The message conveys mild negativity and hints at workplace dissatisfaction, adding some conversational depth.",
      "vulgar": false
    }
  ]
}

Example Input 5:
msg5
I can't stop thinking about you.

Example Output 5:
{
  "messages": [
    {
      "id": "msg5",
      "sentiment": "Romantic",
      "importance": 9,
      "sentiment_justification": "The message explicitly states strong positive feelings and preoccupation, indicative of romantic interest.",
      "importance_justification": "This message carries significant emotional weight and directly impacts the personal relationship.",
      "vulgar": false
    }
  ]
}

Example Input 6:
msg6
Did you hear that noise outside? I'm scared.

Example Output 6:
{
  "messages": [
    {
      "id": "msg6",
      "sentiment": "Fear",
      "importance": 8,
      "sentiment_justification": "The sender explicitly states they are 'scared' and refers to an unknown noise, indicating fear.",
      "importance_justification": "The message conveys immediate potential danger or unease, demanding attention and possibly action.",
      "vulgar": false
    }
  ]
}

Example Input 7:
msg7
...

Example Output 7:
{
  "messages": [
    {
      "id": "msg7",
      "sentiment": "Awkwardness",
      "importance": 1,
      "sentiment_justification": "Ellipses often denote silence, hesitation, or an inability to respond, suggesting awkwardness.",
      "importance_justification": "The lack of content offers little information but can create an awkward gap in conversation.",
      "vulgar": false
    }
  ]
}

Example Input 8:
msg8
Fuck you.

Example Output 8:
{
  "messages": [
    {
      "id": "msg8",
      "sentiment": "Anger",
      "importance": 10,
      "sentiment_justification": "The sender uses strong negative language and capitalizes the word 'Fuck', indicating anger.",
      "importance_justification": "The message is highly impactful emotionally due to the explicit and negative language.",
      "vulgar": true
    }
  ]
}
`;


const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set or loaded correctly.");
}
const ai = new GoogleGenAI({ apiKey }); // Correct initialization with object

const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const config = {
  safetySettings,
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    required: ["messages"],
    properties: {
      messages: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["id", "sentiment", "importance", "sentiment_justification", "importance_justification", "vulgar"],
          properties: {
            id: {
              type: Type.STRING,
            },
            sentiment: {
              type: Type.STRING,
              enum: ["Awkwardness", "Romantic", "Guilt", "Fear", "Neutral", "Anger", "Sympathy", "Sadness", "Sarcasm", "Joy", "Surprise"],
            },
            importance: {
              type: Type.INTEGER,
            },
            sentiment_justification: {
              type: Type.STRING,
            },
            importance_justification: {
              type: Type.STRING,
            },
            vulgar: {
              type: Type.BOOLEAN,
            }
          },
        },
      },
    },
  },
};
const model = 'gemini-2.5-flash'; // Changed model

// Define the structure for the sentiment analysis result
export interface SentimentAnalysisMessage {
  id: string;
  sentiment: string;
  importance: number;
  sentiment_justification: string;
  importance_justification: string;
  vulgar: boolean;
}

export interface SentimentAnalysisResult {
  messages: SentimentAnalysisMessage[];
}
// Helper function to check if a message should be skipped
export function shouldSkip(content: string): boolean {
  const lowerContent = content.toLowerCase();
  const reactionRegex = /reacted .+ to your message/i;
  return (
    lowerContent.includes("liked a message") ||
    lowerContent.includes("sent an attachment") ||
    lowerContent.includes("sent a photo") || // Added common variants
    lowerContent.includes("sent a video") ||
    reactionRegex.test(content)
  );
}

// Helper function to clean message content
export function cleanContent(text: string): string {
  // Remove URLs
  const cleaned = text.replace(/https?:\/\/\S+/g, '');
  // Additional cleaning can be added here if needed
  return cleaned.trim();
}

/**
 * Analyzes the sentiment and importance of messages within an Instagram chat.
 * @param chatData The Root object containing chat information.
 * @returns A Promise resolving to the SentimentAnalysisResult or null if an error occurs.
 */
export async function analyzeChatSentiment(chatData: Root): Promise<SentimentAnalysisResult | null> {
  const participants = chatData.participants.map(p => p.name).join(', ');
  const chatDetails = `Chat Title: ${chatData.title}\nParticipants: ${participants}\nThread Path: ${chatData.thread_path}`;

  const validMessages = chatData.messages
    .filter((msg: Message): msg is Message & { content: string } => {
      // Ensure content exists and is not just whitespace initially
      if (typeof msg.content !== 'string' || !msg.content.trim()) {
        return false;
      }
      // Skip messages based on content keywords
      if (shouldSkip(msg.content)) {
        return false;
      }
      return true;
    })
    .map((msg) => {
      const messageId = msg.timestamp_ms;
      const cleanedContent = cleanContent(msg.content as string);

      if (!cleanedContent) {
        return null;
      }

      return {
        formattedMessage: `${messageId}\nSender: ${msg.sender_name}\nTimestamp: ${new Date(msg.timestamp_ms).toISOString()}\nContent: ${cleanedContent}`,
        id: messageId.toString()
      };
    })
    .filter((formattedMsg): formattedMsg is { formattedMessage: string, id: string } => formattedMsg !== null)
    .reverse(); // Reverse to maintain chronological order

  if (validMessages.length === 0) {
    console.log("No valid text messages found to analyze after cleaning and filtering.");
    return { messages: [] };
  }

  // Process messages in batches of 50
  const batchSize = 50;
  const batches = [];
  for (let i = 0; i < validMessages.length; i += batchSize) {
    batches.push(validMessages.slice(i, i + batchSize));
  }

  console.log(`Processing ${validMessages.length} messages in ${batches.length} batches of max ${batchSize}`);

  // Analyze each batch
  const allResults: SentimentAnalysisMessage[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Processing batch ${i + 1}/${batches.length} with ${batch.length} messages`);

    const messagesToAnalyze = batch.map(item => item.formattedMessage).join('\n\n');

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: prompt, // The main instruction prompt
          },
          {
            text: `Chat Details:\n${chatDetails}`,
          },
          {
            text: `List of Messages to Analyze (Batch ${i + 1}/${batches.length}):\n${messagesToAnalyze}`
          }
        ],
      },
    ];

    try {
      // Match original call structure more closely
      const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });

      let aggregatedResponse = '';
      // Iterate directly over the response stream
      for await (const chunk of response) {
        // Access chunk.text directly as it's a property
        if (chunk && typeof chunk.text === 'string') {
          aggregatedResponse += chunk.text;
        } else {
          // Handle unexpected chunk format if necessary
          console.warn("Unexpected chunk format in stream:", chunk);
        }
      }

      // Ensure aggregatedResponse is not empty before parsing
      if (!aggregatedResponse) {
        console.error(`Received empty response from API stream for batch ${i + 1}.`);
        continue; // Skip this batch but continue with others
      }

      try {
        const result = JSON.parse(aggregatedResponse) as SentimentAnalysisResult;
        // Add the batch results to the combined results
        if (result && result.messages && Array.isArray(result.messages)) {
          allResults.push(...result.messages);
          console.log(`Successfully processed ${result.messages.length} messages in batch ${i + 1}`);
        }
      } catch (parseError) {
        console.error(`Error parsing JSON response for batch ${i + 1}:`, parseError);
        console.error("Aggregated response string was:", aggregatedResponse); // Log the problematic string
        // Continue with other batches
      }
    } catch (error) {
      console.error(`Error during sentiment analysis API call for batch ${i + 1}:`, error);
      // Continue with other batches
    }
  }

  // Return combined results
  return { messages: allResults };
}