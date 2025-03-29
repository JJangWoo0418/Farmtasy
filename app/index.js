import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Link href="/FarmInfo" asChild>
        <Button title="농장 정보 보기" />
    </Link>
    </View> 
    );
}