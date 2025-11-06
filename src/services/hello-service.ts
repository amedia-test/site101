import { extendedLogger } from '../logger.js';

interface I18nTranslation {
  hello: string;
}

interface I18nConfig {
  [key: string]: I18nTranslation;
}

const DEFAULT_I18N: I18nConfig = {
  NB_NO: { hello: 'Hei' },
  EN_US: { hello: 'Hello' },
};

/**
 * Creates a hello service that can greet users in different languages
 */
export function createHelloService(i18n: I18nConfig = DEFAULT_I18N) {
  /**
   * Greets a user in the specified language
   */
  function hello(name: string, lang = 'NB_NO'): string {
    if (!name) {
      throw Error('Name is required');
    }
    if (!i18n[lang]) {
      throw Error('Language not supported');
    }
    extendedLogger().info(`Saying hello to ${name} in ${lang}`);
    return `${i18n[lang].hello} ${name}!`;
  }

  return {
    hello,
  };
}
