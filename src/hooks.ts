import { useEffect, useState } from "react";
import { emitter } from "@marvelapp/react-ab-test";

interface ExperimentHookResult {
  experimentName: string;
  variant: string;
  emitWin: () => {};
}

export const useExperiment = (
  experimentName: string,
  defaultVariant?: string,
  userIdentifier?: string
): ExperimentHookResult => {
  useState(experimentName);
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
    emitWin: () => emitter.emitWin(experimentName)
  };
};
