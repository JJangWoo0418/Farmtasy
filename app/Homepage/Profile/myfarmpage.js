import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../../Components/Css/Homepage/myfarmpagestyle';
import API_CONFIG from '../../DB/api';

const Myfarmpage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const phone = route.params?.phone;
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFarms = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/api/farms/user/${phone}`);
                const data = await response.json();
                setFarms(Array.isArray(data.farms) ? data.farms : []);
            } catch (e) {
                setFarms([]);
            } finally {
                setLoading(false);
            }
        };
        if (phone) fetchFarms();
    }, [phone]);

    const renderFarm = ({ item }) => (
        <View style={styles.farmCard}>
            <Image
                source={item.farm_image ? { uri: item.farm_image } : require('../../../assets/deleteicon.png')}
                style={styles.farmImage}
            />
            <View style={styles.farmInfo}>
                <Text style={styles.farmName}>{item.farm_name}</Text>
                <Text style={styles.farmLocation}>{item.region} {item.address}</Text>
                <Text style={styles.farmDesc}>{item.description || '설명이 없습니다.'}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={require('../../../assets/gobackicon.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>내 농장 지역</Text>
            </View>
            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#22CC6B" />
            ) : (
                <FlatList
                    data={farms}
                    renderItem={renderFarm}
                    keyExtractor={item => item.id?.toString()}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>등록된 농장이 없습니다.</Text>
                    }
                />
            )}
        </View>
    );
};

export default Myfarmpage;