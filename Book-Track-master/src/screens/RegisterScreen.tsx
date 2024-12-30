import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { Portal, Dialog, Paragraph, Button as PaperButton } from 'react-native-paper';
import Button from '../components/Button'; // Sesuaikan path Button jika perlu
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

const API_URL = 'https://backendbooktrack-production.up.railway.app'; // URL API backend

// Tipe untuk respons API yang diterima (menggunakan generik)
interface RegisterResponse {
  message: string;
  errors?: object;
}

const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleRegister = async () => {
    // Validasi input
    if (!username || !password || !email) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    setLoading(true);
    try {
      // Log data yang dikirim untuk memastikan format yang benar
      console.log('Sending registration request with data:', {
        username,
        password,
        email,
      });

      // Menggunakan generik untuk memastikan tipe data yang diterima
      const response = await axios.post<RegisterResponse>(`${API_URL}/api/auth/register`, {
        username,
        password,
        email,
      });

      // Log respons untuk memeriksa apakah response benar
      console.log('Registration Response:', response);

      // Jika berhasil, tampilkan pesan sukses
      if (response.status === 201) {
        setDialogMessage(response.data.message || 'Registration successful!');
        setVisible(true);
      }

    } catch (error: any) {
      console.error('Failed to register:', error.response?.data || error.message);

      // Menangani error berdasarkan kode status respons
      if (error.response) {
        const { message, errors } = error.response.data;

        if (error.response.status === 400) {
          setDialogMessage(`Validation Error: ${message}`);
        } else if (error.response.status === 500) {
          setDialogMessage('Server Error. Please try again later.');
        } else if (error.response.status === 404) {
          setDialogMessage('Route not found. Please check the API URL or endpoint.');
        } else {
          setDialogMessage('Registration failed. Please check your inputs and try again.');
        }
      } else {
        setDialogMessage('Network error. Please check your connection.');
      }
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogDismiss = () => {
    setVisible(false);
    if (dialogMessage.includes('successful')) {
      navigation.navigate('Login'); // Mengarahkan ke layar Login setelah berhasil
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} disabled={loading} />
      <Portal>
        <Dialog visible={visible} onDismiss={handleDialogDismiss}>
          <Dialog.Title>{dialogMessage.includes('successful') ? 'Success' : 'Error'}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{dialogMessage}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={handleDialogDismiss}>OK</PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});

export default RegisterScreen;
