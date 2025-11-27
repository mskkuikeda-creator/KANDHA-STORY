
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { Character, Language } from '../App';

// Fix: Aligned with Gemini API guidelines by initializing the client directly with the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GlossaryItem {
  term: string;
  definition: string;
}

export async function generateStory(
  topic: string, 
  storyLength: number, 
  negativePrompt: string, 
  characters: Character[], 
  language: Language,
  theme: string,
  customThemeStyle?: string
): Promise<string> {
  const model = 'gemini-2.5-pro';

  const themePrompts: Record<string, { odia: string, sambalpuri: string }> = {
    motivation: { odia: "ପ୍ରେରଣାଦାୟକ", sambalpuri: "ପ୍ରେରଣାଦାୟକ" },
    love: { odia: "ପ୍ରେମ ଏବଂ ଭାବପ୍ରବଣ", sambalpuri: "ପ୍ରେମ ଆଉ ଭାବପ୍ରବଣ" },
    suspense: { odia: "ରହସ୍ୟମୟ ଏବଂ ଉତ୍କଣ୍ଠାପୂର୍ଣ୍ଣ", sambalpuri: "ରହସ୍ୟମୟ" },
    horror: { odia: "ଭୟାନକ ଏବଂ ଡର", sambalpuri: "ଭୟାନକ" },
    adventure: { odia: "ଦୁଃସାହସିକ ଯାତ୍ରା", sambalpuri: "ଦୁଃସାହସିକ" },
    comedy: { odia: "ହାସ୍ୟରସାତ୍ମକ", sambalpuri: "ହସମଜା" },
    mythology: { odia: "ପୌରାଣିକ ତଥା ଲୋକକଥା ଭିତ୍ତିକ", sambalpuri: "ପୌରାଣିକ ଆଉ ଲୋକକଥା" },
    historical: { odia: "ଐତିହାସିକ", sambalpuri: "ଐତିହାସିକ" },
    folklore: { odia: "ଲୋକକଥା", sambalpuri: "ଲୋକକଥା" },
    educational: { odia: "ଶିକ୍ଷଣୀୟ", sambalpuri: "ଶିଖ୍‌ବାର୍ କଥା" },
  };

  let selectedThemeOdia = "";
  let selectedThemeSambalpuri = "";

  if (theme === 'custom' && customThemeStyle) {
      selectedThemeOdia = customThemeStyle;
      selectedThemeSambalpuri = customThemeStyle;
  } else {
      const t = themePrompts[theme] || themePrompts['motivation'];
      selectedThemeOdia = t.odia;
      selectedThemeSambalpuri = t.sambalpuri;
  }

  const negativePromptSection = negativePrompt.trim()
    ? language === 'odia'
      ? `
    ନିମ୍ନଲିଖିତ ବିଷୟବସ୍ତୁ କିମ୍ବା ଉପାଦାନଗୁଡ଼ିକୁ କାହାଣୀରେ କଦାପି ଅନ୍ତର୍ଭୁକ୍ତ କରନ୍ତୁ ନାହିଁ:
    "${negativePrompt}"
    `
      : `
    ତଲେ ଦିଆଯାଇଥିବାର୍ ବିଷୟବସ୍ତୁ କିମ୍ବା ଉପାଦାନମାନଙ୍କୁ କାହାନୀରେ କେଭେ ବି ସାମିଲ ନାଇଁ କରବେ:
    "${negativePrompt}"
    `
    : '';

  const characterSection = characters.length > 0 && characters.some(c => c.name.trim() || c.bio.trim())
    ? language === 'odia'
      ? `
    କାହାଣୀରେ ନିମ୍ନଲିଖିତ ଚରିତ୍ରଗୁଡ଼ିକୁ ସାମିଲ କରନ୍ତୁ ଏବଂ ସେମାନଙ୍କର ବର୍ଣ୍ଣିତ ବ୍ୟକ୍ତିତ୍ୱ ଓ ଗୁଣଗୁଡ଼ିକୁ ସ୍ଥିର ରଖନ୍ତୁ |${characters.filter(c => c.name.trim() || c.bio.trim()).map(char => `\n- ନାମ: ${char.name}\n  - ପରିଚୟ: ${char.bio}`).join('')}
    `
      : `
    କାହାନୀରେ ତଲେ ଦିଆଯାଇଥିବାର୍ ଚରିତ୍ରମାନଙ୍କୁ ସାମିଲ କରୁନ୍ ଆଉ ସେମାନକଁର୍ ବର୍ଣ୍ଣନା କରାଯାଇଥିବାର୍ ବ୍ୟକ୍ତିତ୍ୱ ଆଉ ଗୁଣମାନଙ୍କୁ ଠିକ୍ ରଖବେ |${characters.filter(c => c.name.trim() || c.bio.trim()).map(char => `\n- ନାଁ: ${char.name}\n  - ପରିଚୟ: ${char.bio}`).join('')}
    `
    : '';
  
  const odiaPrompt = `
    ଓଡ଼ିଆ ଭାଷାରେ ଓଡ଼ିଶାର କନ୍ଧ ଜନଜାତିର ଜଣେ ସଦସ୍ୟ ଭାବରେ, ନିଜର ଅନୁଭୂତିରୁ ଏକ ${selectedThemeOdia} କାହାଣୀ ଲେଖନ୍ତୁ | ଆପଣ ନିଜେ କନ୍ଧ ହୋଇ କାହାଣୀଟିକୁ ବର୍ଣ୍ଣନା କରନ୍ତୁ | ଏହି କାହାଣୀଟି ପ୍ରାୟ ${storyLength} ଶବ୍ଦର ହେବା ଉଚିତ ଏବଂ ଫେସବୁକରେ ଭାଇରାଲ ହେବା ପାଇଁ ଉପଯୁକ୍ତ ହେବା ଆବଶ୍ୟକ |

    କାହାଣୀର ବିଷୟବସ୍ତୁ: "${topic}"
    କାହାଣୀର ଶୈଳୀ (Theme): ${selectedThemeOdia}
    ${characterSection}
    କାହାଣୀରେ ନିମ୍ନଲିଖିତ ଦିଗଗୁଡ଼ିକ ଉପରେ ଧ୍ୟାନ ଦିଅନ୍ତୁ:
    ୧. କନ୍ଧ ସମ୍ପ୍ରଦାୟର ସଂସ୍କୃତି, ପରମ୍ପରା, ଏବଂ ଜୀବନଶୈଳୀର ସଠିକ୍ ଚିତ୍ରଣ |
    ୨. ପ୍ରକୃତି (ଜଙ୍ଗଲ, ପାହାଡ଼, ଝରଣା) ସହିତ ସେମାନଙ୍କର ଗଭୀର ସମ୍ପର୍କ |
    ୩. ଚରିତ୍ରଗୁଡ଼ିକ ଜୀବନ୍ତ ଏବଂ ସମ୍ବେଦନଶୀଳ ହେବା ଆବଶ୍ୟକ |
    ୪. କାହାଣୀର ଭାଷା ସରଳ, ସୁନ୍ଦର, ଏବଂ ସାବଲୀଳ ହେବା ଉଚିତ ଯାହା ସାଧାରଣ ପାଠକଙ୍କୁ ଆକର୍ଷିତ କରିବ |
    ୫. ଏକ ଶକ୍ତିଶାଳୀ ବାର୍ତ୍ତା ରହିବା ଦରକାର, ଯେପରିକି ଏକତା, ସାହସ, ପରମ୍ପରାର ସୁରକ୍ଷା କିମ୍ବା ଆଧୁନିକତା ଏବଂ ପରମ୍ପରା ମଧ୍ୟରେ ସନ୍ତୁଳନ |
    ୬. କାହାଣୀଟି ସଂପୂର୍ଣ୍ଣ ସୁରକ୍ଷିତ ଏବଂ ପାରିବାରିକ ପାଠକଙ୍କ ପାଇଁ ଉପଯୁକ୍ତ ହେବା ଆବଶ୍ୟକ। କୌଣସି ଅଶ୍ଳୀଳ କିମ୍ବା ଆପତ୍ତିଜନକ ବିଷୟବସ୍ତୁ ରହିବା ଉଚିତ ନୁହେଁ।
    ୭. ଲେଖାର ଶୈଳୀ ଏପରି ହେବା ଦରକାର ଯେପରି ଜଣେ କନ୍ଧ ବ୍ୟକ୍ତି ନିଜର ମନର କଥା କହୁଛନ୍ତି । ଆପଣଙ୍କ ଲେଖାରେ ନିଜସ୍ୱ ଭାବନା ଏବଂ ଆନ୍ତରିକତା ରହିବା ଉଚିତ ।
    ${negativePromptSection}
    କାହାଣୀଟିକୁ ଏକ ଆକର୍ଷଣୀୟ ଶୀର୍ଷକ ଦିଅନ୍ତୁ |
  `;

  const sambalpuriPrompt = `
    ସମ୍ବଲପୁରୀ ଭାଷାରେ ଓଡ଼ିଶାର କନ୍ଧ ଜନଜାତିର୍ ଜଣେ ସଦସ୍ୟ ହିସାବେ, ନିଜର୍ ଅନୁଭୂତିରୁ ଗୁଟେ ${selectedThemeSambalpuri} କାହାନୀ ଲେଖୁନ୍ | ତମେ ନିଜେ କନ୍ଧ ହେଇକରି କାହାନୀଟା ବର୍ଣ୍ଣନା କରୁନ୍ | ଇ କାହାଣୀଟା ପ୍ରାୟ ${storyLength} ଶବ୍ଦର ହେବା ଦରକାର ଆଉ ଫେସବୁକରେ ଭାଇରାଲ ହେବାର୍ ଲାଗି ଠିକ୍ ହେବା କଥା |

    କାହାନୀର୍ ବିଷୟବସ୍ତୁ: "${topic}"
    କାହାନୀର୍ ଶୈଳୀ (Theme): ${selectedThemeSambalpuri}
    ${characterSection}
    କାହାନୀରେ ତଲେ ଦିଆଯାଇଥିବାର୍ ଦିଗମାନକଁର୍ ଉପରେ ଧ୍ୟାନ ଦେଉନ୍:
    ୧. କନ୍ଧ ସମ୍ପ୍ରଦାୟର୍ ସଂସ୍କୃତି, ପରମ୍ପରା, ଆଉ ଜୀବନଶୈଳୀର୍ ସଠିକ୍ ଚିତ୍ରଣ |
    ୨. ପ୍ରକୃତି (ଜଙ୍ଗଲ, ପାହାଡ଼, ଝରଣା) ସାଙ୍ଗେ ସେମାନକଁର୍ ଗଭୀର ସମ୍ପର୍କ |
    ୩. ଚରିତ୍ରମାନେ ଜୀବନ୍ତ ଆଉ ସମ୍ବେଦନଶୀଳ ହେବେ |
    ୪. କାହାନୀର୍ ଭାଷା ସରଳ, ସୁନ୍ଦର, ଆଉ ସହଜ ହେବା ଦରକାର ଯେନ୍ଟା ସାଧାରଣ ପାଠକମାନଙ୍କୁ ଆକର୍ଷିତ କରବା |
    ୫. ଗୁଟେ ଶକ୍ତିଶାଳୀ ବାର୍ତ୍ତା ରହେବା ଦରକାର, ଯେନ୍ତାକି ଏକତା, ସାହସ, ପରମ୍ପରାର୍ ସୁରକ୍ଷା କିମ୍ବା ଆଧୁନିକତା ଆଉ ପରମ୍ପରା ଭିତରେ ସନ୍ତୁଳନ |
    ୬. କାହାନୀଟା ସବୁ ବର୍ଗର୍ ଲୋକଙ୍କର ଲାଗି ଉପଯୁକ୍ତ ହେବା ଦରକାର। ଇଥିରେ କୌଣସି ଖରାପ କିମ୍ବା ଅଶ୍ଳୀଳ କଥା ନାଇଁ ରହେବା କଥା।
    ୭. ଲେଖାର୍ ଶୈଳୀ ଏନ୍ତା ହେବା ଦରକାର ଯେନ୍ତା ଜଣେ କନ୍ଧ ଲୋକ ନିଜର୍ ମନର୍ କଥା କହୁଛେ । ତମର୍ ଲେଖା ଥି ନିଜର୍ ଭାବନା ଆଉ ଆନ୍ତରିକତା ରହେବା କଥା ।
    ${negativePromptSection}
    କାହାନୀକେ ଗୁଟେ ସୁନ୍ଦର୍ ଶୀର୍ଷକ ଦେଉନ୍ |
  `;
  
  const prompt = language === 'odia' ? odiaPrompt : sambalpuriPrompt;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating story:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Story generation failed. The API returned an error: ${message}`);
  }
}

async function getEnglishPromptForImage(story: string, characters: Character[]): Promise<string> {
  const model = 'gemini-2.5-flash';

  const characterPromptSection = characters.length > 0 && characters.some(c => c.name.trim() || c.bio.trim())
    ? `
    Here are the character descriptions provided by the user. Ensure the visual representation in the image prompt strongly aligns with these bios. If the story mentions these characters, prioritize these descriptions for their appearance, clothing, and demeanor.
    ${characters.filter(c => c.name.trim() || c.bio.trim()).map(char => `- ${char.name}: ${char.bio}`).join('\n')}
    `
    : '';
  
  const prompt = `
    Analyze the following story (in Odia or Sambalpuri) and generate a detailed, descriptive, and visually rich prompt in English for an AI image generator. The prompt should be a single paragraph that paints a clear picture for the image generation model.

    **CRITICAL SAFETY INSTRUCTIONS:**
    - The generated image prompt MUST be completely SAFE for all audiences (Family Friendly/PG).
    - STRICTLY EXCLUDE any references to nudity, sexual organs, sexual acts, violence, gore, or disturbing imagery, even if the source story contains them.
    - If the story involves nudity or explicit elements, you MUST modify the description to depict characters in traditional, modest Kandha attire (e.g., woven shawls, sarees, dhotis).
    - Do not use words that might trigger safety filters (e.g., 'naked', 'bare', 'blood', 'kill' in a graphic context).

    ${characterPromptSection}

    Extract the following key visual elements from the story, sanitizing them as per the safety instructions above:
    1.  **Main Subject:** Describe the main character(s) in high detail (facial features, skin texture, expression). Include their approximate age, gender, and any specific actions. **If characters are defined above, their visual description must match their bio.**
    2.  **Setting:** Describe the environment with attention to textures and small details (e.g., moss on rocks, sunlight filtering through leaves, dust motes in the air). Is it a dense jungle, a vibrant village, by a sparkling river?
    3.  **Atmosphere & Lighting:** Describe the mood and specific lighting conditions (e.g., golden hour, soft moonlight, dramatic shadows, cinematic lighting).
    4.  **Cultural Clothing & Adornments:** Pay close attention to specific Kandha tribal clothing (patterns, textures of fabric). Detail traditional jewelry like coin necklaces, brass bangles, or hair ornaments. **Ensure all figures are modestly clothed.**
    5.  **Rituals & Objects:** Identify any rituals or objects. Describe materials (wood, brass, clay) and textures.

    Combine these elements into a cohesive, evocative, and highly descriptive paragraph suitable for generating an 8k hyper-realistic image.

    Story:
    ---
    ${story}
    ---

    Detailed English Image Prompt:
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating image prompt:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Image description generation failed. The API returned an error: ${message}`);
  }
}

export async function generateImageForStory(story: string, aspectRatio: string, characters: Character[]): Promise<string> {
    const imagePrompt = await getEnglishPromptForImage(story, characters);
    const detailedPrompt = `
      Create a stunning, 8k resolution, hyper-realistic image based on this description: "${imagePrompt}".

      **Visual Quality & Style:**
      - **Resolution:** 8k, highly detailed, sharp focus, masterpiece quality.
      - **Realism:** Hyper-realistic, photorealistic texture, lifelike details.
      - **Lighting:** Cinematic, dramatic lighting, HDR, ray tracing, volumetric lighting for depth.
      - **Composition:** A well-composed, epic scene with high detail and a sense of depth. Rule of thirds.
      - **Color Palette:** Rich, natural colors, vibrant yet grounded in reality, color graded.

      **Core Focus:**
      - **Emotional Essence:** Capture the predominant mood of the story (e.g., courage, joy, serenity, struggle). The character's expression should be the focal point.
      - **Cultural Authenticity:** Depict the Kandha tribe of Odisha with deep respect and accuracy. Pay close attention to details of their traditional attire (textiles, patterns), jewelry (coin necklaces, brass ornaments), and the natural environment of the Eastern Ghats (Sal trees, hills). Avoid stereotypes.
      - **Safety & Modesty:** Ensure the image is family-friendly. Depict subjects in modest traditional attire.

      The final image must be a beautiful, dignified, and powerful representation suitable for a viral social media post that celebrates Kandha culture.
    `;

    const generate = async (prompt: string) => {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: aspectRatio,
                outputMimeType: 'image/png',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("Image generation failed. The API did not return an image.");
        }
    };

    try {
        return await generate(detailedPrompt);
    } catch (error: any) {
        console.error("Error generating image:", error);
        
        // Check for safety/responsible AI errors (usually 400 or specific error messages)
        const errorMessage = error.message || "";
        if (errorMessage.includes("sensitive words") || errorMessage.includes("Responsible AI") || errorMessage.includes("400")) {
            console.warn("Primary image prompt triggered safety filters. Attempting fallback with a sanitized prompt.");
            
            const safeFallbackPrompt = `
                A beautiful, photorealistic 8k wide shot of a Kandha tribal village in the Eastern Ghats of Odisha. 
                People in traditional, modest tribal attire are gathered peacefully under a large Banyan tree. 
                Golden hour sunlight filters through the leaves, creating cinematic lighting. 
                The scene is serene, culturally rich, and respectful with high detail textures. 
                Masterpiece quality, HDR, sharp focus.
            `;
            
            try {
                return await generate(safeFallbackPrompt);
            } catch (fallbackError: any) {
                console.error("Fallback image generation also failed:", fallbackError);
                 throw new Error(`Image generation failed due to safety filters: ${errorMessage}`);
            }
        }

        throw new Error(`Image generation failed. The API returned an error: ${errorMessage}`);
    }
}

export async function editImage(base64ImageData: string, mimeType: string, prompt: string): Promise<string> {
  const model = 'gemini-2.5-flash-image';
  
  try {
    const imagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: mimeType,
      },
    };
    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Image editing failed. The API did not return an edited image.");

  } catch (error) {
    console.error("Error editing image:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Image editing failed. The API returned an error: ${message}`);
  }
}

export async function transcribeAudio(base64AudioData: string, mimeType: string): Promise<string> {
    const model = 'gemini-2.5-flash';

    const audioPart = {
        inlineData: {
            mimeType: mimeType,
            data: base64AudioData,
        },
    };

    const textPart = {
        text: "Transcribe this audio recording.",
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [audioPart, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error("Error transcribing audio:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(`Audio transcription failed. The API returned an error: ${message}`);
    }
}

export async function extractGlossaryTerms(story: string): Promise<GlossaryItem[]> {
  const model = 'gemini-2.5-flash';
  const prompt = `
    From the following story (in Odia or Sambalpuri), identify 5-10 key cultural terms, traditional items, or specific dialect words that are significant to the Kandha tribe or the story context. 
    
    Return a JSON array of objects, where each object has:
    - "term": The word or phrase exactly as it appears in the story (in Odia script).
    - "definition": A short, clear explanation of the term in English.

    Story:
    ---
    ${story}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING, description: "The term in Odia script" },
              definition: { type: Type.STRING, description: "English definition" }
            },
            required: ['term', 'definition']
          }
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error extracting glossary terms:", error);
    return [];
  }
}

export async function generatePronunciation(word: string): Promise<string> {
  const model = "gemini-2.5-flash-preview-tts";
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: word }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // A standard Odia voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    } else {
      throw new Error("Pronunciation generation failed. The API did not return audio data.");
    }
  } catch (error) {
    console.error(`Error generating pronunciation for "${word}":`, error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Pronunciation generation failed. The API returned an error: ${message}`);
  }
}

export async function generateStoryNarration(text: string): Promise<string> {
  const model = "gemini-2.5-flash-preview-tts";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Using 'Kore' as a suitable voice option
          },
        },
        // System instruction to guide the tone of the narration
        systemInstruction: "You are a storyteller from the Kandha tribe of Odisha. Speak with warmth, pride, and authenticity, as if sharing the stories of your own people. Speak clearly, with emotion and appropriate pacing.",
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    } else {
      throw new Error("Story narration generation failed. The API did not return audio data.");
    }
  } catch (error) {
    console.error("Error generating story narration:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Narration generation failed. The API returned an error: ${message}`);
  }
}

export async function generateImageFromPrompt(userPrompt: string, aspectRatio: string): Promise<string> {
  const model = 'gemini-2.5-flash';
  
  let finalPrompt = userPrompt;

  // Refine prompt to ensure high quality and safety
  try {
     const prompt = `
        You are an expert image prompt generator.
        Convert the following user input (which may be in Odia or English) into a detailed, high-quality English prompt for an AI image generator (Imagen).
        
        Input: "${userPrompt}"
        
        Rules:
        1. Translate to English if needed.
        2. Enhance visual details (lighting, texture, mood).
        3. Ensure safety (PG, no violence/nudity).
        4. Maintain cultural respect for Kandha tribe if relevant.
        5. Return ONLY the prompt text.
     `;
     const result = await ai.models.generateContent({
         model: model,
         contents: prompt
     });
     if (result.text) {
         finalPrompt = result.text.trim();
     }
  } catch (e) {
      console.warn("Prompt refinement failed, using original", e);
  }

  // Generate
  try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: {
            numberOfImages: 1,
            aspectRatio: aspectRatio,
            outputMimeType: 'image/png',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } else {
        throw new Error("No image returned.");
    }
  } catch (error: any) {
      console.error("Custom image generation error", error);
      const msg = error.message || "";
      if (msg.includes("400") || msg.includes("safety") || msg.includes("sensitive")) {
          throw new Error("Prompt triggered safety filters. Please try a different description.");
      }
      throw new Error(`Image generation failed: ${msg}`);
  }
}
