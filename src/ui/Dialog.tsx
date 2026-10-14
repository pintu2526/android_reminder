import { ReactNode } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { layout, shadow, useTheme } from './theme';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function Dialog({ visible, title, onClose, children }: Props) {
  const { colors } = useTheme();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.scrim }]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface },
              shadow(3),
            ]}
          >
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: colors.text }]}
            >
              {title}
            </Text>
            {children}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: layout.space.xl },
  card: {
    borderRadius: layout.radiusLarge,
    padding: layout.space.xl,
    gap: layout.space.l,
  },
  title: { fontSize: layout.font.title, fontWeight: '700' },
});
