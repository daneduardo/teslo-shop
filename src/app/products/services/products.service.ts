import { HttpClient } from '@angular/common/http';
import { inject, Injectable, provideBrowserGlobalErrorListeners } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { Gender, Product, ProductsResponse } from '@products/interfaces/product.interface';
import { environment } from 'src/environments/environment.development';
import { User } from '@/auth/interfaces/user.interface';

const baseUrl = environment.baseUrl

interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Men,
  tags: [],
  images: [],
  user: {}as User
};




@Injectable({ providedIn: 'root' })
export class ProductsService {

  private http = inject(HttpClient);
  private productsCache = new Map<string, ProductsResponse>();
  private productCache = new Map<string, Product>();


  getProducts(options: Options): Observable<ProductsResponse> {

    const { limit = 9, offset = 0, gender = '' } = options;

    const key = `${limit}-${offset}-${gender}`;
    if (this.productsCache.has(key)) {
      return of(this.productsCache.get(key)!);
    }
    return this.http
      .get<ProductsResponse>(`${baseUrl}/products`, {
        params: {
          limit,
          offset,
          gender,
        }

      })
      .pipe(tap((resp) => console.log(resp)), tap((resp) => this.productsCache.set(key, resp)));
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {
    if (this.productCache.has(idSlug)) {
      return of(this.productCache.get(idSlug)!);
    }
    return this.http.get<Product>(`${baseUrl}/products/${idSlug}`)
      .pipe(tap((product) => this.productCache.set(idSlug, product)));
  }

  getProductById(id: string): Observable<Product> {
    if(id === 'new'){
      return of(emptyProduct);
    }
        if (this.productCache.has(id)) {
      return of(this.productCache.get(id)!);
    }
    return this.http.get<Product>(`${baseUrl}/products/${id}`)
      .pipe(tap((product) => this.productCache.set(id, product)));
  }

  updateProduct(
    id: string,
    productLike:Partial<Product>,
    imageFileList?: FileList
  ): Observable<Product>{

    const currentImage = productLike.images ?? [];


    return this.uploadImages(imageFileList)
    .pipe(
      map(ImageNames => ({
          ...productLike,
          images: [...currentImage, ...ImageNames]
      })),
      switchMap(updatedproduct => this.http.patch<Product>(`${baseUrl}/products/${id}`, updatedproduct)),
      tap((product) => this.updateProductCache(product))
    );
  }

  updateProductCache(product: Product){
    const productId = product.id;

    this.productCache.set(productId, product);
    this.productsCache.forEach((productResponse) => {
      productResponse.products= productResponse.products.map(currentProduct => {
        return currentProduct.id === productId ? product : currentProduct;
      })
    });
  }

  deleteProduct(id:string){
    this.productCache.delete(id);
  }

  createProduct(
    productLike: Partial<Product>,
    imageFileList?: FileList
  ): Observable<Product> {

    const currentImage = productLike.images ?? [];


    return this.uploadImages(imageFileList)
    .pipe(
      map(ImageNames => ({
          ...productLike,
          images: [...currentImage, ...ImageNames]
      })),
      switchMap(createdproduct => this.http.post<Product>(`${baseUrl}/products`, createdproduct)),
      tap((product) => this.updateProductCache(product))
    );
  }

  uploadImages(files?: FileList): Observable<string[]> {
    if (!files) return of([]);

    const uploadObservables = Array.from(files).map(file => this.uploadImage(file));
    return forkJoin(uploadObservables);
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file  );
    return this.http
    .post<{fileName: string}>(`${baseUrl}/files/product`, formData)
    .pipe(map((resp) => resp.fileName));
  }
}
