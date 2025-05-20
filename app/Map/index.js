import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, StyleSheet, Image, Alert, Platform, ActivityIndicator, Keyboard} from 'react-native';
import MapView, { Polygon, Polyline, Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import debounce from 'lodash.debounce';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import BottomTabNavigator from '../Navigator/BottomTabNavigator';
import { BarCodeScanner } from 'expo-barcode-scanner';

// ... 나머지 코드는 동일 ... 