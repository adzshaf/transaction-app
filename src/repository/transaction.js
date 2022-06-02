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
        'SELECT * from table_event WHERE email = ? AND sync_at IS NULL',
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

const saveSyncToDatabase = async data => {
  var db = SQLite.openDatabase({
    name: 'transactionDatabase.db',
    createFromLocation: 1,
  });

  let queryValue = [];
  let queryCommand = '';

  data.map((value, index) => {
    queryValue.push(
      value.email,
      value.data,
      value.stream_id,
      value.hlc,
      value.name,
      value.sync_at,
    );

    queryCommand += '(?,?,?,?,?,?)';

    if (index !== data.length - 1) {
      queryCommand += ',';
    }
  });

  return new Promise((resolve, reject) => {
    db.transaction(txn => {
      txn.executeSql(
        'DELETE FROM table_event',
        [],
        (tx, results) => {
          txn.executeSql(
            `INSERT INTO table_event (email, data, stream_id, hlc, name, sync_at) VALUES ${queryCommand}`,
            queryValue,
            (tx, results) => {
              resolve('success');
            },
          );
        },
        err => console.log('err', err),
      );
    });
  });
};

const deleteDatabase = async data => {
  var db = SQLite.openDatabase({
    name: 'transactionDatabase.db',
    createFromLocation: 1,
  });

  return new Promise((resolve, reject) => {
    db.transaction(txn => {
      txn.executeSql(
        'DELETE FROM table_event',
        [],
        (tx, results) => {
          resolve('success');
        },
        err => console.log('err', err),
      );
    });
  });
};

export {
  updateNullEmailInTable,
  syncTransactionToBackend,
  saveSyncToDatabase,
  deleteDatabase,
};
