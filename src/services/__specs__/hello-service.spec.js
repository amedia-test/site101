import { beforeEach, describe, it, expect } from 'vitest';

import { createHelloService } from '../hello-service.js';

describe('helloService', () => {
  let helloService;
  beforeEach(() => {
    helloService = createHelloService();
  });

  describe('hello', () => {
    it('should return localized "Hello world!"', async () => {
      const result = helloService.hello('verden');

      expect(result).toStrictEqual('Hei verden!');
    });

    it('should throw if name is missing', () => {
      expect(() => helloService.hello()).toThrow('Name is required');
    });

    it('should throw if language is not supported', () => {
      expect(() => helloService.hello('world', 'ES_ES')).toThrow(
        'Language not supported'
      );
    });
  });

  describe('when using a custom i18n', () => {
    it('should return the i18n version of "Hello world!"', async () => {
      const customHelloService = createHelloService({
        ES_ES: { hello: 'Hola' },
      });

      const result = customHelloService.hello('mundo', 'ES_ES');

      expect(result).toStrictEqual('Hola mundo!');
    });
  });
});
