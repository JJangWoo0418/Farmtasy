import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// 주요 키워드 목록 (볼드 처리할 키워드)
const BOLD_KEYWORDS = [
  '병명:', '증상:', '방제법:', '추천 약품:', '추천 비료:', '피해 심각도:', 
  '추천 조치 방법:', '증상 차이점:', '진단 근거 설명:', '이미지 평가:',
  '정확한 진단과 방제를 위해서는 반드시 전문가 상담이 필요합니다.'
];

// 정규표현식 특수문자 escape 함수
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\-]/g, '\\$&');
}

// 전체 텍스트에서 **텍스트** 패턴과 주요 키워드를 모두 찾아 볼드로 변환
function renderMarkdown(text) {
  if (!text) return null;

  // 줄 단위 주요 키워드 목록 (줄 시작 또는 * 뒤에 올 수 있음)
  const LINE_BOLD_KEYWORDS = [
    '병명:', '증상:', '방제법:', '추천 약품:', '추천 비료:', '주요 증상 차이점:', '약제 방제:', '주요 증상:', '증상 차이점:'
  ];

  // 줄 단위로 분리
  const lines = text.split('\n');
  let idx = 0;
  return lines.map((line) => {
    const trimmed = line.trim();
    // * 뒤에 주요 키워드가 오면 전체 줄 볼드처리
    for (const keyword of LINE_BOLD_KEYWORDS) {
      if (trimmed.startsWith(`* ${keyword}`) || trimmed.startsWith(keyword)) {
        return (
          <Text key={idx++} style={[styles.contentText, { fontWeight: 'bold', color: '#19c37d' }]}>{line}</Text>
        );
      }
    }
    // 그 외에는 **텍스트** 패턴만 볼드처리
    const regex = /\*\*(.+?)\*\*/g;
    const elements = [];
    let lastIndex = 0;
    let match;
    let subIdx = 0;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        elements.push(<Text key={subIdx++}>{line.slice(lastIndex, match.index)}</Text>);
      }
      elements.push(<Text key={subIdx++} style={{ fontWeight: 'bold', color: '#19c37d' }}>{match[1]}</Text>);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < line.length) {
      elements.push(<Text key={subIdx++}>{line.slice(lastIndex)}</Text>);
    }
    return <Text key={idx++} style={styles.contentText}>{elements}</Text>;
  });
}

// 텍스트 내 이미지 URL 추출 및 이미지로 변환
function renderTextWithImages(text) {
  if (!text) return null;
  // 이미지 URL 매칭 및 SafeImage 호출 부분 삭제
  // 오직 텍스트만 렌더링
  const lines = text.split('\n');
  let idx = 0;
  return lines.map((line) => (
    <Text key={idx++} style={styles.contentText}>{renderMarkdown(line)}</Text>
  ));
}

export default function PestDiagnosisResult() {
    const router = useRouter();
    const { result } = useLocalSearchParams();
    // parsedImages 등 이미지 관련 변수 전부 삭제

    // AI 응답을 섹션별로 분리 (번호로 시작하는 부분만 섹션으로 인식)
    const sections = result.split(/\n(?=\d+\))|^(?=\d+\))/gm).filter(section => section.trim());

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Image source={require('../../assets/gobackicon.png')} style={{ width: 23, height: 23, marginLeft: -5 }} />
                </TouchableOpacity>
                <Text style={styles.title}>AI 진단 결과</Text>
            </View>
            
            <ScrollView style={styles.content}>
                {sections.map((section, index) => {
                    // 섹션 제목 추출 (예: 1) 주요 병해 정보)
                    const titleMatch = section.match(/^\d+\)\s*(.*?)(?=\n|$)/);
                    let title = titleMatch ? titleMatch[1] : '';
                    let content = section;
                    // 본문에서만 번호+제목 라인 제거 (더 유연하게)
                    content = content.replace(/^\d+\)\s*.*(\r?\n|$)/, '');
                    // 전문가 상담 경고문 섹션은 제목 없이 본문만 표시
                    if (section.includes('정확한 진단과 방제를 위해서는 반드시 전문가 상담이 필요합니다.')) {
                      content = '정확한 진단과 방제를 위해서는 반드시 전문가 상담이 필요합니다.';
                    }
                    // 전문가 상담 경고문만 있는 섹션은 스타일만 다르게 표시
                    if (content.trim() === '정확한 진단과 방제를 위해서는 반드시 전문가 상담이 필요합니다.') {
                      return (
                        <View key={index} style={styles.section}>
                          <Text style={{ fontWeight: 'bold', color: '#e03131', fontSize: 16, textAlign: 'center', marginVertical: 8 }}>
                            정확한 진단과 방제를 위해서는 반드시 전문가 상담이 필요합니다.
                          </Text>
                        </View>
                      );
                    }
                    return (
                        <View key={index} style={styles.section}>
                            {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
                            <View style={styles.sectionContent}>
                                {renderTextWithImages(content)}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
        marginTop: -18,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 24,
        color: '#333',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 95,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#19c37d',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#19c37d',
        marginBottom: 12,
    },
    sectionContent: {
        gap: 8,
    },
    contentText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        marginBottom: 4,
    },
    imageContainer: {
        marginVertical: 8,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f1f3f5',
    },
    imageTitle: {
        fontSize: 14,
        color: '#666',
        padding: 8,
        backgroundColor: '#f8f9fa',
    },
    similarImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#f1f3f5',
    },
    imageErrorContainer: {
        padding: 16,
        backgroundColor: '#fff3f3',
        borderRadius: 8,
        marginVertical: 8,
    },
    imageErrorText: {
        color: '#e03131',
        fontSize: 14,
        marginBottom: 4,
    },
    imageErrorUrl: {
        color: '#868e96',
        fontSize: 12,
    },
    imageLoadingContainer: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageLoadingText: {
        color: '#666',
        fontSize: 14,
    },
    imagesGrid: {
        gap: 16,
    },
}); 