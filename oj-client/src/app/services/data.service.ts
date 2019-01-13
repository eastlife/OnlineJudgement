import { Injectable } from '@angular/core';
import { Problem } from '../models/problem.model';
import { PROBLEMS } from '../components/problem-list/mock-problems';
import {Observable, Subscription} from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private problemSource = new BehaviorSubject<Problem[]>([]);
  private problemArray: Problem[];

  constructor(private http: HttpClient) { }

  // getProblems(): Observable<Problem[]> {
  //   this.http.get('api/v1/problems')
  //     .toPromise()
  //       .then((res: Response) =>{
  //         this.problemSource.next(res.json());
  //      })
  //     .catch(this.handleError);
  //
  //   return this.problemSource.asObservable();
  // }

  getProblems(): Observable<Problem[]> {
    this.http.get('api/v1/problems')
      .toPromise()
      // res is an array of object(json)
      .then((res: any) => {
        // console.log(res);
        this.problemSource.next(res);
      } )
      .catch(this.handleError);

    return this.problemSource.asObservable();
  }

  getProblem(id: number): Promise<Problem> {
    return this.http.get(`api/v1/problems/${id}`)
      .toPromise()
      // res is an object(json), this then() function does nothing
      .then((res: Response) => {
        console.log(res);
        return res;
      })
      .catch(this.handleError);
  }

  addProblem(problem: Problem): Promise<Problem> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post('/api/v1/problems', problem, {headers})
      .toPromise()
      .then((res: Response) => {
        this.getProblems();
        return res;
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred!!', error);
    return Promise.reject(error.body || error);
  }
}
