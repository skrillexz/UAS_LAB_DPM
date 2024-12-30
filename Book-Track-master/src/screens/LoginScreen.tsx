import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Portal, Dialog, Paragraph, Button as PaperButton } from "react-native-paper";
import Input from "../components/Input";
import Button from "../components/Button";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  MainTabs: undefined;
  Register: undefined;
};

const API_URL = 'https://backendbooktrack-production.up.railway.app'; // URL API backend

// Definisikan tipe untuk respons API login
interface LoginResponse {
  message: string;
  data: {
    token: string; // Token sebagai string dalam objek data
  };
}

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setDialogMessage("Please fill in all fields");
      setVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });

      const data = response.data as LoginResponse;

      if (data.data && data.data.token) {
        const token = data.data.token;  // Ambil token dari objek data
        
        // Simpan token sebagai string di AsyncStorage
        await AsyncStorage.setItem('auth_token', token);

        // Reset navigation dan arahkan ke MainTabs
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        setDialogMessage("Invalid login response");
        setVisible(true);
      }
    } catch (error: any) {
      if (error.response) {
        const errorMessage = error.response.data?.message || "Something went wrong";
        const errors = error.response.data?.errors;
        const passwordError = errors?.password;
        const usernameError = errors?.username;

        setDialogMessage(
          passwordError ? `${errorMessage}: ${passwordError}` :
          usernameError ? `${errorMessage}: ${usernameError}` :
          errorMessage
        );
      } else {
        setDialogMessage("Network error or server is unavailable");
      }
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Input
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={loading}
      />
      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Error</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{dialogMessage}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={() => setVisible(false)}>OK</PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  registerLink: {
    marginTop: 15,
    alignItems: "center",
  },
  registerText: {
    color: "#007AFF",
  },
});

export default LoginScreen;
