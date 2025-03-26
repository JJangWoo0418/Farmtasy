import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getThreeWordAddress } from '../../api/w3w'; // W3W API 함수 임포트
import MapStyle from '../Components/Css/Map/mapstyle'; // 스타일 파일 임포트

const Map = () => {
    const [region, setRegion] = useState({
        latitude: 37.5665, // 초기 중심 좌표 (서울 시청)
        longitude: 126.9780,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [threeWordAddress, setThreeWordAddress] = useState('');

    // 지도 이동 시 3단어 주소 업데이트
    useEffect(() => {
        const fetchThreeWordAddress = async () => {
            try {
                const words = await getThreeWordAddress(region.latitude, region.longitude);
                if (words) {
                    setThreeWordAddress(words);
                }
            } catch (error) {
                console.error('Error fetching 3-word address:', error);
                setThreeWordAddress('주소를 가져오는 중 오류가 발생했습니다.');
            }
        };
        fetchThreeWordAddress();
    }, [region]);

    return (
        <View style={MapStyle.container}>
            <MapView
                style={MapStyle.map}
                region={region}
                onRegionChangeComplete={setRegion} // 지도 이동 완료 시 호출
            >
                <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
            </MapView>
            <View style={MapStyle.addressContainer}>
                <Text style={MapStyle.addressText}>3단어 주소: {threeWordAddress}</Text>
            </View>
        </View>
    );
};

export default Map;