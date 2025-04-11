import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import styles from '../Components/Css/Utils/photouploadmodalstyle';

const PhotoUploadModal = ({ isVisible, onClose }) => {
    const uploadAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(uploadAnim, {
            toValue: isVisible ? 1 : 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [isVisible]);

    const uploadTranslateY = uploadAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [300, 0]
    });

    return (
        isVisible && (
            <>
                <TouchableOpacity style={styles.overlay} onPress={onClose} />
                <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: uploadTranslateY }] }]}
                >
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>사진 올리기 선택</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.sheetClose}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sheetOptions}>
                        <TouchableOpacity style={styles.sheetItem} onPress={() => console.log('사진 촬영')}>
                            <Image source={require('../../assets/cameraicon2.png')} style={styles.sheetIcon3} />
                            <Text style={styles.sheetLabel}>사진 촬영</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sheetItem} onPress={() => console.log('앨범 선택')}>
                            <Image source={require('../../assets/galleryicon.png')} style={styles.sheetIcon} />
                            <Text style={styles.sheetLabel}>앨범 선택</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </>
        )
    );
};

export default PhotoUploadModal;
