import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, View } from 'react-native';
import { Provider } from "react-redux";
import { store } from './store';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import "react-native-gesture-handler";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher'
import Constants from 'expo-constants'
import Amplify, { 
  Auth, 
  API,
  graphqlOperation,
} from 'aws-amplify'
import config from './src/aws-exports'
import { withAuthenticator } from "aws-amplify-react-native";
import { getCarId } from './src/graphql/queries';
import { createCar } from './src/graphql/mutations'
Amplify.configure(config);

 function App() {
  
  useEffect(()=> {

    const updateUserCar = async ()=> {
     
      // Get authenticated user
      const authenticatedUser = await Auth.currentAuthenticatedUser({
        bypassCache: true
      });
      if (!authenticatedUser){
        return;
      }

      // Check if the user has a car
      const carData = await API.graphql(
        graphqlOperation(
          getCarId,
          {id: authenticatedUser.attributes.sub}
        )
      )
      console.log ("CAR DATA");
      console.log (carData);

      if(!!carData.data.getCar){
        console.log("User already has a car assigned");
        return;
      }

      // If not create car for new user
      const newCar = {
        id:authenticatedUser.attributes.sub,
        type: 'rideShare5',
        userId: authenticatedUser.attributes.sub, 
      }
       await API.graphql(graphqlOperation(
          createCar, { input: newCar}
       ))

    };
    updateUserCar();
  }, [])
  
  const Stack = createStackNavigator();
 
   const pkg = Constants.manifest.releaseChannel
  ? Constants.manifest.android.package 
  : 'host.exp.exponent'

 useEffect(() => {
   let isMounted = true; 

   const requestLocationPermission = async () => {
  try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (isMounted) {
     if (status !== 'granted') {
        // setErrorMsg('Permission to access location was denied');
        console.log("Location permission denied");
        console.log("STATUS:");
        console.log(status);
        if(Platform.OS === 'android'){
          IntentLauncher.startActivityAsync(
          IntentLauncher.ACTION_APPLICATION_DETAILS_SETTINGS,
          { data: 'package:' + pkg }
         )
        } else { 
          Linking.openURL('app-settings:');
         }
        return;
      }
      // (status === 'granted')
    else {

      console.log("You can access location");
      console.log("STATUS:");
      console.log(status);
      let location = await Location.getCurrentPositionAsync({
         accuracy: Location.Accuracy.BestForNavigation,
         maximumAge: 10000
      });
      console.log("LOCATION:");
      console.log(location);
      //setLocation(location);
      
    } 

  }
   
  } catch (err) {
    console.warn(err);
    // setErrorMsg('Permission to access location was denied');
  }
};
    requestLocationPermission(); 

    return () => { isActive = false };
    
}, [])

  return (
    <Provider store={store}>
      <NavigationContainer>
       <SafeAreaProvider>
         <KeyboardAvoidingView
         behavior={Platform.OS === "ios" ? "padding" : "height"}
         style={{flex: 1}}
         keyboardVerticalOffset={ Platform.OS === "ios" ? -64 : 0}
         >
        <Stack.Navigator>
        <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerShown:false,
        }}/>

        </Stack.Navigator>
        </KeyboardAvoidingView>
        </SafeAreaProvider>
      </NavigationContainer>
    </Provider>
   
  );
}
export default withAuthenticator(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
