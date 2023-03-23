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
  children: ChildNode[];
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

type Node = ElementNode<any> | TextNode<any> | DebugNode<any> | FragmentNode<any>;
type ChildNode = ElementNode<any> | TextNode<any> | DebugNode<any>;

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
type getIDSelectors<S extends string, SS> = S extends `${infer _A}id="${infer V}"${infer B}`
  ? getIDSelectors<B, SS | `#${V}`> : SS;

type splitClasses<C extends string, SS> = C extends `${infer A} ${infer B}`
  ? splitClasses<B, SS | `.${A}`> : SS | `.${C}`;
type getClassSelectors<S extends string, SS> = S extends `${infer _A}class="${infer V}"${infer B}`
  ? getClassSelectors<B, SS | splitClasses<V, never>> : SS

type GetSelectors<S extends string> = (getIDSelectors<S, never> | getClassSelectors<S, never>) & {};


export {
  ParseFragment,
  GetSelectors
}
