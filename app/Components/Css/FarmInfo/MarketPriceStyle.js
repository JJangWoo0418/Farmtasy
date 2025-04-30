import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cropContainer: {
    marginRight: 10,
  },
  varietiesContainer: {
    marginTop: 5,
    flexDirection: 'row',
  },
  varietyTab: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  selectedVarietyTab: {
    backgroundColor: '#4CAF50',
  },
  varietyText: {
    color: '#666',
    fontSize: 12,
  },
  selectedVarietyText: {
    color: '#fff',
  },
  cropSelector: {
    flex: 0.15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cropTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 5,
  },
  selectedCropTab: {
    backgroundColor: '#000',
  },
  cropText: {
    color: '#666',
    fontSize: 14,
    marginRight: 5,
  },
  selectedCropText: {
    color: '#fff',
  },
  removeCropButton: {
    marginLeft: 5,
  },
  addCropButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    height: 50,
  },
  addCropText: {
    color: '#666',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSubTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
  categoryList: {
    maxHeight: 150,
    marginBottom: 10,
  },
  categoryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedCategoryItem: {
    backgroundColor: '#e8f4f8',
  },
  categoryText: {
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#000',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  calendarContainer: {
    flex: 0.2,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownIcon: {
    marginLeft: 4,
  },
  daysContainer: {
    flex: 1,
    marginLeft: 15,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayCell: {
    width: 30,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    color: '#666',
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  dateCell: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDate: {
    backgroundColor: '#000',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '400',
  },
  sundayText: {
    color: '#ff0000',
  },
  saturdayText: {
    color: '#0000ff',
  },
  selectedDateText: {
    color: '#fff',
  },
  tabContainer: {
    flex: 0.7,
    flexDirection: 'column',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  selectedTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  priceContainer: {
    flex: 1,
    padding: 16,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  columnTitle: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  priceText: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  priceValue: {
    color: '#ff0000',
  },
  nationalPriceContainer: {
    flex: 1,
    padding: 16,
  },
  marketSection: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  marketName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalVolume: {
    fontSize: 14,
    color: '#666',
  },
  priceChange: {
    flexDirection: 'row',
  },
  changeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  decreaseText: {
    fontSize: 14,
    color: '#0000ff',
  },
  priceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceRange: {
    marginTop: 8,
  },
  highPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  lowPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  avgPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  volumeInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  volumeText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
  directInputButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  directInputText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  popularCropsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  popularCropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  cropItem: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
  },
  cropIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  cropName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  calendarModalContent: {
    padding: 15,
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 15,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  calendarArrow: {
    fontSize: 20,
    color: '#333',
    padding: 10,
  },
  calendarWeekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarWeekDay: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#333',
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDayOtherMonthText: {
    color: '#999',
  },
  modalScrollView: {
    width: '100%',
  },
  priceItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  marketText: {
    fontSize: 14,
    color: '#666',
  },
  priceColumn: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  noDataText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
}); 