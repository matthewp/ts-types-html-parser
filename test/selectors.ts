import { ParseFragment, GetSelectors } from '../parser';
import { expectTypeOf } from 'expect-type';
import { test } from 'node:test';

test('selectors', () => {
  const html = `
    <div id="foo" class="one two">
      <span id="inner"></span>
    </div>
  `;
  type frag = ParseFragment<typeof html>;
  type sel = GetSelectors<frag>;

  expectTypeOf<"#foo" | ".one" | ".two" | "#inner">()
    .toEqualTypeOf<sel>();

  // @ts-expect-error
  expectTypeOf<string>().toEqualTypeOf<sel>();
});