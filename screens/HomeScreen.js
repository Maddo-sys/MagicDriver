import React, { useEffect, useState } from 'react'
import { Dimensions, Pressable, StyleSheet, Text, View} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import NewRequestPopUp from '../components/NewRequest';
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { GOOGLE_MAPS_APIKEY } from "@env";
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { getCar } from '../src/graphql/queries';
import { updateCar } from '../src/graphql/mutations';


const HomeScreen = () => {

 // const [isOnline, setIsOnline] = useState(false);
 const [car, setCar] = useState(null)
 const [myPosition, setMyPosition] = useState(null);
 const [order, setOrder] = useState(null);
 const [newOrder, setNewOrder] = useState({
   id:"1",
  type: 'UberX',
  originLatitude: -1.4357590999999998,
  originLongitude: 36.9780832,
  destLatitude:-1.3313287496566772,
  destLongitude: 36.92430877685547,
  user: {
    rating: 4.8,
    name: 'Joshua',
  }
 })

const fetchCar = async ()=> {
 try {
  const userData = await Auth.currentAuthenticatedUser();
  const carData = await API.graphql(
   graphqlOperation(getCar, {
    id: userData.attributes.sub
   })
  );
 console.log(carData);
 setCar(carData.data.getCar);
 }catch(e){
  console.error(e);
 }
}

useEffect(() => {
 fetchCar();
 
}, [])

 const onDecline = ()=> {
  setNewOrder(null);
 }

 const onAccept = (newOrder) => {
  setOrder(newOrder);
  setNewOrder(null);
 }
 const goOnline = async ()=> {
  // setIsOnline(!isOnline);
  // Update car and set it to Online
 
  try{
   const userData = await Auth.currentAuthenticatedUser();
   const input ={
    id: userData.attributes.sub,
    isOnline: !car.isOnline,
   }
   const updatedCarData = await API.graphql(
    graphqlOperation(updateCar, { input })
   )
   console.log(updatedCarData);
   setCar(updatedCarData.data.updateCar);
  }catch (e){
   console.log(e);
  }

 }
 const onUserLocationChange = (event) => {
  console.log("USER LOCATION CHANGE");
  console.log(event.nativeEvent);
  setMyPosition(event.nativeEvent.coordinate);
 }
 const onDirectionFound = (event)=> {
  console.log("DIRECTION FOUND: ", event);
  if(order){
   setOrder({
    ...order,
    distance: event.distance,
    duration:event.duration,
    // startTrip:order.pickUpClient,
    pickUpClient:order.pickUpClient || event.distance< 0.2,
    isFinished:order.pickUpClient && event.distance < 0.2,
   })
  }
 }

 const getDestination = ()=> {
  if(order && order.pickUpClient){
   return{
    latitude: order.destLatitude,
    longitude: order.destLongitude,
   }
  }
  return {
   latitude: order.originLatitude,
   longitude: order.originLongitude
  }
 }




 const renderBottomTitle = ()=> {
  // Dropping off client and ending trip
  if(order && order.isFinished){
   return (
    <View style={{alignItems: 'center'}}>
     <View style={{flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    width:300,
    height: 70,
    padding: 10,}}>
     <Text style={{color: 'white',
     fontWeight: 'bold'}}>
      COMPLETE TRIP
      </Text>   
       </View>
    </View>
   )
  }



  // Picking Up Client and Starting Trip
  if (order && order.pickUpClient) {
   return (
    <View style={{alignItems: 'center'}}>
     <View style={{flexDirection:"row", alignItems:'center'}}>
      <Text>
       {order.duration? order.duration.toFixed(1) : '?'} mins
      </Text>
       <View style={{
        backgroundColor: '#48d42a',
        marginHorizontal: 10,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20
       }}>
       <FontAwesome name={"user"}
        color={"white"}
        size={20}/>
       </View>
       <Text>
        {order.distance ? order.distance.toFixed(1): '?'} km
       </Text>
     </View>
     {/* START TRIP */}
     <Text style={styles.bottomText}>
      You are at {order.user.name}'s Pick up point
     </Text>
    </View>
   )
  }

    // Starting trip
  // if(order && order.startTrip){
  //  return (
  //   <View style={{alignItems: 'center'}}>
  //    <View style={{flexDirection: 'row',
  //   alignItems:'center',
  //   justifyContent: 'center',
  //   backgroundColor: 'red',
  //   width:300,
  //   height: 70,
  //   padding: 10,}}>
  //    <Text style={{color: 'white',
  //    fontWeight: 'bold'}}>
  //     START TRIP
  //     </Text>   
  //      </View>
  //   </View>
  //  )
  // }
 

 if (order){
  return (
   <View style={{alignItems: 'center'}}>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
     <Text>
      {order.duration ? order.duration.toFixed(1) : '?'} mins
     </Text>
     <View
     style={{ backgroundColor: "#48d42a",
     marginHorizontal: 10,
     width: 30,
     height: 30,
     alignItems: 'center',
     justifyContent: 'center',
     borderRadius: 20}}>
      <FontAwesome name={"user"}
      color={"white"}
      size={20}/>
     </View>
     <Text>
      {order.distance ? order.distance.toFixed(1) : '?'}km
     </Text>
    </View>
    <Text style={styles.bottomText}>
     Picking Up {order.user.name}
    </Text>
   </View>

  )
 }

 // if(isOnline){
  if(car?.isOnline){
  return (
   <Text style={styles.bottomText}>
    You are online
   </Text>
  )
 }
 return ( <Text style={styles.bottomText}> You are offline </Text>)
}


 return (
  <View>
    <MapView
    style={{width: '100%', height: Dimensions.get('window').height-100}}
    provider={PROVIDER_GOOGLE}
    showsUserLocation={true}
    onUserLocationChange={onUserLocationChange}
    initialRegion={{
      latitude: -1.4357590999999998,  
      longitude:36.9780832,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0821,//0.0421
    }}
  >
    { order && (
    <MapViewDirections
    origin={myPosition}
    // origin={origin}
    // destination={destination}
    // destination={{
    //   latitude: order.originLatitude,
    //   longitude: order.originLongitude,
    // }}
    destination={getDestination()}
    onReady={onDirectionFound}
    apikey={GOOGLE_MAPS_APIKEY}
    strokeWidth={5}
    strokeColor="black"
    lineDashPattern={[0]}
  />
  )}
   
  </MapView>

   <Pressable 
 onPress={()=> console.warn('Balance')} 
 style={styles.balanceButton}>
  <Text style={styles.balanceText}>
   <Text style={{ color: 'green'}}>$</Text>
     {' '}
     0.00
   </Text>
 </Pressable>

  <Pressable
  onPress={()=> console.warn('Hey')}
  style={[styles.roundButton, {top: 10, left: 10}]}>
  <Entypo name= {"menu"} size={30} color="#4a4a4a"/>

  </Pressable>

  <Pressable 
 onPress={()=> console.warn('Hey')} 
 style={[styles.roundButton, {top: 10, right:10}]}>
  {/* <Entypo name={"menu"} size={30} color='#4a4a4a'/> */}
  <AntDesign name={"search1"} size={30} color='#4a4a4a'/>
 </Pressable>

 <Pressable 
 onPress={()=> console.warn('Hey')} 
 style={[styles.roundButton, {bottom: 110, left:10}]}>
  <Entypo name={"menu"} size={30} color='#4a4a4a'/>
 </Pressable>

 <Pressable 
 onPress={()=> console.warn('Hey')} 
 style={[styles.roundButton, {bottom: 110, right:10}]}>
  <Entypo name={"message"} size={30} color='#4a4a4a'/>
 </Pressable>

  <Pressable 
 onPress={goOnline} 
 style={styles.goButton}>
  <Text style={styles.goText}>
  {
    car?.isOnline? 'END' : 'GO'
  }
  </Text>
 
 </Pressable>

  <View style={styles.bottomContainer}>
   <Ionicons name={"options"} size={30} color='#4a4a4a'/>

  
  {renderBottomTitle()}
   
   <Ionicons name={"options"}  size={30} color='#4a4a4a'/>

  </View>

  { newOrder && <NewRequestPopUp 
  newOrder={newOrder}
  onDecline={onDecline}
  duration={2}
  distance={0.5}
  onAccept={()=> onAccept(newOrder)} />}
  
 
 </View>

 );
};

export default HomeScreen

const styles = StyleSheet.create({
 bottomContainer: {
  height: 100,
  backgroundColor: 'white',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 15,
 },
 bottomText: {
 fontSize: 22,
 color: '#4a4a4a',
  
 },
 roundButton: {
  position: 'absolute',
  backgroundColor: 'white',
  padding: 10,
  borderRadius: 25,
  // marginLeft: 10,
  // marginTop: 10,
 },
  goButton: {
  position: 'absolute',
  backgroundColor: '#1495ff',
  width: 75,
  height: 75,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 50,
  bottom: 110, 
  left: Dimensions.get('window').width/2-37,
  
 },
 goText: {
  fontSize: 30,
  color:'white',
  fontWeight:'bold'
 },
 balanceButton: {
  position: 'absolute',
  backgroundColor: '#1c1c1c',
  width: 100,
  height: 50,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 50,
  top: 50, 
  left: Dimensions.get('window').width/2-50,

 },
 balanceText: {
  fontSize: 24,
  color: 'white',
  fontWeight: 'bold',
 }
})
