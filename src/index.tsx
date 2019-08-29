import React, { ReactNode } from "react";
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

const App = () => {
  // Hooks version of Experiments - references an experiment by name
  // and the variants supported within this context
  const { experimentName, variant, emitWin } = useExperiment("test", "exp3");
  console.log("useExperiment result: ", experimentName, variant);
  let experiment: ReactNode;
  switch (variant) {
    case "exp1":
      experiment = <h1>Hello Experiment 1</h1>;
      break;
    case "exp2":
      experiment = <h1>Hello Experiment 2</h1>;
      break;
    case "exp3":
    default:
      experiment = <h1>Hello Fallback</h1>;
      break;
  }

  return (
    <div className="App">
      {experiment}
      <button onClick={emitWin}>CTA</button>
    </div>
  );
};

const rootElement = document.getElementById("root");
render(<App />, rootElement);
