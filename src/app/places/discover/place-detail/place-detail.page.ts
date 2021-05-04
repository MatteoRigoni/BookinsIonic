/* eslint-disable prefer-const */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { BookingService } from 'src/app/bookings/booking.service';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable: boolean;
  isLoading = false;
  private placeSub: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private placeService: PlacesService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('places/offers');
        return;
      } else {
        this.isLoading = true;
        let fetchedUserId: string;

        this.authService
          .getUserId()
          .pipe(
            take(1),
            switchMap((userId) => {
              if (!userId) {
                throw new Error('User not found');
              }
              return this.placeService.getPlace(paramMap.get('placeId'));
            })
          )
          .subscribe(
            (place) => {
              this.place = place;
              this.isBookable = place.userId !== fetchedUserId;
              this.isLoading = false;
            },
            (error) => {
              this.alertCtrl
                .create({
                  header: 'An error occurred',
                  message: 'Place detail not available',
                  buttons: [
                    {
                      text: 'Ok',
                      handler: () => {
                        // todo
                      },
                    },
                  ],
                })
                .then((alertEl) => {
                  alertEl.present();
                });
            }
          );
      }
    });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

  onBookPlace() {
    //this.navCtrl.navigateBack('/places/tabs/discover');
    this.actionSheetCtrl
      .create({
        header: 'Choose an action',
        buttons: [
          {
            text: 'Select date',
            handler: () => {
              this.openBookingModal('select');
            },
          },
          {
            text: 'Random date',
            handler: () => {
              this.openBookingModal('random');
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ],
      })
      .then((actionSheetEl) => {
        actionSheetEl.present();
      });
  }

  openBookingModal(mode: 'select' | 'random') {
    let modalBooking = this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.place, selectedMode: mode },
      })
      .then((modalEl) => {
        modalEl.onDidDismiss().then((result) => {
          if (result.role === 'confirm') {
            this.loadingCtrl
              .create({
                message: 'Booking place...',
              })
              .then((loadingEl) => {
                loadingEl.present();

                console.log('Booking completed!');
                const data = result.data;
                this.bookingService
                  .addBooking(
                    this.place.id,
                    this.place.title,
                    this.place.imageUrl,
                    data.firstName,
                    data.lastName,
                    data.guestNumber,
                    data.startDate,
                    data.endDate
                  )
                  .subscribe(() => {
                    loadingEl.dismiss();
                  });
              });
          }
        });

        modalEl.present();
      });
  }
}
