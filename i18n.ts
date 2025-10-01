
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Supported languages: English, Romanian, Danish, German, French, Dutch
  const supportedLocales = ['en', 'ro', 'da', 'de', 'fr', 'nl'];
  if (!locale || !supportedLocales.includes(locale as string)) {
    locale = 'en'; // Default to English for international audience
  }

  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
