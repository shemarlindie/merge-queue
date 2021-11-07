import {UserInfo} from "firebase/auth";
import {doc, DocumentData, DocumentReference} from "firebase/firestore";
import {firestore} from "../config/firebase-config";
import {UserProxy} from "./models";

export function makeUserProfile(user: UserInfo): UserInfo {
  return {
    displayName: user.displayName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    photoURL: user.photoURL,
    providerId: user.providerId,
    uid: user.uid,
  };
}

export function makeUserProxy(user?: DocumentData | UserInfo | null): UserProxy {
  return {
    displayName: user?.displayName,
    email: user?.email,
    uid: user?.uid,
  };
}

export function makeUserProxyList(users?: DocumentData[] | UserInfo[]): UserProxy[] {
  return users ? users.map(makeUserProxy) : [];
}

export function userToRef(user?: UserInfo | null): DocumentReference {
  return doc(firestore, `users`, user?.uid || "undefined");
}

export function refToUser(ref: DocumentReference, users: UserInfo[]): UserInfo {
  return users.filter((u) => userToRef(u).path === ref.path)[0];
}