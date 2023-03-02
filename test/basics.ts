import { ParseFragment } from '../parser';
import { expectTypeOf } from 'expect-type';
import { test } from 'node:test';

test('attributes', () => {
  const html = `<div id="foo" class="one two"></div>`;
  type ast = ParseFragment<typeof html>;
  type el = ast['children'][0];

  expectTypeOf<'foo'>().toEqualTypeOf<el['attrs']['id']>();

  // @ts-expect-error
  expectTypeOf<string>().toEqualTypeOf<ast['attrs']['id']>();
});

test('classes', () => {
  const html = `<div id="foo" class="one two"></div>`;
  type ast = ParseFragment<typeof html>;
  type el = ast['children'][0];

  expectTypeOf<['one', 'two']>().toEqualTypeOf<el['classes']>();

  // @ts-expect-error
  expectTypeOf<['two', 'one']>().toEqualTypeOf<el['classes']>();
});

test('element with attrs and children', () => {
  const html = `
    <div id="foo" class="one two">
      <span id="inner1">
        <span class="inner2"></span>
      </span>
    </div>
  `;
  type ast = ParseFragment<typeof html>;
  type el = ast['children'][0];

  // Check attributes and children
  expectTypeOf<'foo'>().toEqualTypeOf<el['attrs']['id']>();
  expectTypeOf<['one', 'two']>().toEqualTypeOf<el['classes']>();

  // 1 child
  expectTypeOf<2>().toEqualTypeOf<el['children']['length']>();

  // Check child attributes
  expectTypeOf<{ id: 'inner1' }>().toEqualTypeOf<el['children'][1]['attrs']>();
  // Check child classes
  expectTypeOf<[]>().toEqualTypeOf<el['children'][1]['classes']>();
});