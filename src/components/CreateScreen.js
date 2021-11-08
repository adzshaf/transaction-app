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
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useForm, Controller} from 'react-hook-form';
import {createTransaction} from '../repository/transaction';
import {openDatabase} from 'react-native-sqlite-storage';

var db = openDatabase({name: 'transactionDatabase.db'});

function CreateScreen({navigation}) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm();

  const onSubmit = data => {
    let {amount, type, category, note} = data;
    console.log(data);
    db.transaction(function (tx) {
      tx.executeSql(
        'INSERT INTO table_transaction (date, amount, type, category, note) VALUES (?,?,?,?,?)',
        [new Date().toISOString(), amount, type, category, note],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            navigation.navigate('Home');
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

  return (
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
          required: true,
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
        defaultValue=""
      />
      <View>
        <Caption>Type</Caption>
        <Controller
          control={control}
          rules={{
            required: true,
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
        />
      </View>
      <View>
        <Caption>Category</Caption>
        <Controller
          control={control}
          rules={{
            required: true,
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
        defaultValue=""
      />
      <Button mode="contained" title="Submit" onPress={handleSubmit(onSubmit)}>
        Save
      </Button>
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

export default CreateScreen;
