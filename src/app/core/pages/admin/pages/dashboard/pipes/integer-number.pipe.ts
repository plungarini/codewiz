import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'integerNumber'
})
export class IntegerNumberPipe implements PipeTransform {

  transform(value: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }

}
