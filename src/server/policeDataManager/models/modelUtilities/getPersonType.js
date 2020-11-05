import {
  EMPLOYEE_TYPE,
  PERSON_TYPE
} from "../../../../sharedUtilities/constants";

export const getPersonType = primaryComplainant => {
  if (primaryComplainant && primaryComplainant.officerId) {
    switch (primaryComplainant.caseEmployeeType) {
      case EMPLOYEE_TYPE.OFFICER:
        return PERSON_TYPE.KNOWN_OFFICER;
      case EMPLOYEE_TYPE.CIVILIAN_WITHIN_NOPD:
        return PERSON_TYPE.CIVILIAN_WITHIN_NOPD;
    }
  } else if (primaryComplainant && primaryComplainant.isUnknownOfficer) {
    return PERSON_TYPE.UNKNOWN_OFFICER;
  } else {
    return PERSON_TYPE.CIVILIAN;
  }
};