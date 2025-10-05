import { Component, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { TituloComponent } from '../Shared/titulo/titulo.component';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PeriodoService } from '../_services/periodo.service';
import { AlumnoService } from '../_services/alumno.service';
import { CursoService } from '../_services/curso.service';
import { AlumnoFilter, PagedResult } from '../_models/alumno-filter.interface';
import { Profesor } from '../_models/profesor';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Periodo } from '../_models/periodo';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-alumnos',
  imports: [
    TituloComponent,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatSortModule,
    MatProgressSpinnerModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './alumnos.component.html',
  styleUrl: './alumnos.component.scss'
})
export class AlumnosComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  private alumnosService = inject(AlumnoService);
  private periodoService = inject(PeriodoService);
  private cursoService = inject(CursoService);
  
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['docid','completo', 'email', 'curso', 'turno', 'fechains', 'opciones'];
  currentPeriodo: any | null = null;
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  nombreFiltro: string = '';
  selectedPeriodoId: number | null = null;
  selectedCursoId: number | null = null;
  periodos: any[] = [];
  cursos: any[] = [];
  cursoControl = new FormControl('');
  filteredCursos!: Observable<any[]>;
  profesor: Profesor = JSON.parse(localStorage.getItem('profesor')!);

  ngOnInit(): void {
    this.loadPeriodos();
    this.loadCursos();
    this.loadStudents();
    
    this.filteredCursos = this.cursoControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCursos(value || ''))
    );
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  loadPeriodos(): void {
    this.periodoService.listaPeriodosAño(2025).subscribe({
      next: (periodos: Periodo[]) => {
        this.periodos = periodos;
      },
      error: (error) => {
        console.error('Error loading periods:', error);
      }
    });
  }

  loadCursos(): void {
    this.cursoService.obtenerCursos(true).subscribe({
      next: (cursos: any[]) => {
        this.cursos = cursos;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
      }
    });
  }

  private _filterCursos(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.cursos.filter(curso => 
      curso.descripcion.toLowerCase().includes(filterValue)
    );
  }

  onCursoSelected(event: any): void {
    const selectedCurso = this.cursos.find(curso => curso.descripcion === event.option.value);
    this.selectedCursoId = selectedCurso ? selectedCurso.idCurso : null;
    this.pageIndex = 0;
    this.loadStudents();
  }

  onPeriodoChange(event: any): void {
    this.selectedPeriodoId = event.value;
    this.pageIndex = 0;
    this.loadStudents();
  }

  onCursoChange(event: any): void {
    this.selectedCursoId = event.value;
    this.pageIndex = 0;
    this.loadStudents();
  }

  onPageChange(event: any): void {
    // If page size changed, reset to first page
    if (event.pageSize !== this.pageSize) {
      this.pageIndex = 0;
    } else {
      this.pageIndex = event.pageIndex;
    }
    
    this.pageSize = event.pageSize;
    this.loadStudents();
  }

   loadStudents(): void {
    console.log('Loading students with:', {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      profesorId: this.profesor.idProfesor
    });

    const filter: AlumnoFilter = this.alumnosService.initializeFilter();
    filter.idProfesores = [this.profesor.idProfesor];
    filter.nombre = this.nombreFiltro;
    if (this.selectedPeriodoId) {
      filter.periodos = [this.selectedPeriodoId];
    }
    if (this.selectedCursoId) {
      filter.idCursos = [this.selectedCursoId];
    }
    filter.pageNumber = this.pageIndex + 1;
    filter.pageSize = this.pageSize;

    this.alumnosService.getAlumnosPaginados(filter).subscribe({
      next: (result: PagedResult<any>) => {
        console.log('Received students data:', result);
        this.dataSource.data = result.items || [];
        this.totalItems = result.totalCount || 0;
        
        // Update paginator after data loads
        if (this.paginator) {
          this.paginator.pageIndex = this.pageIndex;
          this.paginator.pageSize = this.pageSize;
        }
      },
      error: (error) => {
        this.dataSource.data = [];
        this.totalItems = 0;
      }
    });
  }



  viewStudent(student: any): void {
    console.log('View student:', student);
    // Implement view functionality
  }

  editStudent(student: any): void {
    console.log('Edit student:', student);
    // Implement edit functionality
  }

  deleteStudent(student: any): void {
    console.log('Delete student:', student);
    // Implement delete functionality
  }

  clearFilters(): void {
    this.selectedPeriodoId = null;
    this.selectedCursoId = null;
    this.nombreFiltro = '';
    this.cursoControl.setValue('');
    this.pageIndex = 0;
    this.loadStudents();
  }

  
}
