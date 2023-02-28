import { ParseHTML } from '../parser';
import { expectTypeOf } from 'expect-type';
import { test } from 'node:test';

test('attributes', () => {
  const html = `<div id="foo" class="one two"></div>`;
  type ast = ParseHTML<typeof html>;

  expectTypeOf<'foo'>().toEqualTypeOf<ast['attrs']['id']>();

  // @ts-expect-error
  expectTypeOf<string>().toEqualTypeOf<ast['attrs']['id']>();
});

test('classes', () => {
  const html = `<div id="foo" class="one two"></div>`;
  type ast = ParseHTML<typeof html>;

  expectTypeOf<['one', 'two']>().toEqualTypeOf<ast['classes']>();

  // @ts-expect-error
  expectTypeOf<['two', 'one']>().toEqualTypeOf<ast['classes']>();
});

test('element with attrs and children', () => {
  const html = `<div id="foo" class="one two"><span id="inner"></span></div>`;
  type ast = ParseHTML<typeof html>;

  // Check attributes and children
  expectTypeOf<'foo'>().toEqualTypeOf<ast['attrs']['id']>();
  expectTypeOf<['one', 'two']>().toEqualTypeOf<ast['classes']>();

  // 1 child
  expectTypeOf<1>().toEqualTypeOf<ast['children']['length']>();

  // Check child attributes
  expectTypeOf<{ id: 'inner' }>().toEqualTypeOf<ast['children'][0]['attrs']>();
  // Check child classes
  expectTypeOf<[]>().toEqualTypeOf<ast['children'][0]['classes']>();
});