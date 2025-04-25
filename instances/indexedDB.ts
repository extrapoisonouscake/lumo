import { toast } from "sonner";

export let indexedDB: IDBDatabase;
const request = window.indexedDB.open("main");
request.onerror = (event) => {
  toast.error("Failed to open indexedDB");
};
request.onsuccess = (event) => {
  indexedDB = (event.target as EventTarget & { result: IDBDatabase }).result;
};
