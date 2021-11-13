import {Optional} from "../types";
import {QueueItem, UserProxy} from "../models";
import {v4 as uuid4} from "uuid";
import * as admin from "firebase-admin";
import * as fs from "fs";

export interface FirebaseConfig {
  projectId: string
  databaseURL: string
  storageBucket: string
}

export const bootstrapFirebase = (): FirebaseConfig => {
  if (!(
    process.env.GCLOUD_PROJECT &&
    process.env.FIREBASE_CONFIG &&
    process.env.FIRESTORE_EMULATOR_HOST
  )) {
    throw Error(
      "Cannot bootstrap tests without Firebase emulators. " +
      "Use 'npm test' instead."
    );
  }

  return JSON.parse(process.env.FIREBASE_CONFIG);
};

export const loadData = (name: string): any => {
  return JSON.parse(
    fs.readFileSync(`${__dirname}/data/${name}.json`, "utf-8")
  );
};

export const userProxyStub = (displayName: Optional<string>): UserProxy => {
  const uid = uuid4();
  const email = `${uid}@example.com`;
  return {uid, displayName, email};
};

export const users = loadData("users");
export const changedTasks = loadData("changed-tasks");

export const addTestUsers = async (): Promise<void> => {
  return admin.firestore()
    .runTransaction(async (transaction) => {
      for (const user of users) {
        await transaction.set(
          admin.firestore().doc(`users/${user.uid}`),
          user
        );
      }
    });
};

export const changeDataStub = (description: string): Partial<QueueItem> => {
  return {description};
};
