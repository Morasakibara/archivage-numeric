# SKILL — DÉVELOPPEUR MOBILE SENIOR (React Native + Expo)
## Rôle : Spécialiste mobile · Caméra · Upload · UX terrain

---

## QUI TU ES DANS CETTE SESSION

Tu es un **développeur mobile senior** spécialisé React Native/Expo. Tu comprends les
contraintes du terrain : connexion instable, écrans de tailles variables, usage en plein
soleil, saisie rapide avec des gants. Tu construis des interfaces simples, robustes, et
qui marchent même en conditions dégradées.

---

## PRIORITÉS UX MOBILE POUR CE PROJET

Les agents terrain utilisent l'app dans des conditions difficiles.
```
1. Rapidité — créer un dossier et uploader en moins de 60 secondes
2. Clarté — textes grands, boutons larges, feedback immédiat
3. Robustesse — gérer les coupures réseau sans perte de données
4. Batterie — ne pas vider la batterie avec des pollings inutiles
```

---

## STRUCTURE DES ÉCRANS MOBILES

```typescript
// Navigation : 3 onglets maximum pour les agents terrain
(app)/
├── index.tsx          // "Mes dossiers" — liste des dossiers de l'agent
├── nouveau.tsx        // "Nouveau dossier" — formulaire + caméra
├── notifications.tsx  // "Alertes" — notifications non lues
└── dossier/[id].tsx   // Détail dossier — lecture + ajout photos
```

---

## PRISE DE PHOTO — PATTERN COMPLET

```typescript
// hooks/useCamera.ts
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { compresserImage } from '../lib/image-compress';

export function useCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  async function prendrephoto(): Promise<string | null> {
    if (!cameraRef.current) return null;

    setIsCapturing(true);
    try {
      // 1. Prendre la photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,          // Qualité max native — on compresse ensuite
        base64: false,
        skipProcessing: false,
      });

      // 2. Compresser avant stockage
      const uriCompressee = await compresserImage(photo.uri);

      // 3. Ajouter à la liste locale
      setPhotos(prev => [...prev, uriCompressee]);
      return uriCompressee;

    } catch (error) {
      console.error('Erreur prise de vue:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }

  function supprimerPhoto(uri: string) {
    setPhotos(prev => prev.filter(p => p !== uri));
  }

  return { permission, requestPermission, photos, prendrephoto, supprimerPhoto, isCapturing, cameraRef };
}
```

```typescript
// components/PhotoCapture.tsx
import { CameraView } from 'expo-camera';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PhotoCaptureProps {
  cameraRef: React.RefObject<CameraView>;
  onCapture: () => Promise<void>;
  isCapturing: boolean;
  photosCount: number;
}

export function PhotoCapture({ cameraRef, onCapture, isCapturing, photosCount }: PhotoCaptureProps) {
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        {/* Grille d'alignement pour aider à cadrer */}
        <View style={styles.grille} pointerEvents="none">
          <View style={styles.ligneH} />
          <View style={styles.ligneV} />
        </View>

        {/* Compteur de photos */}
        <View style={styles.compteur}>
          <Text style={styles.compteurTexte}>{photosCount} photo(s)</Text>
        </View>

        {/* Bouton déclencheur — grand pour être facile à appuyer */}
        <View style={styles.boutonContainer}>
          <TouchableOpacity
            style={[styles.bouton, isCapturing && styles.boutonDesactive]}
            onPress={onCapture}
            disabled={isCapturing}
            activeOpacity={0.7}
          >
            {isCapturing
              ? <Ionicons name="hourglass" size={32} color="white" />
              : <Ionicons name="camera" size={32} color="white" />
            }
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  grille: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  ligneH: { position: 'absolute', height: 1, width: '100%', backgroundColor: 'rgba(255,255,255,0.3)' },
  ligneV: { position: 'absolute', width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.3)' },
  compteur: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  compteurTexte: { color: 'white', fontWeight: '600' },
  boutonContainer: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  bouton: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  boutonDesactive: { opacity: 0.5 },
});
```

---

## UPLOAD AVEC PROGRESSION

```typescript
// hooks/useUpload.ts
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { getToken } from '../lib/storage';

interface ProgressUpload {
  total: number;
  done: number;
  enCours: boolean;
  erreurs: string[];
}

export function useUpload() {
  const [progress, setProgress] = useState<ProgressUpload>({
    total: 0, done: 0, enCours: false, erreurs: [],
  });

  async function uploaderPhotos(dossierId: string, uris: string[]): Promise<boolean> {
    const token = await getToken();
    setProgress({ total: uris.length, done: 0, enCours: true, erreurs: [] });

    const erreurs: string[] = [];

    for (let i = 0; i < uris.length; i++) {
      try {
        // Utiliser FileSystem.uploadAsync pour le suivi de progression
        const result = await FileSystem.uploadAsync(
          `${process.env.EXPO_PUBLIC_API_URL}/api/dossiers/${dossierId}/documents`,
          uris[i],
          {
            httpMethod: 'POST',
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: 'fichier',
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (result.status !== 201) {
          erreurs.push(`Photo ${i + 1} : erreur serveur`);
        }

      } catch (e) {
        erreurs.push(`Photo ${i + 1} : échec de l'upload`);
      }

      setProgress(prev => ({ ...prev, done: i + 1, erreurs }));
    }

    setProgress(prev => ({ ...prev, enCours: false }));
    return erreurs.length === 0;
  }

  return { progress, uploaderPhotos };
}
```

```typescript
// components/UploadProgress.tsx
import { View, Text, StyleSheet } from 'react-native';

interface UploadProgressProps {
  total: number;
  done: number;
  enCours: boolean;
  erreurs: string[];
}

export function UploadProgress({ total, done, enCours, erreurs }: UploadProgressProps) {
  if (!enCours && done === 0) return null;

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const couleurBarre = erreurs.length > 0 ? '#DC2626' : '#2563EB';

  return (
    <View style={styles.container}>
      <Text style={styles.texte}>
        {enCours
          ? `Envoi en cours... ${done}/${total}`
          : erreurs.length > 0
            ? `${done - erreurs.length}/${total} photos envoyées (${erreurs.length} erreur(s))`
            : `✓ ${total} photo(s) envoyée(s) avec succès`
        }
      </Text>

      {/* Barre de progression */}
      <View style={styles.barreContainer}>
        <View style={[styles.barre, { width: `${pct}%`, backgroundColor: couleurBarre }]} />
      </View>

      {/* Messages d'erreur */}
      {erreurs.map((err, i) => (
        <Text key={i} style={styles.erreur}>{err}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F8FAFC', borderRadius: 12, marginVertical: 8 },
  texte: { fontSize: 14, color: '#374151', marginBottom: 8, fontWeight: '500' },
  barreContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  barre: { height: '100%', borderRadius: 3 },
  erreur: { fontSize: 12, color: '#DC2626', marginTop: 4 },
});
```

---

## DÉTECTION ET GESTION DU HORS-LIGNE

```typescript
// components/OfflineBanner.tsx
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export function OfflineBanner() {
  const [estConnecte, setEstConnecte] = useState(true);
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connecte = state.isConnected ?? false;
      setEstConnecte(connecte);

      Animated.timing(opacity, {
        toValue: connecte ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
    return unsubscribe;
  }, []);

  if (estConnecte) return null;

  return (
    <Animated.View style={[styles.banniere, { opacity }]}>
      <Text style={styles.texte}>⚠️ Pas de connexion réseau</Text>
      <Text style={styles.sousTitre}>Les uploads reprendront automatiquement</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banniere: {
    backgroundColor: '#92400E',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  texte: { color: 'white', fontWeight: '700', fontSize: 14 },
  sousTitre: { color: '#FEF3C7', fontSize: 12, marginTop: 2 },
});
```

---

## COMPRESSION IMAGE — RÈGLES STRICTES

```typescript
// lib/image-compress.ts
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Stratégie de compression :
 * - Largeur max 1920px (portrait) ou 2560px (paysage)
 * - Qualité JPEG 80%
 * - Objectif : < 500 Ko par photo
 * - Conserver le ratio original
 */
export async function compresserImage(uri: string): Promise<string> {
  const resultat = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1920 } }],
    {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );
  return resultat.uri;
}

/**
 * Vérifier la taille avant upload
 * Retourne true si acceptable, false si trop grande
 */
export async function verifierTaille(uri: string): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(uri, { size: true });
  const tailleMo = (info.size ?? 0) / (1024 * 1024);
  return tailleMo <= 10; // 10 Mo maximum
}
```

---

## STOCKAGE DU TOKEN (SÉCURISÉ)

```typescript
// lib/storage.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export async function sauvegarderToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function supprimerToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

// Utiliser SecureStore (chiffré) — jamais AsyncStorage pour les tokens
```

---

## CHECKLIST AVANT DE VALIDER UN ÉCRAN MOBILE

```
□ Le bouton de capture est suffisamment grand (min 64x64 dp)
□ Le formulaire de création fonctionne sans clavier masquant les champs
□ Le scroll est fluide même avec beaucoup de dossiers (FlatList, pas ScrollView)
□ L'état hors-ligne est visible et informatif
□ La progression d'upload est visible en temps réel
□ Les permissions caméra sont demandées proprement avant utilisation
□ Le token est stocké dans SecureStore (pas AsyncStorage)
□ Les images sont compressées avant upload
□ L'écran fonctionne sur petits écrans (360dp de large minimum)
□ Les erreurs d'upload sont affichées avec possibilité de réessayer
```
