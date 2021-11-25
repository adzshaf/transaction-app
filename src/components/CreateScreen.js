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
import {useForm, Controller} from 'react-hook-form';
import {createTransaction} from '../repository/transaction';
import {openDatabase} from 'react-native-sqlite-storage';
import DatePicker from 'react-native-date-picker';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

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
    db.transaction(function (tx) {
      tx.executeSql(
        'INSERT INTO table_event (stream_id, version, data, name) VALUES (?,?,?,?)',
        [uuidv4(), 1, JSON.stringify(data), 'ADD_TRANSACTION'],
        (tx, results) => {
          navigation.push('Home');
        },
        error => console.log(error),
      );
    });
  };

  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const [date, setDate] = React.useState(new Date());
  const [open, setOpen] = React.useState(false);

  return (
    <View style={styles.container}>
      <Caption>Date</Caption>
      <View>
        <Text onPress={() => setOpen(true)}>
          {new Date(date).toLocaleDateString('id-ID')}
        </Text>
      </View>
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <DatePicker
            modal
            open={open}
            date={date}
            onConfirm={date => {
              setOpen(false);
              setDate(date);
              onChange(date);
            }}
            onCancel={() => {
              setOpen(false);
            }}
            mode="date"
          />
        )}
        name="date"
        defaultValue=""
      />
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
