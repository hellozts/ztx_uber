import {Component, OnInit} from '@angular/core';
import {PhotoService} from '../services/photo.service';
import {Photo} from '../d.types/Photo';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{
  photos: Photo[] = this.photoService.photos;
  constructor(public photoService: PhotoService) {
  }

  ngOnInit(): void {
   this.photoService.loadSaved().then(r => {
     this.photos = this.photoService.photos;
   });
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

}
