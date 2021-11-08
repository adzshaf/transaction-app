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

function CreateScreen({navigation}) {
  const [value, setValue] = React.useState('Income');
  const [category, setCategory] = React.useState('Food');
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
      <TextInput label="Amount" />
      <View>
        <Caption>Type</Caption>
        <RadioButton.Group
          onValueChange={newValue => setValue(newValue)}
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
      </View>
      <View>
        <Caption>Category</Caption>
        <RadioButton.Group
          onValueChange={newValue => setCategory(newValue)}
          value={category}>
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
      </View>
      <TextInput label="Note" />
      <Button mode="contained">Save</Button>
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
