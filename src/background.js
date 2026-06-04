chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "parseResume") {
    processResumeWithGemini(request.text)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; 
  }
});

async function processResumeWithGemini(resumeText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log("API KEY:", apiKey);
  if (!apiKey) throw new Error("API key is missing.");

  const prompt = `You are an expert AI data extractor. Analyze the provided resume text and extract the information into a strict JSON object. 
  Infer missing information where logically possible. Normalize all dates and formats.
  DO NOT include any markdown formatting like \`\`\`json. Return ONLY the raw JSON object.
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

   const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });
//   const response = await fetch(
//   `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
// )
// .then(r => r.json())
// .then(console.log);

if (!response.ok) {
  const errorText = await response.text();
  console.log("Gemini Error:", errorText);
  throw new Error(errorText);
}
  const result = await response.json();
  return JSON.parse(result.candidates[0].content.parts[0].text);
}