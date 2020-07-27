import { Component } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  items: Observable<any[]>;

  constructor(firestore: AngularFirestore) {
    this.items = firestore.collection('items').valueChanges();
  }

}
