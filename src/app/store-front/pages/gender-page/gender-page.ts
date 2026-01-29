import { PaginationService } from '@shared/components/Pagination/pagination.service';
import { ProductsService } from '@products/services/products.service';
import { ProductCard } from "@products/components/product-card/product-card";
import { Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Pagination } from "@/shared/components/Pagination/Pagination";

@Component({
  selector: 'gender-page',
  imports: [ProductCard, Pagination],
  templateUrl: './gender-page.html',
})
export class GenderPage {

  route= inject(ActivatedRoute);
  gender = toSignal(this.route.params.pipe(map(params => params['gender'])));

  paginationService = inject(PaginationService);
  productsService = inject(ProductsService);

  productsResorce = rxResource({
    params : () => ({page: this.paginationService.currentPage(), gender: this.gender()}),
    stream: ({params})=>{ return this.productsService.getProducts({offset: (params.page - 1) * 9, limit: 9, gender: params.gender});
    },
  });

}
