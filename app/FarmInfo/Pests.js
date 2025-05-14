import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../Components/Css/FarmInfo/PestsStyle';
import itemCodeData from '../Components/Utils/item_code_data.json';
import { PEST_API_KEY } from '../Components/API/apikey';
import axios from 'axios';

// 인기작물 TOP 21 (이모지 포함, MarketPriceScreen.js와 동일)
const popularCrops = [
  { name: '벼', icon: '🌾' },
  { name: '배추', icon: '🥬' },
  { name: '양파', icon: '🧅' },
  { name: '감자', icon: '🥔' },
  { name: '사과', icon: '🍎' },
  { name: '고추', icon: '🌶️' },
  { name: '마늘', icon: '🧄' },
  { name: '배', icon: '🍐' },
  { name: '고구마', icon: '🍠' },
  { name: '수박', icon: '🍉' },
  { name: '포도', icon: '🍇' },
  { name: '옥수수', icon: '🌽' },
  { name: '토마토', icon: '🍅' },
  { name: '오이', icon: '🥒' },
  { name: '가지', icon: '🍆' },
  { name: '복숭아', icon: '🍑' },
  { name: '딸기', icon: '🍓' },
  { name: '땅콩', icon: '🥜' },
  { name: '버섯', icon: '🍄' },
  { name: '당근', icon: '🥕' },
  { name: '망고', icon: '🥭' }
];

// 발병 부위 카테고리 목록 및 설명
const partCategories = [
  '잎', '줄기', '가지', '꽃/화서', '과실/열매', '뿌리/근권', '수관 전체', '전체(복합)', '생장점/눈', '기타/불명'
];
const partDescriptions = {
  '잎': '가장 흔한 부위. 잎마름병, 반점병 등',
  '줄기': '줄기썩음병, 균핵병 등',
  '가지': '복숭아류 등에서 가지에 암반생성 등',
  '꽃/화서': '꽃곰팡이병, 꽃썩음병 등',
  '과실/열매': '점무늬, 균열, 썩음 등 과일 품질 저하',
  '뿌리/근권': '뿌리혹병, 뿌리썩음병, 선충 피해 등',
  '수관 전체': '나무 전체에 증상 확산되는 경우',
  '전체(복합)': '작물 전체 혹은 다수 부위에 걸쳐 증상 발생',
  '생장점/눈': '새순이나 생장점이 피해받는 경우',
  '기타/불명': '특정 부위로 분류 불가한 경우 또는 복합 증상',
};

// 병해충 증상 카테고리 목록 및 설명
const symptomCategories = [
  '반점', '마름', '시듦(위조)', '기형/변형', '균핵/곰팡이', '부패/썩음', '점무늬', '구멍/천공', '탈색/황화', '비정상 생장', '벌레/충 피해', '털/흰가루/분말', '기타/불명'
];
const symptomDescriptions = {
  '반점': '잎이나 과실 등에 검정, 갈색, 회색 등의 반점이 생김',
  '마름': '잎, 줄기, 과실 등이 갈변되며 말라감',
  '시듦(위조)': '물 공급이 잘 되어도 잎이나 식물 전체가 시드는 증상',
  '기형/변형': '잎, 줄기, 과실 등의 형태가 비정상적으로 뒤틀리거나 자람',
  '균핵/곰팡이': '흰색/회색 곰팡이 또는 균핵이 발생하는 형태',
  '부패/썩음': '줄기나 과실이 물러지며 썩거나 갈색으로 변함',
  '점무늬': '흑색 또는 갈색 작은 점처럼 나타나는 병반',
  '구멍/천공': '조직 일부가 괴사되어 구멍이 생김 (ex. 천공병)',
  '탈색/황화': '정상 엽록소 소실로 인해 잎이 노랗게 변함',
  '비정상 생장': '과도한 생장, 왜소화, 줄기 비대 등',
  '벌레/충 피해': '해충의 흡즙, 식해 등으로 인한 물리적 손상',
  '털/흰가루/분말': '해충 또는 곰팡이류에 의한 백색 가루, 털 모양 증상',
  '기타/불명': '상기 항목에 포함되지 않는 특이 증상 또는 미확인 증상',
};

const Pests = () => {
  const navigation = useNavigation();
  const [crop, setCrop] = useState('');
  const [part, setPart] = useState('');
  const [symptom, setSymptom] = useState('');
  const [detail, setDetail] = useState('');
  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [varietyList, setVarietyList] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedVariety, setSelectedVariety] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [partModalVisible, setPartModalVisible] = useState(false);
  const [partSearch, setPartSearch] = useState('');
  const [symptomModalVisible, setSymptomModalVisible] = useState(false);
  const [symptomSearch, setSymptomSearch] = useState('');

  // 모달 오픈/닫기
  const openModal = () => {
    setModalVisible(true);
    setSearchText('');
    setSelectedCrop(null);
    setVarietyList([]);
  };
  const closeModal = () => {
    setModalVisible(false);
    setSearchText('');
    setSelectedCrop(null);
    setVarietyList([]);
  };

  // 인기작물 클릭 시 해당 작물명만 바로 선택
  const handlePopularCropSelect = (crop) => {
    setCrop(crop.name);
    setModalVisible(false);
  };

  const isFormFilled = crop && part && symptom && detail;

  // part 카테고리 필터링
  const filteredParts = partSearch === ''
    ? partCategories
    : partCategories.filter(cat => cat.includes(partSearch));

  // 증상 카테고리 필터링
  const filteredSymptoms = symptomSearch === ''
    ? symptomCategories
    : symptomCategories.filter(cat => cat.includes(symptomSearch));

  // 병해충 API 요청 (예시: 병검색)
  const handleSubmit = async () => {
    try {
      // 예시: 병검색 서비스 (작물명 기반)
      const url = `http://api.nongsaro.go.kr/service/pestDiseaseOccrrncInfo/pestDiseaseList?apiKey=${PEST_API_KEY}&sickKey=&cropName=${encodeURIComponent(crop)}`;
      const res = await axios.get(url);
      console.log('병해충 API 응답:', res.data);
      Alert.alert('API 응답 확인', JSON.stringify(res.data).slice(0, 300));
    } catch (e) {
      console.error('API 오류:', e);
      Alert.alert('API 오류', e.message);
    }
  };

  // 모달 헤더
  const renderModalHeader = () => (
    <>
      <View style={{ height: 16 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>어떤 작물을 추가하시겠어요?</Text>
      </View>
    </>
  );

  // 인기작물/검색 결과 렌더링
  const renderPopularCrops = () => {
    // 21개로 맞추기
    const crops = [...popularCrops];
    while (crops.length < 21) crops.push({ name: '', icon: '' });
    // 3개씩 7줄로 slice
    const rows = [];
    for (let i = 0; i < 21; i += 3) {
      rows.push(crops.slice(i, i + 3));
    }
    return (
      <>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8, textAlign: 'left' }}>인기작물 TOP 21</Text>
        <ScrollView
          style={{ maxHeight: 320 }}
          contentContainerStyle={{ flexGrow: 1, alignItems: 'stretch' }}
          horizontal={false}
          showsVerticalScrollIndicator={true}
        >
          {rows.map((row, rowIdx) => (
            <View key={rowIdx} style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 8, width: '100%' }}>
              {row.map((crop, idx) => (
                crop.name ? (
                  <TouchableOpacity
                    key={crop.name}
                    style={{
                      width: '30%',
                      marginHorizontal: 4,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 16,
                      alignItems: 'center',
                      paddingVertical: 18,
                    }}
                    onPress={() => handlePopularCropSelect(crop)}
                  >
                    <Text style={{ fontSize: 40 }}>{crop.icon}</Text>
                    <Text style={{ marginTop: 8, fontSize: 20, fontWeight: 'bold' }}>{crop.name}</Text>
                  </TouchableOpacity>
                ) : (
                  <View key={idx} style={{ width: '30%', marginHorizontal: 4, backgroundColor: 'transparent' }} />
                )
              ))}
            </View>
          ))}
        </ScrollView>
      </>
    );
  };

  // 검색창 입력 시 실시간 필터링 (품종 리스트 제거, 작물명만 표시)
  useEffect(() => {
    if (searchText === '') {
      setSearchResult(null);
      return;
    }
    // itemCodeData에서 작물명만 검색
    const cropMatch = itemCodeData.find(item => item.itemName && item.itemName.includes(searchText));
    setSearchResult(cropMatch ? cropMatch.itemName : null);
  }, [searchText]);

  // 발병 부위 선택 모달
  const renderPartModal = () => (
    <Modal visible={partModalVisible} animationType="slide" transparent onRequestClose={() => setPartModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>발병 부위 선택</Text>
          <TextInput
            style={[styles.input, { fontSize: 18 }]}
            placeholder="부위명 검색 또는 직접 입력"
            value={partSearch}
            onChangeText={setPartSearch}
          />
          <ScrollView
            style={{ maxHeight: 240, alignSelf: 'stretch', width: '100%' }}
            contentContainerStyle={{ flexGrow: 1, alignItems: 'stretch' }}
            showsVerticalScrollIndicator={true}
          >
            {filteredParts.map((cat, idx) => (
              <TouchableOpacity
                key={cat}
                style={{
                  paddingVertical: 12,
                  alignItems: 'flex-start',
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                  alignSelf: 'stretch',
                  width: '100%',
                  paddingHorizontal: 8,
                }}
                onPress={() => { setPart(cat); setPartModalVisible(false); setPartSearch(''); }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{cat}</Text>
                <Text style={{ fontSize: 14, color: '#888', marginTop: 2 }}>{partDescriptions[cat]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* 직접 입력 버튼 */}
          {partSearch !== '' && !partCategories.includes(partSearch) && (
            <TouchableOpacity
              style={{ marginTop: 16, backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}
              onPress={() => { setPart(partSearch); setPartModalVisible(false); setPartSearch(''); }}
            >
              <Text style={{ color: '#fff', fontSize: 18 }}>
                "{partSearch}" 직접 입력
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.modalCloseButton, { marginTop: 16 }]} onPress={() => setPartModalVisible(false)}>
            <Text style={styles.modalCloseButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // 증상 선택 모달
  const renderSymptomModal = () => (
    <Modal visible={symptomModalVisible} animationType="slide" transparent onRequestClose={() => setSymptomModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>병해충 증상 선택</Text>
          <TextInput
            style={[styles.input, { fontSize: 18 }]}
            placeholder="증상명 검색 또는 직접 입력"
            value={symptomSearch}
            onChangeText={setSymptomSearch}
          />
          <ScrollView
            style={{ maxHeight: 240, alignSelf: 'stretch', width: '100%' }}
            contentContainerStyle={{ flexGrow: 1, alignItems: 'stretch' }}
            showsVerticalScrollIndicator={true}
          >
            {filteredSymptoms.map((cat, idx) => (
              <TouchableOpacity
                key={cat}
                style={{
                  paddingVertical: 12,
                  alignItems: 'flex-start',
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                  alignSelf: 'stretch',
                  width: '100%',
                  paddingHorizontal: 8,
                }}
                onPress={() => { setSymptom(cat); setSymptomModalVisible(false); setSymptomSearch(''); }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{cat}</Text>
                <Text style={{ fontSize: 14, color: '#888', marginTop: 2 }}>{symptomDescriptions[cat]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* 직접 입력 버튼 */}
          {symptomSearch !== '' && !symptomCategories.includes(symptomSearch) && (
            <TouchableOpacity
              style={{ marginTop: 16, backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}
              onPress={() => { setSymptom(symptomSearch); setSymptomModalVisible(false); setSymptomSearch(''); }}
            >
              <Text style={{ color: '#fff', fontSize: 18 }}>
                "{symptomSearch}" 직접 입력
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.modalCloseButton, { marginTop: 16 }]} onPress={() => setSymptomModalVisible(false)}>
            <Text style={styles.modalCloseButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>{'<'}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>병해충 질문</Text>
      {/* 작물 선택 버튼 */}
      <TouchableOpacity style={styles.cropButton} onPress={openModal}>
        <Text style={styles.cropButtonText}>{crop ? crop : '작물 선택'}</Text>
      </TouchableOpacity>
      {/* 모달: 작물 선택 (MarketPriceScreen.js와 동일하게) */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {renderModalHeader()}
            <TextInput
              style={[styles.input, { fontSize: 20 }]}
              placeholder="작물 이름을 입력하세요"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText === '' ? (
              renderPopularCrops()
            ) : (
              searchResult ? (
                <TouchableOpacity style={styles.cropItem} onPress={() => { setCrop(searchResult); setModalVisible(false); setSearchText(''); }}>
                  <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 20 }}>{searchResult} 선택</Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ color: '#888', fontSize: 18, marginTop: 16, textAlign: 'center' }}>검색 결과 없음</Text>
              )
            )}
            <TouchableOpacity style={[styles.modalCloseButton, { marginTop: 12 }]} onPress={closeModal}>
              <Text style={styles.modalCloseButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* 발병 부위 선택 버튼 */}
      <TouchableOpacity style={styles.cropButton} onPress={() => setPartModalVisible(true)}>
        <Text style={styles.cropButtonText}>{part ? part : '발병 부위 선택'}</Text>
      </TouchableOpacity>
      {renderPartModal()}
      {/* 증상 선택 버튼 */}
      <TouchableOpacity style={styles.cropButton} onPress={() => setSymptomModalVisible(true)}>
        <Text style={styles.cropButtonText}>{symptom ? symptom : '병해충 증상 선택'}</Text>
      </TouchableOpacity>
      {renderSymptomModal()}
      <TextInput
        style={styles.textarea}
        placeholder={"병해충 증상을 자세히 입력해 주세요.\n사진 첨부시 더욱 정확한 답변이 가능해요."}
        value={detail}
        onChangeText={setDetail}
        multiline
      />
      <TouchableOpacity style={styles.photoButton}>
        <Text style={styles.photoButtonText}>📷 사진 첨부</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.submitButton, !isFormFilled && styles.submitButtonDisabled]} disabled={!isFormFilled} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>등록</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Pests; 