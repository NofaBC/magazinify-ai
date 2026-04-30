import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { getFirebaseStorage } from '@/lib/config/firebase';

/** Upload a file to tenant's storage bucket */
export async function uploadTenantAsset(
  tenantId: string,
  file: File,
  folder = 'assets'
): Promise<{ path: string; url: string }> {
  const path = `tenants/${tenantId}/${folder}/${Date.now()}_${file.name}`;
  const storageRef = ref(getFirebaseStorage(), path);
  const arrayBuffer = await file.arrayBuffer();
  await uploadBytes(storageRef, new Uint8Array(arrayBuffer));
  const url = await getDownloadURL(storageRef);
  return { path, url };
}

/** Delete a single asset from storage */
export async function deleteTenantAsset(path: string): Promise<void> {
  const storageRef = ref(getFirebaseStorage(), path);
  await deleteObject(storageRef);
}

/** Clean up all temporary assets for a tenant issue */
export async function cleanupTempAssets(
  tenantId: string,
  folder = 'temp'
): Promise<void> {
  const listRef = ref(getFirebaseStorage(), `tenants/${tenantId}/${folder}`);
  const result = await listAll(listRef);
  await Promise.all(result.items.map((item) => deleteObject(item)));
}