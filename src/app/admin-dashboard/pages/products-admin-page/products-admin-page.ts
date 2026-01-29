import { Component, inject, signal } from '@angular/core';
import { ProductTable } from "@/products/components/product-table/product-table";
import { ProductsService } from '../../../products/services/products.service';
import { PaginationService } from '@/shared/components/Pagination/pagination.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Pagination } from "@/shared/components/Pagination/Pagination";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'products-admin-page',
  imports: [ProductTable, Pagination, RouterLink],
  templateUrl: './products-admin-page.html',
})
export class ProductsAdminPage {

  productsService= inject(ProductsService);
  paginationService = inject(PaginationService);
  productsPerPage = signal(10);


    productsResorce = rxResource({
    params: () => ({
      page: this.paginationService.currentPage() -1,
      limit: this.productsPerPage(),
   }),
    stream: ({ params }) => {
      return this.productsService.getProducts({
        offset: params.page * 9,
        limit: params.limit,
      });
    },
  });
}
