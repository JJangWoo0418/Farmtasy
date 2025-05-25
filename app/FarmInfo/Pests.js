import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator, StyleSheet, Image} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../Components/Css/FarmInfo/PestsStyle';
import itemCodeData from '../Components/Utils/item_code_data.json';
import { PEST_API_KEY, PEST_AI_API_KEY, SERVER_URL } from '../Components/API/apikey';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

// 인기작물 TOP 21 (이모지 포함, MarketPriceScreen.js와 동일)
const popularCrops = [
  { name: '고추', image: require('../../assets/peppericon.png') },
  { name: '벼', image: require('../../assets/riceicon.png') },
  { name: '감자', image: require('../../assets/potatoicon.png') },
  { name: '고구마', image: require('../../assets/sweetpotatoicon.png') },
  { name: '사과', image: require('../../assets/appleicon.png') },
  { name: '딸기', image: require('../../assets/strawberryicon.png') },
  { name: '마늘', image: require('../../assets/garlicicon.png') },
  { name: '상추', image: require('../../assets/lettuceicon.png') },
  { name: '배추', image: require('../../assets/napacabbageicon.png') },
  { name: '토마토', image: require('../../assets/tomatoicon.png') },
  { name: '포도', image: require('../../assets/grapeicon.png') },
  { name: '콩', image: require('../../assets/beanicon.png') },
  { name: '감귤', image: require('../../assets/tangerinesicon.png') },
  { name: '복숭아', image: require('../../assets/peachicon.png') },
  { name: '양파', image: require('../../assets/onionicon.png') },
  { name: '감', image: require('../../assets/persimmonicon.png') },
  { name: '파', image: require('../../assets/greenonionicon.png') },
  { name: '들깨', image: require('../../assets/perillaseedsicon.png') },
  { name: '오이', image: require('../../assets/cucumbericon.png') },
  { name: '낙엽교목류', image: require('../../assets/deciduoustreesicon.png') },
  { name: '옥수수', image: require('../../assets/cornericon.png') },
  { name: '표고버섯', image: require('../../assets/mushroomicon.png') },
  { name: '블루베리', image: require('../../assets/blueberryicon.png') },
  { name: '양배추', image: require('../../assets/cabbageicon.png') },
  { name: '호박', image: require('../../assets/pumpkinicon.png') },
  { name: '자두', image: require('../../assets/plumicon.png') },
  { name: '시금치', image: require('../../assets/spinachicon.png') },
  { name: '두릅', image: require('../../assets/araliaicon.png') },
  { name: '참깨', image: require('../../assets/sesameicon.png') },
  { name: '매실', image: require('../../assets/greenplumicon.png') },
];

// 부위 카테고리 (코드/명칭/설명)
const partCategories = [
  { code: '1', name: '잎', desc: '잎마름병, 반점병 등 잎에 흔하게 발생' },
  { code: '2', name: '줄기', desc: '줄기썩음병, 균핵병 등' },
  { code: '3', name: '가지', desc: '가지에 암반 생성 등' },
  { code: '4', name: '꽃', desc: '꽃곰팡이병, 꽃썩음병 등' },
  { code: '5', name: '과실', desc: '점무늬, 균열, 썩음 등 과일 품질 저하' },
  { code: '6', name: '뿌리', desc: '뿌리혹병, 뿌리썩음병, 선충 피해 등' },
  { code: '7', name: '수관 전체', desc: '나무 전체에 증상이 퍼지는 경우' },
  { code: '8', name: '전체', desc: '작물 전체 혹은 여러 부위에 걸쳐 발생' },
  { code: '9', name: '생장점', desc: '새순, 생장점 부위에 발생' },
  { code: '10', name: '기타', desc: '위 항목에 포함되지 않거나 명확하지 않은 경우' }
];

// 증상 카테고리 (코드/명칭/설명)
const symptomCategories = [
  { code: '1', name: '반점', desc: '잎이나 과실 등에 검정, 갈색, 회색 등의 반점이 생김' },
  { code: '2', name: '마름', desc: '잎, 줄기, 과실 등이 갈변되며 말라감' },
  { code: '3', name: '시듦', desc: '물 공급이 잘 되어도 잎이나 식물 전체가 시드는 증상' },
  { code: '4', name: '기형', desc: '잎, 줄기, 과실 등의 형태가 비정상적으로 뒤틀리거나 자람' },
  { code: '5', name: '균핵', desc: '흰색 또는 회색 곰팡이 또는 균핵이 발생하는 형태' },
  { code: '6', name: '부패', desc: '줄기나 과실이 물러지며 썩거나 갈색으로 변함' },
  { code: '7', name: '점무늬', desc: '흑색 또는 갈색의 작은 점처럼 나타나는 병반' },
  { code: '8', name: '구멍', desc: '조직 일부가 괴사되어 구멍이 생기는 증상' },
  { code: '9', name: '탈색', desc: '정상 엽록소 소실로 인해 잎이 노랗게 변함' },
  { code: '10', name: '생장 이상', desc: '과도한 생장, 왜소화, 줄기 비대 등' },
  { code: '11', name: '해충 피해', desc: '해충의 흡즙, 식해 등으로 인한 물리적 손상' },
  { code: '12', name: '흰가루', desc: '백색 가루, 곰팡이 또는 해충 유래의 분말, 털 형태 증상' },
  { code: '13', name: '기타', desc: '상기 항목에 포함되지 않는 특이 증상 또는 미확인 증상' }
];

const Pests = () => {
  const navigation = useNavigation();
  const router = useRouter();
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
  const [partName, setPartName] = useState('');
  const [symptomName, setSymptomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');

  // 로딩 애니메이션 효과
  useEffect(() => {
    let interval;
    if (loading) {
      let count = 0;
      interval = setInterval(() => {
        count = (count + 1) % 4;
        setLoadingDots('.'.repeat(count));
      }, 500);
    } else {
      setLoadingDots('');
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loading]);

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
    : partCategories.filter(cat => cat.name.includes(partSearch));

  // 증상 카테고리 필터링
  const filteredSymptoms = symptomSearch === ''
    ? symptomCategories
    : symptomCategories.filter(cat => cat.name.includes(symptomSearch));

  // 사진 첨부 함수: 사진을 선택하고 base64로 변환하여 image state에 저장
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '앨범 접근 권한이 필요합니다.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true, // base64 데이터 포함
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].base64); // base64 데이터 저장
        Alert.alert('사진 첨부 완료', '사진이 첨부되었습니다.');
      }
    } catch (e) {
      Alert.alert('에러', '사진 선택 중 오류가 발생했습니다: ' + e.message);
    }
  };

  // 병해충 AI(Gemini) API 요청
  const handleSubmit = async () => {
    if (!crop || !part || !symptom || !detail) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }

    setLoading(true);  // 로딩 시작
    try {
      // 요청 내용 터미널에 출력
      console.log('\n=== AI 요청 내용 ===');
      console.log('작물:', crop);
      console.log('발병부위:', partName);
      console.log('증상:', symptomName);
      console.log('상세설명:', detail);
      console.log('이미지 첨부:', image ? '있음' : '없음');
      console.log('===================\n');

      // 서버 URL 확인
      if (!SERVER_URL) {
        throw new Error('서버 URL이 설정되지 않았습니다.');
      }

      // 서버 API 호출
      const response = await axios.post(`${SERVER_URL}/api/ai/pest-diagnosis`, {
        crop: crop,
        partName: partName,
        symptomName: symptomName,
        detail: detail,
        image: image
      });

      if (response.data.success) {
        console.log('\n=== AI 응답 ===');
        console.log(response.data.result);
        console.log('===============\n');

        router.push({
          pathname: '/FarmInfo/PestDiagnosisResult',
          params: {
            result: response.data.result,
            similarImages: JSON.stringify(response.data.similarImages || [])
          }
        });
      } else {
        throw new Error(response.data.message);
      }

    } catch (error) {
      console.error('AI API 오류:', error);

      if (error.message === '서버 URL이 설정되지 않았습니다.') {
        Alert.alert(
          '설정 오류',
          '서버 URL이 설정되지 않았습니다.\n관리자에게 문의해주세요.',
          [{ text: '확인' }]
        );
      } else if (error.response?.status === 429) {
        Alert.alert(
          'AI 사용 제한',
          '현재 AI 요청이 너무 많아 잠시 차단되었습니다.\n\n' +
          '1분 후에 다시 시도해주세요.',
          [{ text: '확인' }]
        );
      } else if (error.message === 'Network Error') {
        Alert.alert(
          '네트워크 오류',
          '서버에 연결할 수 없습니다.\n\n' +
          '다음을 확인해주세요:\n' +
          '1. 인터넷 연결 상태\n' +
          '2. 서버가 실행 중인지 확인\n' +
          '3. 잠시 후 다시 시도',
          [{ text: '확인' }]
        );
      } else {
        Alert.alert(
          'AI 오류',
          'AI 서버 연결에 실패했습니다.\n\n' +
          '문제가 지속되면 다음을 확인해주세요:\n' +
          '1. 인터넷 연결 상태\n' +
          '2. 잠시 후 다시 시도\n' +
          '3. 관리자에게 문의',
          [{ text: '확인' }]
        );
      }
    } finally {
      setLoading(false);  // 로딩 종료
    }
  };

  // 모달 헤더
  const renderModalHeader = () => (
    <>
      <View style={{ height: 16 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>어떤 작물을 추가하시겠어요?</Text>
      </View>
    </>
  );

  // 인기작물/검색 결과 렌더링
  const renderPopularCrops = () => {
    // 21개로 맞추기
    const crops = [...popularCrops];
    while (crops.length < 30) crops.push({ name: '', icon: '' });
    // 3개씩 7줄로 slice
    const rows = [];
    for (let i = 0; i < 30; i += 3) {
      rows.push(crops.slice(i, i + 3));
    }
    return (
      <>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8, textAlign: 'left' }}>인기작물 TOP 30</Text>
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
                      borderRadius: 16,
                      alignItems: 'center',
                      paddingVertical: 18,
                    }}
                    onPress={() => handlePopularCropSelect(crop)}
                  >
                    <Image source={crop.image} style={{ width: 60, height: 60 }} />
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
    <Modal visible={partModalVisible} animationType="fade" transparent onRequestClose={() => setPartModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>발병 부위 선택</Text>
          <TextInput
            style={[styles.input, { fontSize: 18, marginBottom: 8 }]}
            placeholder="부위명 입력"
            value={partSearch}
            onChangeText={setPartSearch}
          />
          <ScrollView
            style={{ maxHeight: 240, alignSelf: 'stretch', width: '100%' }}
            contentContainerStyle={{ flexGrow: 1, alignItems: 'stretch' }}
            showsVerticalScrollIndicator={true}
          >
            {filteredParts.map((cat) => (
              <TouchableOpacity
                key={cat.code}
                style={{
                  paddingVertical: 12,
                  alignItems: 'flex-start',
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                  alignSelf: 'stretch',
                  width: '100%',
                  paddingHorizontal: 8,
                }}
                onPress={() => { setPart(cat.code); setPartName(cat.name); setPartModalVisible(false); }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{cat.name}</Text>
                <Text style={{ fontSize: 14, color: '#888', marginTop: 2 }}>{cat.desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={[styles.modalCloseButton, { marginTop: 16 }]} onPress={() => setPartModalVisible(false)}>
            <Text style={styles.modalCloseButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // 증상 선택 모달
  const renderSymptomModal = () => (
    <Modal visible={symptomModalVisible} animationType="fade" transparent onRequestClose={() => setSymptomModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>병해충 증상 선택</Text>
          <TextInput
            style={[styles.input, { fontSize: 18, marginBottom: 8 }]}
            placeholder="증상 입력"
            value={symptomSearch}
            onChangeText={setSymptomSearch}
          />
          <ScrollView
            style={{ maxHeight: 240, alignSelf: 'stretch', width: '100%' }}
            contentContainerStyle={{ flexGrow: 1, alignItems: 'stretch' }}
            showsVerticalScrollIndicator={true}
          >
            {filteredSymptoms.map((cat) => (
              <TouchableOpacity
                key={cat.code}
                style={{
                  paddingVertical: 12,
                  alignItems: 'flex-start',
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                  alignSelf: 'stretch',
                  width: '100%',
                  paddingHorizontal: 8,
                }}
                onPress={() => { setSymptom(cat.code); setSymptomName(cat.name); setSymptomModalVisible(false); }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{cat.name}</Text>
                <Text style={{ fontSize: 14, color: '#888', marginTop: 2 }}>{cat.desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={[styles.modalCloseButton, { marginTop: 16 }]} onPress={() => setSymptomModalVisible(false)}>
            <Text style={styles.modalCloseButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 상단 헤더: ←(뒤로가기) + 중앙 타이틀 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, width: '100%', marginBottom: 16, marginTop: -30 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 0, paddingLeft: 8, zIndex: 2 }}>
          <Image source={require('../../assets/gobackicon.png')} style={{ width: 23, height: 23, marginLeft: -17 }} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', }}>병해충 질문</Text>
        </View>
      </View>
      {/* 작물 선택 버튼 */}
      <TouchableOpacity style={styles.cropButton} onPress={openModal}>
        <Text style={styles.cropButtonText}>{crop ? crop : '작물 선택'}</Text>
      </TouchableOpacity>
      {/* 모달: 작물 선택 (MarketPriceScreen.js와 동일하게) */}
      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={closeModal}>
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
        <Text style={styles.cropButtonText}>{partName ? partName : '발병 부위 선택'}</Text>
      </TouchableOpacity>
      {renderPartModal()}
      {/* 증상 선택 버튼 */}
      <TouchableOpacity style={styles.cropButton} onPress={() => setSymptomModalVisible(true)}>
        <Text style={styles.cropButtonText}>{symptomName ? symptomName : '병해충 증상 선택'}</Text>
      </TouchableOpacity>
      {renderSymptomModal()}
      <TextInput
        style={styles.textarea}
        placeholder={"병해충 증상과 의심되는 병명을 함께 입력해 주세요.\n사진 첨부시 더욱 정확한 답변이 가능해요."}
        placeholderTextColor={'#888'}
        value={detail}
        onChangeText={setDetail}
        multiline
      />
      {/* 사진 첨부 버튼: 실제로 사진을 선택하고 base64로 저장 */}
      <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
        <Text style={styles.photoButtonText}>📷 사진 첨부</Text>
      </TouchableOpacity>
      {/* 사진 미리보기 (선택 시) */}
      {image && (
        <Text style={{ color: '#4CAF50', marginBottom: 8 }}>사진이 첨부되었습니다.</Text>
      )}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <Text style={[styles.submitButtonText, { textAlign: 'center' }]}>답변하는중{loadingDots}</Text>
        ) : (
          <Text style={styles.submitButtonText}>질문하기</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Pests; 