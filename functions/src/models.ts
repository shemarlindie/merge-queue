import * as admin from "firebase-admin";

export interface UserProxy {
  uid: string;
  displayName?: string | null;
  email?: string | null;
}

export interface QueueItem {
  id: string
  queueId: string
  section: string
  description: string
  status: string
  type: string[]
  jiraPriority: string
  priority: string
  developer?: UserProxy
  reviewer?: UserProxy
  qaAssignee?: UserProxy
  ticketNumber: string
  basedOnVersion: string
  mrLink: string
  mrLink2: string
  client: string
  notes: string
  readonly active: boolean
}

export interface QueueSection {
  name: string
  groupBy: keyof QueueItem
}

export interface Queue {
  id: string
  dateCreated?: admin.firestore.Timestamp
  dateUpdated?: admin.firestore.Timestamp
  createdBy?: admin.firestore.DocumentReference
  updatedBy?: admin.firestore.DocumentReference
  name: string
  description: string
  clients: string[]
  sections: QueueSection[]
  members: UserProxy[]
  watchers: UserProxy[]
  readonly active: boolean
}
