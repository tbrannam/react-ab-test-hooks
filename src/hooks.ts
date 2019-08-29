import React, { useEffect, useState, ReactNode } from "react";
import { emitter, experimentDebugger } from "@marvelapp/react-ab-test";

export const useExperiment = (
  experimentName: string,
  defaultVariant?: string,
  userIdentifier?: string
): { experimentName: string; variant: string; emitWin: () => {} } => {
  const [currentVariant, setCurrentVariant] = useState(
    emitter.calculateActiveVariant(
      experimentName,
      userIdentifier,
      defaultVariant
    )
  );

  useEffect(() => {
    // experiment mounted
    console.log("hook", currentVariant);
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
