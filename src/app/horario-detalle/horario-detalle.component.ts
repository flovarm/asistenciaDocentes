import { Component, inject, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { endOfDay, addMonths, set } from 'date-fns';
import {
  DAYS_IN_WEEK,
  SchedulerViewDay,
  SchedulerViewHour,
  SchedulerViewHourSegment,
  CalendarSchedulerEvent,
  CalendarSchedulerEventAction,
  startOfPeriod,
  endOfPeriod,
  addPeriod,
  subPeriod,
  SchedulerDateFormatter,
  SchedulerEventTimesChangedEvent,
  CalendarSchedulerViewComponent,
  SchedulerModule,
} from 'angular-calendar-scheduler';
import {
  CalendarView,
  CalendarDateFormatter,
  DateAdapter,
  CalendarModule,
} from 'angular-calendar';
import { Subject } from 'rxjs';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { HorarioService } from '../_services/horario.service';
import { Profesor } from '../_models/profesor';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MarcacionComponent } from './marcacion/marcacion.component';
import { TituloComponent } from '../Shared/titulo/titulo.component';
@Component({
  selector: 'app-horario-detalle',
  imports: [
     CalendarModule,
    SchedulerModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    TituloComponent
  ],
   providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory
    },
    {
      provide: CalendarDateFormatter,
      useClass: SchedulerDateFormatter,
    }
  ],
  templateUrl: './horario-detalle.component.html',
  styleUrl: './horario-detalle.component.scss'
})
export class HorarioDetalleComponent implements OnInit{
CalendarView = CalendarView;
  view: CalendarView = CalendarView.Week;
  viewDate: Date = new Date();
  viewDays: number = 7;
  refresh: Subject<any> = new Subject();
  locale: string = 'es-PE';
  hourSegments: any = 1;
  weekStartsOn: number = 1;
  startsWithToday: boolean = false;
  activeDayIsOpen: boolean = true;
  excludeDays: number[] = []; // [0];
  dayStartHour: number = 6;
  dayEndHour: number = 21;
  minDate: Date = endOfDay(addMonths(new Date(), -12));
  maxDate: Date = endOfDay(addMonths(new Date(), 12));
  dayModifier: Function;
  hourModifier: Function;
  segmentModifier: Function;
  eventModifier: Function;
  prevBtnDisabled: boolean = false;
  nextBtnDisabled: boolean = false;
  currentClassTitle: string = '';
  private dialog = inject(MatDialog);
  profesor: Profesor = JSON.parse(localStorage.getItem('profesor'))!;

  actions: CalendarSchedulerEventAction[] = [
    {
      when: 'enabled',
      label:
        '<span class="valign-center"><i class="material-icons md-18 md-red-500">cancel</i></span>',
      title: 'Delete',
      onClick: (event: CalendarSchedulerEvent): void => {
     //   console.log("Pressed action 'Delete' on event " + event.id);
      },
    },
    {
      when: 'cancelled',
      label:
        '<span class="valign-center"><i class="material-icons md-18 md-red-500">autorenew</i></span>',
      title: 'Restore',
      onClick: (event: CalendarSchedulerEvent): void => {
      //  console.log("Pressed action 'Restore' on event " + event.id);
      },
    },
  ];
  
  private appService = inject(HorarioService);
  events: CalendarSchedulerEvent[];

  @ViewChild(CalendarSchedulerViewComponent)
  calendarScheduler: CalendarSchedulerViewComponent;

  constructor(
    @Inject(LOCALE_ID) locale: string,
    private dateAdapter: DateAdapter,
  ) {
    this.locale = locale;
    this.segmentModifier = ((segment: SchedulerViewHourSegment): void => {
      segment.isDisabled = !this.isDateValid(segment.date);
    }).bind(this);

    this.eventModifier = ((event: CalendarSchedulerEvent): void => {
 // event.isDisabled = !this.isDateValid(event.start);
if (this.isCurrentEvent(event)) {
    event.cssClass = 'blinking-event'; 
  }
  // Si es la clase actual, agrega la clase 'blink'
}).bind(this);

    this.dateOrViewChanged();
  }
  ngOnInit(): void {
    this.obtenerHorario(this.profesor.idProfesor);
    setInterval(() => {
    if (this.events) {
      this.events.forEach(event => {
        if (this.isCurrentEvent(event)) {
          event.cssClass = 'blinking-event';
        } else if (event.cssClass === 'blinking-event') {
          event.cssClass = '';
        }
      });
      this.refresh.next(this.events);
    }
  }, 60000); // cada 60 segundo
  }

  obtenerHorario(idDocente: number) {

    this.appService
      .obtenerHorario(this.actions, this.profesor.idProfesor)
      .subscribe((events: any) => {
        this.events = events;
        this.refresh.next(this.events);
      });
  }


  viewDaysOptionChanged(viewDays: any): void {
   // console.log('viewDaysOptionChanged', viewDays);
    this.calendarScheduler.setViewDays(viewDays);
  }

  changeDate(date: Date): void {
   // console.log('changeDate', date);
    this.viewDate = date;
    this.dateOrViewChanged();
  }

  changeView(view: CalendarView): void {
   // console.log('changeView', view);
    this.view = view;
    this.dateOrViewChanged();
  }

  dateOrViewChanged(): void {
    if (this.startsWithToday) {
      this.prevBtnDisabled = !this.isDateValid(
        subPeriod(
          this.dateAdapter,
          CalendarView.Day /*this.view*/,
          this.viewDate,
          1
        )
      );
      this.nextBtnDisabled = !this.isDateValid(
        addPeriod(
          this.dateAdapter,
          CalendarView.Day /*this.view*/,
          this.viewDate,
          1
        )
      );
    } else {
      this.prevBtnDisabled = !this.isDateValid(
        endOfPeriod(
          this.dateAdapter,
          CalendarView.Day /*this.view*/,
          subPeriod(
            this.dateAdapter,
            CalendarView.Day /*this.view*/,
            this.viewDate,
            1
          )
        )
      );
      this.nextBtnDisabled = !this.isDateValid(
        startOfPeriod(
          this.dateAdapter,
          CalendarView.Day /*this.view*/,
          addPeriod(
            this.dateAdapter,
            CalendarView.Day /*this.view*/,
            this.viewDate,
            1
          )
        )
      );
    }

    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
  }

  private isDateValid(date: Date): boolean {
    return /*isToday(date) ||*/ date >= this.minDate && date <= this.maxDate;
  }

  viewDaysChanged(viewDays: number): void {
   // console.log('viewDaysChanged', viewDays);
    this.viewDays = viewDays;
  }

  dayHeaderClicked(day: SchedulerViewDay): void {
   // console.log('dayHeaderClicked Day', day);
  }

  hourClicked(hour: SchedulerViewHour): void {
   // console.log('hourClicked Hour', hour);
  }

  segmentClicked(action: string, segment: SchedulerViewHourSegment): void {

  }

  eventClicked(action: string, event: CalendarSchedulerEvent): void {
     this.dialog.open(MarcacionComponent, {
      width: 'auto',
      height: '700px',
      data:  event ,
      disableClose: true,
    });
    

  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
    type,
  }: SchedulerEventTimesChangedEvent): void {
   // console.log('eventTimesChanged Type', type);
   // console.log('eventTimesChanged Event', event);
   // console.log('eventTimesChanged New Times', newStart, newEnd);
    const ev: CalendarSchedulerEvent = this.events.find(
      (e) => e.id === event.id
    );
    ev.start = newStart;
    ev.end = newEnd;
    this.refresh.next(null);
  }


isCurrentEvent(event: CalendarSchedulerEvent): boolean {
  const now = new Date();
  const start = new Date(new Date(event.start).getTime() - 5 * 60 * 1000); // 5 minutos antes del inicio
  const end = new Date(new Date(event.end).getTime() + 20 * 60 * 1000);   // 20 minutos después del fin
  return start <= now && now <= end;
}



}
