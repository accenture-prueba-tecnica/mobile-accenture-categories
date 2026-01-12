import { TestBed } from '@angular/core/testing';

import { CategoryDialogService } from './category-dialog.service';

describe('CategoryDialogService', () => {
  let service: CategoryDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
