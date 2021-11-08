import {openDatabase} from 'react-native-sqlite-storage';

const createTransaction = ({amount, type, category, note}) => {
  var db = openDatabase({name: 'transactionDatabase.db'});

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

export {createTransaction};
