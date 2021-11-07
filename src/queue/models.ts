import * as Yup from "yup";
import {UserProxy} from "../auth/models";
import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  SetOptions,
  SnapshotOptions,
  Timestamp
} from "firebase/firestore";
import {UserInfo} from "firebase/auth";
import {firestore} from "../config/firebase-config";
import {AuditedModel} from "../utils/models";


export const statusList = [
  "Pending",
  "Ready for Review",
  "Ready for QA",
  "Ready for QA - Rebasing",
  "Rebasing",
  "Validate Rebase",
  "In QA",
  "Failed QA",
  "Passed QA",
  "Review Comments",
  "Merged",
];

export const jiraPriorityList = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

export const typeList = [
  "CLF Improve",
  "CLF New",
  "SVP Improve",
  "SVP New",
  "Response Improve",
  "Response New",
  "Enable/Disable Competency",
  "Mapper Improve",
  "Mapper New",
  "Other",
];

export const groupByFields: (keyof QueueItem)[] = [
  "jiraPriority",
  "client",
  "status",
  "type",
  "developer",
  "reviewer",
  "qaAssignee",
];

export class GenericConverter<T> implements FirestoreDataConverter<T> {
  constructor(protected modelClass: { new(...rest: any): T }) {
  }

  toFirestore(model: PartialWithFieldValue<T>, options?: SetOptions): DocumentData {
    const data: any = {};
    const anyModel = model as any;
    if (model) {
      for (const k in anyModel) {
        data[k] = anyModel[k] === undefined ? null : anyModel[k];
      }
    }
    return data;
  }

  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>, options?: SnapshotOptions): T {
    const data = snapshot.data(options);
    const model: any = new this.modelClass(snapshot.id);
    if (data) {
      const keys = Array.from(new Set(Object.keys(model).concat(Object.keys(data))));
      for (const key of keys) {
        model[key] = data[key] === undefined ? model[key] : data[key];
      }
    }

    return model;
  }
}

export class QueueItem extends AuditedModel {
  static readonly converter = new GenericConverter<QueueItem>(QueueItem);

  constructor(
    public id: string,
    public queueId: string,
    public section: string = "",
    public description: string = "",
    public status: string = "",
    public type: string[] = [],
    public jiraPriority: string = "",
    public priority: string = "",
    public developer?: UserProxy,
    public reviewer?: UserProxy,
    public qaAssignee?: UserProxy,
    public ticketNumber: string = "",
    public basedOnVersion: string = "",
    public mrLink: string = "",
    public mrLink2: string = "",
    public client: string = "",
    public notes: string = "",
    public readonly active: boolean = true,
  ) {
    super();
  }

  get createdTimestamp(): number {
    return this.dateCreated ? this.dateCreated.toMillis() : 0;
  }

  static readonly makeGroupByValueConverter = (field: keyof QueueItem) => {
    return (el: QueueItem): string | undefined | null => {
      let fieldValue;
      if (field === "developer" || field === "reviewer" || field === "qaAssignee") {
        fieldValue = el[field]?.displayName || el[field]?.email;
      } else {
        fieldValue = el[field];
      }

      return fieldValue?.toString();
    };
  };

  static collectionPath(queueId: string) {
    return `${Queue.collectionPath()}/${queueId}/items`;
  }

  static collectionRef(queueId: string) {
    return collection(firestore, this.collectionPath(queueId)).withConverter(this.converter);
  }

  mrId(field: "mrLink" | "mrLink2"): string {
    let id = "";
    if (this[field]) {
      const pattern = /\/([0-9]+)\/?$/;
      const match = this[field].match(pattern);
      id = match ? match[1] : "";
    }

    return id;
  }

  collectionPath() {
    return QueueItem.collectionPath(this.queueId);
  }

  collectionRef() {
    return collection(firestore, this.collectionPath()).withConverter(QueueItem.converter);
  }

  documentRef() {
    return doc(this.collectionRef(), this.id).withConverter(QueueItem.converter);
  }
}

export class QueueSection {
  constructor(
    public name: string,
    public groupBy: keyof QueueItem
  ) {
  }
}

export class Queue {
  static readonly converter = new GenericConverter<Queue>(Queue);

  constructor(
    public id: string,
    public dateCreated?: Timestamp,
    public dateUpdated?: Timestamp,
    public createdBy?: DocumentReference<UserInfo>,
    public updatedBy?: DocumentReference<UserInfo>,
    public name: string = "",
    public description: string = "",
    public clients: string[] = [],
    public sections: QueueSection[] = [],
    public members: UserProxy[] = [],
    public watchers: UserProxy[] = [],
    public readonly active: boolean = true,
  ) {
  }

  static collectionPath() {
    return "queues";
  }

  static documentRef(id: string) {
    return doc(this.collectionRef(), id).withConverter(this.converter);
  }

  static collectionRef() {
    return collection(firestore, this.collectionPath()).withConverter(this.converter);
  }

  documentRef() {
    return Queue.documentRef(this.id);
  }
}

export const queueValidationSchema = Yup.object({
  name: Yup.string()
    .required("Required")
    .max(30, "Must not exceed 30 characters"),
  description: Yup.string()
    .max(200, "Must not exceed 200 characters"),
  clients: Yup.array(),
  sections: Yup.array(),
});

export const queueItemValidationSchema = Yup.object({
  section: Yup.string()
    .required(),
  description: Yup.string()
    .required()
    .max(200, "Must not exceed 200 characters"),
  ticketNumber: Yup.string()
    .max(30, "Must not exceed 30 characters"),
  basedOnVersion: Yup.string()
    .max(30, "Must not exceed 30 characters"),
  mrLink: Yup.string()
    .url("Invalid URL")
    .max(500, "Must not exceed 500 characters"),
  mrLink2: Yup.string()
    .url("Invalid URL")
    .max(500, "Must not exceed 500 characters"),
  status: Yup.string()
    .required(),
  type: Yup.array()
    .required(),
  jiraPriority: Yup.string()
    .required(),
  priority: Yup.number(),
  client: Yup.string()
    .max(30, "Must not exceed 30 characters"),
  notes: Yup.string()
    .max(1000, "Must not exceed 1000 characters"),
});