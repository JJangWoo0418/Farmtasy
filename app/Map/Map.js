import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, StyleSheet, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import MapView, { Polygon, Polyline, Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import debounce from 'lodash.debounce';

// Geocoder 초기화 (API 키 확인)
Geocoder.init('AIzaSyB7uysOUsyE_d6xdLLJx7YxC-Ux7giVNdc'); // 여기에 실제 API 키를 넣어주세요

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

    // 지도 움직임 시작 시 핀 애니메이션
    const handleRegionChangeStart = () => {
        setIsMapMoving(true);
        Animated.spring(pinAnimation, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    // 지도 움직임 종료 시 핀 애니메이션
    const handleRegionChangeComplete = (newRegion) => {
        setIsMapMoving(false);
        Animated.spring(pinAnimation, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
        
        if (!isDrawingMode) {
            setRegion(newRegion);
            debouncedFetchCenterAddress(newRegion.latitude, newRegion.longitude);
        }
    };

    // 핀 애니메이션 스타일
    const pinAnimatedStyle = {
        transform: [
            {
                translateY: pinAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -15]
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

    // --- 컴포넌트 마운트 시 첫 주소 가져오기 (초기 region 기반) ---
    useEffect(() => {
        if (region) { // region이 설정되면 초기 주소 로드
            fetchCenterAddress(region.latitude, region.longitude);
        }
        // 컴포넌트 언마운트 시 debounce 취소
        return () => {
            debouncedFetchCenterAddress.cancel();
        };
    }, []); // 마운트 시 한 번만 (region 초기값 기준)
    // -----------------------------------------------------------

    const toggleMenu = () => {
        const toValue = isMenuOpen ? 0 : 1;
        Animated.timing(animation, {
            toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setIsMenuOpen(!isMenuOpen);
    };

    const arrowRotate = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const menuTranslateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [100, 0],
    });

    const menuOpacity = animation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });

    const handlePanDrag = (e) => {
        if (isDrawingMode && isDragging.current) {
            const coordinate = e.nativeEvent.coordinate;
            setDrawnPath(prevPath => [...prevPath, coordinate]);
        }
    };

    const handleMapTouchStart = () => {
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
                    <Text style={isDrawingMode ? styles.shovelButtonTextActive : {}}>
                        {isDrawingMode ? '완료/취소' : '삽'}
                     </Text>
                </TouchableOpacity>
            </View>

            {!isDrawingMode && (
                <View style={styles.bottomContainer}>
                    <Animated.View style={[
                        styles.buttonContainer,
                        { transform: [{ translateY: menuTranslateY }], opacity: menuOpacity }
                    ]}>
                        <TouchableOpacity style={styles.menuButton} onPress={handleQrScanPress}>
                            <Text style={styles.menuButtonText}>QR스캔</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuButton} onPress={handleWeatherPress}>
                            <Text style={styles.menuButtonText}>날씨</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity style={styles.toggleButton} onPress={toggleMenu}>
                        <Animated.View style={{ transform: [{ rotate: arrowRotate }] }}>
                            <Text style={styles.arrowIcon}>▼</Text>
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            )}

            {/* 중앙 핀 애니메이션 적용 */}
            {!isDrawingMode && (
                <Animated.View style={[styles.centerPinContainer, pinAnimatedStyle]} pointerEvents="none">
                    <Text style={styles.centerPinEmoji}>📍</Text>
                </Animated.View>
            )}

            {/* --- 지도 중앙 주소 표시 --- */}
            {!isDrawingMode && (
                 <View style={styles.centerAddressContainer}>
                     {isFetchingAddress ? (
                         <ActivityIndicator size="small" color="#0000ff" />
                     ) : (
                         <Text style={styles.centerAddressText}>{centerAddress}</Text>
                     )}
                 </View>
            )}
             {/* ------------------------ */}
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
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#eee',
        borderRadius: 15,
        marginLeft: 5,
        minWidth: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shovelButtonActive: {
        backgroundColor: 'green',
    },
    shovelButtonTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        alignItems: 'flex-end',
        zIndex: 5,
    },
    toggleButton: {
        backgroundColor: '#2ECC71',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    arrowIcon: {
        fontSize: 24,
        color: 'white',
    },
    buttonContainer: {
       flexDirection: 'row',
       marginBottom: 15,
       backgroundColor: '#2ECC71',
       borderRadius: 25,
       paddingVertical: 10,
       paddingHorizontal: 15,
       elevation: 3,
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 1 },
       shadowOpacity: 0.2,
       shadowRadius: 1,
    },
    menuButton: {
        marginHorizontal: 10,
        paddingVertical: 5,
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
    centerAddressContainer: {
        position: 'absolute',
        bottom: 110, // 하단 위치 조정 (하단 메뉴와 겹치지 않도록)
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
        elevation: 6, // 하단 메뉴(5)보다 높게
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        zIndex: 6, // 하단 메뉴(5)보다 높게
    },
    centerAddressText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    // --------------------------
});

export default Map;