
import { AIAnalysis } from "../types";

/**
 * localPerformanceAnalysis
 * Replaces external API calls with local logic to ensure the app is 
 * secure for uploading and doesn't require an external API key.
 */
export function localPerformanceAnalysis(score: number): AIAnalysis {
  let rank = "مبتدئ";
  let commentary = "بداية جيدة، لكن يمكنك فعل الأفضل!";
  let advice = "حاول التركيز على منتصف المربع دائماً.";

  if (score > 40) {
    rank = "أسطورة سيبرانية";
    commentary = "ردود فعلك تتجاوز حدود البشر! أنت مذهل.";
    advice = "ربما يجب أن تنضم لفريق النخبة العالمي.";
  } else if (score > 25) {
    rank = "نينجا الأعصاب";
    commentary = "أداء احترافي جداً. أعصابك من حديد.";
    advice = "السرعة هي مفتاحك للفوز الدائم.";
  } else if (score > 15) {
    rank = "إنسان خارق";
    commentary = "لديك سرعة بديهة ممتازة.";
    advice = "لا تدع التوتر يقلل من دقة ضغطاتك.";
  } else if (score > 5) {
    rank = "متدرب";
    commentary = "بدأت تتقن اللعبة، استمر!";
    advice = "التركيز قبل الضغط هو أهم قاعدة.";
  }

  return { rank, commentary, advice };
}
