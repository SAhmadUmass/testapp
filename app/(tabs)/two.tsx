import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { useCallback } from 'react';
import { Text, View } from '@/components/Themed';
import { useExtraContextStore } from '@/state/extraContextStore';
import { useFocusEffect } from 'expo-router';

export default function TabTwoScreen() {
  const { extraContext, setExtraContext } = useExtraContextStore();

  // Log when screen gains focus
  useFocusEffect(
    useCallback(() => {
      console.log('Tab 2 focused. Current extra context:', extraContext);
      if (!extraContext) {
        setExtraContext('');
        console.log('Extra context was empty, reset to empty string');
      }
    }, [extraContext])
  );

  const handleSave = () => {
    console.log('Saving extra context:', extraContext);
    Keyboard.dismiss();
    Alert.alert(
      "Context Saved",
      "Your additional context has been saved and will be used in future AI conversations.",
      [{ text: "OK" }]
    );
  };

  const handleContextChange = (newContext: string) => {
    console.log('Extra context changing to:', newContext);
    setExtraContext(newContext);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>AI Chat Settings</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Additional Context</Text>
            <TextInput
              style={styles.input}
              value={extraContext}
              onChangeText={handleContextChange}
              placeholder="Enter additional context for AI..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>
              This context will be included in all your AI chat conversations to provide extra information to the AI assistant.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Context</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    minHeight: 100,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
