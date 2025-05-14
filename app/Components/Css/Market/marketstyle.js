import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#fff',
paddingTop: 40,
paddingHorizontal: 16,
},
searchBarWrap: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 16,
},
searchBar: {
flex: 1,
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#F5F5F7',
borderRadius: 10,
paddingHorizontal: 12,
height: 40,
marginRight: 8,
},
searchIcon: {
width: 18,
height: 18,
marginRight: 6,
tintColor: '#BDBDBD',
},
searchInput: {
flex: 1,
fontSize: 15,
color: '#222',
},
bellIcon: {
width: 22,
height: 22,
tintColor: '#222',
},
categoryWrap: {
flexDirection: 'row',
flexWrap: 'wrap',
justifyContent: 'space-between',
marginBottom: 8,
},
categoryItem: {
width: width / 4 - 18,
alignItems: 'center',
marginVertical: 10,
},
categoryIcon: {
width: 36,
height: 36,
marginBottom: 4,
},
categoryLabel: {
fontSize: 13,
color: '#222',
},
foldBtn: {
alignSelf: 'center',
backgroundColor: '#F5F5F7',
borderRadius: 12,
paddingHorizontal: 16,
paddingVertical: 1,
marginBottom: 8,
flexDirection: 'row',
justifyContent: 'center',
alignItems: 'center',
borderWidth: 1,
borderColor: '#222',
},
foldBtnText: {
color: '#222',
fontSize: 16,
fontWeight: 'bold',
},
foldBtnDivider: {
width: 1,
height: 18,
backgroundColor: '#E0E0E0',
marginHorizontal: 10,
},
foldBtnHDivider: {
height: 1,
backgroundColor: '#E0E0E0',
flex: 1,
alignSelf: 'center',
},
specialWrap: {
flex: 1,
},
specialTitle: {
fontSize: 16,
fontWeight: 'bold',
marginBottom: 10,
color: '#222',
},
productCard: {
flexDirection: 'row',
backgroundColor: '#fff',
borderRadius: 14,
shadowColor: '#000',
shadowOpacity: 0.06,
shadowRadius: 8,
elevation: 2,
padding: 12,
marginBottom: 20,
alignItems: 'center',
},
productImg: {
width: 80,
height: 100,
borderRadius: 8,
marginRight: 12,
backgroundColor: '#eee',
},
productInfo: {
flex: 1,
},
timerWrap: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 4,
},
timerIcon: {
width: 14,
height: 14,
marginRight: 3,
tintColor: '#FF4D4F',
},
timerText: {
color: '#FF4D4F',
fontSize: 12,
fontWeight: 'bold',
},
productTitle: {
fontSize: 14,
color: '#222',
marginBottom: 4,
},
priceRow: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 2,
},
discount: {
color: '#FF4D4F',
fontWeight: 'bold',
fontSize: 14,
marginRight: 6,
},
originalPrice: {
color: '#BDBDBD',
fontSize: 12,
textDecorationLine: 'line-through',
},
price: {
fontSize: 16,
fontWeight: 'bold',
color: '#222',
},
freeShip: {
color: '#00C471',
fontSize: 12,
fontWeight: 'bold',
},
cartBtn: {
marginLeft: 8,
padding: 6,
borderRadius: 20,
backgroundColor: '#F5F5F7',
},
cartIcon: {
width: 22,
height: 22,
tintColor: '#00C471',
},
sellBtn: {
position: 'absolute',
bottom: 30,
right: 20,
backgroundColor: '#00C471',
borderRadius: 22,
paddingHorizontal: 36,
paddingVertical: 12,
shadowColor: '#00C471',
shadowOpacity: 0.2,
shadowRadius: 8,
elevation: 4,
},
sellBtnText: {
color: '#fff',
fontSize: 18,
fontWeight: 'bold',
},
});

export default styles; 