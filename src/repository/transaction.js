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

const selectTransactionToBackend = async email => {
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

  return new Promise((resolve, reject) => {
    db.transaction(txn => {
      txn.executeSql(
        'DELETE FROM table_event',
        [],
        (tx, results) => {
          const chunkSize = 100;
          for (let i = 0; i < data.length; i += chunkSize) {
            let queryValue = [];
            let queryCommand = '';
            const chunk = data.slice(i, i + chunkSize);

            chunk.map((value, index) => {
              queryValue.push(
                value.email,
                value.data,
                value.stream_id,
                value.hlc,
                value.name,
                value.sync_at,
              );

              queryCommand += '(?,?,?,?,?,?)';

              if (index !== chunk.length - 1) {
                queryCommand += ',';
              }
            });

            txn.executeSql(
              `INSERT INTO table_event (email, data, stream_id, hlc, name, sync_at) VALUES ${queryCommand}`,
              queryValue,
              (tx, results) => {
                resolve('success');
              },
              err => console.log('error insert', err),
            );
          }
        },
        err => console.log('error delete:', err),
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
  selectTransactionToBackend,
  saveSyncToDatabase,
  deleteDatabase,
};
