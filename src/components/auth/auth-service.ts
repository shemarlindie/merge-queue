import {UserInfo} from "firebase/auth";
import {collection, doc, setDoc} from "firebase/firestore";
import {auth, firestore} from "../../config/firebase-config";
import {makeUserProfile, makeUserProxy} from "./utils";

export class AuthService {
  static saveProfile(user: UserInfo): Promise<void> {
    return setDoc(doc(firestore, "users", user.uid), makeUserProfile(user));
  }

  static isAuthenticated() {
    return !!auth.currentUser?.uid;
  }

  static currentUser() {
    return this.isAuthenticated() ? auth.currentUser : null;
  }

  static currentUserProxy() {
    return this.isAuthenticated() ? makeUserProxy(this.currentUser()) : null;
  }

  static currentUserRef() {
    const user = this.currentUser();
    return user ? doc(this.usersCollectionRef(), user.uid) : null;
  }

  static usersCollectionRef() {
    return collection(firestore, "users");
  }
}