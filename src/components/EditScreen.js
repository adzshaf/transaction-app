import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  FAB,
  Title,
  Text,
  Caption,
  useTheme,
  TextInput,
  RadioButton,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useForm, Controller} from 'react-hook-form';
import {openDatabase} from 'react-native-sqlite-storage';

var db = openDatabase({name: 'transactionDatabase.db'});

function EditScreen({route, navigation}) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm();

  const onSubmit = data => {
    let {amount, type, category, note} = data;
    db.transaction(function (tx) {
      tx.executeSql(
        'UPDATE table_transaction SET date = ?, amount = ?, type = ?, category = ?, note = ? WHERE transaction_id = ?',
        [new Date().toISOString(), amount, type, category, note, transactionId],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            navigation.push('Home');
          }
        },
      );
    });
  };

  const deleteTransaction = () => {
    db.transaction(function (tx) {
      tx.executeSql(
        'DELETE FROM table_transaction WHERE transaction_id = ?',
        [transactionId],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            navigation.push('Home');
          }
        },
      );
    });
  };

  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const [date, setDate] = React.useState(new Date());
  const [mode, setMode] = React.useState('date');
  const [show, setShow] = React.useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  const {transactionId} = route.params;
  const [defaultData, setDefaultData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    db.transaction(function (txn) {
      txn.executeSql(
        'SELECT * FROM table_transaction WHERE transaction_id = ?',
        [transactionId],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }

          if (temp.length > 0) {
            setDefaultData(temp[0]);
          }
        },
      );
    });
  }, []);

  return defaultData === null ? (
    <ActivityIndicator />
  ) : (
    <View style={styles.container}>
      <Caption>Date</Caption>
      <View>
        <Text onPress={showDatepicker}>
          {new Date(date).toLocaleDateString('id-ID')}
        </Text>
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
      <Controller
        control={control}
        rules={{
          required: false,
        }}
        render={({field: {onChange, onBlur, value}}) => {
          return (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={value => onChange(value)}
              value={value}
              label="Amount"
            />
          );
        }}
        name="amount"
        defaultValue={defaultData.amount.toString()}
      />
      <View>
        <Caption>Type</Caption>
        <Controller
          control={control}
          rules={{
            required: false,
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <RadioButton.Group
              onValueChange={newValue => onChange(newValue)}
              value={value}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <RadioButton value="Income" />
                <Text>Income</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <RadioButton value="Expense" />
                <Text>Expense</Text>
              </View>
            </RadioButton.Group>
          )}
          name="type"
          defaultValue={defaultData.type}
        />
      </View>
      <View>
        <Caption>Category</Caption>
        <Controller
          control={control}
          rules={{
            required: false,
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <RadioButton.Group
              onValueChange={newValue => onChange(newValue)}
              value={value}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <RadioButton value="Food" />
                <Text>Food</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <RadioButton value="Holiday" />
                <Text>Holiday</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <RadioButton value="Culture" />
                <Text>Culture</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <RadioButton value="Health" />
                <Text>Health</Text>
              </View>
            </RadioButton.Group>
          )}
          name="category"
          defaultValue={defaultData.category}
        />
      </View>
      <Controller
        control={control}
        rules={{
          required: false,
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            label="Note"
          />
        )}
        name="note"
        defaultValue={defaultData.note}
      />
      <Button mode="contained" title="Submit" onPress={handleSubmit(onSubmit)}>
        Save
      </Button>

      <Button onPress={() => deleteTransaction()}>Delete</Button>
    </View>
  );
}

const makeStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 15,
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

export default EditScreen;
