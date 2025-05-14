// farmedit.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import gobackIcon from '../../assets/gobackicon.png';

export default function FarmEdit() {
  const { farmName } = useLocalSearchParams();
  const router = useRouter();
  const params = useLocalSearchParams();

  // 작물 카드 리스트 상태
  const [crops, setCrops] = useState([]);

  // cropplus에서 돌아올 때 params로 값이 오면 추가
  useEffect(() => {
    if (params?.newCropName && params?.newCropImage) {
      if (params?.editIndex !== undefined) {
        // 수정
        setCrops(prev => prev.map((crop, idx) =>
          idx === Number(params.editIndex)
            ? { ...crop, name: params.newCropName, image: params.newCropImage }
            : crop
        ));
      } else {
        // 추가
        setCrops(prev => [
          ...prev,
          {
            name: params.newCropName,
            image: params.newCropImage,
          }
        ]);
      }
    }
  }, [params?.newCropName, params?.newCropImage, params?.editIndex]);

  useEffect(() => {
    if (params?.deleteCrop && params?.editIndex !== undefined) {
      setCrops(prev => prev.filter((_, idx) => idx !== Number(params.editIndex)));
    }
  }, [params?.deleteCrop, params?.editIndex]);

  const [image, setImage] = useState(params.image || null);
  const [name, setName] = useState(params.name || '');
  const editIndex = params.editIndex !== undefined ? Number(params.editIndex) : null;

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

  return (
    <View style={styles.container}>
      {/* 상단 주소(농장 이름) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={gobackIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>{farmName}</Text>
      </View>

      {/* 사진 추가 카드 */}
      <TouchableOpacity style={styles.photoBox} onPress={pickImage} activeOpacity={0.8}>
        {image ? (
          <Image source={{ uri: image }} style={styles.photo} resizeMode="cover" />
        ) : (
          <>
            <Image source={require('../../assets/addphotoicon.png')} style={styles.icon} />
            <Text style={styles.photoText}>사진 추가</Text>
          </>
        )}
      </TouchableOpacity>

      {/* 작물 카드 리스트 */}
      <FlatList
        data={crops}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.cropCard}
            onPress={() => router.push({
              pathname: '/Memo/memolist',
              params: {
                cropName: item.name,
                cropImage: item.image,
                cropIndex: index,
              }
            })}
          >
            <Image source={{ uri: item.image }} style={styles.cropCardImage} />
            <Text style={styles.cropCardText}>{item.name}</Text>
            <Image source={require('../../assets/settingicon.png')} style={styles.settingIcon} />
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.cropBox} onPress={() => router.push('/Memo/cropplus')}>
            <Image source={require('../../assets/cropicon.png')} style={styles.iconSmall} />
            <Text style={styles.cropText}>작물 추가</Text>
          </TouchableOpacity>
        }
      />

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => {
          router.replace({
            pathname: '/Memo/farmedit',
            params: {
              newCropName: name,
              newCropImage: image,
              editIndex: editIndex,
            }
          });
        }}
      >
        <Text style={styles.confirmButtonText}>확인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
    position: 'relative',
    height: 40, // 높이 고정(필요시 조정)
  },
  backIcon: {
    width: 24,
    height: 24,
    position: 'absolute',
    left: 0,
    zIndex: 1,
    resizeMode: 'contain',
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  photoBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    height: 220,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  icon: { width: 60, height: 60, marginBottom: 8 },
  photoText: { fontSize: 16, color: '#444' },
  cropBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconSmall: { width: 40, height: 40, marginBottom: 8 },
  cropText: { fontSize: 16, color: '#222' },
  cropCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cropCardImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  cropCardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingIcon: {
    width: 24,
    height: 24,
    tintColor: '#888',
  },
  confirmButton: {
    backgroundColor: '#007bff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});