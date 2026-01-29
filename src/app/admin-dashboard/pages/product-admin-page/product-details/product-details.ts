import { Product } from '@/products/interfaces/product.interface';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { ProductCarousel } from "@/products/components/product-carousel/product-carousel";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '@/utils/form-utils';
import { FormErrorLabel } from "@/shared/components/form-error-label/form-error-label";
import { ProductsService } from '@/products/services/products.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'product-details',
  imports: [ProductCarousel, ReactiveFormsModule, FormErrorLabel],
  templateUrl: './product-details.html',
})
export class ProductDetails implements OnInit {
  product = input.required<Product>();
  productService = inject(ProductsService);
  wasSaved = signal(false);

  imageFileList: FileList | undefined = undefined;
  tempImages = signal<string[]>([]);

  router = inject(Router);
  fb = inject(FormBuilder);

  productForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)],],
    price: ['', [Validators.required, Validators.min(0)]],
    stock: ['', [Validators.required, Validators.min(0)]],
    gender: ['men', [Validators.required, Validators.pattern(/men|women|kid|unisex/)]],
    sizes: [['']],
    images: [[]],
    tags: [''],
  });

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  ngOnInit(): void {
    this.setFormValue(this.product());
  }

  setFormValue(formLike: Partial<Product>) {
    this.productForm.reset(this.product() as any);
    this.productForm.patchValue({ tags: formLike.tags?.join(', ') });
  }

  onSizeChange(sizes: string) {
    const currentSizes = this.productForm.value.sizes ?? [];

    if (currentSizes.includes(sizes)) {
      this.productForm.patchValue({
        sizes: currentSizes.filter(s => s !== sizes)
      })
    } else {
      this.productForm.patchValue({
        sizes: [...currentSizes, sizes]
      })
    }
  }

  async onSubmit() {
    const isValid = this.productForm.valid;

    if (!isValid) return;
    const formValue = this.productForm.value;

    const productLike: Partial<Product> = {
      ...(formValue as any),
      tags: formValue.tags
        ?.toLowerCase()
        .split(',')
        .map(tag => tag.trim()) ?? [],
    };
    console.log({ productLike });

    if (this.product().id === 'new') {

      const product = await firstValueFrom(this.productService.createProduct(productLike, this.imageFileList));
      this.router.navigate(['/admin/products', product.id]);
    } else {
      await firstValueFrom(this.productService.updateProduct(this.product().id, productLike, this.imageFileList));
    }
    this.wasSaved.set(true);
    setTimeout(() => {
      this.wasSaved.set(false);
    }, 2000);
  }

  onFilesChanged(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    this.imageFileList = files ?? undefined;
    this.tempImages.set([]);

    if (!files) return;
    const images = Array.from(files ?? []).map(file => URL.createObjectURL(file));

    this.tempImages.set(images);

  }

}
