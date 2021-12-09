import SQLite from 'react-native-sqlite-storage';
import axios from 'axios';
import {BACKEND_URL} from '@env';

const createTransaction = ({amount, type, category, note}) => {
  var db = SQLite.openDatabase({name: 'transactionDatabase.db'});

  db.transaction(function (tx) {
    tx.executeSql(
      'INSERT INTO table_transaction (date, amount, type, category, note) VALUES (?,?,?,?,?)',
      [new Date().toISOString(), amount, type, category, note],
      (tx, results) => {
        console.log('Results', results.rowsAffected);
        if (results.rowsAffected > 0) {
          return true;
        }
      },
    );
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

export {createTransaction, syncTransactionToBackend, saveSyncToDatabase};
