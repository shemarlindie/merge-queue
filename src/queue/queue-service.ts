import {doc, serverTimestamp, setDoc, updateDoc} from "firebase/firestore";
import {v4 as uuid4} from "uuid";
import {Queue, QueueItem} from "./models";
import {AuthService} from "../auth/auth-service";

export class QueueService {
  static createQueue(values: any) {
    const id = uuid4();
    const data = {
      ...values,
      id: id,
      dateCreated: serverTimestamp(),
      createdBy: AuthService.currentUserRef()
    };
    return setDoc(doc(Queue.collectionRef(), id), data);
  }

  static updateQueue(queue: Queue, values: any) {
    const data = {
      ...values,
      dateUpdated: serverTimestamp(),
      updatedBy: AuthService.currentUserRef()
    };
    return updateDoc(queue.documentRef(), data);
  }

  static createQueueItem(queue: Queue, values: any) {
    const id = uuid4();
    const data = {
      ...values,
      id: id,
      dateCreated: serverTimestamp(),
      createdBy: AuthService.currentUserRef()
    };
    return setDoc(doc(QueueItem.collectionRef(queue.id), id), data);
  }

  static updateQueueItem(queueItem: QueueItem, values: any) {
    const data = {
      ...values,
      dateUpdated: serverTimestamp(),
      updatedBy: AuthService.currentUserRef()
    };
    return updateDoc(queueItem.documentRef(), data);
  }
}