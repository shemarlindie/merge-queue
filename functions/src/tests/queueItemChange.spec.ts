import {expect} from "chai";
import {describe, it} from "mocha";
import * as sinon from "sinon";
import * as functionsTest from "firebase-functions-test";
import * as admin from "firebase-admin";
import {
  addTestData,
  addTestUsers,
  bootstrapFirebase,
  changedTasks,
  loadData,
  queueItems,
  queues,
  users,
} from "./shared";
import {QueueItem} from "../models";
import {ChangeSummary} from "../types";
import fn = require("../queueItemChange");

const firebaseConfig = bootstrapFirebase();
const test = functionsTest(firebaseConfig);
const firestore = admin.firestore();

before(async () => {
  await test.firestore.clearFirestoreData(firebaseConfig.projectId);
  await addTestUsers();
  await addTestData();
});

// after(async () => {
//   await test.firestore.clearFirestoreData(firebaseConfig.projectId);
// });

export const makeChange = (before: any, after: any) => {
  return test.makeChange<any>(
    {
      data: sinon.fake.returns(before),
      get: sinon.spy((key: string) => before ? before[key] : undefined),
    },
    {
      data: sinon.fake.returns(after),
      get: sinon.spy((key: string) => after ? after[key] : undefined),
    }
  );
};

const changeDataStub = (description: string): Partial<QueueItem> => {
  return {description};
};

const changeStub = () => {
  const before = changedTasks[0].before; // all fields are empty/falsy
  const after = queueItems[1];
  after.updatedBy = firestore.doc(`users/${users[0].uid}`);
  return makeChange(before, after);
};

const summaryStub = (): ChangeSummary => {
  return {
    changeType: {created: false, updated: true, deleted: false},
    latest: queueItems[1],
    queue: queues[0],
    user: users[0],
    fields: ["description", "developer", "ticketNumber", "type"],
    before: {
      description: "",
      ticketNumber: "",
      developer: null,
      type: [],
    },
    after: {
      description: "Lokg ueowi clodp",
      ticketNumber: "MQ-102",
      developer: {
        "uid": "id-jane-doe",
        "displayName": "Jane Doe",
        "email": "jane.doe@example.com",
      },
      type: ["CLF Improve", "SVP Improve"],
    },
  };
};

describe("getChangeUser", () => {
  it("should return createdBy user for new tasks", async () => {
    const change = makeChange(null, {
      createdBy: firestore.doc(`users/${users[0].uid}`),
    });
    expect(await fn.getChangeUser(change)).to.eql(users[0]);
  });

  it("should return updatedBy user for updated tasks", async () => {
    const change = makeChange(
      {
        createdBy: firestore.doc(`users/${users[0].uid}`),
      },
      {
        createdBy: firestore.doc(`users/${users[0].uid}`),
        updatedBy: firestore.doc(`users/${users[1].uid}`),
      }
    );
    expect(await fn.getChangeUser(change)).to.eql(users[1]);
  });
});

describe("getLatestChange", () => {
  const before = changeDataStub("before");
  const after = changeDataStub("after");

  it("should return 'after' if it exists", () => {
    const change = makeChange(null, after);
    expect(fn.getLatestChange(change)).to.eql(after);
  });

  it("should return 'after' even if 'before' exists", () => {
    const change = makeChange(before, after);
    expect(fn.getLatestChange(change)).to.eql(after);
  });

  it("should return 'before' if 'after' doesn't exist", () => {
    const change = makeChange(before, null);
    expect(fn.getLatestChange(change)).to.eql(before);
  });
});

describe("getChangeType", () => {
  const before = changeDataStub("before");
  const after = changeDataStub("after");

  it("only 'created' should be true for new documents", () => {
    const change = makeChange(null, after);
    const expected = {created: true, updated: false, deleted: false};
    expect(fn.getChangeType(change)).to.eql(expected);
  });

  it("only 'updated' should be true for changed documents", () => {
    const change = makeChange(before, after);
    const expected = {created: false, updated: true, deleted: false};
    expect(fn.getChangeType(change)).to.eql(expected);
  });

  it("only 'deleted' should be true for removed documents", () => {
    const change = makeChange(before, null);
    const expected = {created: false, updated: false, deleted: true};
    expect(fn.getChangeType(change)).to.eql(expected);
  });
});

describe("computeChangedFields", () => {
  const watchedFields = Object.keys(fn.watchedFields);

  it("should return watched fields that changed", () => {
    const expectedFields = Object.keys(changedTasks[0].after).filter(
      (key) => watchedFields.includes(key)
    );
    const change = makeChange(changedTasks[0].before, changedTasks[0].after);
    expect(fn.computeChangedFields(change)).to.have.members(expectedFields);
  });

  it("should return watched fields that changed (partial)", () => {
    const expectedFields = ["description", "developer", "ticketNumber", "type"];
    const change = makeChange(changedTasks[1].before, changedTasks[1].after);
    expect(fn.computeChangedFields(change)).to.have.members(expectedFields);
  });

  it("should return all watched fields for added items", () => {
    const change = makeChange(null, changedTasks[0].after);
    expect(fn.computeChangedFields(change)).to.have.members(watchedFields);
  });

  it("should return all watched fields for removed items", () => {
    const change = makeChange(changedTasks[0].before, null);
    expect(fn.computeChangedFields(change)).to.have.members(watchedFields);
  });
});

describe("getChangeSummary", () => {
  it("should produce an accurate summary of the change", async () => {
    const expectedSummary = summaryStub();
    const change = changeStub();
    const summary = await fn.getChangeSummary(change);
    expect(summary).to.eql(expectedSummary);
  });

  it("should return null if a non-watched fields changed", async () => {
    const change = makeChange(
      {"notes": "notes from before"},
      {"notes": "these are updated notes"}
    );
    const summary = await fn.getChangeSummary(change);
    expect(summary).to.be.null;
  });
});

describe("formatChanges", () => {
  it("should correctly format changed fields", async () => {
    const expected = {
      before: {
        description: "-",
        ticketNumber: "-",
        developer: "-",
        type: "",
      },
      after: {
        description: "Lokg ueowi clodp",
        ticketNumber: "MQ-102",
        developer: "Jane Doe",
        type: "CLF Improve, SVP Improve",
      },
    };
    const summary = summaryStub();
    const formattedChanges = fn.formatChanges(summary);
    expect(formattedChanges).to.eql(expected);
  });
});

describe("prepareEmailBody", () => {
  it("should correctly render email body", async () => {
    const expected = loadData("email");
    const summary = summaryStub();
    const email = await fn.prepareEmailBody(summary);
    expect(email).to.eql(expected);
  });
});

// describe("getRecipients", () => {
//   it(
//     "should return a list of previous and current assignee emails " +
//     "and queue watchers' emails",
//     async () => {
//       const expected: string[] = [];
//       const summary = summaryStub();
//       const change = changeStub();
//       const recipients = await fn.getRecipients(summary, change);
//       expect(recipients).to.have.members(expected);
//     }
//   );
// });
