# Found Scroll [![npm][npm-badge]][npm]

Scroll management for [Found](https://github.com/4Catalyzer/found).

## Usage

```js
import { createBrowserRouter, createRender } from 'found';
import { ScrollManager } from 'found-scroll';

/* ... */

const render = createRender({ renderError });

const BrowserRouter = createBrowserRouter({
  routeConfig,

  render: (renderArgs) => (
    <ScrollManager renderArgs={renderArgs}>{render(renderArgs)}</ScrollManager>
  ),
});
```

## Guide

### Installation

```
$ npm i -S react found
$ npm i -S found-scroll
```

### Basic usage

When constructing a router, in the `render` method, wrap the rendered element with `<ScrollManager>`, and pass in `renderArgs` as a prop, as in the above example.

### Scrollable Containers

Generally only the `window` scroll position is restored for a location. For
cases where you also want to restore alternative scroll container there is `useScrollContainer`

```jsx
import { useScrollContainer } from 'found-scroll';

function MyScrollView() {
  const scrollRef = useScrollContainer('my-scroll-view');

  return <div ref={scrollRef} />;
}
```

Scroll containers are identified with a 'scrollKey'. There should only be one element associated with a given key for any given location. Think of it as similar to React's `key` prop, in that it provides a stable identity for an element across renders.

### Custom scroll behavior

You can provide a custom `shouldUpdateScroll` callback as a prop to `<ScrollManager>`. This callback receives the previous and the current `renderArgs`.

The callback can return:

- a falsy value to suppress updating the scroll position
- a position array of `x` and `y`, such as `[0, 100]`, to scroll to that position
- a string with the `id` or `name` of an element, to scroll to that element
- a truthy value to emulate the browser default scroll behavior

```js
const shouldUpdateScrollByPathname = (prevRenderArgs, { location }) =>
  !prevRenderArgs || location.pathname !== prevRenderArgs.location.pathname;

const shouldUpdateScrollByRoute = (prevRenderArgs, { routes }) => {
  if (routes.some((route) => route.ignoreScrollBehavior)) {
    return false;
  }

  if (routes.some((route) => route.scrollToTop)) {
    return [0, 0];
  }

  return true;
};

const render = (renderArgs) => (
  <ScrollManager
    shouldUpdateScroll={shouldUpdateScrollByPathname}
    renderArgs={renderArgs}
  >
    {/* ... */}
  </ScrollManager>
);
```

You can customize `<ScrollManager>` even further by providing a `createScrollBehavior` callback that creates the scroll behavior object. This allows using a custom subclass of `ScrollBehavior` from scroll-behavior with custom logic. When using a custom `createScrollBehavior` callback, you can continue to specify the `shouldUpdateScroll` callback as above.

```js
const render = (renderArgs) => (
  <ScrollManager
    createScrollBehavior={(config) => new MyScrollBehavior(config)}
    renderArgs={renderArgs}
  >
    {/* ... */}
  </ScrollManager>
);
```

[npm-badge]: https://img.shields.io/npm/v/found-scroll.svg
[npm]: https://www.npmjs.org/package/found-scroll
