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
import {startTimer} from '../store/timer';

const SignInScreen = ({navigation}) => {
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  const dispatch = useDispatch();
  const ts = useSelector(getTs);
  const count = useSelector(getCount);
  const node = useSelector(getNode);

  var log = logger.createLogger();

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
      // Melakukan parsing dari string HLC peladen
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
    dispatch(update({ts: syncTs, count: syncCount, node: syncNode}));

    return responseData;
  };

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const {idToken, accessToken} = await GoogleSignin.getTokens();
      const user = userInfo.user;
      log.info('BEARER: ' + idToken);

      let startTime = new Date();
      dispatch(startTimer());

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

      sortResponseByHlc(responseData);
      let parsedResponse = parseHlcFromRemote(responseData);
      await saveSyncToDatabase(parsedResponse);

      let endTime = new Date();
      let costTime = (endTime - startTime) / 1000;

      log.info('SYNC TIME: ' + costTime);

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
