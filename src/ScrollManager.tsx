import StateStorage from 'farce/StateStorage';
import type { Location, RenderArgs, Router } from 'found';
import HttpError from 'found/HttpError';
import React from 'react';
import ScrollBehavior, { ScrollTarget } from 'scroll-behavior';

const STORAGE_NAMESPACE = '@@scroll';

export interface LocationBase {
  action: 'PUSH' | string;
  hash?: string;
}

export type ScrollPosition = [scrollLeft: number, scrollTop: number];

export interface CreateScrollBehaviorConfig {
  addNavigationListener: (listener: () => any) => () => void;
  stateStorage: {
    save: (
      location: Location,
      key: string | null,
      value: ScrollPosition,
    ) => void;
    read: (
      location: Location,
      key: string | null,
    ) => ScrollPosition | null | undefined;
  };
  getCurrentLocation: () => Location;
  shouldUpdateScroll: (
    this: ScrollBehavior<Location, ScrollManagerRenderArgs>,
    prevContext: ScrollManagerRenderArgs | null,
    context: ScrollManagerRenderArgs,
  ) => ScrollTarget;
}

export interface ScrollManagerRenderArgs {
  location: Location;
  router: Router;
  elements?: React.ReactNode[];
  error?: HttpError;
}

export interface ScrollManagerProps {
  shouldUpdateScroll?: (
    this: ScrollBehavior<Location, ScrollManagerRenderArgs>,
    prevContext: ScrollManagerRenderArgs | null,
    context: ScrollManagerRenderArgs,
  ) => ScrollTarget;

  createScrollBehavior?: (
    config: CreateScrollBehaviorConfig,
  ) => ScrollBehavior<Location, ScrollManagerRenderArgs>;

  renderArgs: ScrollManagerRenderArgs;
  children?: React.ReactNode;
}

export interface ScrollContextValue {
  scrollBehavior: ScrollBehavior<Location<any>, ScrollManagerRenderArgs>;
  registerScrollElement: (key: string, element: HTMLElement) => () => void;
}
export const ScrollContext = React.createContext<ScrollContextValue | null>(
  null,
);

const defaultCreateScrollBehavior = (config: CreateScrollBehaviorConfig) =>
  new ScrollBehavior(config);

class ScrollManager extends React.Component<ScrollManagerProps> {
  prevRenderArgs: ScrollManagerRenderArgs | null = null;

  readonly scrollBehavior: ScrollBehavior<Location, ScrollManagerRenderArgs>;

  private readonly scrollContext: ScrollContextValue;

  constructor(props: ScrollManagerProps) {
    super(props);

    const {
      createScrollBehavior = defaultCreateScrollBehavior,
      renderArgs,
    } = props;
    const { router } = renderArgs;

    this.scrollBehavior = createScrollBehavior!({
      addNavigationListener: router.addNavigationListener,
      stateStorage: new StateStorage(router, STORAGE_NAMESPACE),
      getCurrentLocation: () => this.props.renderArgs.location,
      shouldUpdateScroll: this.shouldUpdateScroll,
    });

    this.scrollContext = {
      scrollBehavior: this.scrollBehavior,
      registerScrollElement: this.registerScrollElement,
    };

    this.prevRenderArgs = null;
  }

  componentDidMount() {
    this.maybeUpdateScroll();
  }

  componentDidUpdate() {
    this.maybeUpdateScroll();
  }

  componentWillUnmount() {
    this.scrollBehavior.stop();
  }

  maybeUpdateScroll() {
    const { renderArgs } = this.props;
    const prevLocation = this.prevRenderArgs && this.prevRenderArgs.location;

    if (
      renderArgs.location === prevLocation ||
      !(renderArgs.elements || renderArgs.error)
    ) {
      // If the location hasn't actually changed, or if we're in a global
      // pending state, don't update the scroll position.
      return;
    }

    this.scrollBehavior.updateScroll(this.prevRenderArgs, renderArgs);
    this.prevRenderArgs = renderArgs;
  }

  shouldUpdateScroll = (
    prevRenderArgs: RenderArgs,
    renderArgs: RenderArgs,
  ) => {
    const { shouldUpdateScroll } = this.props;
    if (!shouldUpdateScroll) {
      return true;
    }

    // Hack to allow access to ScrollBehavior internals (e.g. stateStorage).
    return shouldUpdateScroll.call(
      this.scrollBehavior,
      prevRenderArgs,
      renderArgs,
    );
  };

  registerScrollElement = (key: string, element: HTMLElement) => {
    const { renderArgs } = this.props;

    this.scrollBehavior.registerElement(
      key,
      element,
      this.shouldUpdateScroll,
      renderArgs,
    );

    return () => {
      this.scrollBehavior.unregisterElement(key);
    };
  };

  render() {
    return (
      <ScrollContext.Provider value={this.scrollContext}>
        {this.props.children}
      </ScrollContext.Provider>
    );
  }
}

export default ScrollManager;
