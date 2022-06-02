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
  syncTransactionToBackend,
  saveSyncToDatabase,
  deleteDatabase,
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

  const syncData = async () => {
    const data = await syncTransactionToBackend(email);
    const response = await axios.post(
      `${BACKEND_URL}/sync`,
      {data: data},
      {headers: {Authorization: `Bearer ${token}`}},
    );
    const {data: responseData} = response.data;

    let syncTs = ts;
    let syncCount = count;
    let syncNode = node;

    responseData.map((value, index) => {
      // Melakukan parsing dari string HLC server dan membuat HLC berdasarkan hasil parsing
      let {
        ts: remoteTs,
        count: remoteCount,
        node: remoteNode,
      } = fromString(value.hlc);
      let remoteHlc = new HLC(remoteTs, remoteNode, remoteCount);

      // Membuat HLC dari data lokal
      let localHlc = new HLC(syncTs, syncNode, syncCount);

      // Melakukan operasi penerimaan event baru dari server pada HLC lokal
      let syncHlc = localHlc.receive(
        remoteHlc,
        Math.round(new Date().getTime() / 1000),
      );

      let {ts: syncTs, count: syncCount, node: syncNode} = syncHlc;

      value.hlc = new HLC(syncTs, syncNode, syncCount).toString();
      console.log(value.hlc);
    });

    // Melakukan pembaruan ts, count, dan node pada clock lokal yang disimpan di Redux
    dispatch(update({ts: syncTs, count: syncCount, node: syncNode}));

    const saveToDb = saveSyncToDatabase(responseData);
    navigation.push('Home');
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      const deleteDatabaseResponse = await deleteDatabase();
      dispatch(logout());
      navigation.push('Home');
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
