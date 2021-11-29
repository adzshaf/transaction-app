import * as React from 'react';
import {Appbar, Menu} from 'react-native-paper';

function CustomNavigationBar({navigation, back}) {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

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
          <Menu.Item
            onPress={() => {
              navigation.navigate('SignIn');
            }}
            title="Sign in"
          />
        </Menu>
      ) : null}
    </Appbar.Header>
  );
}

export default CustomNavigationBar;
