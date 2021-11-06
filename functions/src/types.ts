import {Change} from "firebase-functions";
import * as admin from "firebase-admin";
import {Queue, QueueItem, UserProxy} from "./models";

export type Optional<T> = (T | undefined | null)
export type DocData = admin.firestore.DocumentData
export type DocRef = admin.firestore.DocumentReference
export type TaskChange = Change<admin.firestore.DocumentSnapshot>;

export type Formatter<T> = (value: Optional<T>) => string;
export type Comparer<T> = (a: Optional<T>, b: Optional<T>) => boolean;

export interface WatchedFieldConfig<T> {
  formatter: Formatter<T>;
  comparer: Comparer<T>;
}

export type WatchedFields = {
  basedOnVersion: WatchedFieldConfig<string>,
  description: WatchedFieldConfig<string>,
  developer: WatchedFieldConfig<UserProxy>,
  client: WatchedFieldConfig<string>,
  jiraPriority: WatchedFieldConfig<string>,
  mrLink: WatchedFieldConfig<string>,
  mrLink2: WatchedFieldConfig<string>,
  priority: WatchedFieldConfig<string>,
  qaAssignee: WatchedFieldConfig<UserProxy>,
  reviewer: WatchedFieldConfig<UserProxy>,
  section: WatchedFieldConfig<string>,
  status: WatchedFieldConfig<string>,
  ticketNumber: WatchedFieldConfig<string>,
  type: WatchedFieldConfig<string[]>,
}

export interface ChangeSummary {
  user: Optional<UserProxy>;
  fields: (keyof WatchedFields)[];
  changeType: { deleted: boolean; created: boolean; updated: boolean };
  queue: Optional<Queue>;
  latest: QueueItem;
  before: Partial<{ -readonly [key in keyof QueueItem]: QueueItem[key] }>;
  after: Partial<{ -readonly [key in keyof QueueItem]: QueueItem[key] }>;
}
