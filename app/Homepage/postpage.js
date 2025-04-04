import React from 'react';
import { View, Text, TextInput, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import styles from '../Components/Css/Homepage/postpagestyle';
import { useNavigation } from '@react-navigation/native';

const PostPage = () => {
    const navigation = useNavigation();

    const posts = [
        {
            id: '1',
            user: '충북음성 이준호',
            time: '1시간 전',
            text: '이런 곳에 산다면.\n얼마나 좋을까.',
            image: require('../../assets/postimage1.png'),
            likes: 20,
            comments: 3,
            bookmarks: 5,
            profile: require('../../assets/leejunho.png'),
        },
        {
            id: '2',
            user: '충북음성 이준호',
            time: '5시간 전',
            text: '고양이가 제일 좋아요.',
            profile: require('../../assets/leejunho.png'),
        },
    ];

    const renderPost = ({ item }) => (
        <View style={styles.postBox}>
            <View style={styles.postHeader}>
                <Image source={item.profile} style={styles.profileImg} />
                <View>
                    <Text style={styles.username}>{item.user}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                    <Image source={require('../../assets/moreicon.png')} />
                </TouchableOpacity>
            </View>
            <Text style={styles.postText}>{item.text}</Text>
            {item.image && <Image source={item.image} style={styles.postImage} />}
            <View style={styles.iconRow}>
                <View style={styles.iconGroup}>
                    <Image source={require('../../assets/goodicon.png')} style={styles.icon} />
                    <Text style={styles.iconText}>{item.likes}</Text>
                </View>
                <View style={styles.iconGroup}>
                    <Image source={require('../../assets/commenticon.png')} style={styles.icon} />
                    <Text style={styles.iconText}>{item.comments}</Text>
                </View>
                <View style={styles.iconGroup}>
                    <Image source={require('../../assets/bookmarkicon.png')} style={styles.icon} />
                    <Text style={styles.iconText}>{item.bookmarks}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={require('../../assets/gobackicon.png')} />
                </TouchableOpacity>
                <Text style={styles.title}>게시글</Text>
            </View>

            {/* 카테고리 설명 */}
            <View style={styles.topicBox}>
                <Image source={require('../../assets/freetopic.png')} style={styles.topicIcon} />
                <View>
                    <Text style={styles.topicText}>화목한 농부들의 자유주제</Text>
                    <Text style={styles.topicSub}>다양한 주제로 소통해 보세요!</Text>
                </View>
            </View>

            {/* 검색창 */}
            <View style={styles.searchBox}>
                <Image source={require('../../assets/searchicon.png')} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="제목이나 키워드로 게시글을 찾아보세요!"
                    placeholderTextColor="#aaa"
                />
            </View>

            {/* 필터 탭 */}
            <View style={styles.filterRow}>
                <Text style={styles.filterText}>전체</Text>
                <Text style={styles.filterText}>인기순</Text>
                <Text style={styles.filterText}>최신순</Text>
                <Text style={styles.filterText}>오래된 순</Text>
            </View>

            {/* 게시글 리스트 */}
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* 글쓰기 버튼 */}
            <TouchableOpacity style={styles.writeButton}>
                <Text style={styles.writeButtonText}>글쓰기</Text>
                <Image source={require('../../assets/paperpencil.png')} style={styles.writeIcon} />
            </TouchableOpacity>
        </View>
    );
};

export default PostPage;