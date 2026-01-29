import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.baseUrl;

@Pipe({
  name: 'productImage'
})

export class ProductImagePipe implements PipeTransform {
  transform(value:null | string | string[]): string {

    if(!value) return './assets/images/placeholder/no-image.jpg';

    if(typeof value === 'string'){
      return `${baseUrl}/files/product/${value}`;
    }
    const image = value.at(0);
    if (!image) {
      return './assets/images/placeholder/no-image.jpg';
    }
        return `${baseUrl}/files/product/${image}`;
  }
}

