import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getAuthToken } from '../utils/auth';

type RootStackParamList = {
    MainTabs: undefined;
    Login: undefined;
};

const SplashScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        const checkLoginSession = async () => {
            const token = await getAuthToken();
            if (token) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                });
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }
        };

        checkLoginSession();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text>Loading...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SplashScreen;