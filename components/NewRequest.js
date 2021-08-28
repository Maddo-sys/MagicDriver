import React from "react";
import { View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign"
import FontAwesome from "react-native-vector-icons/FontAwesome"


const NewRequestPopUp = ({ 
  newOrder,
  onAccept, 
  onDecline,
  duration,
  distance }) => {


 return(
  <SafeAreaView style={styles.root}>
   <Pressable onPress={onDecline} style={styles.declineButton}>
     <Text style={styles.declineText}>
      Decline</Text>
   </Pressable>
   <Pressable onPress={onAccept} style={styles.popupContainer}>

   <View style={styles.row}>
    <Text style={styles.serviceType}>{newOrder.type}</Text>
   
    <View style={styles.userBg}>
     <FontAwesome name={"user"} color={"white"} 
     size={35}/>
    </View>

    <Text style={styles.serviceType}>
     <AntDesign name={"star"} size={18}/>
     {newOrder.user.rating}
     </Text>
   </View>
   <Text style={styles.minutes}>{duration} min</Text>
   <Text style={styles.distance}>{distance} kms</Text>
   </Pressable>
  </SafeAreaView>
 )
}

export default NewRequestPopUp;

const styles = StyleSheet.create({
 root: {
  position : 'absolute',
  bottom: 0,
  width:'100%',
  padding: 20,
  height:'100%',
  justifyContent: 'space-between',
  backgroundColor: '#00000099'
 },

 popupContainer: {
  height: 250,
  backgroundColor:'black',
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'space-around', 
 },

 minutes: {
  color: 'lightgrey',
  fontSize: 36,
 },
 distance: {
  color: 'lightgrey',
  fontSize: 26,
 },
 serviceType: {
  color: 'lightgrey',
  fontSize: 20,
  marginHorizontal:10, 
 },
 row: {
  flexDirection: 'row',
  alignItems: 'center',
 },
 userBg: {
  backgroundColor: '#008bff',
  width: 60,
  height: 60,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius:60,
 },
 declineText:{
  color: 'white',
  fontWeight: 'bold',
 },
 declineButton: {
  width: 100,
  backgroundColor: 'black',
  padding: 20,
  borderRadius: 50,
  alignItems:'center'
 }

})