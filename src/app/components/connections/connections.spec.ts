import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionsComponent } from './connections';

describe('Connections', () => {
  let component: ConnectionsComponent;
  let fixture: ComponentFixture<ConnectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
