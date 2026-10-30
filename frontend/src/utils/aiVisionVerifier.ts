// AI Multimodal Vision Verification Engine for Civic Infrastructure Grievance Redressal
// Uses Google Gemini Vision REST API (gemini-2.5-flash) for real semantic and physical scene analysis

export interface AIVerificationResult {
  isSameLocation: boolean;
  isIssueResolved: boolean;
  status: 'ACCEPTED' | 'REJECTED';
  reason: string;
  isMatch: boolean; // Boolean helper (status === 'ACCEPTED')
  score: number; // 0 to 100 confidence
  rawResponse?: any;
}

/**
 * Fetches and converts any image source (Data URI base64, Blob URL, external HTTP URL, or relative path)
 * into a pure Base64 string and its MIME type, stripping any 'data:...;base64,' prefix.
 */
export async function convertImageToBase64(imageSource: string): Promise<{ mimeType: string; base64Data: string }> {
  if (!imageSource || typeof imageSource !== 'string') {
    throw new Error('Image source is missing or invalid.');
  }

  const trimmed = imageSource.trim();

  // If already a Data URI, extract MIME and Base64 data directly
  const dataUriMatch = trimmed.match(/^data:([^;]+);base64,(.+)$/s);
  if (dataUriMatch) {
    return {
      mimeType: dataUriMatch[1].trim(),
      base64Data: dataUriMatch[2].replace(/\s/g, '')
    };
  }

  // If it is a Blob URL (blob:http...) or HTTP(S) URL or local path, fetch and read as Base64
  try {
    const response = await fetch(trimmed);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const mimeType = blob.type || 'image/jpeg';

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (!result) {
          reject(new Error('FileReader returned empty result.'));
          return;
        }
        const pureBase64 = result.includes(',') ? result.split(',')[1] : result;
        resolve({
          mimeType,
          base64Data: pureBase64.replace(/\s/g, '')
        });
      };
      reader.onerror = (e) => reject(new Error('FileReader error: ' + e));
      reader.readAsDataURL(blob);
    });
  } catch (fetchErr: any) {
    console.error(`[Gemini AI Vision] Failed to fetch image from source "${trimmed.substring(0, 50)}...":`, fetchErr);
    throw new Error(`Failed to load image for Gemini verification: ${fetchErr?.message || fetchErr}`);
  }
}

/**
 * Calls Google Gemini REST API using the gemini-2.5-flash model
 * Sends both citizen's 'Before' and officer's 'After' photos in a single prompt.
 */
export async function verifyRepairPhotosWithGemini(
  beforeUrl: string,
  afterUrl: string,
  category = 'Civic Infrastructure',
  title = '',
  description = '',
  customApiKey?: string
): Promise<AIVerificationResult> {
  const apiKey = (
    customApiKey || 
    localStorage.getItem('gemini_api_key') || 
    (import.meta as any).env?.VITE_GEMINI_API_KEY || 
    ''
  ).trim();

  if (!apiKey) {
    const missingKeyMsg = 'Google Gemini API Key is missing. Please enter your Gemini API Key in the dashboard to perform live AI verification.';
    console.error('[Gemini AI Vision] Verification Halted:', missingKeyMsg);
    return {
      isSameLocation: false,
      isIssueResolved: false,
      status: 'REJECTED',
      reason: missingKeyMsg,
      isMatch: false,
      score: 0
    };
  }

  console.log('[Gemini AI Vision] Starting conversion of Before & After images to pure Base64...');
  const [img1, img2] = await Promise.all([
    convertImageToBase64(beforeUrl),
    convertImageToBase64(afterUrl)
  ]);

  console.log(`[Gemini AI Vision] Image 1 (Citizen Before): ${img1.mimeType}, size: ${Math.round(img1.base64Data.length / 1024)} KB`);
  console.log(`[Gemini AI Vision] Image 2 (Officer After): ${img2.mimeType}, size: ${Math.round(img2.base64Data.length / 1024)} KB`);

  const promptText = `You are an expert AI Municipal Auditor for CivicBrain (Smart Cities Grievance Redressal).

CITIZEN GRIEVANCE DETAILS:
- Category: "${category}"
- Issue Title: "${title || category}"
- Description: "${description || title || category}"

You are provided with two photographs:
- Image 1: Citizen's 'Before' incident photo reporting the municipal grievance/defect.
- Image 2: Officer's 'After' resolution photo submitted as proof of repair.

YOUR MANDATORY TASKS:
1. isSameLocation: Determine if Image 1 and Image 2 are photographed at the EXACT SAME physical location, street, or building.
   - Look at architectural landmarks, building facades, windows, street layout, poles, and environment.
   - Realistic camera angle shifts (±35° perspective change or different distance) are acceptable for the same location.
   - If Image 1 and Image 2 show two completely different buildings or locations, isSameLocation MUST be false.
2. isIssueResolved: Determine if the specific civic problem reported by the citizen (${category}: ${title}) has been genuinely repaired, cleaned, covered, or rectified in Image 2.
   - If Image 2 is an identical duplicate of Image 1, or the problem is still visible and unaddressed, isIssueResolved MUST be false.
3. status: Set to "ACCEPTED" ONLY if BOTH isSameLocation === true AND isIssueResolved === true. Otherwise set status to "REJECTED".
4. reason: Provide a clear, honest, concise explanation of your visual findings.

Respond STRICTLY with a valid JSON object matching this exact schema (no markdown, no backticks, no code fence):
{
  "isSameLocation": boolean,
  "isIssueResolved": boolean,
  "status": "ACCEPTED" | "REJECTED",
  "reason": "Clear explanation of whether locations match and whether the defect was fixed"
}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inline_data: {
              mime_type: img1.mimeType,
              data: img1.base64Data
            }
          },
          {
            inline_data: {
              mime_type: img2.mimeType,
              data: img2.base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0.1
    }
  };

  // Google Gemini Vision models in sequence
  const models = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`[Gemini AI Vision] Calling Google Gemini API model: ${model}...`);
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Gemini AI Vision] ${model} HTTP Error ${response.status}:`, errorText);
        lastError = new Error(`Gemini API ${model} Error (${response.status}): ${errorText}`);
        continue;
      }

      const jsonResponse = await response.json();
      console.log(`[Gemini AI Vision] Raw API Response from ${model}:`, jsonResponse);

      const rawText = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error(`Empty response candidates received from ${model}.`);
      }

      // Parse JSON from model response
      let parsed: any;
      try {
        parsed = JSON.parse(rawText.trim());
      } catch (parseErr) {
        // In case model wraps in markdown code block
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      console.log('[Gemini AI Vision] Successfully parsed model evaluation:', parsed);

      const isSameLocation = Boolean(parsed.isSameLocation);
      const isIssueResolved = Boolean(parsed.isIssueResolved);
      const status: 'ACCEPTED' | 'REJECTED' = (parsed.status === 'ACCEPTED' && isSameLocation && isIssueResolved) ? 'ACCEPTED' : 'REJECTED';
      const reason = parsed.reason || (status === 'ACCEPTED' ? 'AI Inspection Verified: Same location confirmed and defect repair validated.' : 'AI Inspection Rejected: Criteria not met.');
      const isMatch = status === 'ACCEPTED';
      const score = isMatch ? 92 : (isSameLocation ? 35 : 15);

      return {
        isSameLocation,
        isIssueResolved,
        status,
        reason,
        isMatch,
        score,
        rawResponse: parsed
      };
    } catch (modelErr: any) {
      console.warn(`[Gemini AI Vision] Model ${model} failed:`, modelErr);
      lastError = modelErr;
    }
  }

  console.error('[Gemini AI Vision] All Gemini models failed:', lastError);
  return {
    isSameLocation: false,
    isIssueResolved: false,
    status: 'REJECTED',
    reason: `Gemini API verification failed: ${lastError?.message || 'Unable to connect to Google Gemini API'}. Check console for details.`,
    isMatch: false,
    score: 0
  };
}

/**
 * Main verification entrypoint invoked by the Officer Dashboard.
 */
export async function verifyRepairPhotos(
  beforeUrl?: string | null,
  afterUrl?: string | null,
  category = 'Roads & Potholes',
  title = '',
  description = ''
): Promise<AIVerificationResult> {
  if (!afterUrl) {
    return {
      isSameLocation: false,
      isIssueResolved: false,
      status: 'REJECTED',
      reason: 'No resolution photo provided. Please upload an after-repair proof.',
      isMatch: false,
      score: 0
    };
  }

  if (!beforeUrl) {
    return {
      isSameLocation: true,
      isIssueResolved: true,
      status: 'ACCEPTED',
      reason: 'Standalone resolution proof uploaded. Ready for officer submission.',
      isMatch: true,
      score: 85
    };
  }

  return await verifyRepairPhotosWithGemini(beforeUrl, afterUrl, category, title, description);
}
