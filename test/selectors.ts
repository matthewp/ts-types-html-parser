import { GetSelectors } from '../parser';
import { expectTypeOf } from 'expect-type';
import { test } from 'node:test';

test('selectors', () => {
  const html = `
    <div id="foo" class="one two">
      <span id="inner"></span>
    </div>
  `;
  type sel = GetSelectors<typeof html>;

  expectTypeOf<"#foo" | ".one" | ".two" | "#inner">()
    .toEqualTypeOf<sel>();

  // @ts-expect-error
  expectTypeOf<string>().toEqualTypeOf<sel>();
});

test('deeper', () => {
  const html = `
    <div class="counter">
      Count is <span id="count"></span>
      <button type="button" id="inc">Increment</button>
    </div>
  `;
  type sel = GetSelectors<typeof html>;

  expectTypeOf<".counter" | "#count" | "#inc">()
  .toEqualTypeOf<sel>();

  // @ts-expect-error
  expectTypeOf<string>().toEqualTypeOf<sel>();
});

