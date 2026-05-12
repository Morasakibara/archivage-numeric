import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { dossiersApi } from '../../../api/dossiers.api';
import { documentsApi } from '../../../api/documents.api';
import { notesApi } from '../../../api/notes.api';
import StatutBadge from '../../../components/StatutBadge';
import { FileText, MessageSquare, Image as ImageIcon, Send, User } from 'lucide-react-native';

export default function DossierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dossier, setDossier] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [sendingNote, setNoteLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [dRes, docsRes, nRes] = await Promise.all([
        dossiersApi.getOne(id!),
        documentsApi.findByDossier(id!),
        notesApi.findByDossier(id!)
      ]);
      setDossier(dRes.data);
      setDocuments(docsRes.data);
      setNotes(nRes.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données du dossier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setNoteLoading(true);
    try {
      await notesApi.create(id!, noteText);
      setNoteText('');
      const nRes = await notesApi.findByDossier(id!);
      setNotes(nRes.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter la note');
    } finally {
      setNoteLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Infos Header */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.numero}>{dossier?.numero}</Text>
          <StatutBadge statut={dossier?.statut} />
        </View>
        <Text style={styles.client}>{dossier?.nomClient}</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Compteur</Text>
            <Text style={styles.infoValue}>{dossier?.numeroCompteur}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Intervention</Text>
            <Text style={styles.infoValue}>{dossier?.typeIntervention}</Text>
          </View>
        </View>
      </View>

      {/* Galerie Photos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <ImageIcon size={18} color="#1e293b" /> Photos Terrain ({documents.length})
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
          {documents.map((doc) => (
            <View key={doc.id} style={styles.photoCard}>
              <View style={styles.photoPlaceholder}>
                <ImageIcon size={30} color="#94a3b8" />
                <Text style={styles.photoName}>{doc.nomFichier.substring(0, 10)}...</Text>
              </View>
            </View>
          ))}
          {documents.length === 0 && <Text style={styles.emptyText}>Aucune photo</Text>}
        </ScrollView>
      </View>

      {/* Fil des Notes */}
      <View style={[styles.section, styles.notesSection]}>
        <Text style={styles.sectionTitle}>
          <MessageSquare size={18} color="#1e293b" /> Notes internes
        </Text>
        <View style={styles.notesList}>
          {notes.map((note) => (
            <View key={note.id} style={styles.noteItem}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteAuthor}>{note.auteur.prenom} {note.auteur.nom}</Text>
                <Text style={styles.noteDate}>{new Date(note.creeLe).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.noteContent}>{note.contenu}</Text>
            </View>
          ))}
          {notes.length === 0 && <Text style={styles.emptyText}>Aucune note</Text>}
        </View>

        <View style={styles.noteInputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ajouter une note..."
            value={noteText}
            onChangeText={setNoteText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !noteText.trim() && styles.sendBtnDisabled]} 
            onPress={handleAddNote}
            disabled={sendingNote || !noteText.trim()}
          >
            {sendingNote ? <ActivityIndicator color="#fff" /> : <Send size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { backgroundColor: '#fff', padding: 20, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  numero: { fontSize: 18, fontWeight: 'bold', color: '#2563eb' },
  client: { fontSize: 20, fontWeight: '600', color: '#1e293b', marginBottom: 15 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  infoItem: { minWidth: '40%' },
  infoLabel: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  infoValue: { fontSize: 15, color: '#1e293b', fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 15, flexDirection: 'row', alignItems: 'center', gap: 8 },
  photoList: { flexDirection: 'row' },
  photoCard: { width: 100, height: 100, marginRight: 12, borderRadius: 8, backgroundColor: '#f1f5f9', overflow: 'hidden' },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoName: { fontSize: 10, color: '#94a3b8', marginTop: 5 },
  notesSection: { flex: 1 },
  notesList: { marginBottom: 20 },
  noteItem: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  noteAuthor: { fontSize: 12, fontWeight: 'bold', color: '#1e293b' },
  noteDate: { fontSize: 10, color: '#64748b' },
  noteContent: { fontSize: 14, color: '#475569' },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginVertical: 10, fontSize: 14 },
  noteInputRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  input: { flex: 1, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, minHeight: 45, maxHeight: 100, backgroundColor: '#fff' },
  sendBtn: { backgroundColor: '#2563eb', width: 45, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#94a3b8' },
});
