import { View, Text, StyleSheet } from 'react-native';
import { StatutDossier } from '../types/dossier.types';

const STATUTS_CONFIG: Record<string, { label: string; color: string; textColor: string }> = {
  nouveau: { label: 'Nouveau', color: '#dbeafe', textColor: '#1e40af' },
  en_instruction: { label: 'Instruction', color: '#fef9c3', textColor: '#854d0e' },
  en_attente_client: { label: 'Client', color: '#ffedd5', textColor: '#9a3412' },
  en_attente_validation: { label: 'Validation', color: '#f3e8ff', textColor: '#6b21a8' },
  valide: { label: 'Validé', color: '#dcfce7', textColor: '#166534' },
  rejete: { label: 'Rejeté', color: '#fee2e2', textColor: '#991b1b' },
  archive: { label: 'Archivé', color: '#f1f5f9', textColor: '#475569' },
};

export default function StatutBadge({ statut }: { statut: string }) {
  const config = STATUTS_CONFIG[statut] || STATUTS_CONFIG.nouveau;

  return (
    <View style={[styles.badge, { backgroundColor: config.color }]}>
      <Text style={[styles.text, { color: config.textColor }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
