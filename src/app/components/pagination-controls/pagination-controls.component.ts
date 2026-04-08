import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  templateUrl: './pagination-controls.component.html',
  styleUrl: './pagination-controls.component.css'
})
export class PaginationControlsComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() itemsCount = 0;
  @Input() hasNext = false;
  @Input() loading = false;
  @Output() pageChange = new EventEmitter<number>();

  goToPrevious() {
    if (this.loading || this.page <= 1) {
      return;
    }

    this.pageChange.emit(this.page - 1);
  }

  goToNext() {
    if (this.loading || !this.hasNext) {
      return;
    }

    this.pageChange.emit(this.page + 1);
  }
}
