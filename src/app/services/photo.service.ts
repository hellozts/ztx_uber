import {Injectable} from '@angular/core';

import {CameraPhoto, CameraResultType, CameraSource, Capacitor, FilesystemDirectory, Plugins} from '@capacitor/core';
import {Photo} from '../d.types/Photo';
import {Platform} from '@ionic/angular';

const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: Photo[] = [];
  private PHOTO_STORAGE = 'photos';

  constructor(private platform: Platform) { }

  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);
    await Storage.set({
      key: this.PHOTO_STORAGE,
      value: this.platform.is('hybrid') ? JSON.stringify(this.photos) : JSON.stringify(this.photos.map(p => {
        const photoCopy = {...p};
        delete photoCopy.base64;
        return photoCopy;
      }))
    });
  }

  public async loadSaved() {
    const photos = await Storage.get({key: this.PHOTO_STORAGE});
    this.photos = JSON.parse(photos.value) || [];
    if (!this.platform.is('hybrid')) {
      for (const photo of this.photos) {
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: FilesystemDirectory.Data
        });
        photo.base64 = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }

  private async savePicture(cameraPhoto: CameraPhoto) {
    const base64Data = await this.readAsBase64(cameraPhoto);
    const fileName = (new Date()).getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });
    if (this.platform.is('hybrid')) {
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri)
      };
    } else {
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      };
    }
  }

  private async readAsBase64(cameraPhoto: CameraPhoto) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      });
      return file.data;
    } else {
      const response = await fetch(cameraPhoto.webPath);
      const blob = await response.blob();
      return await this.converBlobBase64(blob) as string;
    }
  }

  converBlobBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  })
}
