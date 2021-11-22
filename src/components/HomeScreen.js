import * as React from 'react';
import {
  View,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
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

function HomeScreen({navigation}) {
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const [flatListItems, setFlatListItems] = React.useState([]);

  React.useEffect(() => {
    db.transaction(
      function (txn) {
        // txn.executeSql(
        //   "SELECT name FROM sqlite_master WHERE type='table' AND name='table_transaction'",
        //   [],
        //   function (tx, res) {
        //     if (res.rows.length == 0) {
        //       txn.executeSql('DROP TABLE IF EXISTS table_transaction', []);
        //       txn.executeSql(
        //         'CREATE TABLE IF NOT EXISTS table_transaction(transaction_id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, amount INT, type VARCHAR(30), category VARCHAR(30), note VARCHAR(255))',
        //         [],
        //       );
        //     }
        //   },
        // );
        // txn.executeSql(
        //   "SELECT name FROM sqlite_master WHERE type='table' AND name='table_event'",
        //   [],
        //   function (tx, res) {
        //     if (res.rows.length == 0) {
        //       txn.executeSql('DROP TABLE IF EXISTS table_event', []);
        //       txn.executeSql(
        //         'CREATE TABLE IF NOT EXISTS table_event(id INTEGER PRIMARY KEY AUTOINCREMENT, stream_id VARCHAR(36), version INTEGER, data TEXT)',
        //         [],
        //       );
        //     }
        //   },
        // );
        // txn.executeSql('SELECT * FROM table_transaction', [], (tx, results) => {
        //   let temp = [];
        //   for (let i = 0; i < results.rows.length; ++i) {
        //     temp.push(results.rows.item(i));
        //   }
        //   setFlatListItems(temp);
        // });
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS table_event(id INTEGER PRIMARY KEY AUTOINCREMENT, stream_id VARCHAR(36), version INTEGER, data TEXT)',
          [],
        );
        txn.executeSql(
          'SELECT * FROM table_event ORDER BY version ASC',
          [],
          (tx, results) => {
            let temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              let data = JSON.parse(results.rows.item(i).data);
              let streamId = results.rows.item(i)['stream_id'];
              let id = results.rows.item(i)['id'];
              data['stream_id'] = streamId;
              data['id'] = id;
              temp.push(data);
            }
            setFlatListItems(temp);
          },
        );
      },
      error => console.log(error),
    );
  }, []);

  return (
    <>
      <FlatList
        style={styles.container}
        data={flatListItems}
        renderItem={({item}) => (
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Edit', {
                  transactionId: item.stream_id,
                })
              }>
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
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.id}
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
