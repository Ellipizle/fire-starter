import { Injectable, OnDestroy } from '@angular/core';
import { FireLoopRef, Container } from '../shared/sdk/models';
import { RealTime } from '../shared/sdk/services/core/real.time';
import { Subscription } from 'rxjs/Subscription';
import { FormService } from '../ui/form/ui-form.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FileService implements OnDestroy {

  public containers: Container[] = new Array<Container>();
  public containerRef: FireLoopRef<Container>;
  private subscriptions: Subscription[] = new Array<Subscription>();

  constructor(
    private formService: FormService,
    private rt: RealTime,
  ) {
    this.subscriptions.push(
      this.rt.onReady().subscribe(() => {
        this.containerRef = this.rt.FireLoop.ref<Container>(Container);
        this.subscriptions.push(this.containerRef.on('change').subscribe(
          (containers: Container[]) => {
            this.containers = containers;
            this.containers.sort((a, b) => {
              if (a.name > b.name) return 1;
              if (a.name < b.name) return -1;
              return 0;
            });
          }));
      }));
  }

  ngOnDestroy() {
    this.containerRef.dispose();
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  getCardButtons() {
    return {
      class: 'btn btn-primary float-right',
      icon: 'plus',
      text: 'Create'
    };
  }

  getTableHeaders() {
    return [
      'Name',
      'Actions',
    ];
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
      action: formType === 'create' ? formType : 'update',
    };
  }

  getFormFields(formType: string) {
    let fields = [
      this.formService.input('name', {
        label: 'Name',
        className: 'col-12 col-lg-6',
        addonLeft: {
          class: 'fa fa-fw fa-envelope-o'
        }
      }),
    ];
    return fields;
  }

}
