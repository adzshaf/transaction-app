import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import {BACKEND_URL} from '@env';
import HLC from '../shared/hlc';
import {fromString} from '../shared/hlcFunction';
import {getTs, getCount, getNode, update} from '../store/hlc';
import {saveSyncToDatabase} from '../repository/transaction';
import {logger} from 'react-native-logs';
import {login} from '../store/auth';

const SignInScreen = ({navigation}) => {
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  const dispatch = useDispatch();
  const ts = useSelector(getTs);
  const count = useSelector(getCount);
  const node = useSelector(getNode);

  var log = logger.createLogger();

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const {idToken, accessToken} = await GoogleSignin.getTokens();
      const user = userInfo.user;
      log.info('BEARER: ' + idToken);

      let startTime = new Date();

      const response = await axios.post(
        `${BACKEND_URL}/login`,
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      );

      log.info('STATUS: ' + response.status);

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
        } = HLC.fromString(value.hlc);
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

      const saveToDb = saveSyncToDatabase(responseData);
      let endTime = new Date();
      let costTime = (endTime - startTime) / 1000;

      log.info('SYNC TIME: ' + costTime);

      // Melakukan pembaruan ts, count, dan node pada clock lokal yang disimpan di Redux
      dispatch(update({ts: syncTs, count: syncCount, node: syncNode}));

      dispatch(
        login({
          token: idToken,
          email: user.email,
          accessToken: accessToken,
        }),
      );
      navigation.navigate('Home');
    } catch (error) {
      console.log(error);
    }
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
      backgroundColor: colors.background,
    },
  });

export default SignInScreen;
