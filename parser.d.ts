// Utilities
declare namespace util {
  type identity<T> = T;
  type flatten<T extends object> = identity<{ [k in keyof T]: T[k] }>;
  type extendShape<A, B> = flatten<Omit<A, keyof B> & B>;

  type trimStart<T> = T extends ` ${infer H}` ? trimStart<H> : T;
  type trimEnd<T> = T extends `${infer H} ` ? trimEnd<H> : T;
  type trim<T> = trimEnd<trimStart<T>>;
}

// HTML parser
type RawShape = {
    tag: string;
    attrs: {
        [n: string]: string;
    },
    children: Array<RawShape | string>;
}

type AddTag<S> = {
    tag: S;
    attrs: {};
    classes: readonly string[];
    children: Array<RawShape | string>;
};
type AddAttr<A, N extends string, V> = util.extendShape<A, { [k in N]: V }>;

type ParseHTML<T> = T extends string ? TagStart<T> : never;
type TagStart<S> = S extends `<${infer T} ${infer A}`
    ? Classes<Children<AddTag<T>, A>, A>
    : S extends `<${infer T}>${infer C}` ? T : never;

// Attributes
type Attributes<H, S> = util.extendShape<H, { attrs: ParseAttribute<{}, S> }>;
type ParseAttribute<A, S> = S extends `${infer N}="${infer V}"${infer R}` ? ParseAttribute<AddAttr<A, N, V>, util.trimStart<R>>  : A;

// Classes
type Classes<H, S> = util.extendShape<H, { classes: ParseClasses<S> }>;
type ParseClasses<S> = S extends `${infer B}class="${infer C}"${infer R}` ? ParseClassList<[], C> : [];
type ParseClassList<C extends readonly string[], S> = S extends `${infer A} ${infer B}` ? ParseClassList<[B, ...C], A> : [S, ...C];

// Fragment
type Children<H, S extends string> = S extends `${infer A}>${infer R}`
    ? Attributes<util.extendShape<H, { children: Fragment<R> }>, A>
    : never; // TODO;
type Fragment<S extends string> =
    S extends `</${infer _A}` ? []
    :
        S extends `<${infer A}`
            // Child is an element
            ? [TagStart<S>]
            // Child is text
            : never;

export {
  ParseHTML
}