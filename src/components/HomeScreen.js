import * as React from 'react';
import {View, Button, FlatList, StyleSheet} from 'react-native';
import {
  FAB,
  Title,
  Text,
  Subheading,
  useTheme,
  Colors,
} from 'react-native-paper';
import {openDatabase} from 'react-native-sqlite-storage';

var db = openDatabase({name: 'transactionDatabase.db'});

const items = [
  {
    id: '0',
    occured_at: 1635797174618,
    amount: 2000,
    type: 'Income',
    note: 'haha',
    category: 'Health',
  },
  {
    id: '1',
    occured_at: 1635797174618,
    amount: 3000,
    type: 'Expense',
    category: 'Holiday',
  },
  {
    id: '2',
    occured_at: 1635797174618,
    amount: 400,
    type: 'Income',
    category: 'Culture',
  },
];

function HomeScreen({navigation}) {
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const [flatListItems, setFlatListItems] = React.useState([]);

  React.useEffect(() => {
    db.transaction(function (txn) {
      // txn.executeSql(
      //   "SELECT name FROM sqlite_master WHERE type='table' AND name='table_transaction'",
      //   [],
      //   function (tx, res) {
      //     console.log('item:', res.rows);
      //     if (res.rows.length == 0) {
      //       txn.executeSql('DROP TABLE IF EXISTS table_transaction', []);
      //       txn.executeSql(
      //         'CREATE TABLE IF NOT EXISTS table_transaction(transaction_id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, amount INT, type VARCHAR(30), category VARCHAR(30), note VARCHAR(255))',
      //         [],
      //       );
      //     }
      //   },
      // );
      txn.executeSql('SELECT * FROM table_transaction', [], (tx, results) => {
        let temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        console.log(temp);
        console.log(temp.length);
        setFlatListItems(temp);
      });
    });
  }, []);

  return (
    <>
      <FlatList
        style={styles.container}
        data={flatListItems}
        renderItem={({item}) => (
          <View style={styles.row}>
            <Subheading>
              {new Date(item.date).toLocaleDateString('id-ID')}
            </Subheading>
            <View style={styles.col}>
              <View>
                <Text>Type: {item.type}</Text>
                <Text>Category: {item.category}</Text>
                <Text>Note: {item.note ? item.note : '-'}</Text>
              </View>
              <View>
                <Text
                  style={{
                    color:
                      item.type === 'Income'
                        ? Colors.blue900
                        : colors.notification,
                  }}>
                  Amount: {item.amount}
                </Text>
              </View>
            </View>
          </View>
        )}
        keyExtractor={item => item.transaction_id}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('Create')}
      />
    </>
  );
}

const makeStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    col: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    row: {
      padding: 15,
      marginBottom: 5,
      backgroundColor: colors.background,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: colors.notification,
    },
  });

export default HomeScreen;
