import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from '../../Components/Css/Homepage/myfarmpagestyle';
import API_CONFIG from '../../DB/api';

const Myfarmpage = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const phone = params?.phone || params?.userData?.phone;
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFarms = async () => {
            setLoading(true);
            try {
                console.log('전달받은 파라미터:', params);
                console.log('사용할 전화번호:', phone);
                console.log('API URL:', `${API_CONFIG.BASE_URL}/api/farms/user/${phone}`);
                
                const response = await fetch(`${API_CONFIG.BASE_URL}/api/farms/user/${phone}`);
                console.log('API 응답 상태:', response.status);
                
                const data = await response.json();
                console.log('받은 농장 데이터:', data);
                
                if (data.farms && Array.isArray(data.farms)) {
                    console.log('농장 개수:', data.farms.length);
                    setFarms(data.farms);
                } else {
                    console.log('농장 데이터 형식이 올바르지 않음:', data);
                    setFarms([]);
                }
            } catch (e) {
                console.error('농장 데이터 조회 중 오류:', e);
                setFarms([]);
            } finally {
                setLoading(false);
            }
        };
        
        if (phone) {
            console.log('전화번호가 있어서 농장 데이터를 조회합니다.');
            fetchFarms();
        } else {
            console.log('전화번호가 없어서 농장 데이터를 조회하지 않습니다.');
            setLoading(false);
        }
    }, [phone]);

    const renderFarm = ({ item }) => (
        <TouchableOpacity 
            style={styles.farmCard}
            onPress={() => router.push({
                pathname: 'Homepage/farminfo',
                params: { farmId: item.id }
            })}
        >
            <Image
                source={item.farm_image ? { uri: item.farm_image } : require('../../../assets/deleteicon.png')}
                style={styles.farmImage}
            />
            <View style={styles.farmInfo}>
                <Text style={styles.farmName}>{item.farm_name}</Text>
                <View style={styles.locationContainer}>
                    <Image source={require('../../../assets/mapicon3.png')} style={styles.locationIcon} />
                    <Text style={styles.farmLocation}>{item.address}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    // 렌더링 직전 상태 확인
    console.log('렌더링 farms:', farms, '로딩:', loading);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Image source={require('../../../assets/gobackicon.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>내 농장</Text>
            </View>
            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#22CC6B" />
            ) : (
                <FlatList
                    data={Array.isArray(farms) ? farms : []}
                    renderItem={renderFarm}
                    keyExtractor={item => item.id?.toString()}
                    contentContainerStyle={styles.farmList}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>등록된 농장이 없습니다.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default Myfarmpage;