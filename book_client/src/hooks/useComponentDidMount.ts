import { DependencyList, useEffect, EffectCallback } from 'react';

export type HaveLoadedFnType = () => boolean;

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
 * therefore create a hook to execute code only once.
 */
const useComponentDidMount = <T>(
  executeFn: (updateHaveFetchedFlag: () => boolean) => EffectCallback,
  dependencyList: DependencyList = [],
): void => {
  let haveFetched: boolean = false;
  const updateHaveFetchedFlag: HaveLoadedFnType = () => {
    haveFetched = !haveFetched;
    return !haveFetched;
  };
  const fn: EffectCallback = executeFn(updateHaveFetchedFlag);
  useEffect(fn, dependencyList);
};

export default useComponentDidMount;
