import SQLite from 'react-native-sqlite-2';

const updateNullEmailInTable = async email => {
  var db = SQLite.openDatabase('transactionDatabase.db');

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
  var db = SQLite.openDatabase('transactionDatabase.db');

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
  var db = SQLite.openDatabase('transactionDatabase.db');

  return new Promise((resolve, reject) => {
    db.transaction(txn => {
      txn.executeSql(
        'DELETE FROM table_event',
        [],
        (tx, results) => {
          if (data.length == 0) {
            resolve('success');
          }

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

const loadDatabase = async () => {
  var db = SQLite.openDatabase('transactionDatabase.db');

  return new Promise((resolve, reject) => {
    db.transaction(txn => {
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS "table_event" ("id" INTEGER, "stream_id"	VARCHAR(36) NOT NULL, "data"	TEXT NOT NULL, "name"	VARCHAR(50) NOT NULL, "email"	VARCHAR(255), "hlc"	VARCHAR(100) NOT NULL, "sync_at"	INTEGER, PRIMARY KEY("id" AUTOINCREMENT) )',
        [],
        (tx, results) => {
          resolve('success');
        },
        err => console.log('err', err),
      );
    });
  });
};

const queryAllTransactionByEmail = async email => {
  var db = SQLite.openDatabase('transactionDatabase.db');

  return new Promise((resolve, reject) => {
    db.transaction(txn => {
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS "table_event" ("id" INTEGER, "stream_id"	VARCHAR(36) NOT NULL, "data"	TEXT NOT NULL, "name"	VARCHAR(50) NOT NULL, "email"	VARCHAR(255), "hlc"	VARCHAR(100) NOT NULL, "sync_at"	INTEGER, PRIMARY KEY("id" AUTOINCREMENT) )',
        [],
      );
      txn.executeSql(
        "SELECT id, stream_id, JSON_EXTRACT(data, '$') from table_event \
        WHERE email = ? AND (stream_id, hlc) in (SELECT stream_id, max(hlc) FROM table_event GROUP BY stream_id) \
        AND stream_id NOT IN (SELECT stream_id FROM table_event WHERE name == 'DELETE_TRANSACTION')\
        ORDER BY JSON_EXTRACT(data, '$.date') DESC",
        [email],
        (tx, results) => {
          let responseData = [];
          for (let i = 0; i < results.rows.length; ++i) {
            let data = JSON.parse(
              results.rows.item(i)["JSON_EXTRACT(data, '$')"],
            );
            data['stream_id'] = results.rows.item(i)['stream_id'];
            data['id'] = results.rows.item(i)['id'];
            responseData.push(data);
          }
          resolve(responseData);
        },
        (_, error) => console.log('err', error),
      );
    });
  });
};

const queryInsertTransaction = async inputData => {
  var db = SQLite.openDatabase('transactionDatabase.db');

  const {id, data, name, email, hlc} = inputData;

  return new Promise((resolve, reject) => {
    db.transaction(function (tx) {
      tx.executeSql(
        'INSERT INTO table_event (stream_id, data, name, email, hlc) VALUES (?,?,?,?,?)',
        [id, JSON.stringify(data), name, email, hlc],
        (tx, results) => {
          resolve(true);
        },
        (_, error) => console.log('err', error),
      );
    });
  });
};

export {
  updateNullEmailInTable,
  selectTransactionToBackend,
  saveSyncToDatabase,
  deleteDatabase,
  loadDatabase,
  queryAllTransactionByEmail,
  queryInsertTransaction,
};
