import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { LoginFormComponent } from './widgets/login-form/login-form.component';

@NgModule({
  declarations: [AuthPageComponent, LoginFormComponent],
  imports: [SharedModule, AuthRoutingModule],
  exports: [LoginFormComponent],
})
export class AuthModule {}
