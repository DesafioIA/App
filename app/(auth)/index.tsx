import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function AuthHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a la App</Text>
      <Text style={styles.subtitle}>Por favor, inicia sesión o regístrate</Text>

      <View style={styles.linksContainer}>
        <Link href="/(auth)/login" style={styles.linkButton}>
          <Text style={styles.linkText}>Ir al Login</Text>
        </Link>
        <Link href="/(auth)/register" style={styles.linkButton}>
          <Text style={styles.linkText}>Ir al Registro</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#777',
    marginBottom: 40,
  },
  linksContainer: {
    width: '100%',
    alignItems: 'center',
  },
  linkButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginBottom: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
