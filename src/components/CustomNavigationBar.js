import * as React from 'react';
import {Appbar, Menu} from 'react-native-paper';
import {
  isLoggedIn,
  getAccessToken,
  updateToken,
  getEmail,
  getToken,
} from '../store/auth';
import {useSelector} from 'react-redux';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useDispatch} from 'react-redux';
import {logout} from '../store/auth';
import {
  selectTransactionToBackend,
  saveSyncToDatabase,
  deleteDatabaseTableEvent,
} from '../repository/transaction';
import {getTs, getCount, getNode, update} from '../store/hlc';
import axios from 'axios';
import {BACKEND_URL} from '@env';
import HLC from '../shared/hlc';
import {fromString, toString} from '../shared/hlcFunction';

function CustomNavigationBar({navigation, back}) {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const loggedIn = useSelector(isLoggedIn);
  const email = useSelector(getEmail);
  const accessTokenState = useSelector(getAccessToken);
  const token = useSelector(getToken);
  const dispatch = useDispatch();
  const ts = useSelector(getTs);
  const count = useSelector(getCount);
  const node = useSelector(getNode);

  const sortResponseByHlc = response => {
    response.sort((first, second) => {
      let firstHlc = HLC.fromString(first.hlc);
      let secondHlc = HLC.fromString(second.hlc);

      return firstHlc.compare(secondHlc);
    });
  };

  const parseHlcFromRemote = response => {
    let syncTs = ts;
    let syncCount = count;
    let syncNode = node;
    let localHlc;

    let responseData = response.map(value => {
      // Melakukan parsing dari string HLC server
      let remoteHlc = HLC.fromString(value.hlc);

      // Membuat HLC dari data lokal
      localHlc = new HLC(syncTs, syncNode, syncCount);

      // Melakukan operasi penerimaan event baru dari peladen pada HLC lokal
      localHlc.receive(remoteHlc);

      syncTs = localHlc.ts;
      syncCount = localHlc.count;
      syncNode = localHlc.node;

      value.hlc = localHlc.toString();

      return value;
    });

    // Melakukan pembaruan ts, count, dan node pada clock lokal yang disimpan di Redux
    dispatch(
      update({ts: localHlc.ts, count: localHlc.count, node: localHlc.node}),
    );

    return responseData;
  };

  const syncData = async () => {
    let data = await selectTransactionToBackend(email);

    if (data.length == 0) {
      data = [];
    }

    const response = await axios.post(
      `${BACKEND_URL}/sync`,
      {data: data},
      {headers: {Authorization: `Bearer ${token}`}},
    );
    const {data: responseData} = response.data;

    sortResponseByHlc(responseData);
    let parsedResponse = parseHlcFromRemote(responseData);

    await deleteDatabaseTableEvent();
    await saveSyncToDatabase(parsedResponse);
    navigation.push('Home');
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      const deleteDatabaseResponse = await deleteDatabaseTableEvent();
      dispatch(logout());
      navigation.replace('Home');
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
        anchor={<Appbar.Action icon="menu" onPress={openMenu} />}>
        {loggedIn ? (
          <Menu.Item title="Sync" onPress={() => syncData()} />
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
