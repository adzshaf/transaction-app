import * as React from 'react';
import {Appbar, Menu} from 'react-native-paper';
import {isLoggedIn} from '../store/auth';
import {useSelector} from 'react-redux';

function CustomNavigationBar({navigation, back}) {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const loggedIn = useSelector(isLoggedIn);

  return (
    <Appbar.Header>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title="Transaction App" />
      {!back ? (
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <Appbar.Action icon="menu" color="white" onPress={openMenu} />
          }>
          {loggedIn ? (
            <Menu.Item
              onPress={() => {
                navigation.navigate('SignIn');
              }}
              title="Sync"
            />
          ) : (
            <Menu.Item
              onPress={() => {
                navigation.navigate('SignIn');
              }}
              title="Sign in"
            />
          )}
          {loggedIn && <Menu.Item title="Sign out" />}
        </Menu>
      ) : null}
    </Appbar.Header>
  );
}

export default CustomNavigationBar;
