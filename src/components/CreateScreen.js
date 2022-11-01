import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  Text,
  Caption,
  useTheme,
  TextInput,
  RadioButton,
  Button,
} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {openDatabase} from 'react-native-sqlite-storage';
import DatePicker from 'react-native-date-picker';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import {getEmail} from '../store/auth';
import {useSelector} from 'react-redux';
import {update, getTs, getCount, getNode} from '../store/hlc';
import {toString, increment} from '../shared/hlcFunction';
import {useDispatch} from 'react-redux';
import HLC from '../shared/hlc';
import SQLite from 'react-native-sqlite-2';
import {queryInsertTransaction} from '../repository/transaction';

var db = SQLite.openDatabase('transactionDatabase.db');

// var db = openDatabase({name: 'transactionDatabase.db', createFromLocation: 1});

function CreateScreen({navigation}) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm();

  const email = useSelector(getEmail);
  const ts = useSelector(getTs);
  const count = useSelector(getCount);
  const node = useSelector(getNode);
  const dispatch = useDispatch();

  const onSubmit = async data => {
    const hlc = new HLC(ts, node, count);
    const incrementResult = hlc.increment(
      Math.round(new Date().getTime() / 1000),
    );
    dispatch(update(incrementResult));

    const insertResponse = await queryInsertTransaction({
      id: uuidv4(),
      data: JSON.stringify(data),
      name: 'ADD_TRANSACTION',
      email: email,
      hlc: hlc.toString(),
    });

    if (insertResponse) {
      navigation.navigate('Home');
    }
  };

  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const [date, setDate] = React.useState(new Date());
  const [open, setOpen] = React.useState(false);

  return (
    <View style={styles.container}>
      <Caption>Date</Caption>
      <View style={styles.row}>
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
      <View style={styles.row}>
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
      <View style={styles.row}>
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

      <View style={styles.row}>
        <Button
          mode="contained"
          title="Submit"
          onPress={handleSubmit(onSubmit)}>
          Save
        </Button>
      </View>
    </View>
  );
}

const makeStyles = () =>
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
      marginBottom: 8,
      marginTop: 8,
    },
    input: {
      marginTop: 8,
      marginBottom: 8,
    },
  });

export default CreateScreen;
