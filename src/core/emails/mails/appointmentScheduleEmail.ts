import { ICalAttendeeData } from 'ical-generator';

export const appointmentScheduleEmail = (
  link: string,
  attendees: ICalAttendeeData[],
) => {
  return `<p>
    This appointment has been scheduled for you. <br/><br/> Kindly join the session via this zoom <a href="${link}">link</a> <br/><br/>
    <strong>Attendees</strong><br/><br/>
    ${attendees.map((attendee) => {
      return `<a href="${attendee.email}">${attendee.name}</a><br>`;
    })}
</p>`;
};
