import React, { useContext, useLayoutEffect, useState } from 'react';

import { ScrollContext } from './ScrollManager';

export default function useScrollContainer(scrollKey: string | null) {
  const ctx = useContext(ScrollContext);
  const register = ctx?.registerScrollElement;
  const [element, attachRef] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (element && scrollKey) {
      return register?.(scrollKey, element);
    }
    return undefined;
  }, [register, element, scrollKey]);

  return attachRef as React.RefCallback<HTMLElement>;
}
