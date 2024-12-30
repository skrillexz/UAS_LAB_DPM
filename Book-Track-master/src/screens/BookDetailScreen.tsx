import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';

// Tipe data untuk buku
interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  totalPages: number;
}

// Tipe navigasi untuk BookDetailScreen
type RootStackParamList = {
  BookDetail: { book: Book }; // Mendefinisikan parameter book di dalam route.params
};

const API_URL = 'https://backendbooktrack-production.up.railway.app/api/books'; // URL API untuk buku

const BookDetailScreen = () => {
  // Mengambil parameter route dan menambahkan tipe untuk route.params
  const route = useRoute<RouteProp<RootStackParamList, 'BookDetail'>>(); 
  const navigation = useNavigation();
  
  const book: Book = route.params?.book;  // Mengakses data book dari route params

  const [bookDetails, setBookDetails] = useState<Book | null>(null);
  const [updatedBook, setUpdatedBook] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
    totalPages: '',
  });

  useEffect(() => {
    if (book) {
      setBookDetails(book);
      setUpdatedBook({
        title: book.title,
        author: book.author,
        genre: book.genre,
        description: book.description,
        // Pastikan totalPages memiliki nilai sebelum diubah menjadi string
        totalPages: book.totalPages ? book.totalPages.toString() : '', 
      });
    }
  }, [book]);

  const handleUpdateBook = async () => {
    if (!updatedBook.title || !updatedBook.author || !updatedBook.totalPages) {
      Alert.alert('Error', 'Title, Author, and Total Pages are required');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to update a book');
        return;
      }

      const response = await axios.put(`${API_URL}/${book._id}`, updatedBook, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Book updated successfully');
        navigation.goBack(); // Kembali ke layar sebelumnya setelah update
      } else {
        Alert.alert('Error', 'Failed to update book');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error updating book:', error.message);
        Alert.alert('Error', `Failed to update book: ${error.message}`);
      } else {
        console.error('Unknown error:', error);
        Alert.alert('Error', 'An unknown error occurred');
      }
    }
  };

  // Fungsi untuk menghapus buku
  const handleDeleteBook = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to delete a book');
        return;
      }

      // Mengirim permintaan DELETE ke server
      const response = await axios.delete(`${API_URL}/${book._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Book deleted successfully');
        navigation.goBack(); // Kembali ke halaman sebelumnya setelah buku dihapus
      } else {
        Alert.alert('Error', 'Failed to delete book');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error deleting book:', error.message);
        Alert.alert('Error', `Failed to delete book: ${error.message}`);
      } else {
        console.error('Unknown error:', error);
        Alert.alert('Error', 'An unknown error occurred');
      }
    }
  };

  if (!bookDetails) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        value={updatedBook.title}
        onChangeText={(text) => setUpdatedBook({ ...updatedBook, title: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Author"
        value={updatedBook.author}
        onChangeText={(text) => setUpdatedBook({ ...updatedBook, author: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Genre"
        value={updatedBook.genre}
        onChangeText={(text) => setUpdatedBook({ ...updatedBook, genre: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={updatedBook.description}
        onChangeText={(text) => setUpdatedBook({ ...updatedBook, description: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Total Pages"
        value={updatedBook.totalPages}
        onChangeText={(text) => setUpdatedBook({ ...updatedBook, totalPages: text })}
        keyboardType="numeric"
      />

      <Button title="Update Book" onPress={handleUpdateBook} />
      <Button title="Delete Book" color="red" onPress={handleDeleteBook} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
});

export default BookDetailScreen;
