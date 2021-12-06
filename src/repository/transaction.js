import {openDatabase} from 'react-native-sqlite-storage';
import axios from 'axios';
import {BACKEND_URL} from '@env';

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

const syncTransaction = email => {
  var db = openDatabase({
    name: 'transactionDatabase.db',
    createFromLocation: 1,
  });

  db.transaction(function (txn) {
    txn.executeSql(
      'SELECT * from table_event WHERE email = ?',
      [email],
      (tx, results) => {
        let temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        axios
          .post(`${BACKEND_URL}/sync`, {data: temp})
          .then(data => console.log('huhu'))
          .catch(err => console.log(err));
      },
      error => console.log(error),
    );
  });
};

export {createTransaction, syncTransaction};
