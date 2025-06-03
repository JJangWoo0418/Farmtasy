// Components/Css/FarmInfo/indexStyles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navigationContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  navButtonActive: {
    backgroundColor: '#22CC6B',
  },
  navButtonInactive: {
    backgroundColor: '#e9ecef',
  },
  navText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#fff',
  },
  navTextInactive: {
    color: '#495057',
  },
  currentWeatherBox: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
    position: 'relative',
  },
  currentTemp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  weatherDesc: {
    fontSize: 24,
    color: '#495057',
    marginBottom: 8,
  },
  weatherValue: {
    fontSize: 18,
    color: '#868e96',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  tabButtonActive: {
    backgroundColor: '#22CC6B'
  },
  tabButtonInactive: {
    backgroundColor: '#f8f8f8'
  },
  tabText: {
    fontSize: 16
  },
  tabTextActive: {
    color: '#fff'
  },
  tabTextInactive: {
    color: '#000'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 15,
    marginHorizontal: 15
  },
  hourlyWeatherScroll: {
    paddingHorizontal: 15
  },
  hourlyWeatherItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    width: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee'
  },
  hourlyWeatherItemCurrent: {
    backgroundColor: '#E3FBED',
    borderColor: '#22CC6B'
  },
  hourlyTime: {
    fontSize: 16,
    marginBottom: 8
  },
  hourlyTimeCurrent: {
    color: '#22CC6B',
    fontWeight: '600'
  },
  weatherEmoji: {
    fontSize: 24,
    marginBottom: 8
  },
  weatherTemp: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4
  },
  weatherTempCurrent: {
    color: '#22CC6B'
  },
  weeklyContainer: {
    marginHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee'
  },
  weeklyHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  weeklyHeaderText: {
    flex: 1,
    fontSize: 14,
    color: '#666'
  },
  weeklyHeaderCenter: {
    textAlign: 'center'
  },
  weeklyHeaderRight: {
    textAlign: 'right'
  },
  weeklyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  weeklyDateColumn: {
    flex: 1
  },
  weeklyDate: {
    fontSize: 16,
    marginBottom: 2
  },
  weeklyDayOfWeek: {
    fontSize: 12,
    color: '#666'
  },
  weeklyWeatherColumn: {
    flex: 1,
    alignItems: 'center'
  },
  weeklyEmoji: {
    fontSize: 24,
    marginBottom: 4
  },
  weeklyRain: {
    fontSize: 12,
    color: '#666'
  },
  weeklyTempColumn: {
    flex: 1,
    alignItems: 'flex-end'
  },
  weeklyTemp: {
    fontSize: 16
  },
  loading: {
    textAlign: 'center',
    padding: 20,
    color: '#666'
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 20
  },
  noWarning: {
    textAlign: 'center',
    padding: 20,
    color: '#666'
  },
  warningContainer: {
    marginHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    maxHeight: '70%',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    width: '100%',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#22CC6B'
  },
  modalWeatherScroll: {
    maxHeight: '90%'
  },
  modalWeatherItem: {
    width: '100%',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingLeft: 140
  },
  changeFarmButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  changeFarmButtonText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    maxHeight: '60%',
    width: '85%',
  },
  farmListScroll: {
    width: '100%',
    flexGrow: 1,
  },
  farmItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
    alignSelf: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  farmEmoji: {
    fontSize: 35,
    marginBottom: 5,
  },
  farmName: {
    fontSize: 18,
    color: '#212529',
    fontWeight: 'normal',
    textAlign: 'center',
  },
  closeButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  closeModalButton: {
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '95%',
  },
  closeModalButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'center',
  },
});
