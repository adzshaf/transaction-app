import * as React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {FAB, Text, Subheading, useTheme, Colors} from 'react-native-paper';
import {openDatabase} from 'react-native-sqlite-storage';
import {getEmail} from '../store/auth';
import {useSelector} from 'react-redux';

import {useIsFocused} from '@react-navigation/native';

var db = openDatabase({name: 'transactionDatabase.db', createFromLocation: 1});

function HomeScreen({navigation}) {
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  const email = useSelector(getEmail);

  const isFocused = useIsFocused();

  const [flatListItems, setFlatListItems] = React.useState([]);

  React.useEffect(() => {
    db.transaction(function (txn) {
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
          setFlatListItems(responseData);
        },
        error => console.log(error),
      );
    });
  }, [isFocused]);

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
