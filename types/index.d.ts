import { HttpError, Location, Router } from 'found';
import { Component } from 'react';
import ScrollBehavior, { ScrollTarget } from 'scroll-behavior';

export interface LocationBase {
  action: 'PUSH' | string;
  hash?: string;
}

export type ScrollPosition = [number, number];

export interface CreateScrollBehaviorConfig {
  addNavigationListener: (listener: () => void) => () => void;
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

export class ScrollManager extends Component<ScrollManagerProps> {}
