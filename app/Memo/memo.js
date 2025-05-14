import { useNavigation } from '@react-navigation/native';

const Map = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <MapView
                // ... 기존 props ...
            >
                {/* ... 기존 Marker, Polyline ... */}

                {farmAreas
                    .filter(area => area.id !== modifyingAreaId)
                    .map((area) => (
                        <React.Fragment key={area.id}>
                            <Polygon
                                coordinates={area.coordinates}
                                strokeColor="green"
                                strokeWidth={3}
                                fillColor="rgba(0, 255, 0, 0.1)"
                                tappable={true}
                                onPress={() => navigation.navigate('FarmEdit', { farmName: area.name })}
                            />
                            {area.coordinates.length > 0 && (
                                 <Marker
                                     coordinate={area.coordinates[0]}
                                     anchor={{ x: 0.5, y: 1 }}
                                     onPress={() => handleAreaPress(area.id)}
                                 >
                                     <View style={styles.areaNameContainer}>
                                         <Text style={styles.areaNameText}>{area.name}</Text>
                                     </View>
                                 </Marker>
                            )}
                        </React.Fragment>
                    ))}

                {/* ... 나머지 코드 ... */}
            </MapView>
            {/* ... 나머지 UI ... */}
        </View>
    );
};
