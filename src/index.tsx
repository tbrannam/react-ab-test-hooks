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

const useExperiment = (experimentName: string, localVariants: string[]) => {
  const [currentVariant, setCurrentVariant] = useState(
    emitter.getActiveVariant(experimentName)
  );

  useEffect(() => {
    // experiment mounted
    console.log("hook", currentVariant);
    // should emitplay be called if the caller
    // doesn't have one of these variants?
    // if not - we don't need to pass localVariants
    if (localVariants.indexOf(currentVariant) !== -1) {
      console.log("play");
      emitter._emitPlay(experimentName, currentVariant);
    }

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
  }, [experimentName, localVariants, currentVariant]);

  return {
    experimentName,
    variant: currentVariant,
    emitWin: () => emitter.emitWin(experimentName)
  };
};

const App = () => {
  // Hooks version of Experiments - references an experiment by name
  // and the variants supported within this context
  const { variant, emitWin } = useExperiment("test", ["exp1", "exp2"]);
  // const label = variant === "exp1" ? "Experiment 1" : "Experiment 2";
  let label: string;
  switch (variant) {
    case "exp1":
      label = "experiment 1";
      break;
    case "exp2":
      label = "experiment 2";
      break;
    // exp3 isn't in this experiment block, could be in another
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

emitter.defineVariants("test", ["exp1", "exp2", "unused-exp3"]);
emitter.setActiveVariant("test", "exp1");

const rootElement = document.getElementById("root");
render(<App />, rootElement);
