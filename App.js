import * as React from 'react';
import {View, Text, Button} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './src/components/HomeScreen';
import Form from './src/components/CreateScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} options={{title: 'Home'}} />
        <Stack.Screen
          name="Create"
          component={Form}
          options={{title: 'Create Transaction'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
