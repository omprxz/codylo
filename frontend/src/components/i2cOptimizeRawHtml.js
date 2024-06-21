import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold
} from "@google/generative-ai";

const OptimizeHtml = async (rawHtml, prompt, useModel="gemini-1.5-flash") =>{
  const gemini_apis = process.env.REACT_APP_GEMINI_API.split(',')
  const gemini_api = gemini_apis[3].trim()
  const genAI = new GoogleGenerativeAI(gemini_api);
  const model = genAI.getGenerativeModel({
  model: useModel,
  systemInstruction: `Must give the final html output code in html code block like this-\n \`\`\`html
    //final html output code goes here...
    \`\`\`
  `,
});
  
  const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 15000,
  responseMimeType: "text/plain",
};

  const chatSession = model.startChat({
    generationConfig,
    safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE'
        },
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE'
        },
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE'
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE'
        }
    ],
    history: [],
  });
  
  const result = await chatSession.sendMessage(prompt+"\n\n"+rawHtml);
  return result.response.text()
  
}

export default OptimizeHtml