import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SelectedCropTags = ({ selectedCrop, selectedVariety }) => {
  return (
    <View style={styles.container}>
      {selectedCrop && (
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>
            {selectedCrop} {selectedVariety ? `| ${selectedVariety}` : '| 전체'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: 'white',
    position: 'relative',
    zIndex: 1,
  },
  tagContainer: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  tagText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SelectedCropTags; 