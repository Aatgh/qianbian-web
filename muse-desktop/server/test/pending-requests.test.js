const assert = require("node:assert/strict");
const test = require("node:test");

const {
  mergePendingRequests,
} = require("../src/pending-requests");

test("merges approval and user input requests without duplicates", () => {
  const resumed = [
    {
      approvalId: "57",
      sessionId: "23",
      toolName: "write_file",
      availableChoices: [{ choiceId: "allow_once" }],
    },
  ];
  const listed = {
    approvals: [
      {
        approvalId: "57",
        sessionId: "23",
        toolName: "write_file",
        currentRequirementId: { approvalId: "57", sourceIndex: 0 },
        availableChoices: [{ choiceId: "allow_once" }],
      },
      {
        approvalId: "58",
        sessionId: "23",
        toolName: "read_file",
        requirementId: { approvalId: "58", sourceIndex: 2 },
      },
    ],
    userInputs: [
      {
        userInputId: "12",
        sessionId: "23",
        questions: [{ id: "style", question: "请选择回答风格" }],
      },
    ],
  };

  assert.deepEqual(mergePendingRequests(resumed, listed), [
    {
      approvalId: "57",
      sessionId: "23",
      toolName: "write_file",
      requirementId: { approvalId: "57", sourceIndex: 0 },
      availableChoices: [{ choiceId: "allow_once" }],
    },
    {
      approvalId: "58",
      sessionId: "23",
      toolName: "read_file",
      requirementId: { approvalId: "58", sourceIndex: 2 },
    },
    {
      userInputId: "12",
      sessionId: "23",
      questions: [{ id: "style", question: "请选择回答风格" }],
    },
  ]);
});
