import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import { getAuthToken, removeAuthToken } from '../utils/auth';
import LoadingSpinner from "../components/LoadingSpinner";

// Tipe data User
interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

// Tipe data untuk respons profil
interface ProfileResponse {
  message: string;
  data: {
    _id: string;
    username: string;
    email: string;
    createdAt: string;
  };
}

const API_URL = 'https://backendbooktrack-production.up.railway.app'; // URL API backend

const ProfileScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    const loadUserProfile = async () => {
      const token = await getAuthToken();
      if (token) {
        try {
          const response = await axios.get<ProfileResponse>(`${API_URL}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Memastikan response.data sesuai dengan tipe ProfileResponse
          const profileData: ProfileResponse = response.data;

          if (profileData.data) {
            const userData: User = {
              id: profileData.data._id,  // Map _id menjadi id
              username: profileData.data.username,
              email: profileData.data.email,
              createdAt: profileData.data.createdAt,
            };

            setUser(userData);  // Set data user
            setUsername(userData.username);
            setEmail(userData.email);
          }
        } catch (error) {
          console.error('Gagal mengambil profil user:', error);
          setError('Gagal memuat profil');
        }
      }
      setLoading(false);
    };

    loadUserProfile();
  }, []);

  const handleUpdateProfile = async () => {
    const token = await getAuthToken();
    if (!token) {
      setError('Tidak ada token, harap login kembali.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.put<ProfileResponse>(
        `${API_URL}/api/profile`,
        { username, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedProfileData: ProfileResponse = response.data; // Asumsikan response menjadi ProfileResponse
      if (updatedProfileData.data) {
        const updatedUserData: User = {
          id: updatedProfileData.data._id,  // Map _id menjadi id
          username: updatedProfileData.data.username,
          email: updatedProfileData.data.email,
          createdAt: updatedProfileData.data.createdAt,
        };

        setUser(updatedUserData);  // Update state dengan data user yang baru
        setUsername(updatedUserData.username);
        setEmail(updatedUserData.email);
      }
    } catch (error) {
      console.error('Gagal memperbarui profil:', error);
      setError('Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      {user ? (
        <>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            style={styles.input}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            style={styles.input}
          />
          <Button title="Update Profile" onPress={handleUpdateProfile} />
        </>
      ) : (
        <Text>No user data available.</Text>
      )}
      <Button title="Logout" onPress={async () => {
        await removeAuthToken();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});

export default ProfileScreen;
