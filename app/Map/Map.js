import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, StyleSheet, Image, Alert, Platform, ActivityIndicator, Keyboard } from 'react-native';
import MapView, { Polygon, Polyline, Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import debounce from 'lodash.debounce';
import * as Location from 'expo-location';

// Geocoder 초기화 (API 키 확인)
Geocoder.init('AIzaSyB7uysOUsyE_d6xdLLJx7YxC-Ux7giVNdc'); // 여기에 실제 API 키를 넣어주세요

const locationIcon = '📍';  // 이미지 대신 이모지 사용

const Map = () => {
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

    // --- 지도 중앙 주소 관련 상태 ---
    // const [initialLocationFetched, setInitialLocationFetched] = useState(false);
    // ------------------------------

    // --- 지도 중앙 주소 가져오기 함수 ---
    const fetchCenterAddress = async (latitude, longitude) => {
        if (isDrawingMode) return; // 그리기 모드에서는 주소 가져오지 않음
        console.log('[fetchCenterAddress] Fetching address for:', latitude, longitude); // 로그 추가
        setIsFetchingAddress(true);
        try {
            const response = await Geocoder.from(latitude, longitude);
            console.log('[fetchCenterAddress] Geocoder response:', response.status); // 로그 추가
            // 여러 주소 형식 중 적절한 것 선택 (예: 도로명 또는 지번)
            const formattedAddress = response.results[0]?.formatted_address || '주소를 찾을 수 없습니다.';
             // 너무 길면 잘라서 표시 (선택적)
            const shortAddress = formattedAddress.split(' ').slice(1).join(' ');
            setCenterAddress(shortAddress || formattedAddress);
        } catch (error) {
            console.error('[fetchCenterAddress] Error fetching center address:', error); // 상세 오류 로그
            setCenterAddress('주소 로딩 실패'); // 오류 시 메시지 표시
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
        console.log('handleRegionChangeStart - isAddingCropMode:', isAddingCropMode); // 상태 로그 추가
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
        console.log('handleRegionChangeComplete - isAddingCropMode:', isAddingCropMode); // 상태 로그 추가
        if (!isAddingCropMode && !isMapMoving) return; // 상태 확인 추가 (불필요할 수 있음)

        setIsMapMoving(false);
        pinAnimation.stopAnimation();
        Animated.timing(pinAnimation, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true, // 네이티브 드라이버 사용으로 복원
        }).start();

        // isDrawingMode가 아니고, isAddingCropMode일 때만 주소 가져오기
        if (!isDrawingMode && isAddingCropMode) { // 조건 확인: isAddingCropMode 확실히 체크
            setRegion(newRegion);
            debouncedFetchCenterAddress(newRegion.latitude, newRegion.longitude);
        }
        // 작물 추가 모드가 아닐 때도 region은 업데이트 (선택 사항)
        else if (!isDrawingMode) {
             setRegion(newRegion);
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

    // --- 컴포넌트 마운트 시 초기 작업 ---
    useEffect(() => {
        // 컴포넌트 언마운트 시 debounce 취소만 수행
        return () => {
            debouncedFetchCenterAddress.cancel();
        };
    }, []); // 의존성 배열 비움
    // -----------------------------------------------------------

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

    const promptForAreaName = (areaId = null, currentCoordinates) => {
        const isModifying = areaId !== null;
        const currentArea = isModifying ? farmAreas.find(a => a.id === areaId) : null;
        const title = isModifying ? '농장 이름 수정' : '농장 이름 설정';
        const message = '농장의 이름을 입력하세요:';
        const defaultName = isModifying ? currentArea?.name : '';

        const saveArea = (name) => {
            if (!name) {
                Alert.alert("오류", "농장 이름은 비워둘 수 없습니다.");
                setIsDrawingMode(true);
                return;
            }
            if (isModifying) {
                setFarmAreas(prevAreas =>
                    prevAreas.map(area =>
                        area.id === areaId ? { ...area, name: name, coordinates: currentCoordinates } : area
                    )
                );
                console.log('Area Modified:', { id: areaId, name, coordinates: currentCoordinates });
            } else {
                const newAreaId = Date.now();
                const newArea = { id: newAreaId, name: name, coordinates: currentCoordinates };
                setFarmAreas(prevAreas => [...prevAreas, newArea]);
                console.log('New Area Saved:', newArea);
            }
            setIsDrawingMode(false);
            setDrawnPath([]);
            setModifyingAreaId(null);
        };

        if (Platform.OS === 'ios') {
            Alert.prompt(title, message,
                [
                    { text: '취소', style: 'cancel', onPress: () => {
                        console.log('Name input cancelled');
                     } },
                    { text: '확인', onPress: (name) => saveArea(name) },
                ],
                'plain-text',
                defaultName
            );
        } else {
            const tempName = isModifying ? `${currentArea?.name} (수정됨)` : `임시 농장 ${farmAreas.length + 1}`;
            Alert.alert(
                "알림 (Android)",
                `이름 입력 기능은 커스텀 모달 구현이 필요합니다. 임시 이름 "${tempName}"으로 저장합니다.`,
                [{ text: "확인", onPress: () => saveArea(tempName) }]
            );
        }
    };

    const handleAreaPress = (areaId) => {
        const area = farmAreas.find(a => a.id === areaId);
        if (!area) return;
        Alert.alert(`농장: ${area.name}`, "작업을 선택하세요.",
            [
                { text: "취소", style: "cancel" },
                { text: "삭제", onPress: () => handleDeleteArea(areaId), style: "destructive" },
                { text: "토지 수정", onPress: () => handleModifyAreaStart(areaId) },
            ]
        );
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

    const handleDeleteArea = (areaId) => {
        setFarmAreas(prevAreas => prevAreas.filter(area => area.id !== areaId));
        console.log('Area Deleted:', areaId);
    };

    const handleShovelPress = () => {
        if (!isDrawingMode) {
            Alert.alert("영역 설정", "농장 토지영역을 설정하시겠습니까? 지도를 드래그하여 영역을 그리세요.",
                [
                    { text: "취소", style: "cancel" },
                    { text: "예", onPress: () => {
                        setIsDrawingMode(true);
                        setDrawnPath([]);
                        setModifyingAreaId(null);
                        console.log('Drawing Mode Activated (Create)');
                    } }
                ]
            );
        } else {
            const title = modifyingAreaId ? "수정 종료" : "그리기 종료";
            const message = modifyingAreaId ? "영역 수정을 완료하시겠습니까?" : "영역 그리기를 완료하시겠습니까?";
            Alert.alert(title, message,
                [
                    { text: modifyingAreaId ? "계속 수정" : "계속 그리기", style: "cancel" },
                    { text: "취소", onPress: () => {
                        setIsDrawingMode(false);
                        setDrawnPath([]);
                        setModifyingAreaId(null);
                        console.log('Drawing/Modifying Cancelled');
                     }, style: "destructive" },
                    { text: "완료", onPress: () => {
                        if (drawnPath.length < 3) {
                            Alert.alert("오류", "영역을 형성하려면 최소 3개 이상의 점을 그려야 합니다.");
                            return;
                        }
                        promptForAreaName(modifyingAreaId, [...drawnPath]);
                     } }
                ]
            );
        }
    };

    const handleQrScanPress = () => console.log('QR 스캔 버튼 클릭됨');
    const handleWeatherPress = () => console.log('날씨 버튼 클릭됨');

    const handleSearch = async () => {
        if (!searchQuery) return;
        console.log('Searching for:', searchQuery);
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
                if (mapRef.current) {
                    mapRef.current.animateToRegion(newRegion, 1000);
                }
                console.log('Search successful, moving to:', newRegion);
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
         console.log('New Crop Saved:', newCrop);
         Alert.alert("저장 완료", `"${name}" 작물이 현재 위치에 추가되었습니다.`);
     };

    // 작물 핀 터치 핸들러
    const handleCropPress = (crop) => {
         Alert.alert(
             `작물: ${crop.name}`,
             "작업을 선택하세요.",
             [
                 { text: "취소", style: "cancel" },
                 { text: "관리", onPress: () => manageCrop(crop.id), style: "default" },
                 { text: "위치 수정", onPress: () => startModifyCropLocation(crop.id), style: "default" },
                 { text: "이름 수정", onPress: () => promptForCropName(crop.id, crop.name), style: "default" },
                 { text: "삭제", onPress: () => deleteCrop(crop.id), style: "destructive" },
             ]
         );
     };

     // 작물 관리 (임시)
     const manageCrop = (cropId) => {
         console.log("Manage Crop:", cropId);
         Alert.alert("관리", "작물 관리 기능은 아직 구현되지 않았습니다.");
     };

     // 작물 위치 수정 시작 (임시)
     const startModifyCropLocation = (cropId) => {
         console.log("Start Modify Crop Location:", cropId);
         Alert.alert("위치 수정", "작물 위치 수정 기능은 아직 구현되지 않았습니다.");
         // TODO: 위치 수정 모드 구현 필요
     };

     // 작물 삭제
     const deleteCrop = (cropId) => {
        Alert.alert(
            "작물 삭제",
            "정말로 이 작물을 삭제하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    onPress: () => {
                        setManagedCrops(prevCrops => prevCrops.filter(crop => crop.id !== cropId));
                        console.log('Crop Deleted:', cropId);
                    },
                    style: "destructive"
                },
            ]
        );
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
            mapRef.current?.animateToRegion({
                ...userLocation,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }, 1000);
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                region={region}
                scrollEnabled={!isDrawingMode}
                zoomEnabled={!isDrawingMode}
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

                {farmAreas
                    .filter(area => area.id !== modifyingAreaId)
                    .map((area) => (
                        <React.Fragment key={area.id}>
                            <Polygon
                                coordinates={area.coordinates}
                                strokeColor="green"
                                strokeWidth={3}
                                fillColor="rgba(0, 255, 0, 0.1)"
                            />
                            {area.coordinates.length > 0 && (
                                 <Marker
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

                {isDrawingMode && drawnPath.length > 0 && (
                    <Polyline
                        coordinates={drawnPath}
                        strokeColor={modifyingAreaId ? "orange" : "rgba(0, 255, 0, 0.8)"}
                        strokeWidth={4}
                    />
                )}

                {/* 관리 작물 핀 표시 */}
                {managedCrops.map((crop) => (
                    <Marker
                        key={crop.id}
                        coordinate={{ latitude: crop.latitude, longitude: crop.longitude }}
                        onPress={() => handleCropPress(crop)}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <Text style={styles.cropMarker}>☘️</Text>
                    </Marker>
                ))}
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
                        source={require('../../assets/shovel_icon.png')}
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
                    {!isAddingCropMode ? (
                        // 초기 상태: 작물 추가 버튼 (Animated.View 추가 및 스타일 수정)
                        <Animated.View style={[
                            styles.addCropButtonContainer, // 기본 위치 스타일 (bottom: 40)
                            { transform: [{ translateY: addButtonOffsetY }] } // Y축 오프셋 애니메이션 적용
                        ]}>
                            <TouchableOpacity onPress={activateAddCropMode}>
                                <View style={styles.addCropButton}>
                                    <Text style={styles.addCropButtonText}>여기를 눌러 작물을 추가해보세요!</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ) : (
                        // 작물 추가 모드: 주소 표시 영역 (위치 조정 필요시 addButtonOffsetY 적용 가능)
                        <TouchableOpacity style={styles.centerAddressTouchable} onPress={handleAddCropPress}>
                            {/* 현재는 주소 영역 위치 고정 */}
                            <View style={styles.centerAddressContainer}>
                                {isFetchingAddress ? (
                                    <ActivityIndicator size="small" color="#0000ff" />
                                ) : (
                                    <Text style={styles.centerAddressText} numberOfLines={1} ellipsizeMode="tail">
                                        {centerAddress || "주소 정보를 불러오는 중..."}
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                </>
            )}

            {/* 현재 위치 버튼 */}
            <TouchableOpacity
                style={styles.locationButton}
                onPress={moveToCurrentLocation}
            >
                <Text style={styles.locationIcon}>{locationIcon}</Text>
            </TouchableOpacity>

            {locationError && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{locationError}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    searchContainer: {
        position: 'absolute',
        top: 50,
        left: 15,
        right: 15,
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
        backgroundColor: '#eee',
        borderRadius: 15,
        marginLeft: 5,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shovelButtonActive: {
        backgroundColor: 'green',
    },
    shovelIcon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    drawerContainer: {
        position: 'absolute',
        bottom: 30,
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
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        borderColor: 'green',
        borderWidth: 1,
    },
    areaNameText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 12,
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
         bottom: 110,
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
    addCropButtonContainer: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        zIndex: 6,
    },
    addCropButton: {
        backgroundColor: '#2ECC71',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    addCropButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    locationButton: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        backgroundColor: '#2196F3',
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
});

export default Map;