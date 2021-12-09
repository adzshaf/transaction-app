import SQLite from 'react-native-sqlite-storage';

const updateNullEmailInTable = async email => {
  var db = SQLite.openDatabase({
    name: 'transactionDatabase.db',
    createFromLocation: 1,
  });

  return new Promise((resolve, reject) => {
    db.transaction(txn => {
      txn.executeSql(
        'SELECT COUNT(*) FROM table_event WHERE email IS NULL',
        [],
        (tx, results) => {
          let count = results.rows.item(0)['COUNT(*)'];
          if (count > 0) {
            txn.executeSql(
              'UPDATE table_event SET email = ? WHERE email IS NULL',
              [email],
              (tx, results) => {
                resolve('success');
              },
              err => console.log(err),
            );
          }
        },
      );
    });
  });
};

const syncTransactionToBackend = async email => {
  var db = SQLite.openDatabase({
    name: 'transactionDatabase.db',
    createFromLocation: 1,
  });

  return new Promise((resolve, reject) =>
    db.transaction(txn => {
      txn.executeSql(
        'SELECT * from table_event WHERE email = ?',
        [email],
        (tx, results) => {
          let data = [];
          for (let i = 0; i < results.rows.length; ++i) {
            data.push(results.rows.item(i));
          }
          resolve(data);
        },
      );
    }),
  );
};

const saveSyncToDatabase = data => {
  console.log('data', data);
};

export {updateNullEmailInTable, syncTransactionToBackend, saveSyncToDatabase};
