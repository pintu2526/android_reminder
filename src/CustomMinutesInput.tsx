import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { parseMinutes } from './minutes';

type Props = {
  onStart: (minutes: number) => void;
};

export default function CustomMinutesInput({ onStart }: Props) {
  const [text, setText] = useState('');
  const minutes = parseMinutes(text);

  function submit() {
    if (minutes === null) return;
    onStart(minutes);
    setText('');
  }

  return (
    <View style={styles.row}>
      <TextInput
        value={text}
        onChangeText={setText}
        onSubmitEditing={submit}
        keyboardType="number-pad"
        placeholder="Custom minutes"
        style={styles.input}
      />
      <Pressable
        onPress={submit}
        disabled={minutes === null}
        style={[styles.button, minutes === null && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>Start</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c4c7d0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#e8eaf0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 18 },
});
