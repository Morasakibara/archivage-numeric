import { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { compresserImage } from '../lib/image-compress';
import { X, Camera as CameraIcon, RefreshCcw, Check } from 'lucide-react-native';

interface CameraCaptureProps {
  onCapture: (uri: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);

  if (!permission) return <View />;
  
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Nous avons besoin de votre permission pour utiliser la caméra</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Accorder la permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      const compressedUri = await compresserImage(photo.uri);
      setPreviewUri(compressedUri);
    }
  };

  const confirmCapture = () => {
    if (previewUri) {
      onCapture(previewUri);
      onClose();
    }
  };

  if (previewUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: previewUri }} style={styles.camera} />
        <View style={styles.controls}>
          <TouchableOpacity style={[styles.circleBtn, styles.cancelBtn]} onPress={() => setPreviewUri(null)}>
            <RefreshCcw color="#fff" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.circleBtn, styles.confirmBtn]} onPress={confirmCapture}>
            <Check color="#fff" size={32} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X color="#fff" size={28} />
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.captureBtn} 
            onPress={takePicture}
          >
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    color: '#fff',
    padding: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    padding: 40,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  circleBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#4b5563',
  },
  confirmBtn: {
    backgroundColor: '#10b981',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});
