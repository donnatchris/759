'use server';

import { executeAction, type TServerResponse } from '@/features/core';
import {
  cancelAdminReservationService,
  cancelCurrentUserReservationService,
  createAdminReservationService,
  createReservationService,
  getAdminUserReservationsCalendarService,
  getBookingSettingsService,
  getCurrentUserReservationDetailsService,
  getCurrentUserReservationsCalendarService,
  getCurrentUserUpcomingReservationsCountService,
  getReservationDetailsService,
  getReservableServiceOptionsService,
  getReservationAvailabilityService,
  getReservationsCalendarService,
  getReservationWeekAvailabilityService,
  updateBookingSettingsService,
} from './reservations.service';
import type {
  BookingSettings,
  TCalendarReservation,
  TReservableServiceOption,
  TReservationAvailability,
  TReservationDetails,
  TReservationWeekAvailability,
  TReservationWithResourceUsages,
} from './reservations.types';

export async function getReservationAvailabilityAction(
  data: unknown,
): Promise<TServerResponse<TReservationAvailability>> {
  return await executeAction({
    actionName: 'getReservationAvailabilityAction',
    service: getReservationAvailabilityService,
    input: data,
  });
}

export async function updateBookingSettingsAction(
  data: unknown,
): Promise<TServerResponse<BookingSettings>> {
  return await executeAction({
    actionName: 'updateBookingSettingsAction',
    service: updateBookingSettingsService,
    input: data,
  });
}

export async function getBookingSettingsAction(): Promise<
  TServerResponse<BookingSettings>
> {
  return await executeAction({
    actionName: 'getBookingSettingsAction',
    service: getBookingSettingsService,
  });
}

export async function getReservationWeekAvailabilityAction(
  data: unknown,
): Promise<TServerResponse<TReservationWeekAvailability>> {
  return await executeAction({
    actionName: 'getReservationWeekAvailabilityAction',
    service: getReservationWeekAvailabilityService,
    input: data,
  });
}

export async function createReservationAction(
  data: unknown,
): Promise<TServerResponse<TReservationWithResourceUsages>> {
  return await executeAction({
    actionName: 'createReservationAction',
    service: createReservationService,
    input: data,
  });
}

export async function createAdminReservationAction(
  data: unknown,
): Promise<TServerResponse<TReservationWithResourceUsages>> {
  return await executeAction({
    actionName: 'createAdminReservationAction',
    service: createAdminReservationService,
    input: data,
  });
}

export async function getReservableServiceOptionsAction(): Promise<
  TServerResponse<TReservableServiceOption[]>
> {
  return await executeAction({
    actionName: 'getReservableServiceOptionsAction',
    service: getReservableServiceOptionsService,
  });
}

export async function getReservationsCalendarAction(
  data: unknown,
): Promise<TServerResponse<TCalendarReservation[]>> {
  return await executeAction({
    actionName: 'getReservationsCalendarAction',
    service: getReservationsCalendarService,
    input: data,
  });
}

export async function getAdminUserReservationsCalendarAction(
  data: unknown,
): Promise<TServerResponse<TCalendarReservation[]>> {
  return await executeAction({
    actionName: 'getAdminUserReservationsCalendarAction',
    service: getAdminUserReservationsCalendarService,
    input: data,
  });
}

export async function getReservationDetailsAction(
  data: unknown,
): Promise<TServerResponse<TReservationDetails>> {
  return await executeAction({
    actionName: 'getReservationDetailsAction',
    service: getReservationDetailsService,
    input: data,
  });
}

export async function getCurrentUserReservationsCalendarAction(
  data: unknown,
): Promise<TServerResponse<TCalendarReservation[]>> {
  return await executeAction({
    actionName: 'getCurrentUserReservationsCalendarAction',
    service: getCurrentUserReservationsCalendarService,
    input: data,
  });
}

export async function getCurrentUserReservationDetailsAction(
  data: unknown,
): Promise<TServerResponse<TReservationDetails>> {
  return await executeAction({
    actionName: 'getCurrentUserReservationDetailsAction',
    service: getCurrentUserReservationDetailsService,
    input: data,
  });
}

export async function cancelCurrentUserReservationAction(
  data: unknown,
): Promise<TServerResponse<TReservationDetails>> {
  return await executeAction({
    actionName: 'cancelCurrentUserReservationAction',
    service: cancelCurrentUserReservationService,
    input: data,
  });
}

export async function cancelAdminReservationAction(
  data: unknown,
): Promise<TServerResponse<TReservationDetails>> {
  return await executeAction({
    actionName: 'cancelAdminReservationAction',
    service: cancelAdminReservationService,
    input: data,
  });
}

export async function getCurrentUserUpcomingReservationsCountAction(): Promise<
  TServerResponse<number>
> {
  return await executeAction({
    actionName: 'getCurrentUserUpcomingReservationsCountAction',
    service: getCurrentUserUpcomingReservationsCountService,
  });
}
