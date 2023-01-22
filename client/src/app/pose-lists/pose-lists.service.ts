import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ApiService } from 'src/.api-client/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class PoseListsService {
  constructor(private apiService: ApiService) {}

  getPoseLists() {
    return lastValueFrom(this.apiService.poseListsControllerList());
  }
}
