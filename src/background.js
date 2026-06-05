//src/background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "parseResume") {
    processResumeWithGemini(request.text)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => {
        console.error("Resume Parse Error:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; 
  }
  
  if (request.action === "mapFieldsWithAI") {
    mapFieldsWithGemini(request.resumeData, request.pageFields)
      .then(data => sendResponse({ success: true, mapping: data }))
      .catch(error => {
        console.error("Field Mapping Error:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Helper function to aggressively extract valid JSON from messy AI text
function extractValidJSON(rawText) {
  try {
    // 1. Find the first '{' and the last '}'
    const startIndex = rawText.indexOf('{');
    const endIndex = rawText.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1) {
      let cleanJsonString = rawText.substring(startIndex, endIndex + 1);
      return JSON.parse(cleanJsonString);
    } else {
      throw new Error("No JSON object brackets {} found in the response.");
    }
  } catch (err) {
    console.error("CRITICAL: Failed to parse the following text from AI:\n", rawText);
    throw new Error("AI returned invalid JSON syntax. Check the console for the raw text.");
  }
}

async function processResumeWithGemini(resumeText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key is missing.");

  const prompt = `You are an expert AI data extractor. Analyze the provided resume text and extract the information into a strict JSON object. 
  Infer missing information where logically possible. Normalize all dates and formats.
  CRITICAL RULES:
  1. Return ONLY a valid JSON object.
  2. DO NOT include any markdown formatting like \`\`\`json.
  3. DO NOT include ANY comments (like // or /*).
  4. NO trailing commas.
  
  Use this exact JSON structure:
  {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "experience": [{"company": "", "title": "", "years": ""}],
    "education": [{"institution": "", "degree": "", "year": ""}],
    "skills": [""]
  }
  
  Resume text:
  ${resumeText}`;

   const response = await fetch(                                //gemini-2.5-flash
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API Error:", errorText);
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  
  const result = await response.json();
  const rawText = result.candidates[0].content.parts[0].text;
  
  return extractValidJSON(rawText);
}

async function mapFieldsWithGemini(resumeData, pageFields) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  const prompt = `You are an AI assistant filling out a complex Workday job application.
  Here is the candidate's resume data: ${JSON.stringify(resumeData)}
  
  Here is an array of form fields found on the current page: ${JSON.stringify(pageFields)}
  
  Your job is to match the candidate's data to the form fields. 
  Rules:
  1. For 'text' or 'textarea' types, provide the best string value.
  2. For 'select' (dropdowns) or 'radio' types, you MUST strictly choose one of the exact strings provided in their 'options' array.
  3. If a question asks for a boolean (checkbox), return true or false.
  4. If you absolutely do not know the answer based on the resume, return an empty string "".
  5. CRITICAL: Return ONLY valid JSON. No markdown, no comments, no trailing commas.
  
  Return ONLY a strict JSON object where the keys are the field 'id' and the values are your answers.`;
                                                                                              //2.5
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  
  const result = await response.json();
  const rawText = result.candidates[0].content.parts[0].text;
  
  return extractValidJSON(rawText);
}