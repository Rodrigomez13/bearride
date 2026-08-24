export const NOTIFICATION_EVENTS = ['driver_assigned', 'driver_arriving', 'driver_arrived', 'ride_started', 'ride_completed', 'payment_completed', 'driver_cancelled', 'passenger_cancelled'] as const
export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number]

export type NotificationMessage = { profileId: string; event: NotificationEvent; payload: Record<string, string | number | boolean> }

export interface NotificationProvider {
  send(message: NotificationMessage): Promise<void>
}
