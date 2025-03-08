import { DependencyList, useEffect, EffectCallback } from 'react';
import { HaveLoadedFnType } from 'interfaces';

/**
 * This callback update haveFetched flag.
 *
 * @callback updateHaveFetchedFlagCallback
 * @returns {boolean}
 */

/**
 * This callback executed when hook run.
 *
 * @callback executeCallback
 * @param {updateHaveFetchedFlagCallback} updateHaveFetched - flag to check if useEffect have been run,
 * it will not run again.
 * @returns {EffectCallback}
 */

/**
 * Execute code when jsx rendered.
 * @param {executeCallback} executeFn - execute callback function.
 * @param {DependencyList} dependencyList - dependencies similar DependencyList useEffect Hook.
 * Note: useEffect called twice time by strict mode,
 * therefore I create a hook to execute code only once.
 */
const useComponentDidMount = (
  // eslint-disable-next-line no-unused-vars
  executeFn: (updateHaveFetchedFlag: () => boolean) => EffectCallback,
  dependencyList: DependencyList = []
): void => {
  let haveFetched: boolean = false;
  const updateHaveFetchedFlag: HaveLoadedFnType = () => {
    haveFetched = !haveFetched;
    return !haveFetched;
  };
  const effectCallback: EffectCallback = executeFn(updateHaveFetchedFlag);
  useEffect(effectCallback, dependencyList);
};

export default useComponentDidMount;
