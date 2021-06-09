let db;

const request = window.indexedDB.open('budget', 1);
request.onupgradeneeded = function(event) {
	db = event.target.result;
	const budgetStore = db.createObjectStore('budgetStore', {
		keyPath: 'listID',
		autoIncrement: 'true'
	});
};

request.onsuccess = function(event) {
	db = event.target.result;

	if (navigator.onLine) {
		checkDatabase();
	}
};

request.onerror = function(event) {
	console.log(event);
};

function saveRecord(record) {
	const transaction = db.transaction([ 'budgetStore' ], 'readwrite');
	const budgetStore = transaction.objectStore('budgetStore');
	budgetStore.add(record);
}

function checkDatabase() {
	const transaction = db.transaction([ 'budgetStore' ], 'readwrite');
	const budgetStore = transaction.objectStore('budgetStore');
	const getAll = budgetStore.getAll();

	getAll.onsuccess = function() {
		if (getAll.result.length > 0) {
			fetch('/api/transaction/bulk', {
				method: 'POST',
				body: JSON.stringify(getAll.result),
				headers: {
					Accept: 'application/json, text/plain, */*',
					'Content-Type': 'application/json'
				}
			})
				.then((response) => response.json())
				.then(() => {
					const transaction = db.transaction([ 'budgetStore' ], 'readwrite');
					const budgetStore = transaction.objectStore('budgetStore');
					budgetStore.clearAll();
				});
		}
	};
}

window.addEventListener('online', checkDatabase);
