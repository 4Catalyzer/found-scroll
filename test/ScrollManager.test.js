import { mount } from 'enzyme';
import React from 'react';

import { ScrollManager } from '../src';

const CustomComponent = () => <div />;

const location = {};
const router = {
  push: jest.fn(),
  replace: jest.fn(),
  go: jest.fn(),
  createHref: jest.fn(),
  createLocation: jest.fn(),
  isActive: jest.fn(),
  matcher: {
    match: jest.fn(),
    getRoutes: jest.fn(),
    isActive: jest.fn(),
    format: jest.fn(),
  },
  addNavigationListener: jest.fn(),
};

const initialRenderArgs = {
  location,
  router,
};

it('should render children', () => {
  let wrapper;

  wrapper = mount(
    <ScrollManager renderArgs={initialRenderArgs}>
      <div />
    </ScrollManager>,
  );
  expect(wrapper.find('div')).toHaveLength(1);

  wrapper = mount(
    <ScrollManager renderArgs={initialRenderArgs}>
      <CustomComponent />
    </ScrollManager>,
  );
  expect(wrapper.find(CustomComponent)).toHaveLength(1);
});

it('should call updateScroll if location changed', () => {
  const wrapper = mount(
    <ScrollManager renderArgs={initialRenderArgs}>
      <div />
    </ScrollManager>,
  );

  const scrollManager = wrapper.instance();

  scrollManager.scrollBehavior.updateScroll = jest.fn();

  const newLocation = {};

  wrapper.setProps({
    renderArgs: {
      location: newLocation,
      router,
      elements: [<div />],
    },
  });

  expect(scrollManager.scrollBehavior.updateScroll).toBeCalled();
});

it('should not call updateScroll if location does not change', () => {
  const wrapper = mount(
    <ScrollManager renderArgs={initialRenderArgs}>
      <div />
    </ScrollManager>,
  );

  const scrollManager = wrapper.instance();

  scrollManager.scrollBehavior.updateScroll = jest.fn();

  wrapper.setProps({
    renderArgs: initialRenderArgs,
  });

  expect(scrollManager.scrollBehavior.updateScroll).not.toBeCalled();
});

it('should stop scroll behavior when it will unmount', () => {
  const wrapper = mount(
    <ScrollManager renderArgs={initialRenderArgs}>
      <div />
    </ScrollManager>,
  );

  const scrollManager = wrapper.instance();

  scrollManager.scrollBehavior.stop = jest.fn();

  wrapper.unmount();

  expect(scrollManager.scrollBehavior.stop).toBeCalled();
});

describe('#shouldUpdateScroll', () => {
  it('always return true when shouldUpdateScroll is absence in props', () => {
    const wrapper = mount(
      <ScrollManager renderArgs={initialRenderArgs}>
        <div />
      </ScrollManager>,
    );

    const scrollManager = wrapper.instance();

    expect(scrollManager.shouldUpdateScroll()).toBe(true);
  });

  it('should be controlled by prop', () => {
    let returnValue = false;
    const shouldUpdateScroll = () => returnValue;
    const wrapper = mount(
      <ScrollManager
        renderArgs={initialRenderArgs}
        shouldUpdateScroll={shouldUpdateScroll}
      >
        <div />
      </ScrollManager>,
    );

    const scrollManager = wrapper.instance();

    expect(scrollManager.shouldUpdateScroll()).toBe(false);

    returnValue = true;

    expect(scrollManager.shouldUpdateScroll()).toBe(true);
  });
});
