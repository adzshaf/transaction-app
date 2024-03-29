import * as React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {
  FAB,
  Text,
  Subheading,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import {getEmail} from '../store/auth';
import {useIsFocused} from '@react-navigation/native';
import {queryAllTransactionByEmail} from '../repository/transaction';
import {endTimer, getTime} from '../store/timer'
import {useDispatch, useSelector} from 'react-redux'
import {logger} from 'react-native-logs'

function HomeScreen({navigation}) {
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  const email = useSelector(getEmail);
  const [isLoading, setIsLoading] = React.useState(false);

  const isFocused = useIsFocused();

  const [flatListItems, setFlatListItems] = React.useState(null);
  const dispatch = useDispatch()
  var log = logger.createLogger();

  React.useEffect(() => {
    async function queryAllTransactions() {
      setIsLoading(true)
      const transactions = await queryAllTransactionByEmail(email);
      setFlatListItems(transactions);
      setIsLoading(false)
      dispatch(endTimer())
    }

    queryAllTransactions();
  }, [isFocused]);

  const time = useSelector(getTime)
  log.info('SYNC TIME (reducer): ' + time);

  return (
    <>
      {flatListItems === null ? (
        <ActivityIndicator />
      ) : (
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
                        color: item.type === 'Income' ? '#338BA8' : '#FF5C5C',
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
      )}
      <FAB
        style={styles.fab}
        variant="primary"
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
      padding: 15,
      backgroundColor: colors.surfaceVariant,
    },
    col: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    row: {
      padding: 15,
      marginBottom: 5,
      backgroundColor: colors.background,
      borderRadius: 15,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
    },
  });

export default HomeScreen;
