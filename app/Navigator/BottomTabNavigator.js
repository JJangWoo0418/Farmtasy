import React from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import styles from '../Components/Css/Navigator/BottomTabNavigatorstyle'

const BottomTabNavigator = ({ currentTab, onTabPress }) => {
    const tabs = [
        { key: '질문하기', icon: require('../../assets/chatboticon.png') },
        { key: '정보', icon: require('../../assets/infoicon.png') },
        { key: '홈', icon: require('../../assets/homeicon.png') },
        { key: '내 농장', icon: require('../../assets/mapicon.png') },
        { key: '장터', icon: require('../../assets/shopicon.png') },
    ];
    

    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = currentTab === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tabItem, isActive && styles.activeTab]}
                        onPress={() => onTabPress(tab.key)}
                    >
                        <Image source={tab.icon} style={styles.icon} resizeMode="contain" />
                        <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.key}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default BottomTabNavigator;
