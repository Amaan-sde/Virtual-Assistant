const axios = require('axios');

// Retry logic with exponential backoff
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const geminiResponse = async (command , assistantName ,userName, retries = 3) => {
  try {
    if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL) {
      throw new Error('GEMINI_API_KEY or GEMINI_MODEL not set in .env');
    }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const prompt = `You are virtual assistant named ${assistantName} created by ${userName}. 
    
    You are not Google. You will now behave like a voice-enabled assistant.
    
    Your taskk is to understand the user's natural language input and respond with a JSON object like this:
    
    {
    "type" : "general" | "google_search" | "youtube_search" | "youtube_play" | "get_time" | "get_date" | "get_day" | "get_month" | "calculator_open" | "instagram_open" | "facebook_open" | "weather-show",
    "userInput" : "<original user input>" {only remove your name from userinput if exists} and agar kisi ne google ya youtube pe kuch search karne ko bola hai to userinput me only bola search text jaye,
    "response" : "<a short spoken response to read out to the user>"}

    Instructions :
    - "type" : determine the intent of the user.
    - "userinput" : original sentence the user spoke.
    - "response" : A short voice-friendly reply , e.g., "Sure  playing it now" , "Here's what I found", "Today is Tuesday" , etc.

    Type meanings :
    - "general" : if it's a factual or information question.
    aur agar koi aisa question puchta hai jiska answer tume pata hai usko bhi general ki category me rakho bas short answer dena 
    - "google_search" : if the user wants to search something on Google.
    - "youtube_search" : if the user wants to search something on YouTube.
    - "youtube_play" : if the user wants to directly play a video or song on YouTube.
      - "youtube_search" : if user says things like "search on youtube", "find on youtube", "youtube mein search karo"
      - "youtube_play" : if user says things like "play on youtube", "play music", "play video", "play song"
      - "get_time" : if the user asks for current time.@@
    - "get_date" : if the user asks for today's date.
    - "get_day" : if the user asks for current day of the week.
    - "get_month" : if the user asks for current month.
    - "calculator_open" : if the user wants to open calculator.
    - "instagram_open" : if the user wants to open Instagram.
    - "facebook_open" : if the user wants to open Facebook.
    - "weather-show" : if the user wants to know the weather.

    Important:
    - Use "${userName}" agar koi puche tume kisne banaya
    - Only respond with the JSON object , nothing else.
  CRITICAL: If the user mentions "youtube", ALWAYS return either "youtube_search" or "youtube_play", NOT "general".
  Extract ONLY the search query in userInput, without the word "youtube" or similar.
  Example: If user says "search billie eilish on youtube", return {"type": "youtube_search", "userInput": "billie eilish", "response": "Searching for billie eilish on YouTube"}

    now your userInput- ${command}
`;

    const result = await axios.post(apiUrl, {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    }, {
      timeout: 10000 // 10 second timeout
    });

    // Gemini response structure
    if (!result.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Unexpected Gemini response structure:", result.data);
      throw new Error("Invalid Gemini API response format");
    }
    return result.data.candidates[0].content.parts[0].text;

  } catch (err) {
    const status = err.response?.status;
    const errorMsg = err.response?.data?.error?.message || err.message || 'Unknown error';
    
    // Handle rate limit (429) with retry
    if (status === 429 && retries > 0) {
      const backoffMs = (4 - retries) * 2000; // 2s, 4s, 6s backoff
      console.warn(`Rate limited. Retrying in ${backoffMs}ms... (${retries} attempts left)`);
      await sleep(backoffMs);
      return geminiResponse(command, assistantName, userName, retries - 1);
    }
    
    // Handle 500/503 server errors with retry
    if ((status === 500 || status === 503) && retries > 0) {
      const backoffMs = (4 - retries) * 1000;
      console.warn(`Server error (${status}). Retrying in ${backoffMs}ms... (${retries} attempts left)`);
      await sleep(backoffMs);
      return geminiResponse(command, assistantName, userName, retries - 1);
    }
    
    console.error("Error in gemini response:", errorMsg);
    console.error("Full error details:", err.response?.data || err);
    throw new Error(`Gemini API Error: ${errorMsg}`);
  }
};

module.exports = { geminiResponse };
