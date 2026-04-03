import { Component, EventEmitter, Input, Output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  templateUrl: './pagination-controls.component.html',
  styleUrl: './pagination-controls.component.css'
})
export class PaginationControlsComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Input() totalPages = 1;
  @Input() loading = false;
  @Output() pageChange = new EventEmitter<number>();

  readonly inicio = computed(() => this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1);
  readonly fim = computed(() => Math.min(this.page * this.pageSize, this.total));
  readonly pages = computed(() => {
    const totalPages = Math.max(this.totalPages, 1);
    const start = Math.max(1, this.page - 1);
    const end = Math.min(totalPages, start + 2);
    const normalizedStart = Math.max(1, end - 2);

    return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index);
  });

  goTo(page: number) {
    if (this.loading || page < 1 || page > this.totalPages || page === this.page) {
      return;
    }

    this.pageChange.emit(page);
  }
}
