import { SCREEN_SIZES } from "../../../../sharedUtilities/constants";
import publicInfoStyles, { colors } from "../publicInfoStyles";

const dataVisStyles = theme => ({
  ...publicInfoStyles(theme),

  dataSectionWrapper: {
    height: "95vh",
    margin: "1.5em",
    padding: "16px 0",
    fontFamily: "Montserrat"
  },
  [`dataSectionWrapper-${SCREEN_SIZES.DESKTOP}`]: {
    height: "70vh",
    margin: "4.5em 7em"
  },
  dataSectionTitle: {
    fontFamily: "inherit",
    fontSize: "32px",
    fontWeight: "300"
  },
  categoryGraphWrapper: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-start"
  },
  [`categoryGraphWrapper-${SCREEN_SIZES.DESKTOP}`]: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  /* CATEGORY DROPDOWN & LIST */
  categoryButtonTitle: {
    width: "211px",
    fontFamily: "inherit",
    fontSize: "20px",
    fontWeight: "400",
    letterSpacing: "-.25px",
    color: "black",
    textTransform: "none",
    borderRadius: "0",
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    display: "flex",
    justifyContent: "space-between"
  },
  [`categoryButtonTitle-${SCREEN_SIZES.DESKTOP}`]: {
    width: "100%",
    padding: "10px 2px 10px 18px",
    borderBottom: "1px solid rgb(34, 118, 124)",
    boxShadow: "0px 4px 4px 0px #00000040"
  },
  categoryButtonGroup: {
    width: "100%",
    padding: "0 10px 20px 10px",
    borderRadius: "0",
    backgroundColor: colors.accent,
    boxShadow: "0px 4px 4px 0px #00000040"
  },
  categoryButton: {
    padding: "12px 8px",
    fontFamily: "inherit",
    fontWeight: "500",
    letterSpacing: ".15px",
    textTransform: "none",
    borderBottom: "1px solid rgba(0, 0, 0, 0.23)",
    justifyContent: "space-between"
  },
  active: {
    color: colors.secondaryBrand
  },
  /* GRAPH */
  graphInfoContainer: {
    height: "80%",
    width: "100%",
    marginTop: "28px",
    fontFamily: "inherit",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  [`graphInfoContainer-${SCREEN_SIZES.DESKTOP}`]: {
    height: "90%",
    width: "75%",
    marginTop: "10px"
  },
  graphCategoryTitle: {
    width: "96vw",
    marginLeft: "-16px",
    fontFamily: "inherit",
    fontSize: "24px",
    fontWeight: "700",
    textAlign: "center"
  },
  [`graphCategoryTitle-${SCREEN_SIZES.DESKTOP}`]: {
    width: "100%",
    margin: "0"
  },
  graphCategoryDescription: {
    padding: "8px 0",
    fontFamily: "inherit",
    fontSize: "16px",
    fontWeight: "500",
    lineHeight: "22.4px",
    textAlign: "center"
  },
  [`graphCategoryDescription-${SCREEN_SIZES.DESKTOP}`]: {
    width: "85%",
    margin: "auto"
  },
  graphWrapper: {
    height: "70%"
  },
  [`graphWrapper-${SCREEN_SIZES.TABLET}`]: {
    height: "80%"
  },
  sourceText: {
    paddingTop: "16px",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: "500"
  },
  /* FAILED TO LOAD */
  failedToLoadWrapper: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  failedToLoadText: {
    padding: "16px",
    fontFamily: "inherit",
    textAlign: "center"
  }
});

export default dataVisStyles;
