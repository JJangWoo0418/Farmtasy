import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import styles from '../Components/Css/Homepage/writingpagestyle';
import { useNavigation, useRoute } from '@react-navigation/native';

const WritingPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { category, icon } = route.params || {};

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={require('../../assets/gobackicon.png')} />
                </TouchableOpacity>
                <Text style={styles.title}>글쓰기</Text>
            </View>

            {/* 주제 */}
            <View style={styles.topicBox}>
                <Image source={icon || require('../../assets/freetopic.png')} style={styles.topicIcon} />
                <Text style={styles.topicText}>{category || '자유주제'}</Text>
                <TouchableOpacity style={styles.topicChangeBtn}>
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
