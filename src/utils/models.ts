import { DocumentReference, Timestamp } from "firebase/firestore";
import { UserInfo } from "firebase/auth";

export class AuditedModel {
  dateCreated?: Timestamp
  dateUpdated?: Timestamp
  createdBy?: DocumentReference<UserInfo>
  updatedBy?: DocumentReference<UserInfo>
}
