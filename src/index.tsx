import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { emitter, experimentDebugger } from "@marvelapp/react-ab-test";

import "./styles.css";

// experimentDebugger.setDebuggerAvailable(true);
experimentDebugger.enable();

emitter.addPlayListener((experimentName: string, variantName: string) => {
  console.log(`Displaying experiment ${experimentName} variant ${variantName}`);
});

// Called when a 'win' is emitted, in this case by this.refs.experiment.win()
emitter.addWinListener((experimentName: string, variantName: string) => {
  console.log(
    `Variant ${variantName} of experiment ${experimentName} was clicked`
  );
});

const useExperiment = (
  experimentName: string,
  defaultVariant?: string
): { experimentName: string; variant: string; emitWin: () => {} } => {
  console.log("defaultVariant", defaultVariant);
  const activeVariant = emitter.calculateActiveVariant(
    experimentName,
    undefined,
    defaultVariant
  );
  console.log("calc", activeVariant);
  const [currentVariant, setCurrentVariant] = useState(activeVariant);

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
  }, [experimentName, currentVariant, defaultVariant]);

  return {
    experimentName: experimentName,
    variant: currentVariant,
    emitWin: () => emitter.emitWin(experimentName)
  };
};

const App = () => {
  // Hooks version of Experiments - references an experiment by name
  // and the variants supported within this context
  const { experimentName, variant, emitWin } = useExperiment("test", "exp3");
  console.log(experimentName, variant);
  let label: string;
  switch (variant) {
    case "exp1":
      label = "experiment 1";
      break;
    case "exp2":
      label = "experiment 2";
      break;
    default:
      label = "fallback content";
      break;
  }

  return (
    <div className="App">
      <h1>Hello {label}</h1>
      <button onClick={emitWin}>CTA</button>
    </div>
  );
};

emitter.defineVariants("test", ["exp1", "exp2", "exp3"]);
emitter.setActiveVariant("test", "exp1");

const rootElement = document.getElementById("root");
render(<App />, rootElement);
