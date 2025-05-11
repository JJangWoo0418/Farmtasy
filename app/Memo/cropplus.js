import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; // 캘린더용
import { useRouter } from 'expo-router';

export default function CropPlus() {
  const router = useRouter();

  // 입력값 상태
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');
  const [plantDate, setPlantDate] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [amount, setAmount] = useState('');

  // 캘린더 상태
  const [isPlantDatePickerVisible, setPlantDatePickerVisible] = useState(false);
  const [isHarvestDatePickerVisible, setHarvestDatePickerVisible] = useState(false);

  // 이미지 선택
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 날짜 포맷 함수
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 40}}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={require('../../assets/gobackicon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>작물 추가</Text>
        <TouchableOpacity>
          <Image source={require('../../assets/deleteicon.png')} style={styles.deleteIcon} />
        </TouchableOpacity>
      </View>

      {/* 이미지 추가 */}
      <TouchableOpacity style={styles.imageBox} onPress={pickImage} activeOpacity={0.8}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.imagePlaceholder}>사진 추가</Text>
        )}
      </TouchableOpacity>

      {/* 이름 */}
      <Text style={styles.label}>이름</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="작물 이름을 입력하세요"
      />

      {/* 작물 */}
      <Text style={styles.label}>작물</Text>
      <TextInput
        style={styles.input}
        value={crop}
        onChangeText={setCrop}
        placeholder="예: 감자"
      />

      {/* 재배 면적 */}
      <Text style={styles.label}>재배 면적</Text>
      <TextInput
        style={styles.input}
        value={area}
        onChangeText={setArea}
        placeholder="예: 10000"
        keyboardType="numeric"
      />
      <Text style={styles.subText}>최대 99,999평까지 입력이 가능해요</Text>

      {/* 정식 시기 */}
      <Text style={styles.label}>정식 시기</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={plantDate}
          placeholder="YYYY.MM.DD"
          editable={false}
        />
        <TouchableOpacity onPress={() => setPlantDatePickerVisible(true)}>
          <Image source={require('../../assets/calendaricon.png')} style={styles.calendarIcon} />
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        isVisible={isPlantDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setPlantDate(formatDate(date));
          setPlantDatePickerVisible(false);
        }}
        onCancel={() => setPlantDatePickerVisible(false)}
      />

      {/* 수확 시기 */}
      <Text style={styles.label}>수확 시기</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={harvestDate}
          placeholder="YYYY.MM.DD"
          editable={false}
        />
        <TouchableOpacity onPress={() => setHarvestDatePickerVisible(true)}>
          <Image source={require('../../assets/calendaricon.png')} style={styles.calendarIcon} />
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        isVisible={isHarvestDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setHarvestDate(formatDate(date));
          setHarvestDatePickerVisible(false);
        }}
        onCancel={() => setHarvestDatePickerVisible(false)}
      />

      {/* 수확량 */}
      <Text style={styles.label}>수확량</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={amount}
          onChangeText={setAmount}
          placeholder="예: 10,000"
          keyboardType="numeric"
        />
        <Text style={styles.unit}>Kg</Text>
      </View>
      <Text style={styles.subText}>최대 9,999,999Kg까지 입력이 가능해요</Text>

      {/* 확인 버튼 */}
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => {
          // 입력값 검증 등 추가 가능
          router.replace({
            pathname: '/Memo/farmedit',
            params: {
              newCropName: name,
              newCropImage: image,
            }
          });
        }}
      >
        <Text style={styles.confirmButtonText}>확인</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { fontWeight: 'bold', fontSize: 18, textAlign: 'center', flex: 1 },
  backIcon: { width: 24, height: 24, resizeMode: 'contain' },
  deleteIcon: { width: 22, height: 22, resizeMode: 'contain', marginRight: 4 },
  imageBox: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { color: '#aaa', fontSize: 16 },
  label: { fontWeight: 'bold', fontSize: 15, marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  subText: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  calendarIcon: { width: 28, height: 28, marginLeft: 8, resizeMode: 'contain' },
  unit: { fontSize: 15, color: '#888', marginLeft: 8 },
  confirmButton: {
    backgroundColor: '#22CC6B',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
