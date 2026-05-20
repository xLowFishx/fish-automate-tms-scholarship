import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeFormData } from './index';

test('sanitizeFormData removes blank keys and trims values', () => {
  assert.deepEqual(
    sanitizeFormData([
      { key: ' username ', value: ' alice ' },
      { key: '   ', value: 'ignore me' },
      { key: 'scholarship', value: ' STEM ' },
    ]),
    {
      username: 'alice',
      scholarship: 'STEM',
    },
  );
});
