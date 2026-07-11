import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dropdownOptions',
  standalone: true,
  pure: true 
})
export class DropdownOptionsPipe implements PipeTransform {

  transform(options?: string): { label: string; value: string }[] {
    if (!options || typeof options !== 'string') {
      return [];
    }

    return options
      .split(',')
      .map(pair => {
        const [value, label] = pair.split('|');
        return value && label
          ? { value: value.trim(), label: label.trim() }
          : null;
      })
      .filter(Boolean) as { label: string; value: string }[];
  }
}
