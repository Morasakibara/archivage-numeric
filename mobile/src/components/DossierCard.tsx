import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import StatutBadge from './StatutBadge';
import { Calendar, Hash } from 'lucide-react-native';

interface DossierCardProps {
  dossier: any;
}

export default function DossierCard({ dossier }: DossierCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push({ pathname: '/(app)/dossier/[id]', params: { id: dossier.id } })}
    >
      <View style={styles.header}>
        <Text style={styles.numero}>{dossier.numero}</Text>
        <StatutBadge statut={dossier.statut} />
      </View>
      
      <Text style={styles.client}>{dossier.nomClient}</Text>
      
      <View style={styles.footer}>
        <View style={styles.info}>
          <Hash size={14} color="#94a3b8" />
          <Text style={styles.infoText}>{dossier.numeroCompteur}</Text>
        </View>
        <View style={styles.info}>
          <Calendar size={14} color="#94a3b8" />
          <Text style={styles.infoText}>{new Date(dossier.creeLe).toLocaleDateString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  numero: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  client: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 15,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
  },
});
