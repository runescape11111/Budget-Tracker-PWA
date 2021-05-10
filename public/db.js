let db;
const request = window.indexedDB.open('BudgetDB', 1);

// TODO: setup database with BudgetStore object store.
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  const BudgetStore = db.createObjectStore('BudgetDB', {
    autoIncrement: true,
  });
  // BudgetStore.createIndex('statusIndex', 'status');
};

request.onsuccess = function (event) {
  console.log("open BudgetDB success 🔌");
  db = event.target.result;

  if (navigator.onLine) {
    console.log("Online! 🌐");
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log(`⛔ ${event.target.errorCode}`);
};

// TODO: checkDatabase is called when the user goes online. This function should
// get all items in the BudgetStore object store and send a request to the
// backend to add them to the database. If the request is successful, all items
// should be removed from the BudgetStore object store.
function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(["BudgetDB"],"readwrite");
  // access your BudgetStore object
  const BudgetStore = transaction.objectStore("BudgetDB");
  // get all entries in the BudgetStore
  const getAll = BudgetStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.length > 0) {
            // create a new readwrite transaction with the BudgetStore
            // access the BudgetStore object store
            // clear all items in BudgetStore
            const transaction = db.transaction(["BudgetDB"],"readwrite");
            const BudgetStore = transaction.objectStore("BudgetDB");
            const getAll = BudgetStore.getAll();

            getAll.onsuccess = function() {
              BudgetStore.clear();
            }
          }
        });
    }
  };
}

// TODO: saveRecord accepts a record object and saves it in the BudgetStore
// object store
function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  // access your pending object store
  // add record to your store with add method.
  const transaction = db.transaction(["BudgetDB"],"readwrite");
  const BudgetStore = transaction.objectStore("BudgetDB");
  BudgetStore.add(record);
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
