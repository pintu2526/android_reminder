import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  onAdd: (label: string) => void;
  onClose: () => void;
};

export default function AddPresetModal({ visible, onAdd, onClose }: Props) {
  const [label, setLabel] = useState('');

  function close() {
    setLabel('');
    onClose();
  }

  function submit() {
    const trimmed = label.trim();
    if (trimmed === '') return;
    onAdd(trimmed);
    close();
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={close}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.title}>New preset</Text>
          <TextInput
            value={label}
            onChangeText={setLabel}
            onSubmitEditing={submit}
            placeholder="Timer name"
            autoFocus
            style={styles.input}
          />
          <View style={styles.actions}>
            <Pressable onPress={close} style={styles.button}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={submit} style={styles.button}>
              <Text style={styles.buttonText}>Add</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 16 },
  title: { fontSize: 20, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#c4c7d0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  button: {
    backgroundColor: '#e8eaf0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: { fontSize: 16 },
});
