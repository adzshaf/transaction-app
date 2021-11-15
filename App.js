import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './src/components/HomeScreen';
import Form from './src/components/CreateScreen';
import EditForm from './src/components/EditScreen';

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
        <Stack.Screen
          name="Edit"
          component={EditForm}
          options={{title: 'Edit Transaction'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
