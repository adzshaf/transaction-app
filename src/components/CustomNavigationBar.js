import * as React from 'react';
import {Appbar, Menu} from 'react-native-paper';
import {isLoggedIn, getAccessToken, updateToken, getEmail} from '../store/auth';
import {useSelector} from 'react-redux';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useDispatch} from 'react-redux';
import {logout} from '../store/auth';
import {syncTransaction} from '../repository/transaction';

function CustomNavigationBar({navigation, back}) {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const loggedIn = useSelector(isLoggedIn);
  const email = useSelector(getEmail);
  const accessTokenState = useSelector(getAccessToken);
  const dispatch = useDispatch();

  const sync = async () => {
    // await GoogleSignin.clearCachedAccessToken(accessTokenState);
    // const {idToken, accessToken} = await GoogleSignin.getTokens();
    // dispatch(updateToken({token: idToken, accessToken: accessToken}));
    syncTransaction(email);
  };

  const signOut = async () => {
    try {
      dispatch(logout());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Appbar.Header>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title="Transaction App" />
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Appbar.Action icon="menu" color="white" onPress={openMenu} />}>
        {loggedIn ? (
          <Menu.Item title="Sync" onPress={() => sync()} />
        ) : (
          <Menu.Item
            onPress={() => {
              navigation.navigate('SignIn');
            }}
            title="Sign in"
          />
        )}
        {loggedIn && <Menu.Item title="Sign out" onPress={() => signOut()} />}
      </Menu>
    </Appbar.Header>
  );
}

export default CustomNavigationBar;
