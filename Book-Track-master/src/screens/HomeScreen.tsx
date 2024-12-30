import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://backendbooktrack-production.up.railway.app/api/books'; // URL API untuk daftar buku

interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  totalPages: number;
}

interface ApiResponse {
  message: string;
  data: Book[];
}

const HomeScreen = ({ navigation }: any) => {
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
    totalPages: '',
  });

  const [books, setBooks] = useState<Book[]>([]); // State untuk menyimpan daftar buku
  const [loading, setLoading] = useState(false);

  // Function untuk fetch buku dari API
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to view books');
        return;
      }

      console.log('Authorization token:', token); // Log token untuk memastikan token ada

      const response: AxiosResponse<ApiResponse> = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Log response data untuk memeriksa format
      console.log('Response data:', response.data);

      // Cek apakah response.data.data memiliki format yang benar
      if (Array.isArray(response.data.data)) {
        setBooks(response.data.data); // Mengakses response.data.data untuk mendapatkan daftar buku
      } else {
        console.error('Data tidak sesuai dengan format yang diharapkan');
        Alert.alert('Error', 'Failed to load books: Invalid data format');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error response:', error.message);
        Alert.alert('Error', `Failed to fetch books: ${error.message}`);
      } else {
        console.error('Unknown error:', error);
        Alert.alert('Error', 'An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(); // Ambil buku ketika komponen pertama kali dimuat
  }, []);

  // Fungsi untuk menambahkan buku
  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.totalPages) {
      Alert.alert('Error', 'Title, Author, and Total Pages are required');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to add a book');
        return;
      }

      console.log('Authorization token for adding book:', token); // Log token saat menambahkan buku

      // Request POST untuk menambahkan buku
      const response = await axios.post(API_URL, {
        title: newBook.title,
        author: newBook.author,
        genre: newBook.genre,
        description: newBook.description,
        totalPages: newBook.totalPages,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`, // Menambahkan header Authorization dengan token
        },
      });

      // Menampilkan pesan sukses
      Alert.alert('Success', 'Book added successfully');
      setNewBook({ title: '', author: '', genre: '', description: '', totalPages: '' }); // Reset form

      // Ambil buku lagi untuk memperbarui daftar
      fetchBooks();

    } catch (error) {
      if (error instanceof Error) {
        console.error('Error response:', error.message);
        Alert.alert('Error', `Failed to add book: ${error.message}`);
      } else {
        console.error('Unknown error:', error);
        Alert.alert('Error', 'Failed to add book');
      }
    }
  };

  // Fungsi untuk menampilkan detail buku dengan navigasi ke halaman baru
  const handleSelectBook = (book: Book) => {
    navigation.navigate('BookDetail', { book }); // Navigasi ke BookDetail dan kirimkan data buku
  };

  // Render item buku
  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity style={styles.bookItem} onPress={() => handleSelectBook(item)}>
      <Text style={styles.bookTitle}>{item.title}</Text>
      <Text>{item.author}</Text>
      <Text>{item.genre}</Text>
      <Text>{item.totalPages} pages</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Book Tracking App!</Text>
      <Text style={styles.subtitle}>Manage your books and track your reading progress.</Text>

      {/* Form untuk menambahkan buku */}
      <View style={styles.addBookContainer}>
        <Text style={styles.formTitle}>Add New Book</Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={newBook.title}
          onChangeText={(text) => setNewBook({ ...newBook, title: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Author"
          value={newBook.author}
          onChangeText={(text) => setNewBook({ ...newBook, author: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Genre"
          value={newBook.genre}
          onChangeText={(text) => setNewBook({ ...newBook, genre: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={newBook.description}
          onChangeText={(text) => setNewBook({ ...newBook, description: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Total Pages"
          value={newBook.totalPages}
          onChangeText={(text) => setNewBook({ ...newBook, totalPages: text })}
          keyboardType="numeric"
        />
        <Button title="Add Book" onPress={handleAddBook} />
      </View>

      {/* Daftar buku */}
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id.toString()}
        style={styles.bookList}
        refreshing={loading}
        onRefresh={fetchBooks}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  addBookContainer: {
    marginTop: 30,
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
  bookList: {
    width: '100%',
    marginTop: 20,
  },
  bookItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
