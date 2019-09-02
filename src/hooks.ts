import { useEffect, useState } from "react";
import { emitter } from "@marvelapp/react-ab-test";

interface ExperimentHookResult {
  experimentName: string;
  variant: string;
  emitWin: () => {};
  selectVariant: <T>(
    variants: Record<string, T>,
    fallback?: T
  ) => T | undefined;
}

const selectVariant = (experimentName: string) => <T>(
  variants: Record<string, T>,
  fallback?: T
) => {
  if (Object.keys(variants).indexOf(experimentName) !== -1) {
    return variants[experimentName];
  } else if (fallback !== undefined) {
    return fallback;
  }
  return undefined;
};

export const useExperiment = (
  experimentName: string,
  defaultVariant?: string,
  userIdentifier?: string
): ExperimentHookResult => {
  // useState(experimentName);
  const [currentVariant, setCurrentVariant] = useState(
    emitter.calculateActiveVariant(
      experimentName,
      userIdentifier,
      defaultVariant
    )
  );

  useEffect(() => {
    // experiment mounted
    console.log("useEffect", currentVariant);
    emitter._emitPlay(experimentName, currentVariant);
    emitter._incrementActiveExperiments(experimentName);

    const variantListener = emitter.addActiveVariantListener(
      experimentName,
      (name: string, variant: string) => {
        if (name === experimentName) {
          setCurrentVariant(variant);
        }
      }
    );

    return () => {
      variantListener.remove();
      emitter._decrementActiveExperiments(experimentName);
    };
  }, [experimentName, currentVariant]);

  return {
    experimentName,
    variant: currentVariant,
    emitWin: () => emitter.emitWin(experimentName),
    selectVariant: selectVariant(currentVariant)
  };
};
