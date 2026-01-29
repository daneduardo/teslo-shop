import { PaginationService } from '@shared/components/Pagination/pagination.service';
import { Component, inject } from '@angular/core';
import { ProductCard } from "@products/components/product-card/product-card";
import { ProductsService } from '@products/services/products.service';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Pagination } from "@shared/components/Pagination/Pagination";

@Component({
  selector: 'home-page',
  imports: [ProductCard, Pagination],
  templateUrl: './home-page.html',
})
export class HomePage {

  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);

    productsResorce = rxResource({
    params: () => ({ page: this.paginationService.currentPage() }),
    stream: ({ params }) => {
      return this.productsService.getProducts({ offset: (params.page - 1) * 9, limit: 9 });
    },
  });
}
