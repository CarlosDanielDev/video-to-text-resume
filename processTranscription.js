import OpenAI from 'openai';
import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function classifyAndSummarize(text) {
  const promptMessage = `${process.env.PROMPT_MESSAGE}:\n\n${text}`;

  const completion = await client.chat.completions.create({
    model: process.env.MODEL,
    messages: [
      { role: 'system', content: process.env.MODEL_BRIEFING },
      { role: 'user', content: promptMessage },
    ],
  });

  return completion.choices[0].message.content;
}

fs.readFile(process.env.TRANSCRIPTION_FILENAME, 'utf8', async (err, data) => {
  if (err) {
    console.error(`Error on read trascription: ${err}`);
    return;
  }
  try {
    const result = await classifyAndSummarize(data);
    console.log('Structured text:');
    console.log(result);
  } catch (error) {
    console.error('Error on process transcription:', error);
  }
});

