// writingpage.js
import React, {useState, useRef} from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import styles from '../Components/Css/Homepage/writingpagestyle';
import { useNavigation, useRoute } from '@react-navigation/native';

const WritingPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { category, icon } = route.params || {};
    const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(category || '자유주제');
    const [selectedIcon, setSelectedIcon] = useState(icon || require('../../assets/freetopic.png'));
    const sheetAnim = useRef(new Animated.Value(0)).current;

    const openSheet = () => {
        setCategoryModalVisible(true);
        Animated.timing(sheetAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const closeSheet = () => {
        Animated.timing(sheetAnim, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: false,
        }).start(() => {
            setCategoryModalVisible(false);
        });
    };

    const sheetTranslateY = sheetAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [300, 0],
    });

    return (
        <View style={styles.container}>
            {/* 어두운 배경 dim 처리 */}
            {isCategoryModalVisible && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={closeSheet}
                />
            )}

            {/* 바텀 시트 */}
            {isCategoryModalVisible && (
                <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: sheetTranslateY }] }]}
                >
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>카테고리 선택</Text>
                        <TouchableOpacity onPress={closeSheet}>
                            <Text style={styles.sheetClose}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sheetOptions}>
                        <TouchableOpacity
                            style={styles.sheetItem}
                            onPress={() => {
                                setSelectedCategory('농사질문');
                                setSelectedIcon(require('../../assets/farmingquestions2.png'));
                                closeSheet();
                            }}
                        >
                            <Image source={require('../../assets/FarmingQuestions.png')} style={styles.sheetIcon} />
                            <Text style={styles.sheetLabel}>농사질문</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sheetItem}
                            onPress={() => {
                                setSelectedCategory('농사공부');
                                setSelectedIcon(require('../../assets/studyfarming2.png'));
                                closeSheet();
                            }}
                        >
                            <Image source={require('../../assets/studyfarming.png')} style={styles.sheetIcon2} />
                            <Text style={styles.sheetLabel}>농사공부</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sheetItem}
                            onPress={() => {
                                setSelectedCategory('자유주제');
                                setSelectedIcon(require('../../assets/freetopic2.png'));
                                closeSheet();
                            }}
                        >
                            <Image source={require('../../assets/freetopic.png')} style={styles.sheetIcon} />
                            <Text style={styles.sheetLabel}>자유주제</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}

            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={require('../../assets/gobackicon.png')} />
                </TouchableOpacity>
                <Text style={styles.title}>글쓰기</Text>
            </View>

            {/* 주제 */}
            <View style={styles.topicBox}>
                <Image source={selectedIcon} style={styles.topicIcon} />
                <Text style={styles.topicText}>{selectedCategory}</Text>
                <TouchableOpacity style={styles.topicChangeBtn} onPress={openSheet}>
                    <Text style={styles.topicChangeText}>변경</Text>
                </TouchableOpacity>
            </View>

            {/* 제목 입력 */}
            <TextInput
                style={styles.titleInput}
                placeholder="제목을 입력해 주세요."
                placeholderTextColor="#999"
            />

            {/* 본문 입력 */}
            <TextInput
                style={styles.contentInput}
                placeholder={"글쓰기로 자유롭게 소통해보세요.\n고민, 농업 정보 무엇이든 나눌 수 있어요."}
                placeholderTextColor="#999"
                multiline
            />

            {/* 사진 업로드 */}
            <TouchableOpacity style={styles.uploadBtn}>
                <Image source={require('../../assets/cameraicon.png')} style={styles.cameraIcon} />
                <Text style={styles.uploadText}>사진 올리기</Text>
            </TouchableOpacity>

            {/* 등록 버튼 */}
            <TouchableOpacity style={styles.submitBtn}>
                <Text style={styles.submitText}>등록</Text>
            </TouchableOpacity>
        </View>
    );
};

export default WritingPage;