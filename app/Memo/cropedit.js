import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import gobackIcon from '../../assets/gobackicon.png';

const crops = [
  { emoji: '🌶️', name: '고추' },
  { emoji: '🫐', name: '블루베리' },
  { emoji: '🥔', name: '감자' },
  { emoji: '🍠', name: '고구마' },
  { emoji: '🍎', name: '사과' },
  { emoji: '🍓', name: '딸기' },
  { emoji: '🧄', name: '마늘' },
  { emoji: '🥬', name: '상추' },
  { emoji: '🥒', name: '오이' },
  { emoji: '🍅', name: '토마토' },
  { emoji: '🍇', name: '포도' },
  { emoji: '🌱', name: '콩' },
  // ...필요한 만큼 추가
];

const foodEmojis = [
  '',
  '🌶️','🫑','🧄','🧅','🥔','🍠','🥕','🌽','🥒','🥬','🥦','🥑','🍆','🍅','🥜','🌰',
  '🥥','🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐',
  '🥝','🍅','🥬','🥦','🥒','🥕','🌽','🥔','🍠','🧄','🧅','🍄','��','🌰','🍚','🍙',
  '🍢','🍡','🍧','🍨','🍦','🍰','🎂','🍮','🍭','🍬','🍫'
];

export default function CropEdit() {
  const router = useRouter();
  const [isCustomAdd, setIsCustomAdd] = useState(false);
  const [customCropName, setCustomCropName] = useState('');
  const [customCropEmoji, setCustomCropEmoji] = useState('');

  return (
    <ScrollView style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={gobackIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>어떤 작물을 추가하시겠어요?</Text>
      </View>

      {/* 직접 추가하기 버튼 */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsCustomAdd(true)}
      >
        <Text style={styles.addButtonText}>직접 추가하기</Text>
      </TouchableOpacity>

      {/* 인기작물 리스트 */}
      <Text style={styles.subTitle}>인기작물 TOP 30</Text>
      <View style={styles.cropsGrid}>
        {crops.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.cropItem}
            onPress={() => {
              router.replace({
                pathname: '/Memo/cropplus',
                params: { crop: item.name, cropEmoji: item.emoji }
              });
            }}
          >
            <Text style={styles.cropEmoji}>{item.emoji}</Text>
            <Text style={styles.cropName}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isCustomAdd && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.customAddBox}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>작물 이모지 (선택)</Text>
            <View style={styles.emojiScrollBox}>
              <ScrollView horizontal={false} style={{ maxHeight: 120 }}>
                <View style={styles.emojiGrid}>
                  {foodEmojis.map((emoji, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.emojiCircle,
                        customCropEmoji === emoji && { borderColor: '#22CC6B', borderWidth: 2 }
                      ]}
                      onPress={() => setCustomCropEmoji(emoji)}
                    >
                      {emoji ? (
                        <Text style={{ fontSize: 24 }}>{emoji}</Text>
                      ) : (
                        <View style={{ width: 24, height: 24 }} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            <Text style={styles.label}>작물 이름</Text>
            <TextInput
              style={styles.input}
              value={customCropName}
              onChangeText={setCustomCropName}
              placeholder="작물 이름을 입력하세요"
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                if (!customCropName) {
                  alert('작물 이름을 입력하세요!');
                  return;
                }
                router.replace({
                  pathname: '/Memo/cropplus',
                  params: { crop: customCropName, cropEmoji: customCropEmoji }
                });
              }}
            >
              <Text style={styles.confirmButtonText}>추가</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsCustomAdd(false)}>
              <Text style={{ color: '#22CC6B', marginTop: 8 }}>취소</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backIcon: { width: 24, height: 24, resizeMode: 'contain' },
  title: { fontWeight: 'bold', fontSize: 18, flex: 1, textAlign: 'center' },
  addButton: {
    backgroundColor: '#22CC6B',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
    width: 150,
    alignSelf: 'flex-start',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  subTitle: { color: '#888', fontSize: 14, marginBottom: 8, marginTop: 8 },
  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  cropItem: {
    width: '28%',
    aspectRatio: 1,
    backgroundColor: '#f3f3f3',
    borderRadius: 40,
    margin: '2%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cropEmoji: { fontSize: 32, marginBottom: 4 },
  cropName: { fontSize: 14, color: '#222', fontWeight: 'bold' },
  customAddBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: 'center',
  },
  label: { fontWeight: 'bold', fontSize: 15, marginTop: 8, marginBottom: 4, alignSelf: 'flex-start' },
  emojiScrollBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    maxHeight: 120,
  },
  emojiCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f3f3',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderColor: '#eee',
    borderWidth: 1,
  },
  input: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#22CC6B',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  confirmButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
