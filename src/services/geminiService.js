// Enhanced geminiService with conversation support for ReflectionModal
// This file adds conversational AI features while maintaining compatibility with existing code

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-1.5-flash-002',
  'gemini-1.5-flash-001',
];

let currentModelIndex = 0;

async function callGemini(userPrompt, options = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('API key not configured');
  }

  const modelId = MODELS[currentModelIndex];
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

  const requestBody = {
    contents: [{
      role: "user",
      parts: [{ text: options.systemInstruction ? `${options.systemInstruction}\n\n${userPrompt}` : userPrompt }]
    }],
    generationConfig: {
      temperature: options.temperature || 0.8,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
      maxOutputTokens: options.maxOutputTokens || 2048,
      ...(modelId.includes('2.5') && { thinkingConfig: { thinkingBudget: 0 } })
    }
  };

  console.log(`🤖 Using: ${modelId}`);

  try {
    const response = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      
      if (response.status === 429) {
        const retryAfter = errorData.error?.message?.match(/retry in (\d+\.?\d*)/)?.[1];
        if (retryAfter) {
          console.warn(`⏳ Rate limited. Waiting ${Math.ceil(retryAfter)}s...`);
          await new Promise(resolve => setTimeout(resolve, Math.ceil(parseFloat(retryAfter)) * 1000));
          return callGemini(userPrompt, options);
        }
        throw new Error('Rate limit exceeded. Wait and try again.');
      }

      if (response.status === 404 && currentModelIndex < MODELS.length - 1) {
        console.warn(`⚠️ ${modelId} not available, trying next...`);
        currentModelIndex++;
        return callGemini(userPrompt, options);
      }

      if (response.status === 403) {
        throw new Error('API key invalid');
      }
      throw new Error(`API Error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error('No text in response');
    
    console.log(`✅ Success!`);
    return text;

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

function parseJSON(text) {
  try {
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleaned.match(/[\[{][\s\S]*[\]}]/);
    if (jsonMatch) cleaned = jsonMatch[0];
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('❌ Parse failed:', text.substring(0, 200));
    throw new Error('Could not parse response');
  }
}

// Conversational reflection analysis for ReflectionModal
export async function analyzeReflectionConversational(userMessage, habits, options = {}) {
  const { conversationHistory = [] } = options;
  
  // Build context from conversation history
  const conversationContext = conversationHistory
    .slice(-6) // Last 3 exchanges (6 messages)
    .map(msg => `${msg.type === 'user' ? 'Student' : 'Coach'}: ${msg.content}`)
    .join('\n');

  const habitsSummary = habits.map(h => 
    `• ${h.title}: ${h.currentPunches}/${h.targetPunches} punches (${Math.round((h.currentPunches / h.targetPunches) * 100)}%)`
  ).join('\n');

  const systemInstruction = `You are a warm, supportive life coach for college students. You:
- Listen actively and respond to what they're saying
- Ask thoughtful follow-up questions
- Celebrate small wins
- Normalize struggles
- Give practical, actionable advice
- Remember previous conversation context
- Keep responses conversational and concise (2-4 sentences)
- Avoid being preachy or judgmental`;

  const prompt = `**Conversation so far:**
${conversationContext || 'This is the start of the conversation.'}

**Student's current message:**
"${userMessage}"

**Their habit progress:**
${habitsSummary}

**Your task:**
1. Respond naturally to what they just said
2. Provide 2-3 specific, actionable suggestions they can explore
3. Keep your message warm, concise, and conversational

**Return this JSON:**
{
  "message": "Your warm, supportive response (2-4 sentences)",
  "suggestions": [
    "Specific suggestion #1",
    "Specific suggestion #2",
    "Specific suggestion #3"
  ]
}

**Good response examples:**
{
  "message": "It sounds like you're feeling overwhelmed, and that's completely normal. What if we broke things down into smaller steps?",
  "suggestions": [
    "Start with just 5 minutes of the hardest habit",
    "Move your easiest habit to right after breakfast",
    "Give yourself permission to skip one day guilt-free"
  ]
}

{
  "message": "That's amazing progress! You're building momentum. How does it feel to see those punches adding up?",
  "suggestions": [
    "Tell me what's making this habit stick",
    "Let's talk about keeping this energy going",
    "Share what you're learning about yourself"
  ]
}

**Bad examples (don't do this):**
❌ Generic: "Good job, keep going!"
❌ Too long: [5+ sentences]
❌ Vague: "Try to be more disciplined"
❌ Not personalized: Ignoring what they just said`;

  try {
    const response = await callGemini(prompt, { 
      systemInstruction, 
      temperature: 0.85,
      maxOutputTokens: 1024
    });
    
    const parsed = parseJSON(response);
    
    // Validate response structure
    if (!parsed.message || !Array.isArray(parsed.suggestions)) {
      throw new Error('Invalid response structure');
    }
    
    // Ensure suggestions are strings and limited to 3
    parsed.suggestions = parsed.suggestions
      .filter(s => typeof s === 'string' && s.trim())
      .slice(0, 3);
    
    return parsed;
  } catch (error) {
    console.error('Error in conversational analysis:', error);
    
    // Fallback response
    return {
      message: "I'm here to listen. Tell me more about what's on your mind.",
      suggestions: [
        "Share what's been most challenging this week",
        "Tell me about a habit that's going well",
        "Let's explore what would make things easier"
      ]
    };
  }
}

// Main export that ReflectionModal uses
export async function analyzeReflection(userMessage, habits, options = {}) {
  return analyzeReflectionConversational(userMessage, habits, options);
}

// Generate habit suggestions for onboarding
export async function generateHabitSuggestions(onboardingData) {
  const systemInstruction = `You are an expert college student success coach who specializes in building sustainable habits. You understand student life - classes, exams, social life, stress, and time constraints.`;
  
  const prompt = `A college student needs help building better habits. Here's their situation:

**Their Struggles:**
${onboardingData.strugglingWith || 'General productivity and time management'}

**Current Load:**
- Taking ${onboardingData.numClasses || 'several'} classes
- Feeling overwhelmed with coursework and life balance

**Their Goals:**
${onboardingData.goals || 'Be more productive and feel less stressed'}

**Additional Context:**
${onboardingData.additionalContext || 'Typical college student schedule'}

**Your Task:**
Create 3-5 specific, actionable habits that will actually help THIS student.

Return ONLY this JSON array:
[
  {
    "title": "Specific, actionable habit name (under 50 characters)",
    "description": "One sentence explaining why this helps (under 100 characters)",
    "frequency": "daily",
    "reward": "Specific, motivating reward"
  }
]`;

  try {
    const response = await callGemini(prompt, { systemInstruction, temperature: 0.9 });
    const habits = parseJSON(response);
    return habits.map(h => ({ ...h, targetPunches: 10 }));
  } catch (error) {
    return [{
      title: "Morning Planning Ritual",
      description: "Start each day with clarity and intention",
      frequency: "daily",
      targetPunches: 10,
      reward: "Your favorite coffee or tea ☕"
    }];
  }
}

// Transform a goal into specific habits
export async function transformGoalToHabits(goalText) {
  const systemInstruction = `You are a habit formation expert who helps college students break down big goals into daily actions.`;
  
  const prompt = `Transform this goal into 2-3 specific habits: "${goalText}"

Return ONLY this JSON array:
[
  {
    "title": "Specific action (under 60 characters)",
    "description": "How this helps achieve the goal (under 120 characters)",
    "frequency": "daily"
  }
]`;

  try {
    const response = await callGemini(prompt, { systemInstruction, temperature: 0.85 });
    const habits = parseJSON(response);
    return habits.map(h => ({ ...h, targetPunches: 10 }));
  } catch (error) {
    throw error;
  }
}

// Generate reward ideas for a habit
export async function generateRewardIdeas(habitTitle, userPreferences = '') {
  const systemInstruction = `You are a motivational expert who understands what actually motivates college students.`;
  
  const prompt = `Suggest 4-5 specific rewards for completing this habit: "${habitTitle}"
${userPreferences ? `Preferences: ${userPreferences}` : ''}

Return ONLY a JSON array:
["Specific reward with emoji 🎉", "Another specific reward 🎮", ...]`;

  try {
    const response = await callGemini(prompt, { systemInstruction, temperature: 0.9 });
    return parseJSON(response);
  } catch (error) {
    return [
      "Your favorite coffee or boba drink 🧋",
      "30 minutes of guilt-free social media time 📱",
      "Order from your favorite restaurant 🍕",
      "Buy that item under $20 you've wanted 🛍️"
    ];
  }
}

// Generate color theme from description
export async function generateThemeFromDescription(description) {
  const systemInstruction = `You are a UI/UX designer who creates beautiful, harmonious color palettes.`;
  
  const prompt = `Create a color theme based on: "${description}"

Return ONLY this JSON:
{
  "name": "Creative name (2-3 words)",
  "primary": "#HEX_COLOR",
  "secondary": "#HEX_COLOR",
  "emoji": "Perfect emoji",
  "description": "One sentence description"
}`;

  try {
    const response = await callGemini(prompt, { systemInstruction, temperature: 0.95 });
    const theme = parseJSON(response);
    
    const hexRegex = /^#[0-9A-F]{6}$/i;
    return {
      name: theme.name || 'Custom',
      primary: hexRegex.test(theme.primary) ? theme.primary : '#8B5CF6',
      secondary: hexRegex.test(theme.secondary) ? theme.secondary : '#EC4899',
      emoji: theme.emoji || '⭐',
      description: theme.description || description
    };
  } catch (error) {
    return null;
  }
}

// Test Gemini connection
export async function testGeminiConnection() {
  console.log('🧪 Testing...');
  try {
    const response = await callGemini('Respond: {"status":"ok","message":"Works!"}');
    const result = parseJSON(response);
    return {
      success: true,
      message: '✅ Working!',
      model: MODELS[currentModelIndex],
      response: result
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ ${error.message}`,
      model: MODELS[currentModelIndex]
    };
  }
}

// Get API status
export function getAPIStatus() {
  return {
    hasAPIKey: !!GEMINI_API_KEY,
    currentModel: MODELS[currentModelIndex],
    availableModels: MODELS
  };
}

// Export model for statsService.js compatibility
export const model = {
  generateContent: async (prompt) => {
    const response = await callGemini(prompt);
    return {
      response: {
        text: () => response
      }
    };
  }
};