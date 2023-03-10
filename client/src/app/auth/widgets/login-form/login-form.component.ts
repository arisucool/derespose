import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['../../../shared/style.scss', './login-form.component.scss'],
})
export class LoginFormComponent {
  @Input()
  openWithNewWindow: boolean = false;
}
