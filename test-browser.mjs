import { BrowserUseClient } from "browser-use-sdk";

const client = new BrowserUseClient({
  apiKey: "bu_HrR_RNZ6fdcmnYdY47WgztMRw2Q6XQCteHWrhQbVlnU",
});

async function test() {
  try {
    console.log("Creating browser task...");
    
    const task = await client.tasks.createTask({
      task: "Go to github.com/chocothebot and tell me what repos I have.",
    });

    console.log("Task created, waiting for completion...");
    const result = await task.complete();

    console.log("Result:", result.output);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
