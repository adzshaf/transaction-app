import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  Text,
  Caption,
  useTheme,
  TextInput,
  RadioButton,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {openDatabase} from 'react-native-sqlite-storage';
import DatePicker from 'react-native-date-picker';
import {getEmail} from '../store/auth';
import {useSelector} from 'react-redux';
import {update, getTs, getCount, getNode} from '../store/hlc';
import {toString, increment} from '../shared/hlcFunction';
import {useDispatch} from 'react-redux';
import HLC from '../shared/hlc';
import SQLite from 'react-native-sqlite-2';


// var db = openDatabase({name: 'transactionDatabase.db', createFromLocation: 1});
var db = SQLite.openDatabase('transactionDatabase.db')

function EditScreen({route, navigation}) {
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

  const onSubmit = data => {
    const hlc = new HLC(ts, node, count);
    const incrementResult = hlc.increment(
      Math.round(new Date().getTime() / 1000),
    );
    dispatch(update(incrementResult));
    db.transaction(function (tx) {
      tx.executeSql(
        'INSERT INTO table_event (stream_id, data, name, email, hlc) VALUES (?,?,?,?,?)',
        [
          transactionId,
          JSON.stringify(data),
          'EDIT_TRANSACTION',
          email,
          hlc.toString(),
        ],
        (tx, results) => {
          navigation.navigate('Home');
        },
      );
    });
  };

  const deleteTransaction = defaultData => {
    const hlc = new HLC(ts, node, count);
    const incrementResult = hlc.increment(
      Math.round(new Date().getTime() / 1000),
    );
    dispatch(update(incrementResult));
    db.transaction(function (tx) {
      tx.executeSql(
        'INSERT INTO table_event (stream_id, data, name, email, hlc) VALUES (?,?,?,?,?)',
        [
          transactionId,
          JSON.stringify(defaultData),
          'DELETE_TRANSACTION',
          email,
          hlc.toString(),
        ],
        (tx, results) => {
          navigation.navigate('Home');
        },
        error => console.log(error),
      );
    });
  };

  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const [date, setDate] = React.useState(new Date());
  const [open, setOpen] = React.useState(false);

  const {transactionId} = route.params;
  const [defaultData, setDefaultData] = React.useState(null);

  React.useEffect(() => {
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT JSON_EXTRACT(data, '$') FROM table_event \
        WHERE stream_id = ? AND hlc = (SELECT MAX(hlc) FROM table_event WHERE stream_id = ?)",
        [transactionId, transactionId],
        (tx, results) => {
          let resultData = JSON.parse(
            results.rows.item(0)["JSON_EXTRACT(data, '$')"],
          );

          setDefaultData(resultData);
          setDate(resultData['date']);
        },
        err => {
          console.log(err);
        },
      );
    });
  }, []);

  return defaultData === null ? (
    <ActivityIndicator />
  ) : (
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
            date={new Date(defaultData.date)}
            onConfirm={valueDate => {
              setOpen(false);
              setDate(valueDate);
              onChange(valueDate);
            }}
            onCancel={() => {
              setOpen(false);
            }}
            mode="date"
          />
        )}
        name="date"
        defaultValue={defaultData.date}
      />
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
      <View style={styles.row}>
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
      <View style={styles.row}>
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
      <View style={styles.row}>
        <Button
          mode="contained"
          title="Submit"
          onPress={handleSubmit(onSubmit)}>
          Save
        </Button>
      </View>

      <View style={styles.row}>
        <Button onPress={() => deleteTransaction(defaultData)}>Delete</Button>
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
      marginTop: 8,
      marginBottom: 8,
    },
    input: {
      marginTop: 8,
      marginBottom: 8,
    },
  });

export default EditScreen;
