// Utilities
declare namespace util {
  type identity<T> = T;
  type flatten<T extends object> = identity<{ [k in keyof T]: T[k] }>;
  type extendShape<A, B> = flatten<Omit<A, keyof B> & B>;

  type whitespaceChar = ' ' | '\n' | '\t';

  type startsWithWhitepace<T> = T extends `${whitespaceChar}${infer _H}`
    ? true : false;

  type trimStart<T extends string> = T extends `${whitespaceChar}${infer H}`
    ? trimStart<H>
    : T;
  type trimEnd<T> = T extends `${infer H}${whitespaceChar}`
    ? trimEnd<H> 
    : T;
  type trim<T extends string> = trimEnd<trimStart<T>>;
}

type NodeType = 1 | 3 | 11 | 99;

type ElementNode<T extends string> = {
  nodeType: 1;
  tag: T;
  attrs: {
      [n: string]: string;
  },
  classes: readonly string[];
  children: Node[];
};
type TextNode<T extends string> = {
  nodeType: 3;
  data: T;
} & {};
type FragmentNode<C extends Node[]> = {
  nodeType: 11;
  children: C;
};
type DebugNode<T extends string> = {
  nodeType: 99;
  data: T;
}

type Node = ElementNode<any> | TextNode<any> | DebugNode<any>;

// HTML parser
declare namespace parser {
  type isEndTag<S extends string> = S extends `</${infer _A}` ? true : false;
  type isAfterEndBracket<S extends string> = S extends `${infer _A}>${infer _B}` ? true : false;
}

type AddAttr<A, N extends string, V> = util.extendShape<A, { [k in N]: V }>;

type ParseFragment<T> = T extends string
  ? FragmentNode<[TagStart<util.trimStart<T>>]>
  : never;
type TagStart<S> = S extends `<${infer T} ${infer A}`
    ? Classes<Children<ElementNode<T>, A>, A>
    : S extends `<${infer T}>${infer _C}` ? DebugNode<T> : DebugNode<never>;

// Attributes
type Attributes<H, S> = util.extendShape<H, { attrs: ParseAttribute<{}, S> }>;
type ParseAttribute<A, S> = S extends `${infer N}="${infer V}"${infer R}` ? ParseAttribute<AddAttr<A, N, V>, util.trimStart<R>>  : A;

// Classes
type Classes<H, S> = util.extendShape<H, { classes: ParseClasses<S> }>;
type ParseClasses<S> = S extends `${infer B}class="${infer C}"${infer R}`
  ? parser.isAfterEndBracket<B> extends true ? [] : ParseClassList<[], C> : [];
type ParseClassList<C extends readonly string[], S> = S extends `${infer A} ${infer B}` ? ParseClassList<[B, ...C], A> : [S, ...C];

// Fragment
type Children<H, S extends string> = S extends `${infer A}>${infer R}`
    ? Attributes<util.extendShape<H, { children: Fragment<R> }>, A>
    : never; // TODO;
type Fragment<S extends string, N extends Node[] = []> =
    parser.isEndTag<S> extends true ? N
    :
        S extends `<${infer _A}`
            // Child is an element
            ? [...N, TagStart<S>]
            // Child is text
            : S extends `${infer R}${util.trimStart<S>}`
              ? Fragment<util.trimStart<S>, [...N, TextNode<R>]>
              : N;

// Extras
type getElementChildren<T extends ElementNode<any> | FragmentNode<any>> = Extract<T['children'][number], { nodeType: 1 }>;
type appendId<B, T extends ElementNode<any>> = T extends { attrs: { id: string } }
  ? B | `#${T['attrs']['id']}` : B;
type appendClasses<B, T extends ElementNode<any>> = B | `.${T['classes'][number]}`;
type getSelectors<B, T extends ElementNode<any> | FragmentNode<any>> =
  T extends ElementNode<any>
    // Elements
    ? getElementChildren<T> extends never
      ? appendClasses<appendId<B, T>, T>
      : getSelectors<appendClasses<appendId<B, T>, T>, getElementChildren<T>>
    // Fragments
    : getElementChildren<T> extends never ? B : getSelectors<B, getElementChildren<T>>;
type GetSelectors<T extends ElementNode<any> | FragmentNode<any>> = getSelectors<never, T> & {};

export {
  ParseFragment,
  GetSelectors
}