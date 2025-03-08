import { useLayoutEffect } from 'react';
import { useLastNavigateNameContext } from 'contexts/last-name-navigate-bar';

/**
 * Set the last step name in navigate bar.
 *
 * @param {string} name - The last item in navigate bar.
 */
export default (name: string): void => {
  // setName is dispatch useState function.
  // this function will be set name data in navigate bar.
  const { setName } = useLastNavigateNameContext();

  useLayoutEffect(() => {
    if (name) {
      setName(name);
    }
  }, [name]);
};
