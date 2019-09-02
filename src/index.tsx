import React from "react";
import { render } from "react-dom";
import { useExperiment } from "./hooks";
import { emitter, experimentDebugger } from "@marvelapp/react-ab-test";
import "./styles.css";

// https://github.com/marvelapp/react-ab-test/issues/8
// check ./hooks.ts for implementation spike

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

emitter.defineVariants("test", ["exp1", "exp2", "exp3"]);
emitter.setActiveVariant("test", "exp1");

const App: React.FC<{}> = () => {
  // Hooks version of Experiments - references an experiment by name
  // useExperiment(experimentName: string, userIdentifier?: string, defaultVariant?: string)

  // should useExperiment's parameters match the order of calculateActiveVariant?
  // is userIdentifier or defaultVariant more commonly used?
  const { selectVariant, emitWin } = useExperiment("test");

  const variant = selectVariant(
    {
      exp1: <h1>Hello Experiment 1</h1>,
      exp2: <h1>Hello Experiment 2</h1>
    },
    <h1>Hello Fallback</h1>
  );

  return (
    <div className="App">
      {variant}
      <button onClick={emitWin}>CTA</button>
    </div>
  );
};

const rootElement = document.getElementById("root");
render(<App />, rootElement);
