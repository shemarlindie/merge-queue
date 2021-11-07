export class LocalStorage {
  static get<T>(key: string, defaultValue: T): T {
    let val = localStorage.getItem(key);
    val = val === "undefined" ? "null" : val;
    return (val && JSON.parse(val)) || defaultValue;
  }

  static set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }
}