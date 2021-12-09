import * as React from 'react';
import {Appbar, Menu} from 'react-native-paper';
import {isLoggedIn, getAccessToken, updateToken, getEmail} from '../store/auth';
import {useSelector} from 'react-redux';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useDispatch} from 'react-redux';
import {logout} from '../store/auth';
import {
  syncTransactionToBackend,
  saveSyncToDatabase,
} from '../repository/transaction';
import {getTs, getCount, getNode, update} from '../store/hlc';
import axios from 'axios';
import {BACKEND_URL} from '@env';
import HLC from '../shared/hlc';
import {fromString} from '../shared/hlcFunction';

function CustomNavigationBar({navigation, back}) {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const loggedIn = useSelector(isLoggedIn);
  const email = useSelector(getEmail);
  const accessTokenState = useSelector(getAccessToken);
  const dispatch = useDispatch();
  const ts = useSelector(getTs);
  const count = useSelector(getCount);
  const node = useSelector(getNode);

  const syncData = async () => {
    const data = await syncTransactionToBackend(email);
    const response = await axios.post(`${BACKEND_URL}/sync`, {data: data});
    const {responseData} = response.data;

    responseData.map(value => {
      // Melakukan parsing dari string HLC server dan membuat HLC berdasarkan hasil parsing
      let {
        ts: remoteTs,
        count: remoteCount,
        node: remoteNode,
      } = fromString(value.hlc);
      let remoteHlc = new HLC(remoteTs, remoteNode, remoteCount);

      // Membuat HLC dari data lokal
      let localHlc = new HLC(ts, node, count);

      // Melakukan operasi penerimaan event baru dari server pada HLC lokal
      let syncHlc = localHlc.receive(remoteHlc, new Date().getTime());
      let {ts: syncTs, count: syncCount, node: syncNode} = syncHlc;

      // Melakukan pembaruan ts, count, dan node pada clock lokal yang disimpan di Redux
      dispatch(update({ts: syncTs, count: syncCount, node: syncNode}));

      value.hlc = new HLC(syncTs, syncNode, syncCount).toString();
    });

    saveSyncToDatabase(responseData);
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
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
