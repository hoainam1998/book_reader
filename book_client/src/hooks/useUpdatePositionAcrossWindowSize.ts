/* eslint-disable no-undef */
import { CSSProperties, useEffect, useState } from 'react';

/**
 * This callback will run when resize event complete.
 *
 * @callback action
 * @return {CSSProperties} - The position information.
 */

/**
* Create prisma field service class.
*
* @param {action} action - The action run when resize event complete.
* @return {CSSProperties} - The position information.
*/
export default (action: () => CSSProperties): CSSProperties => {
  const [position, setPosition] = useState<CSSProperties>({});
  const DELAY: number = 200;
  let timeout: NodeJS.Timeout;

  /**
  * Execute resize action.
  */
  const resizeEvent = () => {
    // clear previous timeout.
    clearTimeout(timeout);
    // delay resize action, until resize event complete.
    timeout = setTimeout(() => setPosition(action()), DELAY);
  };

  useEffect(() => {
    // set current position.
    setPosition(action());
    window.addEventListener('resize', resizeEvent);

    // remove resize event when component exist.
    return () => window.removeEventListener('resize', resizeEvent);
  }, []);

  return position;
};
