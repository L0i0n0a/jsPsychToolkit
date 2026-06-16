import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import jsPsychExtensionDebugExperiment from ".";

describe("extension-debug-experiment", () => {
  test("extension_type and extension_version are recorded correctly", async () => {
    const jsPsych = initJsPsych({
      extensions: [{ type: jsPsychExtensionDebugExperiment }],
    });

    const { getData, expectFinished } = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "trial",
          extensions: [{ type: jsPsychExtensionDebugExperiment }],
        },
      ],
      jsPsych
    );

    await pressKey("a");
    await expectFinished();

    const data = getData().values()[0];
    expect(data.extension_type).toContain("extension-debug-experiment");
    expect(data.extension_version).toBeDefined();
  });

  test("debug_skipped is false on a normal trial", async () => {
    const jsPsych = initJsPsych({
      extensions: [{ type: jsPsychExtensionDebugExperiment }],
    });

    const { getData, expectFinished } = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "trial",
          extensions: [{ type: jsPsychExtensionDebugExperiment }],
        },
      ],
      jsPsych
    );

    await pressKey("a");
    await expectFinished();

    expect(getData().values()[0].debug_skipped).toBe(false);
  });

  test("debug_autoresponded is false when autoResponder is disabled", async () => {
    const jsPsych = initJsPsych({
      extensions: [
        { type: jsPsychExtensionDebugExperiment, params: { autoResponder: false } },
      ],
    });

    const { getData, expectFinished } = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "trial",
          extensions: [{ type: jsPsychExtensionDebugExperiment }],
        },
      ],
      jsPsych
    );

    await pressKey("a");
    await expectFinished();

    expect(getData().values()[0].debug_autoresponded).toBe(false);
  });

  test("debug_skipped is true for trials skipped during jumpToTrial fast-forward", async () => {
    const jsPsych = initJsPsych({
      extensions: [
        { type: jsPsychExtensionDebugExperiment, params: { jumpToTrial: 2 } },
      ],
    });

    const ext = [{ type: jsPsychExtensionDebugExperiment }];

    const { getData, expectFinished } = await startTimeline(
      [
        { type: htmlKeyboardResponse, stimulus: "trial 0", extensions: ext },
        { type: htmlKeyboardResponse, stimulus: "trial 1", extensions: ext },
        { type: htmlKeyboardResponse, stimulus: "trial 2", extensions: ext },
      ],
      jsPsych
    );

    // trials 0 and 1 are skipped automatically; only trial 2 needs a keypress
    await pressKey("a");
    await expectFinished();

    const values = getData().values();
    expect(values[0].debug_skipped).toBe(true);
    expect(values[1].debug_skipped).toBe(true);
    expect(values[2].debug_skipped).toBe(false);
  });

  test("debug_skipped resets to false on the trial after a skipped block", async () => {
    const jsPsych = initJsPsych({
      extensions: [
        { type: jsPsychExtensionDebugExperiment, params: { jumpToTrial: 1 } },
      ],
    });

    const ext = [{ type: jsPsychExtensionDebugExperiment }];

    const { getData, expectFinished } = await startTimeline(
      [
        { type: htmlKeyboardResponse, stimulus: "trial 0", extensions: ext },
        { type: htmlKeyboardResponse, stimulus: "trial 1", extensions: ext },
      ],
      jsPsych
    );

    await pressKey("a");
    await expectFinished();

    const values = getData().values();
    expect(values[0].debug_skipped).toBe(true);
    expect(values[1].debug_skipped).toBe(false);
  });
});
