import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { app } from '@/lib/firebase';

const storage = getStorage(app);

export async function uploadServiceImage(file: File, serviceId: string): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `services/${serviceId}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadChatAttachment(file: File, chatId: string): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `chats/${chatId}/attachments/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
