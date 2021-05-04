/* eslint-disable eqeqeq */
/* eslint-disable arrow-body-style */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, filter, map, tap, delay, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.model';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    // new Place(
    //   '1',
    //   'Manhattan hostel',
    //   'In the heart of New York',
    //   'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/1280px-New_york_times_square-terabass.jpg',
    //   150.99,
    //   new Date('2019-01-01'),
    //   new Date('2019-12-31'),
    //   'xyz'
    // ),
    // new Place(
    //   '2',
    //   'Paris hostel',
    //   'Romantic place in Paris',
    //   'https://recruit4languages.com/app/uploads/2020/05/Paris.jpg',
    //   200,
    //   new Date('2019-01-01'),
    //   new Date('2019-12-31'),
    //   'abc'
    // ),
    // new Place(
    //   '3',
    //   'Everest hostel',
    //   'On the top of the world',
    //   'https://upload.wikimedia.org/wikipedia/commons/4/46/View_of_Mount_Everest.jpg',
    //   499.99,
    //   new Date('2019-01-01'),
    //   new Date('2019-12-31'),
    //   'abc'
    // ),
  ]);

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient
  ) {}

  get places() {
    //return [...this._places];
    return this._places.asObservable();
  }

  fetchPlaces() {
    return this.httpClient
      .get<{ [key: string]: PlaceData }>(
        'https://ionic-angular-course-boo-ba221-default-rtdb.firebaseio.com/offered-places.json'
      )
      .pipe(
        map((resData) => {
          const places = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              places.push(
                new Place(
                  key,
                  resData[key].title,
                  resData[key].description,
                  resData[key].imageUrl,
                  resData[key].price,
                  new Date(resData[key].availableFrom),
                  new Date(resData[key].availableTo),
                  resData[key].userId
                )
              );
            }
          }
          return places;
        }),
        tap((places) => {
          this._places.next(places);
        })
      );
  }

  getPlace(id) {
    return this.httpClient
      .get<PlaceData>(
        `https://ionic-angular-course-boo-ba221-default-rtdb.firebaseio.com/offered-places/${id}.json`
      )
      .pipe(
        map((placeData) => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.availableFrom),
            new Date(placeData.availableTo),
            placeData.userId
          );
        })
      );
    //return {...this._places.find(f => f.id === placeId)};
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    availableFrom: Date,
    availableTo: Date
  ) {
    let generatedId: string;
    let newPlace: Place;
    return this.authService
      .getUserId()
      .pipe(
        take(1),
        switchMap((userId) => {
          if (!userId) {
            throw new Error('User not found');
          }

          newPlace = new Place(
            Math.random().toString(),
            title,
            description,
            'https://upload.wikimedia.org/wikipedia/commons/4/46/View_of_Mount_Everest.jpg',
            price,
            availableFrom,
            availableTo,
            userId
          );

          return this.httpClient.post<{ name: string }>(
            'https://ionic-angular-course-boo-ba221-default-rtdb.firebaseio.com/offered-places.json',
            { ...newPlace, id: null }
          );
        })
      )
      .pipe(
        switchMap((resData) => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap((places) => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap((places) => {
        if (!places || places.length == 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updatedPlaces = [...places];
        const old = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          old.id,
          title,
          description,
          old.imageUrl,
          old.price,
          old.availableFrom,
          old.availableTo,
          old.userId
        );
        return this.httpClient.put(
          `https://ionic-angular-course-boo-ba221-default-rtdb.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap((resData) => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
