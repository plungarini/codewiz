import { Injectable } from '@angular/core';
import { deleteObject, getDownloadURL, Storage } from '@angular/fire/storage';
import { ref, uploadBytes } from '@firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

	constructor(
		private storage: Storage,
	) { }

	async uploadFileAndGetPath(
		mediaFolderPath: string,
		fileToUpload: Blob | Uint8Array | ArrayBuffer | File,
		fileName?: string,
	) {
		const name = 'name' in fileToUpload ? fileToUpload.name : fileName;
		const filePath = `${mediaFolderPath}/${name}`;
		const reference = ref(this.storage, filePath);

		const uploadTask =	await uploadBytes(reference, fileToUpload);
		return uploadTask.metadata.fullPath;
	}

	async deleteFile(path: string): Promise<void> {
		const reference = ref(this.storage, path);
	  await deleteObject(reference);
	}

	async getDownloadUrl(path: string): Promise<string> {
		const reference = ref(this.storage, path);
		return await getDownloadURL(reference);
	}
}
