import { Component } from '@angular/core';
import { UIService } from '../ui/ui.service';

@Component({
  selector: 'app-home',
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./home.component.scss']

})
export class HomeComponent {
  private sidebarNav: any = [
    {
      'name': 'Dashboard',
      'link': '/home/dashboard',
      'icon': 'tachometer'
    },
    // {
    //   'name': 'Authentication',
    //   'link': '/auth',
    //   'icon': 'lock'
    // },
    {
      'name': 'Todos',
      'link': '/home/todos',
      'icon': 'check-square-o'
    },
    {
      'name': 'Notes',
      'link': '/home/notes',
      'icon': 'sticky-note-o'
    },
    {
      'name': 'Notifications',
      'link': '/home/notifications',
      'icon': 'comments-o'
    },
    {
      'name': 'Files',
      'link': '/home/files',
      'icon': 'files-o'
    },
  ];

  constructor(private uiService: UIService) {
    this.uiService.setSidebarNav(this.sidebarNav);
  }
}
