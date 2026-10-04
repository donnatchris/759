/* eslint-disable @typescript-eslint/no-require-imports -- Tests run with the tsx CommonJS loader. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  phoneSchema,
  signUpSchema,
  signUpFormSchema,
  updateUserProfileSchema,
} = require('../src/features/auth/auth.schema.ts');

const account = {
  name: 'Camille',
  email: 'camille@example.com',
  password: 'Password123!',
  confirmPassword: 'Password123!',
  legalTermsAccepted: true,
};

for (const [name, schema] of Object.entries({
  signUpSchema,
  signUpFormSchema,
  updateUserProfileSchema,
})) {
  test(`${name} accepts a missing or cleared phone`, () => {
    assert.equal(schema.parse(account).phone, undefined);
    for (const phone of [null, '', '   ']) {
      assert.equal(schema.parse({ ...account, phone }).phone, null);
    }
  });

  test(`${name} normalizes a supplied phone and rejects invalid numbers`, () => {
    assert.equal(
      schema.parse({ ...account, phone: ' 06 12 34 56 78 ' }).phone,
      '0612345678',
    );
    for (const phone of ['123', 'abcdefghij', '0012345678', '----------']) {
      assert.equal(schema.safeParse({ ...account, phone }).success, false);
    }
  });
}

test('a cleared profile phone remains null after client and server validation', () => {
  const clientData = updateUserProfileSchema.parse({ ...account, phone: '' });
  assert.equal(updateUserProfileSchema.parse(clientData).phone, null);
  assert.equal(phoneSchema.safeParse(612345678).success, false);
});
