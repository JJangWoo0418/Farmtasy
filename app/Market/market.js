import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import styles from '../Components/Css/Market/marketstyle';

const categories = [
{ label: '제초용품', icon: require('../../assets/weed.png') },
{ label: '농자재', icon: require('../../assets/tool.png') },
{ label: '농수산물', icon: require('../../assets/fruit.png') },
{ label: '생활잡화', icon: require('../../assets/life.png') },
{ label: '농기계', icon: require('../../assets/tractor.png') },
{ label: '비료/상토', icon: require('../../assets/fertilizer.png') },
{ label: '종자/모종', icon: require('../../assets/seed.png') },
{ label: '기타', icon: require('../../assets/etc.png') },
];

const Market = () => {
const [isFolded, setIsFolded] = useState(false);

return (
<View style={styles.container}>
    {/* 상단 검색창 */}
    <View style={styles.searchBarWrap}>
    <View style={styles.searchBar}>
        <Image source={require('../../assets/search.png')} style={styles.searchIcon} />
        <TextInput
        style={styles.searchInput}
        placeholder="지금 필요한 농자재 검색"
        placeholderTextColor="#BDBDBD"
        />
    </View>
    <TouchableOpacity>
        <Image source={require('../../assets/bellicon.png')} style={styles.bellIcon} />
    </TouchableOpacity>
    </View>

    {/* 카테고리 + 접기/펼치기 버튼 */}
    {!isFolded && (
    <>
        <View style={styles.categoryWrap}>
        {categories.map((cat, idx) => (
            <View key={idx} style={styles.categoryItem}>
            <Image source={cat.icon} style={styles.categoryIcon} />
            <Text style={styles.categoryLabel}>{cat.label}</Text>
            </View>
        ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
            <View style={styles.foldBtnHDivider} />
            <TouchableOpacity style={styles.foldBtn} onPress={() => setIsFolded(true)}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={require('../../assets/arrow_up.png')} style={{ width: 16, height: 16, marginRight: 2 }} />
                    <Text style={styles.foldBtnText}>접기</Text>
                </View>
            </TouchableOpacity>
            <View style={styles.foldBtnHDivider} />
        </View>
    </>
    )}
    {isFolded && (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
        <View style={styles.foldBtnHDivider} />
        <TouchableOpacity style={styles.foldBtn} onPress={() => setIsFolded(false)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../../assets/arrow_down.png')} style={{ width: 16, height: 16, marginRight: 2 }} />
                <Text style={styles.foldBtnText}>펼치기</Text>
            </View>
        </TouchableOpacity>
        <View style={styles.foldBtnHDivider} />
    </View>
    )}

    {/* 기간 한정 특가 */}
    <View style={styles.specialWrap}>
    <Text style={styles.specialTitle}>기간 한정 특가</Text>
    </View>
</View>
);
};

export default Market;