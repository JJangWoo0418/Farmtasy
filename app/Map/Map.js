import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, StyleSheet, Image, Alert, Platform, ActivityIndicator, Keyboard, Modal, ScrollView } from 'react-native';
import MapView, { Polygon, Polyline, Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import debounce from 'lodash.debounce';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BottomTabNavigator from '../Navigator/BottomTabNavigator';
import API_CONFIG from '../DB/api';



// Geocoder 초기화 (API 키 확인)
Geocoder.init('AIzaSyB7uysOUsyE_d6xdLLJx7YxC-Ux7giVNdc'); // 여기에 실제 API 키를 넣어주세요

const locationIcon = require('../../assets/farmicon.png');  // 이미지 대신 이모지 사용

const Map = () => {
    const navigation = useNavigation();
    const { farmName } = useLocalSearchParams();
    const router = useRouter();
    const params = useLocalSearchParams();
    // 초기 region을 고정값으로 설정
    const [region, setRegion] = useState({
        latitude: 37.5665, // 서울 시청
        longitude: 126.9780,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [drawnPath, setDrawnPath] = useState([]);
    const isDragging = useRef(false);
    const [farmAreas, setFarmAreas] = useState([]);
    const [modifyingAreaId, setModifyingAreaId] = useState(null);
    const mapRef = useRef(null);
    const [centerAddress, setCenterAddress] = useState('');
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);
    const [isMapMoving, setIsMapMoving] = useState(false);
    const pinAnimation = useRef(new Animated.Value(0)).current;
    const lastRegion = useRef(region);
    const [managedCrops, setManagedCrops] = useState([]);
    const [isAddingCropMode, setIsAddingCropMode] = useState(false);
    const addButtonOffsetY = useRef(new Animated.Value(0)).current; // Add Crop button offset animation value
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const route = useRoute();
    const { userData, phone, name } = useLocalSearchParams();
    const [selectedArea, setSelectedArea] = useState(null);
    const [isAddingArea, setIsAddingArea] = useState(false);
    const [initialRegion, setInitialRegion] = useState(null);
    const [saving, setSaving] = useState(false);
    const [highlightedId, setHighlightedId] = useState(null);
    const [activeHighlightName, setActiveHighlightName] = useState(null);
    const [loadingFarms, setLoadingFarms] = useState(false);
    const [loadingCrops, setLoadingCrops] = useState(false);
    const highlightTimerRef = useRef(null);
    const highlightDelayRef = useRef(null);
    const [highlightedName, setHighlightedName] = useState(null);
    const [isFarmModalVisible, setIsFarmModalVisible] = useState(false);
    const [showCropActionModal, setShowCropActionModal] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [createSuccessModalVisible, setCreateSuccessModalVisible] = useState(false);
    const [farmActionModal, setFarmActionModal] = useState({ visible: false, area: null });
    // 위치 수정 모드 관련 상태
    const [isModifyingLocation, setIsModifyingLocation] = useState(false);
    const [modifyingTarget, setModifyingTarget] = useState(null);
    const [modifyingLocation, setModifyingLocation] = useState(null);
    const [modifySuccessModalVisible, setModifySuccessModalVisible] = useState(false);

    // --- 지도 중앙 주소 관련 상태 ---
    // const [initialLocationFetched, setInitialLocationFetched] = useState(false);
    // ------------------------------

    // --- 지도 중앙 주소 가져오기 함수 ---
    const fetchCenterAddress = async (latitude, longitude) => {
        if (isDrawingMode) return;
        setIsFetchingAddress(true);
        try {
            const response = await Geocoder.from(latitude, longitude);
            const formattedAddress = response.results[0]?.formatted_address || '';
            const shortAddress = formattedAddress.split(' ').slice(1).join(' ');
            setCenterAddress(shortAddress || formattedAddress);
        } catch (error) {
            setCenterAddress('');
        } finally {
            setIsFetchingAddress(false);
        }
    };
    // ------------------------------

    // --- Debounced 주소 가져오기 함수 ---
    // 지도 이동이 멈춘 후 500ms 뒤에 주소 가져오기 실행
    const debouncedFetchCenterAddress = useRef(
        debounce((lat, lon) => {
            fetchCenterAddress(lat, lon);
        }, 500)
    ).current;
    // ------------------------------------

    // 지도 움직임 시작 시 핀 애니메이션 및 키보드 닫기
    const handleRegionChangeStart = () => {
        if (!isAddingCropMode) return; // 작물 추가 모드가 아닐 때는 애니메이션 안 함

        Keyboard.dismiss();
        setIsMapMoving(true);
        pinAnimation.stopAnimation();
        Animated.timing(pinAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true, // 네이티브 드라이버 사용으로 복원
        }).start();
    };

    // 지도 움직임 종료 시 핀 애니메이션 및 (조건부) 주소 가져오기
    const handleRegionChangeComplete = (newRegion) => {
        if (!isAddingCropMode && !isMapMoving && !isModifyingLocation) return;

        setIsMapMoving(false);
        pinAnimation.stopAnimation();
        Animated.timing(pinAnimation, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start();

        // region 상태 업데이트
        setRegion(newRegion);

        // 위치 수정 모드일 때는 주소 가져오기
        if (isModifyingLocation) {
            debouncedFetchCenterAddress(newRegion.latitude, newRegion.longitude);
        }
        // 작물 추가 모드일 때도 주소 가져오기
        else if (!isDrawingMode && isAddingCropMode) {
            debouncedFetchCenterAddress(newRegion.latitude, newRegion.longitude);
        }
    };

    // 핀 애니메이션 스타일 (translateY 조정)
    const pinAnimatedStyle = {
        transform: [
            {
                translateY: pinAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -25] // Y축 이동 거리 증가
                })
            },
            {
                scale: pinAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2]
                })
            }
        ]
    };

    // 농장 데이터 패치 함수
    const fetchFarms = async () => {
        setLoadingFarms(true);
        try {
            const farmResponse = await fetch(`${API_CONFIG.BASE_URL}/api/farm?user_phone=${phone}`);
            const farmData = await farmResponse.json();
            if (farmResponse.ok) {
                const formattedFarms = farmData.map(farm => ({
                    id: farm.farm_id,
                    name: farm.farm_name,
                    coordinates: Array.isArray(farm.coordinates) && farm.coordinates.length > 0
                        ? farm.coordinates
                        : [{ latitude: farm.latitude, longitude: farm.longitude }]
                }));
                setFarmAreas(formattedFarms);
            }
        } catch (error) {
            // 에러 무시
        } finally {
            setLoadingFarms(false);
        }
    };

    // 작물 데이터 패치 함수
    const fetchCrops = async () => {
        setLoadingCrops(true);
        try {
            const cropDetailResponse = await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail?user_phone=${phone}`);
            const cropDetailData = await cropDetailResponse.json();
            if (cropDetailResponse.ok) {
                const formattedCrops = cropDetailData.map(crop => ({
                    ...crop,
                    id: crop.cropdetail_id,
                    detail_id: crop.cropdetail_id,
                    detailId: crop.cropdetail_id,
                    name: crop.detail_name,
                    image: crop.detail_image_url,
                    latitude: Number(crop.latitude),
                    longitude: Number(crop.longitude)
                }));
                console.log('새로고침된 작물 목록:', formattedCrops);
                setManagedCrops(formattedCrops);
            }
        } catch (error) {
            console.error('작물 목록 불러오기 실패:', error);
        } finally {
            setLoadingCrops(false);
        }
    };

    // 농장/작물 데이터는 phone이 바뀔 때마다 각각 독립적으로 패치
    useEffect(() => {
        if (phone) {
            fetchFarms();
            fetchCrops();
        }
        return () => {
            debouncedFetchCenterAddress.cancel();
        };
    }, [phone]);

    // 특정 작물만 fetch해서 지도 이동 및 강조
    const fetchAndHighlightCropDetail = async (detailId) => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${detailId}`);
            const data = await res.json();
            if (data.latitude && data.longitude) {
                setHighlightedId(detailId);
                const region = {
                    latitude: parseFloat(data.latitude),
                    longitude: parseFloat(data.longitude),
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                };
                console.log('이동할 region:', region); // 디버깅용 로그
                setRegion(region); // region 상태도 동기화 (MapView region prop과 연결되어 있으므로 즉시 이동)
                setTimeout(() => {
                    setHighlightedId(null);
                }, 2000);
            } else {
                console.log('잘못된 좌표:', data);
            }
        } catch (e) {
            setHighlightedId(null);
            console.log('fetchAndHighlightCropDetail 에러:', e);
        }
    };

    // highlightDetailId가 바뀔 때만 해당 작물만 fetch해서 animateToRegion 및 강조
    useEffect(() => {
        if (params.highlightDetailId) {
            fetchAndHighlightCropDetail(params.highlightDetailId);
        } else {
            setHighlightedId(null);
        }
    }, [params.highlightDetailId]);

    // 메뉴 토글 함수 수정 (버튼 위치 애니메이션 타겟 조정)
    const toggleMenu = () => {
        const toValue = isMenuOpen ? 0 : 1; // Drawer animation target value
        // 닫힐 때(isMenuOpen=true): target=0 (원래 위치)
        // 열릴 때(isMenuOpen=false): target=-60 (위로 60 이동, 값 조정 가능)
        const buttonOffsetYTarget = isMenuOpen ? 0 : -70; // Corrected target value

        // 메뉴를 열 때 작물 추가 모드 비활성화
        if (toValue === 1) {
            setIsAddingCropMode(false);
        }

        // 서랍과 버튼 애니메이션을 동시에 시작
        Animated.parallel([
            // 서랍 애니메이션
            Animated.timing(animation, {
                toValue,
                duration: 300,
                useNativeDriver: false,
            }),
            // "작물 추가" 버튼 위치 애니메이션
            Animated.timing(addButtonOffsetY, {
                toValue: buttonOffsetYTarget, // 수정된 타겟 값 사용
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();

        setIsMenuOpen(!isMenuOpen);
    };

    // 애니메이션 값 설정 (arrowRotate 제거)
    // 서랍 X축 이동 애니메이션 (오른쪽 화면 밖 -> 제자리)
    const drawerTranslateX = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -140] // 0: 초기 위치 (화살표만 보임), -140: 왼쪽으로 이동할 거리 (값 조정 필요)
    });

    const menuOpacity = animation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1, 1], // 항상 보이도록 (투명도 조절은 제거 또는 수정 가능)
    });

    const handlePanDrag = (e) => {
        // Keyboard.dismiss(); // 팬 드래그 중에는 키보드를 닫지 않아도 될 수 있음 (필요시 주석 해제)
        if (isDrawingMode && isDragging.current) {
            const coordinate = e.nativeEvent.coordinate;
            setDrawnPath(prevPath => [...prevPath, coordinate]);
        }
    };

    const handleMapTouchStart = () => {
        Keyboard.dismiss(); // 키보드 닫기 추가
        if (isDrawingMode) {
            isDragging.current = true;
        }
    };

    const handleMapTouchEnd = () => {
        if (isDrawingMode) {
            isDragging.current = false;
        }
    };

    const handleMapPress = (e) => {
        if (isDrawingMode) {
            const coordinate = e.nativeEvent.coordinate;
            setDrawnPath(prevPath => [...prevPath, coordinate]);
        }
    };

    const promptForAreaName = (currentCoordinates) => {
        // 이름 입력 모달 또는 Alert.prompt 등으로 이름을 받는다고 가정
        const askNameAndSave = (name) => {
            saveFarmArea(name, currentCoordinates);
        };

        if (Platform.OS === 'ios') {
            Alert.prompt(
                '농장 이름 설정',
                '농장의 이름을 입력하세요:',
                [
                    { text: '취소', style: 'cancel' },
                    { text: '저장', onPress: askNameAndSave },
                ],
                'plain-text',
                ''
            );
        } else {
            // Android: 커스텀 모달 구현 필요. 임시로 기본 이름 사용
            const tempName = `임시 농장 ${farmAreas.length + 1}`;
            Alert.alert(
                '알림 (Android)',
                `이름 입력 기능은 커스텀 모달 구현이 필요합니다. 임시 이름 "${tempName}"으로 저장합니다.`,
                [{ text: '확인', onPress: () => askNameAndSave(tempName) }]
            );
        }
    };

    const saveFarmArea = async (name, coordinates) => {
        if (!name || name.trim().length === 0) {
            Alert.alert('오류', '농장 이름을 입력하세요.');
            return;
        }
        if (!coordinates || coordinates.length < 3) {
            Alert.alert('오류', '영역을 3개 이상 점으로 그려주세요.');
            return;
        }

        // 중심 좌표 계산
        const lat = coordinates.reduce((sum, c) => sum + c.latitude, 0) / coordinates.length;
        const lng = coordinates.reduce((sum, c) => sum + c.longitude, 0) / coordinates.length;

        let formattedAddress = '';
        let shortAddress = '';

        try {
            // 중심 좌표로 주소 가져오기
            const geocodeResponse = await Geocoder.from(lat, lng);

            if (geocodeResponse.results && geocodeResponse.results.length > 0) {
                formattedAddress = geocodeResponse.results[0]?.formatted_address || '';
                shortAddress = formattedAddress.split(' ').slice(1).join(' ');
            } else {
                formattedAddress = `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`;
                shortAddress = formattedAddress;
            }

            const farmData = {
                user_phone: phone,
                farm_name: name,
                latitude: Number(lat.toFixed(7)),
                longitude: Number(lng.toFixed(7)),
                coordinates: coordinates,
                address: shortAddress // 간단 주소를 address 필드에 저장
            };

            const response = await fetch(`${API_CONFIG.BASE_URL}/api/farm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(farmData)
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '농장 정보 저장에 실패했습니다.');
            }

            // 성공 시 지도에 반영
            setFarmAreas(prev => [...prev, {
                id: data.farm_id,
                name,
                coordinates: coordinates,
                address: shortAddress // 간단 주소를 address 필드에 저장
            }]);
            // ★ 드래그로 농장 생성 시에만 지도 이동 ★
            setRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
            Alert.alert('성공', '농장이 등록되었습니다.');
        } catch (error) {
            // Geocoder 오류가 발생해도 기본 주소로 저장 시도
            if (error.code === 4) {
                formattedAddress = `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`;
                shortAddress = formattedAddress;

                try {
                    const farmData = {
                        user_phone: phone,
                        farm_name: name,
                        latitude: Number(lat.toFixed(7)),
                        longitude: Number(lng.toFixed(7)),
                        coordinates: coordinates,
                        address: shortAddress // 기본 주소도 address 필드에 저장
                    };

                    const response = await fetch(`${API_CONFIG.BASE_URL}/api/farm`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(farmData)
                    });
                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || '농장 정보 저장에 실패했습니다.');
                    }

                    await fetchFarms();
                    setRegion({
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    });
                    Alert.alert('성공', '농장이 등록되었습니다. (기본 주소 사용)');
                } catch (retryError) {
                    Alert.alert('오류', '농장 정보 저장에 실패했습니다.');
                }
            } else {
                Alert.alert('오류', error.message || '농장 정보 저장에 실패했습니다.');
            }
        } finally {
            setIsDrawingMode(false);
            setDrawnPath([]);
            setModifyingAreaId(null);
        }
    };

    const handleAreaPress = (areaId) => {
        const area = farmAreas.find(a => a.id === areaId);
        if (!area) return;
        setFarmActionModal({ visible: true, area });
    };

    const handleModifyAreaStart = (areaId) => {
        const areaToModify = farmAreas.find(a => a.id === areaId);
        if (!areaToModify) return;

        setModifyingAreaId(areaId);
        setIsDrawingMode(true);
        setDrawnPath([]);
        console.log('Start Modifying Area (cleared path):', areaId);
        Alert.alert("수정 시작", "지도를 드래그하여 영역을 새로 그리세요.");
    };

    const handleDeleteArea = async (areaId) => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/farm/${areaId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '농장 삭제에 실패했습니다.');
            }

            // 성공적으로 삭제되면 상태 업데이트
            setFarmAreas(prev => prev.filter(area => area.id !== areaId));

            // 작물(마커 등)도 즉시 상태에서 제거 (farm_id가 crop에 있다면)
            setManagedCrops(prev => prev.filter(crop => crop.farm_id !== areaId));
            // 만약 crop에 farm_id가 없다면 아래 fetchCrops를 사용하세요.
            // await fetchCrops();

            Alert.alert('성공', '농장이 삭제되었습니다.');
        } catch (error) {
            console.error('농장 삭제 중 오류:', error);
            Alert.alert('오류', error.message || '농장 삭제에 실패했습니다.');
        }
    };

    const handleShovelPress = () => {
        if (!isDrawingMode) {
            Alert.alert("영역 설정", "농장 토지영역을 설정하시겠습니까? 지도를 드래그하여 영역을 그리세요.",
                [
                    { text: "취소", style: "cancel" },
                    {
                        text: "예", onPress: () => {
                            setIsDrawingMode(true);
                            setDrawnPath([]);
                            setModifyingAreaId(null);
                            console.log('Drawing Mode Activated (Create)');
                        }
                    }
                ]
            );
        } else {
            const title = modifyingAreaId ? "수정 종료" : "그리기 종료";
            const message = modifyingAreaId ? "영역 수정을 완료하시겠습니까?" : "영역 그리기를 완료하시겠습니까?";
            Alert.alert(title, message,
                [
                    { text: modifyingAreaId ? "계속 수정" : "계속 그리기", style: "cancel" },
                    {
                        text: "취소", onPress: () => {
                            setIsDrawingMode(false);
                            setDrawnPath([]);
                            setModifyingAreaId(null);
                            console.log('Drawing/Modifying Cancelled');
                        }, style: "destructive"
                    },
                    {
                        text: "완료", onPress: async () => {
                            if (drawnPath.length < 3) {
                                Alert.alert("오류", "영역을 형성하려면 최소 3개 이상의 점을 그려야 합니다.");
                                return;
                            }

                            if (modifyingAreaId) {
                                // 수정 모드일 때는 업데이트 API 호출
                                try {
                                    // 중심 좌표 계산
                                    const lat = drawnPath.reduce((sum, c) => sum + c.latitude, 0) / drawnPath.length;
                                    const lng = drawnPath.reduce((sum, c) => sum + c.longitude, 0) / drawnPath.length;

                                    // 주소 가져오기
                                    let shortAddress = '';
                                    try {
                                        const geocodeResponse = await Geocoder.from(lat, lng);
                                        if (geocodeResponse.results && geocodeResponse.results.length > 0) {
                                            const formattedAddress = geocodeResponse.results[0]?.formatted_address || '';
                                            shortAddress = formattedAddress.split(' ').slice(1).join(' ');
                                        }
                                    } catch (error) {
                                        console.error('Geocoder 오류:', error);
                                        shortAddress = `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`;
                                    }

                                    // 업데이트 요청
                                    const response = await fetch(`${API_CONFIG.BASE_URL}/api/farm/${modifyingAreaId}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            latitude: Number(lat.toFixed(7)),
                                            longitude: Number(lng.toFixed(7)),
                                            coordinates: drawnPath,
                                            address: shortAddress
                                        })
                                    });

                                    if (!response.ok) {
                                        throw new Error('농장 정보 업데이트에 실패했습니다.');
                                    }

                                    // 성공 시 상태 업데이트
                                    setFarmAreas(prev => prev.map(area =>
                                        area.id === modifyingAreaId
                                            ? {
                                                ...area,
                                                coordinates: drawnPath,
                                                address: shortAddress
                                            }
                                            : area
                                    ));

                                    Alert.alert('성공', '농장 영역이 수정되었습니다.');
                                } catch (error) {
                                    console.error('농장 수정 중 오류:', error);
                                    Alert.alert('오류', error.message || '농장 수정에 실패했습니다.');
                                }
                            } else {
                                // 새로 그리기 모드일 때는 기존 로직 실행
                                promptForAreaName(drawnPath);
                            }

                            // 공통 정리 작업
                            setIsDrawingMode(false);
                            setDrawnPath([]);
                            setModifyingAreaId(null);
                        }
                    }
                ]
            );
        }
    };

    const handleQrScanPress = () => {
        router.push('Map/qrscan');
    };

    const handleWeatherPress = () => console.log('날씨 버튼 클릭됨');

    const handleSearch = async () => {
        if (!searchQuery) return;
        try {
            const response = await Geocoder.from(searchQuery);
            if (response.results.length > 0) {
                const location = response.results[0].geometry.location;
                const newRegion = {
                    latitude: location.lat,
                    longitude: location.lng,
                    latitudeDelta: region?.latitudeDelta || 0.01,
                    longitudeDelta: region?.longitudeDelta || 0.01,
                };
                setRegion(newRegion);
            } else {
                Alert.alert("검색 실패", "해당 주소를 찾을 수 없습니다.");
            }
        } catch (error) {
            console.error('Error during geocoding search:', error);
            Alert.alert("검색 오류", "주소 검색 중 오류가 발생했습니다.");
        }
    };

    // 작물 추가 모드 활성화 및 초기 주소 로드
    const activateAddCropMode = () => {
        setIsAddingCropMode(true);
        // 현재 region 정보로 즉시 주소 가져오기 시작
        if (region) {
            fetchCenterAddress(region.latitude, region.longitude);
        }
    };

    // 주소 영역 터치 핸들러 (작물 추가 모드일 때만 동작)
    const handleAddCropPress = () => {
        if (isDrawingMode || !isAddingCropMode) return; // 그리기 모드 또는 작물 추가 모드가 아닐 때는 동작 안 함

        Alert.alert(
            "작물 추가",
            "☘️ 현재 위치에 관리 작물을 추가하시겠습니까?",
            [
                { text: "아니요", style: "cancel" },
                { text: "예", onPress: () => promptForCropName() }
            ]
        );
    };

    // 작물 이름 입력 받기
    const promptForCropName = (cropId = null, currentName = '') => {
        const isModifying = cropId !== null;
        const title = isModifying ? '작물 이름 수정' : '작물 이름 설정';
        const message = '관리할 작물의 이름을 입력하세요:';
        const defaultName = isModifying ? currentName : '';

        const saveCropWithName = (name) => {
            if (!name) {
                Alert.alert("오류", "작물 이름은 비워둘 수 없습니다.");
                return;
            }
            if (isModifying) {
                // 이름 수정 로직
                setManagedCrops(prevCrops =>
                    prevCrops.map(crop =>
                        crop.id === cropId ? { ...crop, name: name } : crop
                    )
                );
                console.log('Crop Name Modified:', { id: cropId, name });
            } else {
                // 새 작물 추가 로직
                saveCrop(name);
            }
        };

        if (Platform.OS === 'ios') {
            Alert.prompt(title, message,
                [
                    { text: '취소', style: 'cancel' },
                    { text: '저장', onPress: saveCropWithName },
                ],
                'plain-text',
                defaultName
            );
        } else {
            // Android: Alert.prompt 미지원 -> 임시 이름 사용 또는 커스텀 모달 필요
            // 우선 간단하게 임시 이름으로 저장하고 수정 유도
            if (isModifying) {
                // Android 이름 수정은 Alert.prompt 대안 필요 (여기서는 간단히 로그만 남김)
                Alert.alert("알림 (Android)", "이름 수정 기능은 커스텀 구현이 필요합니다.");
                console.log("Android - Attempted to modify name for crop:", cropId);

            } else {
                const tempName = `작물 ${managedCrops.length + 1}`;
                Alert.alert(
                    "알림 (Android)",
                    `이름 입력 기능은 커스텀 모달 구현이 필요합니다. 임시 이름 "${tempName}"으로 저장합니다. '이름 수정' 메뉴를 이용해 변경해주세요.`,
                    [{ text: "확인", onPress: () => saveCrop(tempName) }]
                );
            }
        }
    };

    // 작물 정보 저장
    const saveCrop = (name) => {
        const newCrop = {
            id: Date.now(), // 간단한 고유 ID 생성
            name: name,
            latitude: region.latitude,
            longitude: region.longitude,
        };
        setManagedCrops(prevCrops => [...prevCrops, newCrop]);
        Alert.alert("저장 완료", `"${name}" 작물이 현재 위치에 추가되었습니다.`);
    };

    // 작물 핀 터치 핸들러
    const handleCropPress = (crop) => {
        console.log('handleCropPress crop:', JSON.stringify(crop, null, 2));
        const selected = {
            ...crop,
            cropId: crop.crop_id || crop.cropId || crop.id,
            farmId: crop.farm_id || crop.farmId || params.farmId,
            farmName: crop.farm_name || crop.farmName || params.farmName,
            detailId: crop.detail_id || crop.cropdetail_id || crop.id,
            cropdetail_id: crop.cropdetail_id || crop.detail_id || crop.id,
            latitude: crop.latitude,
            longitude: crop.longitude
        };
        console.log('handleCropPress selected:', JSON.stringify(selected, null, 2));
        setSelectedCrop(selected);
        setShowCropActionModal(true);
    };

    // 위치 수정 진입
    const startModifyCropLocation = (crop) => {
        console.log('startModifyCropLocation crop:', JSON.stringify(crop, null, 2));
        if (!crop || !crop.cropdetail_id) {
            console.error('상세작물 cropdetail_id 없음:', JSON.stringify(crop, null, 2));
            return;
        }
        setIsModifyingLocation(true);
        setModifyingTarget(crop.cropdetail_id);
        setModifyingLocation({ 
            latitude: Number(crop.latitude), 
            longitude: Number(crop.longitude) 
        });
        // 현재 위치로 지도 이동
        setRegion({
            latitude: Number(crop.latitude),
            longitude: Number(crop.longitude),
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
        });
        setShowCropActionModal(false);
    };

    // 위치 수정 저장 함수
    const handleSaveModifiedLocation = async () => {
        if (!modifyingTarget) {
            console.error('modifyingTarget이 없습니다.');
            return;
        }

        console.log('위치 수정 시도:', {
            target: modifyingTarget,
            newLocation: {
                latitude: region.latitude,
                longitude: region.longitude
            }
        });

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/location/${modifyingTarget}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    latitude: region.latitude,
                    longitude: region.longitude
                }),
            });

            console.log('서버 응답:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('위치 수정 실패:', errorData);
                throw new Error(errorData.error || '위치 수정에 실패했습니다.');
            }

            const result = await response.json();
            console.log('위치 수정 성공:', result);

            // UI 즉시 업데이트
            setManagedCrops(prevCrops => 
                prevCrops.map(crop => 
                    crop.cropdetail_id === modifyingTarget
                        ? {
                            ...crop,
                            latitude: region.latitude,
                            longitude: region.longitude
                        }
                        : crop
                )
            );

            setModifySuccessModalVisible(true);
            setIsModifyingLocation(false);
            setModifyingTarget(null);
            setModifyingLocation(null);
            
            // 작물 목록 새로고침
            await fetchCrops();
        } catch (e) {
            console.error('위치 수정 중 오류 발생:', e);
            Alert.alert('오류', e.message || '위치 수정에 실패했습니다.');
        }
    };

    // GPS 위치 권한 요청 및 위치 추적 설정
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLocationError('위치 권한이 거부되었습니다.');
                    return;
                }

                // 현재 위치 가져오기
                const location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;

                setUserLocation({
                    latitude,
                    longitude,
                });

                // 지도를 현재 위치로 이동
                setRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });

                // 실시간 위치 업데이트 구독
                const locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 5000,
                        distanceInterval: 10,
                    },
                    (newLocation) => {
                        const { latitude, longitude } = newLocation.coords;
                        setUserLocation({
                            latitude,
                            longitude,
                        });
                    }
                );

                return () => {
                    if (locationSubscription) {
                        locationSubscription.remove();
                    }
                };
            } catch (error) {
                setLocationError('위치를 가져오는데 실패했습니다.');
                console.error('Location error:', error);
            }
        })();
    }, []);

    // 현재 위치로 이동하는 함수
    const moveToCurrentLocation = async () => {
        if (userLocation) {
            setRegion({
                ...userLocation,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        }
    };

    useEffect(() => {
        if (route.params?.farmAddress) {
            console.log('전달받은 농장 주소:', route.params.farmAddress);
            // 주소로 검색
            const searchAddress = async () => {
                try {
                    console.log('Geocoder 검색 시작:', route.params.farmAddress);
                    const response = await Geocoder.from(route.params.farmAddress);
                    console.log('Geocoder 응답:', response);

                    if (response.results.length > 0) {
                        const location = response.results[0].geometry.location;
                        console.log('검색된 위치:', location);

                        const region = {
                            latitude: location.lat,
                            longitude: location.lng,
                            latitudeDelta: 0.002,
                            longitudeDelta: 0.002,
                        };
                        console.log('설정할 region:', region);

                        setInitialRegion(region);
                        setRegion(region);
                        console.log('농장 위치로 이동 완료:', response.results[0].formatted_address);

                        // 지도 이동 완료 후 작물 추가 모드 활성화
                        setTimeout(() => {
                            activateAddCropMode();  // activateAddCropMode 함수 호출
                        }, 1000);
                    } else {
                        console.log('검색 결과 없음');
                        Alert.alert('오류', '농장 주소를 찾을 수 없습니다.');
                    }
                } catch (error) {
                    console.error('주소 검색 실패:', error);
                    Alert.alert('오류', '농장 주소를 찾을 수 없습니다.');
                }
            };
            searchAddress();
        }
    }, [route.params]);

    // 위치 저장 버튼 클릭 시 region의 중심 좌표를 저장
    const handleSaveCropDetail = async () => {
        const latitude = region.latitude;
        const longitude = region.longitude;
        setSaving(true);
        try {
            // params에서 직접 crop_id 받아오기
            const crop_id = params.cropId;
            if (!crop_id) {
                alert('작물 정보를 찾을 수 없습니다.');
                setSaving(false);
                return;
            }

            // cropdetail 저장
            const saveRes = await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    crop_id,
                    detail_name: params.name,
                    detail_qr_code: params.qrValue,
                    detail_image_url: params.image,
                    latitude,
                    longitude,
                })
            });
            if (!saveRes.ok) {
                alert('작물 위치 저장에 실패했습니다.');
                setSaving(false);
                return;
            }
            // 저장 성공 시 성공 모달 표시
            setCreateSuccessModalVisible(true);
            setSaving(false);
            return;
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (params.isAddingCropMode) {
            setIsAddingCropMode(true);
            if (region) {
                fetchCenterAddress(region.latitude, region.longitude);
            }
        }
    }, [params.isAddingCropMode]);

    // farmAddress가 있으면 주소로 지도 이동
    useEffect(() => {
        if (params.farmAddress) {
            (async () => {
                try {
                    const response = await Geocoder.from(params.farmAddress);
                    if (response.results.length > 0) {
                        const location = response.results[0].geometry.location;
                        setRegion({
                            latitude: location.lat,
                            longitude: location.lng,
                            latitudeDelta: 0.002,
                            longitudeDelta: 0.002,
                        });
                    }
                } catch (e) {
                    // 주소 검색 실패 시 무시
                }
            })();
        }
    }, [params.farmAddress]);

    // 마커 하이라이트 useEffect 수정
    useEffect(() => {
        if (params.name && params.shouldHighlight) {
            setHighlightedName(params.name);
            const timer = setTimeout(() => {
                setHighlightedName(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [params.name, params.shouldHighlight]);

    // region prop과 state(region) 완전 동기화, params.latitude/longitude가 명확히 준비된 경우에만 setRegion, 중복 setRegion 방지
    useEffect(() => {
        if (
            params.latitude !== undefined && params.longitude !== undefined &&
            params.latitude !== null && params.longitude !== null &&
            !isNaN(Number(params.latitude)) && !isNaN(Number(params.longitude))
        ) {
            const newRegion = {
                latitude: Number(params.latitude),
                longitude: Number(params.longitude),
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
            };
            if (
                region.latitude !== newRegion.latitude ||
                region.longitude !== newRegion.longitude ||
                region.latitudeDelta !== newRegion.latitudeDelta ||
                region.longitudeDelta !== newRegion.longitudeDelta
            ) {
                setTimeout(() => {
                    setRegion(newRegion);
                }, 500); // 0.5초 딜레이 후 확대 이동
            }
        }
    }, [params.latitude, params.longitude]);

    // 마커 배경색 하이라이트 로직 (지도 이동 후 0.5초 뒤 3초간)
    useEffect(() => {
        if (params.detailId) {
            if (highlightDelayRef.current) clearTimeout(highlightDelayRef.current);
            if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
            highlightDelayRef.current = setTimeout(() => {
                setHighlightedId(params.detailId);
                highlightTimerRef.current = setTimeout(() => {
                    setHighlightedId(null);
                }, 3000);
            }, 500);
        }
        return () => {
            if (highlightDelayRef.current) clearTimeout(highlightDelayRef.current);
            if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        };
    }, [params.detailId]);

    const handleManagePress = () => {
        if (!selectedCrop) {
            Alert.alert('오류', '작물 정보가 없습니다. 마커를 다시 선택해 주세요.');
            return;
        }
        console.log('관리 버튼 selectedCrop:', selectedCrop);
        const navigationParams = {
            detailId: (selectedCrop && (selectedCrop.detailId || selectedCrop.detail_id || selectedCrop.id)) || params.detailId,
            name: (selectedCrop && selectedCrop.name) || params.name,
            image: (selectedCrop && selectedCrop.image) || params.image,
            cropId: (selectedCrop && selectedCrop.cropId) || params.cropId,
            phone: params.phone,
            farmId: (selectedCrop && selectedCrop.farmId) || params.farmId,
            farmName: (selectedCrop && selectedCrop.farmName) || params.farmName,
            userData: params.userData,
            region: params.region,
            introduction: params.introduction,
        };
        if (selectedCrop && selectedCrop.memo && Array.isArray(selectedCrop.memo) && selectedCrop.memo.length > 0) {
            navigationParams.memo = JSON.stringify(selectedCrop.memo);
        }
        console.log('관리 버튼 navigationParams:', navigationParams);
        router.push({
            pathname: '/Memo/cropdetailmemopage',
            params: navigationParams
        });
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                region={region}
                initialRegion={initialRegion}
                scrollEnabled={!isDrawingMode}
                zoomEnabled={true}
                onRegionChangeStart={handleRegionChangeStart}
                onRegionChangeComplete={handleRegionChangeComplete}
                onPanDrag={handlePanDrag}
                onTouchStart={handleMapTouchStart}
                onTouchEnd={handleMapTouchEnd}
            >
                {userLocation && (
                    <Marker
                        coordinate={userLocation}
                        title="현재 위치"
                        pinColor="blue"
                        opacity={isAddingCropMode ? 0.5 : 1}
                    />
                )}
                {drawnPath.length > 0 && (
                    <Polyline
                        coordinates={drawnPath}
                        strokeColor="green"
                        strokeWidth={4}
                    />
                )}

                {/* 농장 영역(Polygon) 표시 */}
                {loadingFarms ? null : farmAreas
                    .filter(area => area.id !== modifyingAreaId)
                    .map((area, index) => (
                        <React.Fragment key={`farm-area-${area.id}-${index}`}>
                            <Polygon
                                coordinates={area.coordinates}
                                strokeColor="green"
                                strokeWidth={3}
                                fillColor="rgba(0, 255, 0, 0.1)"
                                tappable={true}
                                onPress={() => {
                                    router.push({
                                        pathname: 'Memo/farmedit',
                                        params: {
                                            farmName: area.name,
                                            userData: route.params?.userData,
                                            phone: route.params?.phone,
                                            name: route.params?.name,
                                            region: route.params?.region,
                                            introduction: route.params?.introduction
                                        }
                                    });
                                }}
                            />
                            {area.coordinates.length > 0 && (
                                <Marker
                                    key={`farm-marker-${area.id}-${index}`}
                                    coordinate={area.coordinates[0]}
                                    anchor={{ x: 0.5, y: 1 }}
                                    onPress={() => handleAreaPress(area.id)}
                                >
                                    <View style={styles.areaNameContainer}>
                                        <Text style={styles.areaNameText}>{area.name}</Text>
                                    </View>
                                </Marker>
                            )}
                        </React.Fragment>
                    ))}

                {/* 관리 작물 핀 표시 */}
                {loadingCrops ? null : managedCrops.map((crop, index) => {
                    // 위치 수정 모드에서 수정 대상 마커(빨간색 핑 포함)는 숨김
                    if (isModifyingLocation && crop.id === modifyingTarget) return null;
                    // 이름이 같으면 하이라이트 (2초간만)
                    const isHighlighted = crop.name && highlightedName && crop.name === highlightedName;
                    return (
                        <Marker
                            key={`managed-crop-${crop.id}-${index}`}
                            coordinate={{ latitude: crop.latitude, longitude: crop.longitude }}
                            onPress={() => handleCropPress(crop)}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={{
                                borderWidth: 2,
                                borderColor: '#22C55E',
                                borderRadius: 25,
                                padding: 4,
                                backgroundColor: isHighlighted ? '#FFA726' : '#fff',
                                shadowColor: '#22C55E',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.5,
                                shadowRadius: 5,
                                elevation: 5
                            }}>
                                <Image source={require('../../assets/planticon2.png')} style={{ width: 30, height: 30 }} />
                            </View>
                        </Marker>
                    );
                })}

                {/* 전달받은 작물 정보 마커 표시 */}
                {route.params?.showMarker && (
                    <Marker
                        key={`route-crop-${route.params.markerName}-${Date.now()}`}
                        coordinate={{
                            latitude: Number(route.params.latitude),
                            longitude: Number(route.params.longitude)
                        }}
                        title={route.params.markerTitle}
                        description={route.params.markerDescription}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <Text style={styles.cropMarker}>{route.params.markerEmoji}</Text>
                    </Marker>
                )}

                {isDrawingMode && drawnPath.length > 0 && (
                    <Polyline
                        coordinates={drawnPath}
                        strokeColor={modifyingAreaId ? "orange" : "rgba(0, 255, 0, 0.8)"}
                        strokeWidth={4}
                    />
                )}

                {/* 위치 수정 모드일 때 memoplus와 동일한 UI */}
                {isModifyingLocation && (
                    <>
                        {/* 중앙 조준점 */}
                        <Animated.View style={[styles.centerPinContainer, pinAnimatedStyle]} pointerEvents="none">
                            <Text style={styles.centerPinEmoji}>📍</Text>
                        </Animated.View>

                        {/* 하단 주소+버튼 박스 */}
                        <View style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 32,
                            alignItems: 'center',
                            zIndex: 99,
                        }}>
                            <View style={{
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                borderRadius: 18,
                                paddingHorizontal: 18,
                                paddingVertical: 12,
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.15,
                                shadowRadius: 8,
                                elevation: 8,
                                flexDirection: 'column',
                                minWidth: 220,
                                bottom: 40,
                            }}>
                                <Text style={{ fontSize: 15, color: '#222', marginBottom: 0 }}>
                                    {centerAddress || "주소 정보를 불러오는 중..."}
                                </Text>

                            </View>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#22CC6B',
                                    borderRadius: 20,
                                    paddingVertical: 12,
                                    paddingHorizontal: 20,
                                    alignItems: 'center',
                                    minWidth: 120,
                                    elevation: 2,
                                    bottom: 3,
                                }}
                                onPress={handleSaveModifiedLocation}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>위치 저장</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </MapView>

            <View style={styles.searchContainer}>
                <TouchableOpacity style={styles.searchIcon} disabled={isDrawingMode} onPress={handleSearch}>
                    <Text>🔍</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="주소 검색"
                    editable={!isDrawingMode}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
                <TouchableOpacity style={[styles.shovelButton, isDrawingMode && styles.shovelButtonActive]} onPress={handleShovelPress}>
                    <Image
                        source={require('../../assets/shovelicon.png')}
                        style={styles.shovelIcon}
                    />
                </TouchableOpacity>
            </View>

            {/* 하단 서랍 메뉴 (레이아웃 및 애니메이션 수정) */}
            {!isDrawingMode && (
                <Animated.View style={[
                    styles.drawerContainer, // 새로운 서랍 컨테이너 스타일
                    { transform: [{ translateX: drawerTranslateX }], opacity: menuOpacity }
                ]}>
                    {/* 서랍 핸들 (화살표 버튼) */}
                    <TouchableOpacity style={styles.drawerHandle} onPress={toggleMenu}>
                        <Text style={styles.arrowIcon}>{isMenuOpen ? '▶' : '◀'}</Text>
                    </TouchableOpacity>

                    {/* 메뉴 버튼들 */}
                    <TouchableOpacity style={styles.menuButton} onPress={handleQrScanPress}>
                        <Text style={styles.menuButtonText}>QR스캔</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuButton} onPress={handleWeatherPress}>
                        <Text style={styles.menuButtonText}>날씨</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* 중앙 고정 핀 (작물 추가 모드일 때만 표시) */}
            {!isDrawingMode && isAddingCropMode && (
                <Animated.View style={[styles.centerPinContainer, pinAnimatedStyle]} pointerEvents="none">
                    <Text style={styles.centerPinEmoji}>📍</Text>
                </Animated.View>
            )}

            {/* 하단 버튼 또는 주소 표시 (작물 추가 모드에 따라 분기) */}
            {!isDrawingMode && (
                <>
                    {isAddingCropMode ? (
                        // 작물 추가 모드: 주소 표시 영역과 표시하기 버튼
                        <View style={styles.addCropModeContainer}>
                            <View style={styles.centerAddressContainer}>
                                {isFetchingAddress ? (
                                    <ActivityIndicator size="small" color="#0000ff" />
                                ) : (
                                    <Text style={styles.centerAddressText} numberOfLines={1} ellipsizeMode="tail">
                                        {centerAddress || "주소 정보를 불러오는 중..."}
                                    </Text>
                                )}
                            </View>
                            {/* 표시하기 버튼 추가 */}
                            <TouchableOpacity
                                style={styles.showLocationButton}
                                onPress={handleSaveCropDetail}
                                disabled={saving}
                            >
                                <Text style={styles.showLocationButtonText}>위치 저장</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </>
            )}

            {/* 농장 목록 버튼 (팝오버 활성화 시 X 아이콘으로 변경) */}
            <TouchableOpacity
                style={styles.locationButton}
                onPress={() => setIsFarmModalVisible(v => !v)}
            >
                <Image
                    source={
                        isFarmModalVisible
                            ? require('../../assets/Xicon.png') // X 아이콘
                            : locationIcon // 원래 농장 아이콘
                    }
                    style={
                        isFarmModalVisible
                            ? { width: 48, height: 48, } // X 아이콘만 별도 스타일
                            : { width: 28, height: 28 }
                    }
                />
            </TouchableOpacity>

            {/* 버튼 위에 뜨는 작은 사각형 팝오버 */}
            {isFarmModalVisible && (
                <TouchableOpacity
                    style={styles.farmPopoverOverlay}
                    activeOpacity={1}
                    onPress={() => setIsFarmModalVisible(false)}
                >
                    <View style={styles.farmPopover}>
                        <View style={styles.farmPopoverHeader}>
                            <Text style={styles.farmPopoverTitle}>내 농장 목록</Text>
                        </View>
                        <ScrollView style={{ maxHeight: 180 }}>
                            {farmAreas.length === 0 ? (
                                <Text style={styles.noFarmText}>등록된 농장이 없습니다.</Text>
                            ) : (
                                farmAreas.map(farm => (
                                    <TouchableOpacity
                                        key={farm.id}
                                        style={styles.farmItem}
                                        onPress={() => {
                                            if (farm.coordinates && farm.coordinates.length > 0) {
                                                setRegion({
                                                    latitude: farm.coordinates[0].latitude,
                                                    longitude: farm.coordinates[0].longitude,
                                                    latitudeDelta: 0.005,
                                                    longitudeDelta: 0.005,
                                                });
                                            }
                                            setIsFarmModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.farmName}>{farm.name}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            )}

            {locationError && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{locationError}</Text>
                </View>
            )}

            <Modal
                visible={showCropActionModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCropActionModal(false)}
            >
                {selectedCrop && selectedCrop.name ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', minWidth: 240 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 18 }}>
                                {`작물: ${selectedCrop.name}`}
                            </Text>
                            <View style={{ width: '100%' }}>
                                <TouchableOpacity onPress={handleManagePress} style={{ paddingVertical: 12, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 16 }}>관리</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setShowCropActionModal(false); startModifyCropLocation(selectedCrop); }} style={{ paddingVertical: 12, alignItems: 'center' }}><Text style={{ fontSize: 16 }}>위치 수정</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowCropActionModal(false)} style={{ paddingVertical: 12, alignItems: 'center' }}><Text style={{ fontSize: 16 }}>취소</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : null}
            </Modal>

            <Modal
                visible={createSuccessModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCreateSuccessModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', minWidth: 240 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 18 }}>상세작물 생성 완료</Text>
                        <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>상세작물이 성공적으로 생성되었습니다.</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setCreateSuccessModalVisible(false);
                                router.push({
                                    pathname: '/Memo/memolist',
                                    params: {
                                        userData: params.userData,
                                        phone: params.phone,
                                        name: params.name,
                                        region: params.region,
                                        introduction: params.introduction,
                                        farmId: params.farmId,
                                        farmName: params.farmName,
                                        cropId: params.cropId,
                                        detailId: params.detailId,
                                    }
                                });
                            }}
                            style={{ backgroundColor: '#22CC6B', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24 }}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>확인</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={farmActionModal.visible}
                transparent
                animationType="fade"
                onRequestClose={() => setFarmActionModal({ visible: false, area: null })}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', minWidth: 240 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 18 }}>
                            {farmActionModal.area ? `농장: ${farmActionModal.area.name}` : ''}
                        </Text>
                        <View style={{ width: '100%' }}>
                            <TouchableOpacity
                                onPress={() => {
                                    setFarmActionModal({ visible: false, area: null });
                                    handleDeleteArea(farmActionModal.area.id);
                                }}
                                style={{ paddingVertical: 12, alignItems: 'center' }}
                            >
                                <Text style={{ fontSize: 16, color: '#EF4444' }}>삭제</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setFarmActionModal({ visible: false, area: null });
                                    handleModifyAreaStart(farmActionModal.area.id);
                                }}
                                style={{ paddingVertical: 12, alignItems: 'center' }}
                            >
                                <Text style={{ fontSize: 16 }}>토지 수정</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setFarmActionModal({ visible: false, area: null })}
                                style={{ paddingVertical: 12, alignItems: 'center' }}
                            >
                                <Text style={{ fontSize: 16 }}>취소</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <BottomTabNavigator
                currentTab="내 농장"
                onTabPress={(tab) => {
                    if (tab === '질문하기') {
                        router.push({
                            pathname: '/Chatbot/questionpage', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
                    } else if (tab === '홈') {
                        router.push({
                            pathname: '/Homepage/Home/homepage', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
                    }
                    else if (tab === '정보') {
                        router.push({
                            pathname: '/FarmInfo/farminfo', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
                        // 필요시 다른 탭도 추가
                    }
                    else if (tab === '장터') {
                        router.push({
                            pathname: '/Market/market', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
                    }
                    else if (tab === '내 농장') {
                        router.push({
                            pathname: '/Map/Map', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
                    }
                }
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99,
    },
    map: {
        flex: 1,
    },
    searchContainer: {
        position: 'absolute',
        top: 61,
        left: 8,
        right: 8,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 25,
        paddingHorizontal: 10,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        height: 50,
        zIndex: 10,
    },
    searchIcon: {
        padding: 5,
    },
    searchInput: {
        flex: 1,
        marginLeft: 5,
        fontSize: 16,
        height: '100%',
    },
    shovelButton: {
        backgroundColor: 'white',
        borderRadius: 15,
        marginLeft: 5,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'black',
    },
    shovelButtonActive: {
        backgroundColor: '#68FF68',
    },
    shovelIcon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    drawerContainer: {
        position: 'absolute',
        bottom: 130,
        right: -140, // Adjust as needed based on content width
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2ECC71',
        height: 60,
        // borderRadius: 30, // Remove global rounding
        borderTopLeftRadius: 30, // Round only the left side
        borderBottomLeftRadius: 30,
        borderTopRightRadius: 0, // Explicitly set right corners to square
        borderBottomRightRadius: 0,
        paddingLeft: 0,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: -1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        zIndex: 10,
    },
    drawerHandle: {
        width: 60,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        // Remove border radius from handle, it inherits from container
        // borderTopLeftRadius: 30,
        // borderBottomLeftRadius: 30,
    },
    arrowIcon: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
    },
    menuButton: {
        paddingHorizontal: 15,
        height: '100%',
        justifyContent: 'center',
    },
    menuButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    areaNameContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        borderColor: '#2ECC71',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    areaNameText: {
        color: '#2ECC71',
        fontWeight: 'bold',
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // --- 중앙 핀 스타일 --- (centerPinView 제거, centerPinEmoji 추가)
    centerPinContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99,
    },
    centerPinEmoji: {
        fontSize: 40,
        transform: [{ translateY: -20 }]
    },
    // --------------------

    // --- 중앙 주소 표시 스타일 --- (위치 변경, zIndex 조정)
    centerAddressTouchable: {
        position: 'absolute',
        bottom: 70,
        alignSelf: 'center',
        zIndex: 6,
    },
    centerAddressContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 15,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        minWidth: 200,
        alignItems: 'center',
        marginBottom: 20
    },
    centerAddressText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    cropMarker: {
        fontSize: 30,
    },
    // cropNameContainer: {
    //     backgroundColor: 'rgba(0, 0, 0, 0.6)',
    //     paddingHorizontal: 5,
    //     paddingVertical: 2,
    //     borderRadius: 5,
    //     marginTop: 25,
    // },
    // cropNameText: {
    //     color: 'white',
    //     fontSize: 10,
    // },
    addCropModeContainer: {
        position: 'absolute',
        bottom: 143,
        alignSelf: 'center',
        zIndex: 6,
        width: '100%',
        alignItems: 'center',
    },
    showLocationButton: {
        backgroundColor: '#2ECC71',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        marginTop: 10,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    showLocationButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    locationButton: {
        position: 'absolute',
        bottom: 138,
        left: 16,
        backgroundColor: '#2ECC71',
        borderRadius: 30,
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    locationIcon: {
        fontSize: 20,
        color: '#fff'
    },
    errorContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        padding: 10,
        borderRadius: 5,
    },
    errorText: {
        color: 'white',
        textAlign: 'center',
    },
    cropCountContainer: {
        backgroundColor: '#2ECC71',
        borderRadius: 15,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 2,
        borderColor: 'white',
    },
    cropCountText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    farmPopoverOverlay: {
        position: 'absolute',
        left: 16,
        bottom: 200, // 버튼 위에 뜨도록 조정
        zIndex: 100,
        width: 240,
        alignItems: 'flex-start',
    },
    farmPopover: {
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 12,
        width: 220,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
    },
    farmPopoverHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    farmPopoverTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    farmPopoverClose: {
        fontSize: 18,
        color: '#888',
        paddingHorizontal: 4,
    },
    farmItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    farmName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    farmAddress: {
        fontSize: 14,
        color: '#666',
    },
    noFarmText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
        padding: 20,
    },
});

export default Map;