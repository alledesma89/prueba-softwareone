import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';

export const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger('60ms', [
        animate('0.4s ease', 
          keyframes([
            style({ opacity: 0, transform: 'translateY(20px)', offset: 0 }),
            style({ opacity: 0.5, transform: 'translateY(-8px)', offset: 0.7 }),
            style({ opacity: 1, transform: 'translateY(0)', offset: 1 })
          ])
        )
      ])
    ], { optional: true }),
    query(':leave', [
      stagger('40ms', [
        animate('0.3s ease', 
          keyframes([
            style({ opacity: 1, transform: 'scale(1)', offset: 0 }),
            style({ opacity: 0.5, transform: 'scale(0.95)', offset: 0.3 }),
            style({ opacity: 0, transform: 'scale(0.9)', offset: 1 })
          ])
        )
      ])
    ], { optional: true })
  ])
]);

export const pulseAnimation = trigger('pulse', [
  transition('* => *', [
    animate('0.3s', keyframes([
      style({ transform: 'scale(1)', offset: 0 }),
      style({ transform: 'scale(1.05)', offset: 0.5 }),
      style({ transform: 'scale(1)', offset: 1 })
    ]))
  ])
]);

export const fadeSlide = trigger('fadeSlide', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-20px)' }),
    animate('0.4s ease', 
      style({ opacity: 1, transform: 'translateY(0)' })
    )
  ]),
  transition(':leave', [
    animate('0.3s ease', 
      style({ opacity: 0, transform: 'translateY(20px)' })
    )
  ])
]);