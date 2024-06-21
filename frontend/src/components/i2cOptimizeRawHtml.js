import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold
} from "@google/generative-ai";

const OptimizeHtml = async (rawHtml, prompt, useModel="gemini-1.5-flash") =>{
  const gemini_apis = process.env.REACT_APP_GEMINI_APIS.split(',')
  const gemini_api = gemini_apis[3].trim()
  const genAI = new GoogleGenerativeAI(gemini_api);
  console.log("Adding libraries and functions")
  const model = genAI.getGenerativeModel({
  model: useModel,
  systemInstruction: `Don't remove anything even a single from the code i am going to give you. and don't even remove any kind of resources like css link. Don't remove any classes or anything from this html code. Just whatever told to you.\nMust give the final html output code in html code block like this-\n \`\`\`html
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
  try{
  const result = await chatSession.sendMessage(prompt+"\n\n"+rawHtml);
  return result.response.text()
  }catch(e){
    return 'Error occured whie optimizing html'
  }
  
}

export default OptimizeHtml