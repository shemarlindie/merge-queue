import {expect} from "chai";
import {describe, it} from "mocha";
import * as sinon from "sinon";
import * as functionsTest from "firebase-functions-test";
import * as admin from "firebase-admin";
import {
  bootstrapFirebase,
  changeDataStub,
  addTestUsers,
  users, changedTasks,
} from "./shared";
import fn = require("../queueItemChange");

const firebaseConfig = bootstrapFirebase();
const test = functionsTest(firebaseConfig);
const firestore = admin.firestore();

before(async () => {
  await test.firestore.clearFirestoreData(firebaseConfig.projectId);
  await addTestUsers();
});

after(async () => {
  await test.firestore.clearFirestoreData(firebaseConfig.projectId);
});

describe("getChangeUser", () => {
  it("should return createdBy user for new tasks", async () => {
    const change = test.makeChange<any>(
      null,
      {
        data: sinon.fake.returns({
          createdBy: firestore.doc(`users/${users[0].uid}`),
        }),
      }
    );
    expect(await fn.getChangeUser(change)).to.eql(users[0]);
  });

  it("should return updatedBy user for updated tasks", async () => {
    const change = test.makeChange<any>(
      {
        data: sinon.fake.returns({
          createdBy: firestore.doc(`users/${users[0].uid}`),
        }),
      },
      {
        data: sinon.fake.returns({
          createdBy: firestore.doc(`users/${users[0].uid}`),
          updatedBy: firestore.doc(`users/${users[1].uid}`),
        }),
      }
    );
    expect(await fn.getChangeUser(change)).to.eql(users[1]);
  });
});

describe("getLatestChange", () => {
  const before = changeDataStub("before");
  const after = changeDataStub("after");

  it("should return 'after' if it exists", () => {
    const change = test.makeChange<any>(
      {data: sinon.fake.returns(null)},
      {data: sinon.fake.returns(after)}
    );
    expect(fn.getLatestChange(change)).to.eql(after);
  });

  it("should return 'after' even if 'before' exists", () => {
    const change = test.makeChange<any>(
      {data: sinon.fake.returns(before)},
      {data: sinon.fake.returns(after)}
    );
    expect(fn.getLatestChange(change)).to.eql(after);
  });

  it("should return 'before' if 'after' doesn't exist", () => {
    const change = test.makeChange<any>(
      {data: sinon.fake.returns(before)},
      {data: sinon.fake.returns(null)}
    );
    expect(fn.getLatestChange(change)).to.eql(before);
  });
});

describe("getChangeType", () => {
  const before = changeDataStub("before");
  const after = changeDataStub("after");

  it("only 'created' should be true for new documents", () => {
    const change = test.makeChange<any>(
      {data: sinon.fake.returns(null)},
      {data: sinon.fake.returns(after)}
    );
    const expected = {created: true, updated: false, deleted: false};
    expect(fn.getChangeType(change)).to.eql(expected);
  });

  it("only 'updated' should be true for changed documents", () => {
    const change = test.makeChange<any>(
      {data: sinon.fake.returns(before)},
      {data: sinon.fake.returns(after)}
    );
    const expected = {created: false, updated: true, deleted: false};
    expect(fn.getChangeType(change)).to.eql(expected);
  });

  it("only 'deleted' should be true for removed documents", () => {
    const change = test.makeChange<any>(
      {data: sinon.fake.returns(before)},
      {data: sinon.fake.returns(null)}
    );
    const expected = {created: false, updated: false, deleted: true};
    expect(fn.getChangeType(change)).to.eql(expected);
  });
});

describe("computeChangedFields", () => {
  const watchedFields = Object.keys(fn.watchedFields);

  it("should return watched fields that changed", () => {
    const before = changedTasks[0].before;
    const after = changedTasks[0].after;
    const expectedFields = Object.keys(after).filter(
      (key) => watchedFields.includes(key)
    );
    const change = test.makeChange<any>(
      {data: sinon.fake.returns(before)},
      {data: sinon.fake.returns(after)}
    );
    expect(fn.computeChangedFields(change)).to.have.members(expectedFields);
  });

  it("should return watched fields that changed (partial)", () => {
    const before = changedTasks[1].before;
    const after = changedTasks[1].after;
    const expectedFields = ["description", "ticketNumber"];
    const change = test.makeChange<any>(
      {data: sinon.fake.returns(before)},
      {data: sinon.fake.returns(after)}
    );
    expect(fn.computeChangedFields(change)).to.have.members(expectedFields);
  });

  it("should return all watched fields for added items", () => {
    const after = changedTasks[0].after;
    const change = test.makeChange<any>(
      {data: sinon.fake.returns(null)},
      {data: sinon.fake.returns(after)}
    );
    expect(fn.computeChangedFields(change)).to.have.members(watchedFields);
  });

  it("should return all watched fields for removed items", () => {
    const after = changedTasks[0].after;
    const change = test.makeChange<any>(
      {data: sinon.fake.returns(null)},
      {data: sinon.fake.returns(after)}
    );
    expect(fn.computeChangedFields(change)).to.have.members(watchedFields);
  });
});
