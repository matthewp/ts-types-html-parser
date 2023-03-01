# ts-types-html-parser

```ts
const html = `
  <div id="foo" class="one two">
    <span id="inner1">
      <span class="inner2"></span>
    </span>
  </div>
`;
type ast = ParseFragment<typeof html>;

ast['attrs']['id'];
// ^ foo
```

# License

BSD-2-Clause