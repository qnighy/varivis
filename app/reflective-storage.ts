export function reflectiveSetItem(this: Storage, key: string, value: string): void {
  const oldValue = this.getItem(key);
  this.setItem(key, value);
  window.dispatchEvent(new StorageEvent("storage", {
    key,
    newValue: value,
    oldValue,
    storageArea: this,
    url: location.href,
  }));
}

export function reflectiveRemoveItem(this: Storage, key: string): void {
  const oldValue = this.getItem(key);
  this.removeItem(key);
  window.dispatchEvent(new StorageEvent("storage", {
    key,
    newValue: null,
    oldValue,
    storageArea: this,
    url: location.href,
  }));
}

export function reflectiveClear(this: Storage): void {
  this.clear();
  window.dispatchEvent(new StorageEvent("storage", {
    key: null,
    newValue: null,
    oldValue: null,
    storageArea: this,
    url: location.href,
  }));
}
