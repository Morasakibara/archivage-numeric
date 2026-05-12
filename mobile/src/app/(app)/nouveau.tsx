import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { dossiersApi } from '../../api/dossiers.api';
import { documentsApi } from '../../api/documents.api';
import apiClient from '../../api/client';
import { Camera, Image as ImageIcon, Save } from 'lucide-react-native';
import CameraCapture from '../../components/CameraCapture';

export default function NouveauDossierScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [typesIntervention, setTypesIntervention] = useState<any[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    nomClient: '',
    telephoneClient: '',
    numeroCompteur: '',
    typeIntervention: '',
    description: '',
  });

  useEffect(() => {
    apiClient.get('/referentiels/types').then(res => {
      setTypesIntervention(res.data.data);
    });
  }, []);

  const handleCapture = (uri: string) => {
    setPhotos([...photos, uri]);
  };

  const handleSave = async () => {
    if (!form.nomClient || !form.numeroCompteur || !form.typeIntervention) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Erreur', 'Veuillez prendre au moins une photo');
      return;
    }

    setLoading(true);
    try {
      // 1. Créer le dossier
      const dossierRes = await dossiersApi.create(form);
      const dossierId = dossierRes.data.id;

      // 2. Uploader les photos
      for (const photoUri of photos) {
        await documentsApi.upload(dossierId, photoUri);
      }

      Alert.alert('Succès', 'Dossier créé avec succès', [
        { text: 'OK', onPress: () => router.replace('/(app)') }
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création du dossier');
    } finally {
      setLoading(false);
    }
  };

  if (showCamera) {
    return <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client & Compteur</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom du client *"
          value={form.nomClient}
          onChangeText={(v) => setForm({ ...form, nomClient: v })}
        />
        <TextInput
          style={styles.input}
          placeholder="Téléphone"
          keyboardType="phone-pad"
          value={form.telephoneClient}
          onChangeText={(v) => setForm({ ...form, telephoneClient: v })}
        />
        <TextInput
          style={styles.input}
          placeholder="Numéro de compteur *"
          value={form.numeroCompteur}
          onChangeText={(v) => setForm({ ...form, numeroCompteur: v })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intervention</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          {typesIntervention.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeChip,
                form.typeIntervention === type.libelle && styles.typeChipActive
              ]}
              onPress={() => setForm({ ...form, typeIntervention: type.libelle })}
            >
              <Text style={[
                styles.typeChipText,
                form.typeIntervention === type.libelle && styles.typeChipTextActive
              ]}>{type.libelle}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description / Observations"
          multiline
          numberOfLines={4}
          value={form.description}
          onChangeText={(v) => setForm({ ...form, description: v })}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.photoHeader}>
          <Text style={styles.sectionTitle}>Photos Terrain ({photos.length})</Text>
          <TouchableOpacity style={styles.addPhotoBtn} onPress={() => setShowCamera(true)}>
            <Camera color="#2563eb" size={20} />
            <Text style={styles.addPhotoText}>Prendre</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal style={styles.photoList}>
          {photos.map((uri, index) => (
            <View key={index} style={styles.photoWrapper}>
              <ImageIcon color="#94a3b8" size={40} />
              <TouchableOpacity 
                style={styles.removePhoto} 
                onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
              >
                <Text style={styles.removePhotoText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity 
        style={[styles.saveBtn, loading && styles.saveBtnDisabled]} 
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Save color="#fff" size={20} />
            <Text style={styles.saveBtnText}>Enregistrer le dossier</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeScroll: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  typeChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  typeChipText: {
    fontSize: 13,
    color: '#64748b',
  },
  typeChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addPhotoText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  photoList: {
    flexDirection: 'row',
  },
  photoWrapper: {
    width: 80,
    height: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  removePhoto: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 10,
  },
  saveBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
