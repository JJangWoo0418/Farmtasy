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
    backgroundColor: '#4dabf7',
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
    backgroundColor: '#007AFF'
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
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF'
  },
  hourlyTime: {
    fontSize: 16,
    marginBottom: 8
  },
  hourlyTimeCurrent: {
    color: '#007AFF',
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
    color: '#007AFF'
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#007AFF'
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
  }
});
