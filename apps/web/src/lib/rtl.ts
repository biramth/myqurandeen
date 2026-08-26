const RTL_LANGUAGES = new Set(["ar", "ur", "fa", "he", "ps", "sd"]);

export function isRtlLanguage(languageCode: string): boolean {
  return RTL_LANGUAGES.has(languageCode.toLowerCase());
}
