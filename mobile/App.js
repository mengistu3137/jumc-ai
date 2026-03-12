import { Text, View } from 'react-native';

export default function App() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}
    >
      <Text style={{ color: '#6288c6', fontSize: 20, fontWeight: '700' }}>
        JUMC AI Assistant
      </Text>
      <Text style={{ marginTop: 8, color: '#3f4f66' }}>
        STEP 1 scaffold ready
      </Text>
    </View>
  );
}
