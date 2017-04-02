import { Injectable, OnDestroy } from '@angular/core';
import { Http } from "@angular/http";
import { FireLoopRef, Container } from '../shared/sdk/models';
import { RealTime, ContainerApi } from '../shared/sdk/services';
import { Subscription } from 'rxjs/Subscription';
import { FormService } from '../ui/form/ui-form.service';
import { Observable } from 'rxjs/Observable';

export class FilesToContainer {
  container: Container;
  files: any[];
}

@Injectable()
export class FileService implements OnDestroy {

  public containers: Container[] = new Array<Container>();
  public filesToContainers: FilesToContainer[];
  public containerRef: FireLoopRef<Container>;
  private subscriptions: Subscription[] = new Array<Subscription>();

  constructor(
    private formService: FormService,
    private rt: RealTime,
    public containerApi: ContainerApi,
    private http: Http
  ) {
    this.refresh();
  }

  setFilesToContainers(): void {
    let newMapping: FilesToContainer[] = [];
    this.containers.forEach(container => {
      this.subscriptions.push(
        this.containerApi.getFiles(container.name).subscribe(
          (files: any[]) => {
            files.forEach(file => {
              let containerUrl = this.getUploadUrl(container.name).replace('upload', 'download');
              file.url = containerUrl + '/' + file.name;
            });
            files.sort((a, b) => {
              if (a.file.firstName > b.file.firstName) return 1;
              if (a.file.firstName < b.file.firstName) return -1;
              return 0;
            });
            let row = {
              container: container,
              files: files
            };
            newMapping.push(row);
          }));
    });
    this.filesToContainers = newMapping.sort((a, b) => {
      if (a.container.name > b.container.name) return 1;
      if (a.container.name < b.container.name) return -1;
      return 0;
    });
  }

  ngOnDestroy() {
    this.containerRef.dispose();
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  getCardButtons() {
    return {
      class: 'btn btn-primary float-right',
      icon: 'plus',
      text: 'Create Container'
    };
  }

  getTableHeaders() {
    return [
      'Container',
      'Files',
      'Actions',
    ];
  }

  refresh() {
    this.subscriptions.push(
      this.containerApi.getContainers().subscribe(
        (containers: Container[]) => {
          this.containers = containers;
          this.setFilesToContainers();
        }));
  }

  upsert(container: Container): Observable<Container> {
    if (container.id) {
      return this.containerRef.upsert(container);
    } else {
      return this.containerRef.create(container);
    }
  }

  delete(container: Container): Observable<Container> {
    return this.containerRef.remove(container);
  }

  getFormConfig(formType: string) {
    return {
      fields: this.getFormFields(formType),
      showCancel: true,
      action: formType === 'create' ? formType : 'upload',
    };
  }

  getUploadUrl(container: Container) {
    const apiConfig = window['apiConfig'];
    return [apiConfig.baseUrl, apiConfig.version, 'Containers', container, 'upload'].join('/');
  }

  getFiles(container: any): Observable<any> {
    const apiConfig = window['apiConfig'];
    let filesUrl = [apiConfig.baseUrl, apiConfig.version, 'Containers', container, 'files'].join('/');
    return this.containerApi.getFiles(container);
  }

  getFormFields(formType: string) {
    let fields = [
      this.formService.input('name', {
        label: 'Name',
        className: 'col-12',
        addonLeft: {
          class: 'fa fa-fw fa-tag'
        }
      }),
    ];
    return fields;
  }

}
