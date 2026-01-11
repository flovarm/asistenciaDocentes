import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(fullName: string): string {
    if (!fullName) return ''; 
    const parts = fullName.trim().split(' ');
    const firstNameInitial = parts[0]?.charAt(0).toUpperCase() || '';
    const lastNameInitial = parts[parts.length - 1]?.charAt(0).toUpperCase() || '';
    return `${firstNameInitial}${lastNameInitial}`;
  }
}