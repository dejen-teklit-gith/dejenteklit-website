import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = 'http://localhost:3000';

  private userSubject = new BehaviorSubject<any>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ---------------- AUTH ----------------
  async login(email: string, password: string): Promise<any> {
    const res = await firstValueFrom(
      this.http.post<any>(`${this.API}/auth/login`, { email, password })
    );
    this.storeAuth(res);
    return res;
  }

  async register(data: any): Promise<any> {
    const res = await firstValueFrom(
      this.http.post<any>(`${this.API}/auth/register`, data)
    );
    this.storeAuth(res);
    return res;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    return this.userSubject.value;
  }

  // ---------------- USER (✅ NEW) ----------------
  async getMe(): Promise<any> {
    const token = this.getToken();
    if (!token) return null;

    return await firstValueFrom(
      this.http.get<any>(`${this.API}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
  }

  // ---------------- ORDERS ----------------
  async getMyOrders(): Promise<any[]> {
    return await firstValueFrom(
      this.http.get<any[]>(`${this.API}/my-orders`, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      })
    );
  }

  // ---------------- HELPERS ----------------
  private storeAuth(res: any): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.userSubject.next(res.user);
  }

  private getStoredUser(): any {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }
  async forgotPassword(email: string): Promise<any> {
    return await firstValueFrom(
      this.http.post<any>(`${this.API}/auth/forgot-password`, { email })
    );
  }
  async resetPassword(token: string, password: string): Promise<any> {
    return await firstValueFrom(
      this.http.post<any>(`${this.API}/auth/reset-password`, {
        token,
        password,
      })
    );
  }
  async getOrderById(id: number): Promise<any> {
    return await firstValueFrom(
      this.http.get<any>(`${this.API}/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      })
    );
  }

}
