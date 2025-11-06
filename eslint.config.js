import { eslintConfig } from '@amedia/kragl/eslint-config';

// https://github.com/amedia/eslint-config-amedia/blob/master/packages/eslint-config/README.md
export default eslintConfig(
  {},
  {
    ignores: ['coverage/'],
  }
);
