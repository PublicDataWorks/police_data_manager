import Handlebars from "handlebars";
import moment from "moment";
import {
  computeTimeZone,
  format12HourTime
} from "../client/utilities/formatDate";
import formatPhoneNumber from "../client/utilities/formatPhoneNumber";

export const formatAddress = address => {
  if (!address) return "";
  const addressArray = [
    address.streetAddress,
    address.intersection,
    address.city,
    address.state
  ];

  const addressString = addressArray
    .filter(addressPart => {
      return addressPart && addressPart !== "";
    })
    .join(", ");

  return addressString !== ""
    ? addressString + ` ${address.zipCode}`
    : addressString;
};
Handlebars.registerHelper("formatAddress", formatAddress);

export const isPresent = value =>
  value && value !== "" && value !== "<p><br></p>";
Handlebars.registerHelper("isPresent", isPresent);

export const renderHtml = html => {
  if (html) return new Handlebars.SafeString(html);
  return "";
};
Handlebars.registerHelper("renderHtml", renderHtml);

export const sumAllegations = letterOfficer => {
  let total = 0;
  if (letterOfficer.numHistoricalHighAllegations) {
    total += letterOfficer.numHistoricalHighAllegations;
  }
  if (letterOfficer.numHistoricalMedAllegations) {
    total += letterOfficer.numHistoricalMedAllegations;
  }
  if (letterOfficer.numHistoricalLowAllegations) {
    total += letterOfficer.numHistoricalLowAllegations;
  }
  return total;
};
Handlebars.registerHelper("sumAllegations", sumAllegations);

export const showOfficerHistory = letterOfficer => {
  return (
    sumAllegations(letterOfficer) ||
    isPresent(letterOfficer.historicalBehaviorNotes) ||
    letterOfficer.referralLetterOfficerHistoryNotes.length > 0
  );
};
Handlebars.registerHelper("showOfficerHistory", showOfficerHistory);

export const showOfficerHistoryHeader = accusedOfficers => {
  const letterOfficers = accusedOfficers.map(officer => officer.letterOfficer);
  return letterOfficers.some(showOfficerHistory);
};
Handlebars.registerHelper("showOfficerHistoryHeader", showOfficerHistoryHeader);

const formatTime = (date, time) => {
  if (!time) return time;
  return format12HourTime(time) + " " + computeTimeZone(date, time);
};
Handlebars.registerHelper("formatTime", formatTime);

const formatDate = date => {
  if (!date) return date;
  return moment(date, "YYYY/MM/DD").format("MM/DD/YYYY");
};
Handlebars.registerHelper("formatDate", formatDate);

const formatPhone = phoneNumber => {
  if (!phoneNumber) return phoneNumber;
  return formatPhoneNumber(phoneNumber);
};
Handlebars.registerHelper("formatPhoneNumber", formatPhone);
