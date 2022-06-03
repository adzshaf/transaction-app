import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import {useDispatch, useSelector} from 'react-redux';
import {login} from '../store/auth';
import {updateNullEmailInTable} from '../repository/transaction';
import axios from 'axios';
import {BACKEND_URL} from '@env';
import HLC from '../shared/hlc';
import {fromString} from '../shared/hlcFunction';
import {getTs, getCount, getNode, update} from '../store/hlc';
import {saveSyncToDatabase} from '../repository/transaction';

const SignInScreen = ({navigation}) => {
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  const dispatch = useDispatch();
  const ts = useSelector(getTs);
  const count = useSelector(getCount);
  const node = useSelector(getNode);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const {idToken, accessToken} = await GoogleSignin.getTokens();
      const user = userInfo.user;
      dispatch(
        login({
          token: idToken,
          email: user.email,
          accessToken: accessToken,
        }),
      );

      const response = await axios.post(
        `${BACKEND_URL}/login`,
        {},
        {headers: {Authorization: `Bearer ${idToken}`}},
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

        syncTs = syncHlc.ts;
        syncCount = syncHlc.count;
        syncNode = syncHlc.node;

        value.hlc = new HLC(syncTs, syncNode, syncCount).toString();
      });

      // Melakukan pembaruan ts, count, dan node pada clock lokal yang disimpan di Redux
      dispatch(update({ts: syncTs, count: syncCount, node: syncNode}));

      const saveToDb = saveSyncToDatabase(responseData);
      navigation.navigate('Home');
    } catch (error) {}
  };

  return (
    <View style={styles.container}>
      <GoogleSigninButton
        style={{width: 240, height: 80}}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={() => signIn()}
      />
    </View>
  );
};

const makeStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default SignInScreen;
