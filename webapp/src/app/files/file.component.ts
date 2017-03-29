import { Component, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Container } from '../shared/sdk/models';
import { FileFormComponent } from './file-form.component';
import { FileService } from './file.service';
import { UIService } from '../ui/ui.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
})
export class FileComponent implements OnDestroy {

  private modalRef;
  private subscriptions: Subscription[] = new Array<Subscription>();

  constructor(
    private modal: NgbModal,
    private uiService: UIService,
    private fileService: FileService,
  ) { }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  showDialog(type, item) {
    this.modalRef = this.modal.open(FileFormComponent, { size: 'lg' });
    this.modalRef.componentInstance.item = item;
    this.modalRef.componentInstance.formConfig = this.fileService.getFormConfig(type);
    this.modalRef.componentInstance.title = (type === 'create') ? 'Create Container' : 'Update Container';
    this.subscriptions.push(this.modalRef.componentInstance.action.subscribe(event => this.handleAction(event)));
  }

  create() {
    this.showDialog('create', new Container());
  }

  update(file: Container) {
    this.showDialog('update', file);
  }

  delete(container: Container) {
    const question = {
      title: 'Delete Container',
      html: `
        <p class="lead">Are you sure you want to delete Container
          <span class="font-weight-bold font-italic">${container.name}</span>?
        </p>
      `,
      confirmButtonText: 'Yes, Delete'
    };
    this.uiService.alertError(question, () => this.handleAction({ type: 'delete', payload: container }), () => { });
  }

  handleAction(event) {
    switch (event.type) {
      case 'create':
        this.subscriptions.push(this.fileService
          .upsert(event.payload).subscribe(() => {
            this.modalRef.close();
            this.uiService.toastSuccess('Container Created', 'The Container was created successfully.');
          }, (err) => {
            this.modalRef.close();
            this.uiService.toastError('Create Container Failed', err.message || err.error.message);
          },
        ));
        break;
      case 'update':
        this.subscriptions.push(this.fileService
          .upsert(event.payload).subscribe(() => {
            this.modalRef.close();
            this.uiService.toastSuccess('Container Updated', 'The Container was updated successfully.');
          }, (err) => {
            this.modalRef.close();
            this.uiService.toastError('Update Container Failed', err.message || err.error.message);
          },
        ));
        break;
      case 'delete':
        this.subscriptions.push(this.fileService
          .delete(event.payload).subscribe(() => {
            this.uiService.toastSuccess('Container Deleted', 'The Container was deleted successfully.');
          },
          (err) => {
            this.uiService.toastError('Delete Container Failed', err.message || err.error.message);
          },
        ));
        break;
      default:
        return console.log('Unknown event action', event);
    }
  }

}
