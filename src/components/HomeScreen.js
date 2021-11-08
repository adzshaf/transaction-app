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
  return (
    <>
      <FlatList
        style={styles.container}
        data={items}
        renderItem={({item}) => (
          <View style={styles.row}>
            <Subheading>
              {new Date(item.occured_at).toLocaleDateString('id-ID')}
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
