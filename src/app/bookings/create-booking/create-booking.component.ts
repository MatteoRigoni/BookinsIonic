/* eslint-disable no-bitwise */
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Place } from 'src/app/places/place.model';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Place;
  @Input() selectedMode: string;
  @ViewChild('f', { static: true }) form: NgForm;
  startDate: string;
  endDate: string;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.selectedMode === 'random') {
      this.startDate = this.selectedPlace.availableFrom.toISOString();
      this.endDate = this.selectedPlace.availableTo.toISOString();
    }
  }

  onBookPlace() {
    this.modalCtrl.dismiss(
      {
        bookingData: {
          fistName: this.form.value['first-name'],
          lastName: this.form.value['last-name'],
          guestNumber: +this.form.value['guest-number'],
          dateFrom: new Date(this.form.value['date-from']),
          dateTo: new Date(this.form.value['date-to'])
        },
      },
      'confirm'
    );
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  datesValid() {
    const startDate = new Date(this.form.value['date-from']);
    const toDate = new Date(this.form.value['date-to']);
    return toDate < startDate;
  }
}
