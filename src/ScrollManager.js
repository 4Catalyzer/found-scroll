import StateStorage from 'farce/lib/StateStorage';
import HttpError from 'found/lib/HttpError';
import { routerShape } from 'found/lib/PropTypes';
import PropTypes from 'prop-types';
import React from 'react';
import ScrollBehavior from 'scroll-behavior';

const STORAGE_NAMESPACE = '@@scroll';

const propTypes = {
  shouldUpdateScroll: PropTypes.func,
  createScrollBehavior: PropTypes.func.isRequired,
  renderArgs: PropTypes.shape({
    location: PropTypes.object.isRequired,
    router: routerShape.isRequired,
    elements: PropTypes.array,
    error: PropTypes.instanceOf(HttpError),
  }).isRequired,
  children: PropTypes.node,
};

const defaultProps = {
  createScrollBehavior: config => new ScrollBehavior(config),
};

class ScrollManager extends React.Component {
  constructor(props, context) {
    super(props, context);

    const { createScrollBehavior, renderArgs } = props;
    const { router } = renderArgs;

    this.scrollBehavior = createScrollBehavior({
      addTransitionHook: router.addTransitionHook,
      stateStorage: new StateStorage(router, STORAGE_NAMESPACE),
      getCurrentLocation: () => this.props.renderArgs.location,
      shouldUpdateScroll: this.shouldUpdateScroll,
    });

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

  shouldUpdateScroll = (prevRenderArgs, renderArgs) => {
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

  render() {
    return this.props.children;
  }
}

ScrollManager.propTypes = propTypes;
ScrollManager.defaultProps = defaultProps;

export default ScrollManager;
