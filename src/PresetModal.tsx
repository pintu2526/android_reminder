import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { parseMinutes } from './minutes';
import { Preset } from './storage';
import Button from './ui/Button';
import Dialog from './ui/Dialog';
import { layout, useTheme } from './ui/theme';

export type PresetValues = { label: string; defaultMinutes?: number };

type Props = {
  visible: boolean;
  // Pass a preset to edit it, or leave it out to create a new one.
  preset?: Preset;
  onSave: (values: PresetValues) => void;
  onDelete: () => void;
  onClose: () => void;
};

export default function PresetModal({ visible, preset, ...rest }: Props) {
  return (
    <Dialog
      visible={visible}
      title={preset ? 'Edit preset' : 'New preset'}
      onClose={rest.onClose}
    >
      {/* Mounted only while open, so the fields start fresh each time. */}
      {visible && <PresetForm preset={preset} {...rest} />}
    </Dialog>
  );
}

function PresetForm({
  preset,
  onSave,
  onDelete,
  onClose,
}: Omit<Props, 'visible'>) {
  const { colors } = useTheme();
  const [label, setLabel] = useState(preset?.label ?? '');
  const [minutesText, setMinutesText] = useState(
    preset?.defaultMinutes?.toString() ?? '',
  );

  const hasMinutes = minutesText.trim() !== '';
  const minutes = hasMinutes ? parseMinutes(minutesText) : undefined;
  const minutesInvalid = minutes === null;
  const canSave = label.trim() !== '' && !minutesInvalid;

  const inputStyle = [
    styles.input,
    { color: colors.text, backgroundColor: colors.surfaceAlt },
  ];

  function submit() {
    if (!canSave) return;
    onSave({ label: label.trim(), defaultMinutes: minutes ?? undefined });
    onClose();
  }

  function remove() {
    onDelete();
    onClose();
  }

  return (
    <>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Timer name</Text>
        <TextInput
          value={label}
          onChangeText={setLabel}
          placeholder="For example: Tea"
          placeholderTextColor={colors.textMuted}
          autoFocus={!preset}
          style={inputStyle}
        />
      </View>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>
          Default time in minutes (optional)
        </Text>
        <TextInput
          value={minutesText}
          onChangeText={setMinutesText}
          onSubmitEditing={submit}
          keyboardType="number-pad"
          placeholder="For example: 6"
          placeholderTextColor={colors.textMuted}
          style={[
            inputStyle,
            minutesInvalid && {
              borderColor: colors.onDangerSoft,
              borderWidth: 2,
            },
          ]}
        />
        {minutesInvalid && (
          <Text style={[styles.error, { color: colors.onDangerSoft }]}>
            ⚠ Use a whole number from 1 to 1440.
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <Button label="Cancel" onPress={onClose} style={styles.action} />
        <Button
          label={preset ? 'Save' : 'Add'}
          variant="primary"
          onPress={submit}
          disabled={!canSave}
          style={styles.action}
        />
      </View>
      {preset && (
        <Button label="Delete preset" variant="danger" onPress={remove} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  field: { gap: layout.space.s },
  label: { fontSize: layout.font.body, fontWeight: '600' },
  input: {
    minHeight: 60,
    borderRadius: layout.radius,
    paddingHorizontal: layout.space.l,
    fontSize: layout.font.body,
  },
  error: { fontSize: layout.font.body },
  actions: { flexDirection: 'row', gap: layout.space.m },
  action: { flex: 1 },
});
